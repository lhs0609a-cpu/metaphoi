from typing import Tuple, Any

from app.tests_engine.base import BaseTestEngine, register_engine


@register_engine
class SasangEngine(BaseTestEngine):
    """사상체질 검사 엔진"""

    test_code = "sasang"
    test_name = "사상체질 검사"

    # 4가지 체질
    CONSTITUTIONS = {
        "태양인": {
            "organ_strong": "폐",
            "organ_weak": "간",
            "body_type": "상체 발달, 목덜미 굵음, 허리 아래 약함",
            "personality": "진취적, 창의적, 독창적, 사교적",
            "strengths": ["리더십", "추진력", "창의성", "결단력"],
            "weaknesses": ["독단적", "급한 성격", "지구력 부족"],
            "health_tips": ["간 기능 보강", "하체 운동", "충분한 휴식"],
            "foods_good": ["순한 채소류", "해산물", "담백한 음식"],
            "foods_bad": ["기름진 음식", "맵고 자극적인 음식"],
            "careers": ["정치인", "사업가", "예술가", "발명가"],
        },
        "태음인": {
            "organ_strong": "간",
            "organ_weak": "폐",
            "body_type": "골격 큼, 체격 건장, 배가 나옴",
            "personality": "끈기 있음, 침착함, 보수적, 인내심",
            "strengths": ["인내력", "지구력", "신뢰성", "꼼꼼함"],
            "weaknesses": ["우유부단", "게으름", "변화 저항"],
            "health_tips": ["폐 기능 보강", "유산소 운동", "체중 관리"],
            "foods_good": ["쇠고기", "밤", "호두", "콩류"],
            "foods_bad": ["닭고기", "돼지고기", "밀가루"],
            "careers": ["사업가", "공무원", "농업인", "건축가"],
        },
        "소양인": {
            "organ_strong": "비장",
            "organ_weak": "신장",
            "body_type": "가슴 발달, 엉덩이 작음, 날렵함",
            "personality": "활발함, 급함, 정의감, 외향적",
            "strengths": ["판단력", "행동력", "봉사정신", "정의감"],
            "weaknesses": ["성급함", "경솔함", "지속력 부족"],
            "health_tips": ["신장 기능 보강", "충분한 수분 섭취", "마음 안정"],
            "foods_good": ["돼지고기", "오이", "수박", "보리"],
            "foods_bad": ["닭고기", "인삼", "꿀"],
            "careers": ["언론인", "교사", "사회운동가", "외교관"],
        },
        "소음인": {
            "organ_strong": "신장",
            "organ_weak": "비장",
            "body_type": "체격 작음, 상체보다 하체 발달",
            "personality": "내성적, 꼼꼼함, 치밀함, 소심함",
            "strengths": ["섬세함", "분석력", "책임감", "신중함"],
            "weaknesses": ["소극적", "걱정 많음", "체력 약함"],
            "health_tips": ["소화기능 보강", "따뜻한 음식", "스트레스 관리"],
            "foods_good": ["닭고기", "찹쌀", "인삼", "대추"],
            "foods_bad": ["돼지고기", "냉면", "찬 음식"],
            "careers": ["연구원", "회계사", "프로그래머", "작가"],
        },
    }

    async def calculate_result(
        self, session_id: str
    ) -> Tuple[dict[str, Any], str]:
        responses = await self.get_responses(session_id)

        # 체질별 점수 계산
        scores = {"태양인": 0, "태음인": 0, "소양인": 0, "소음인": 0}

        # 영역별 점수
        area_scores = {
            "body": {"태양인": 0, "태음인": 0, "소양인": 0, "소음인": 0},
            "personality": {"태양인": 0, "태음인": 0, "소양인": 0, "소음인": 0},
            "health": {"태양인": 0, "태음인": 0, "소양인": 0, "소음인": 0},
            "preference": {"태양인": 0, "태음인": 0, "소양인": 0, "소음인": 0},
        }

        for response in responses:
            question = response.get("questions", {})
            answer = response.get("answer")
            scoring = question.get("scoring_weights", {})
            area = question.get("scoring_weights", {}).get("area", "personality")

            if answer is not None and scoring:
                for constitution, weight in scoring.items():
                    if constitution in scores:
                        if isinstance(answer, (int, float)):
                            scores[constitution] += weight * answer
                            if area in area_scores:
                                area_scores[area][constitution] += weight * answer
                        elif isinstance(answer, str):
                            answer_weight = scoring.get(answer, 0)
                            if isinstance(answer_weight, dict):
                                for c, w in answer_weight.items():
                                    if c in scores:
                                        scores[c] += w

        # 체질 결정
        sorted_constitutions = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        primary = sorted_constitutions[0][0]
        secondary = sorted_constitutions[1][0] if len(sorted_constitutions) > 1 else None

        # 확신도 계산
        total = sum(scores.values())
        confidence = (scores[primary] / total * 100) if total > 0 else 0

        raw_scores = {
            "scores": scores,
            "area_scores": area_scores,
            "primary": primary,
            "secondary": secondary,
            "confidence": round(confidence, 1),
        }

        return raw_scores, primary

    def interpret_result(
        self, raw_scores: dict[str, Any], result_type: str
    ) -> dict[str, Any]:
        scores = raw_scores.get("scores", {})
        primary = raw_scores.get("primary", "태음인")
        secondary = raw_scores.get("secondary")
        confidence = raw_scores.get("confidence", 0)

        constitution_info = self.CONSTITUTIONS.get(primary, {})

        # 점수 정규화 (0-100)
        total = sum(scores.values())
        normalized = {k: round(v / total * 100, 1) if total > 0 else 25 for k, v in scores.items()}

        return {
            "result_type": result_type,
            "constitution": primary,
            "confidence": confidence,
            "all_scores": normalized,
            "secondary_constitution": secondary,
            "body_type": constitution_info.get("body_type", ""),
            "organ_info": {
                "strong": constitution_info.get("organ_strong", ""),
                "weak": constitution_info.get("organ_weak", ""),
            },
            "personality": constitution_info.get("personality", ""),
            "strengths": constitution_info.get("strengths", []),
            "weaknesses": constitution_info.get("weaknesses", []),
            "health_tips": constitution_info.get("health_tips", []),
            "diet_recommendations": {
                "good": constitution_info.get("foods_good", []),
                "bad": constitution_info.get("foods_bad", []),
            },
            "suitable_careers": constitution_info.get("careers", []),
            "lifestyle_advice": self._get_lifestyle_advice(primary),
            "exercise_advice": self._get_exercise_advice(primary),
        }

    def _get_lifestyle_advice(self, constitution: str) -> list[str]:
        """체질별 생활 조언"""
        advice = {
            "태양인": [
                "과로를 피하고 충분히 쉬세요",
                "하체 운동을 꾸준히 하세요",
                "급한 결정은 하루 미루세요",
            ],
            "태음인": [
                "규칙적인 운동으로 체중을 관리하세요",
                "새로운 것에 도전해보세요",
                "과식을 피하고 소식하세요",
            ],
            "소양인": [
                "충분한 수분을 섭취하세요",
                "명상이나 요가로 마음을 안정시키세요",
                "결정 전 충분히 생각하세요",
            ],
            "소음인": [
                "따뜻한 음식을 드세요",
                "가벼운 운동을 꾸준히 하세요",
                "긍정적인 생각을 키우세요",
            ],
        }
        return advice.get(constitution, [])

    def _get_exercise_advice(self, constitution: str) -> str:
        """체질별 운동 조언"""
        advice = {
            "태양인": "수영, 걷기, 하체 근력 운동이 좋습니다. 격렬한 운동보다 꾸준한 운동이 중요합니다.",
            "태음인": "등산, 조깅, 유산소 운동이 좋습니다. 땀을 많이 흘리는 운동이 도움됩니다.",
            "소양인": "수영, 산책, 명상이 좋습니다. 마음을 차분하게 하는 운동이 도움됩니다.",
            "소음인": "가벼운 산책, 스트레칭, 요가가 좋습니다. 무리하지 않는 운동이 중요합니다.",
        }
        return advice.get(constitution, "자신에게 맞는 운동을 꾸준히 하세요.")
