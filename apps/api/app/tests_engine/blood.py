from typing import Tuple, Any

from app.tests_engine.base import BaseTestEngine, register_engine


@register_engine
class BloodEngine(BaseTestEngine):
    """혈액형 성격 분석 엔진"""

    test_code = "blood"
    test_name = "혈액형 성격 분석"

    # 혈액형별 기본 특성
    BLOOD_TYPES = {
        "A": {
            "name": "A형",
            "basic_trait": "꼼꼼하고 신중한 완벽주의자",
            "personality": {
                "strengths": ["꼼꼼함", "성실함", "배려심", "계획적", "책임감"],
                "weaknesses": ["걱정 많음", "소심함", "완벽주의", "스트레스에 약함"],
            },
            "work_style": "체계적이고 계획적으로 일처리, 디테일에 강함",
            "relationship": "신중하게 관계를 맺고, 한번 맺은 관계는 오래 유지",
            "stress_response": "혼자 고민하고, 내면화하는 경향",
            "compatible": ["A", "O"],
            "careers": ["연구원", "회계사", "의사", "교사", "프로그래머"],
        },
        "B": {
            "name": "B형",
            "basic_trait": "자유롭고 창의적인 개성파",
            "personality": {
                "strengths": ["창의성", "자유로움", "낙천적", "적응력", "호기심"],
                "weaknesses": ["변덕스러움", "이기적", "무책임", "산만함"],
            },
            "work_style": "독창적이고 자유로운 방식, 관심 분야에 몰입",
            "relationship": "솔직하고 직설적, 친해지면 깊은 관계",
            "stress_response": "기분 전환을 위해 새로운 것을 찾음",
            "compatible": ["B", "AB"],
            "careers": ["예술가", "기획자", "마케터", "요리사", "디자이너"],
        },
        "O": {
            "name": "O형",
            "basic_trait": "리더십 있고 사교적인 활동가",
            "personality": {
                "strengths": ["리더십", "자신감", "사교성", "현실적", "결단력"],
                "weaknesses": ["질투심", "자기중심적", "고집", "감정 기복"],
            },
            "work_style": "목표 지향적, 큰 그림을 보며 추진력 있게 진행",
            "relationship": "폭넓은 인간관계, 충성심 강함",
            "stress_response": "운동이나 활동으로 해소",
            "compatible": ["O", "A"],
            "careers": ["경영자", "정치인", "운동선수", "영업직", "기업가"],
        },
        "AB": {
            "name": "AB형",
            "basic_trait": "이성적이고 다재다능한 분석가",
            "personality": {
                "strengths": ["분석력", "냉정함", "다재다능", "합리적", "공정함"],
                "weaknesses": ["이중적", "냉소적", "우유부단", "거리감"],
            },
            "work_style": "분석적이고 논리적, 다양한 관점에서 접근",
            "relationship": "선택적 관계, 깊이 있는 소수와 친밀",
            "stress_response": "혼자만의 시간을 갖고 분석하며 정리",
            "compatible": ["AB", "B"],
            "careers": ["컨설턴트", "과학자", "작가", "외교관", "평론가"],
        },
    }

    # 혈액형 궁합
    COMPATIBILITY = {
        ("A", "A"): {"score": 80, "description": "서로의 신중함을 이해하고 안정적인 관계"},
        ("A", "B"): {"score": 60, "description": "다른 점이 매력이 될 수도, 갈등이 될 수도"},
        ("A", "O"): {"score": 90, "description": "서로의 장점을 살려주는 이상적인 조합"},
        ("A", "AB"): {"score": 70, "description": "지적인 대화가 잘 통하는 관계"},
        ("B", "B"): {"score": 75, "description": "자유로운 영혼끼리의 이해"},
        ("B", "O"): {"score": 65, "description": "열정은 맞지만 스타일 차이 존재"},
        ("B", "AB"): {"score": 85, "description": "서로의 개성을 존중하는 창의적 관계"},
        ("O", "O"): {"score": 80, "description": "강한 리더십이 충돌할 수 있으나 서로 이해"},
        ("O", "AB"): {"score": 70, "description": "실용과 이론의 조화"},
        ("AB", "AB"): {"score": 85, "description": "지적이고 냉정한 관계, 깊은 이해"},
    }

    async def calculate_result(
        self, session_id: str
    ) -> Tuple[dict[str, Any], str]:
        responses = await self.get_responses(session_id)

        blood_type = "A"  # 기본값
        additional_info = {}
        personality_scores = {
            "introvert": 0,
            "extrovert": 0,
            "thinking": 0,
            "feeling": 0,
            "planning": 0,
            "flexible": 0,
        }

        for response in responses:
            question = response.get("questions", {})
            answer = response.get("answer")
            scoring = question.get("scoring_weights", {})
            field = scoring.get("field", "")

            if answer is not None:
                # 혈액형 입력
                if field == "blood_type" and answer in self.BLOOD_TYPES:
                    blood_type = answer
                # 추가 정보
                elif field == "rh_factor":
                    additional_info["rh_factor"] = answer
                # 성격 특성 문항
                elif scoring:
                    for trait, weight in scoring.items():
                        if trait in personality_scores:
                            if isinstance(answer, (int, float)):
                                personality_scores[trait] += weight * answer
                            elif isinstance(answer, bool) and answer:
                                personality_scores[trait] += weight

        # 혈액형 특성과 응답 일치도 계산
        consistency = self._calculate_consistency(blood_type, personality_scores)

        raw_scores = {
            "blood_type": blood_type,
            "additional_info": additional_info,
            "personality_scores": personality_scores,
            "consistency": consistency,
        }

        result_type = blood_type

        return raw_scores, result_type

    def _calculate_consistency(self, blood_type: str, scores: dict) -> float:
        """혈액형 특성과 응답 일치도"""
        expected = {
            "A": {"introvert": 0.7, "thinking": 0.4, "planning": 0.8},
            "B": {"extrovert": 0.6, "feeling": 0.5, "flexible": 0.8},
            "O": {"extrovert": 0.8, "thinking": 0.5, "planning": 0.6},
            "AB": {"introvert": 0.5, "thinking": 0.8, "flexible": 0.5},
        }

        type_expected = expected.get(blood_type, {})
        total_diff = 0
        count = 0

        for trait, expected_ratio in type_expected.items():
            if trait in scores:
                actual = scores[trait]
                # 정규화
                max_score = 50  # 가정
                actual_ratio = actual / max_score if max_score > 0 else 0
                diff = abs(expected_ratio - actual_ratio)
                total_diff += diff
                count += 1

        if count == 0:
            return 70.0

        avg_diff = total_diff / count
        consistency = (1 - avg_diff) * 100
        return round(max(0, min(100, consistency)), 1)

    def interpret_result(
        self, raw_scores: dict[str, Any], result_type: str
    ) -> dict[str, Any]:
        blood_type = raw_scores.get("blood_type", "A")
        consistency = raw_scores.get("consistency", 70)
        additional_info = raw_scores.get("additional_info", {})

        type_info = self.BLOOD_TYPES.get(blood_type, {})

        # 궁합 정보
        compatibility_info = []
        for other_type in ["A", "B", "O", "AB"]:
            key = tuple(sorted([blood_type, other_type]))
            compat = self.COMPATIBILITY.get(key, {"score": 70, "description": ""})
            compatibility_info.append({
                "type": other_type,
                "score": compat["score"],
                "description": compat["description"],
            })

        # 정렬 (궁합 점수 높은 순)
        compatibility_info.sort(key=lambda x: x["score"], reverse=True)

        return {
            "result_type": result_type,
            "blood_type": {
                "type": blood_type,
                "name": type_info.get("name", ""),
                "basic_trait": type_info.get("basic_trait", ""),
            },
            "rh_factor": additional_info.get("rh_factor", "Rh+"),
            "personality": {
                "strengths": type_info.get("personality", {}).get("strengths", []),
                "weaknesses": type_info.get("personality", {}).get("weaknesses", []),
            },
            "work_style": type_info.get("work_style", ""),
            "relationship_style": type_info.get("relationship", ""),
            "stress_response": type_info.get("stress_response", ""),
            "suitable_careers": type_info.get("careers", []),
            "compatibility": compatibility_info,
            "best_match": compatibility_info[0]["type"] if compatibility_info else blood_type,
            "consistency_score": consistency,
            "consistency_note": self._get_consistency_note(consistency),
            "lifestyle_tips": self._get_lifestyle_tips(blood_type),
            "health_tips": self._get_health_tips(blood_type),
            "disclaimer": "혈액형 성격론은 과학적으로 검증되지 않았으며, 재미로만 참고하세요.",
        }

    def _get_consistency_note(self, consistency: float) -> str:
        """일치도 해석"""
        if consistency >= 80:
            return "응답이 해당 혈액형의 전형적인 특성과 매우 일치합니다."
        elif consistency >= 60:
            return "대체로 해당 혈액형의 특성을 보이고 있습니다."
        elif consistency >= 40:
            return "혈액형 특성과 다른 독특한 개성을 가지고 있습니다."
        else:
            return "전형적인 혈액형 특성과는 다른 성격을 가지고 있습니다."

    def _get_lifestyle_tips(self, blood_type: str) -> list[str]:
        """생활 팁"""
        tips = {
            "A": [
                "완벽을 추구하기보다 적당함을 받아들이세요",
                "스트레스 관리를 위한 이완 활동을 하세요",
                "혼자만의 시간을 충분히 가지세요",
                "규칙적인 생활 패턴을 유지하세요",
            ],
            "B": [
                "관심 분야에 집중하되 책임감도 챙기세요",
                "다양한 경험을 통해 에너지를 충전하세요",
                "창의적인 취미 활동을 즐기세요",
                "때로는 계획을 세워보는 것도 좋습니다",
            ],
            "O": [
                "목표를 향해 달리되 휴식도 챙기세요",
                "다른 사람의 의견에도 귀 기울이세요",
                "활동적인 운동으로 에너지를 발산하세요",
                "리더 역할에 대한 부담을 덜어내세요",
            ],
            "AB": [
                "결정을 미루지 말고 선택해보세요",
                "감정 표현을 연습해보세요",
                "혼자만의 시간과 사회적 시간의 균형을 맞추세요",
                "분석도 좋지만 직관을 믿어보세요",
            ],
        }
        return tips.get(blood_type, [])

    def _get_health_tips(self, blood_type: str) -> list[str]:
        """건강 팁 (혈액형 다이어트 등 참고)"""
        tips = {
            "A": [
                "채소 위주의 식단이 잘 맞을 수 있어요",
                "스트레스가 위장에 영향을 줄 수 있어요",
                "명상이나 요가 같은 이완 운동을 추천해요",
                "충분한 수면을 취하세요",
            ],
            "B": [
                "다양한 음식을 균형 있게 드세요",
                "유제품을 적당히 섭취하세요",
                "재미있는 운동을 찾아 꾸준히 하세요",
                "규칙적인 생활 습관을 들여보세요",
            ],
            "O": [
                "단백질 섭취를 충분히 하세요",
                "유산소 운동이 잘 맞을 수 있어요",
                "밀가루 음식을 줄여보세요",
                "활동적인 라이프스타일을 유지하세요",
            ],
            "AB": [
                "다양하고 균형 잡힌 식단을 유지하세요",
                "요가나 태극권 같은 운동이 좋아요",
                "과식을 피하고 소식을 하세요",
                "스트레스 관리에 신경 쓰세요",
            ],
        }
        return tips.get(blood_type, [])
