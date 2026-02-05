from typing import Tuple, Any

from app.tests_engine.base import BaseTestEngine, register_engine


@register_engine
class DISCEngine(BaseTestEngine):
    """DISC 행동 유형 검사 엔진"""

    test_code = "disc"
    test_name = "DISC 행동 유형 검사"

    # DISC 유형 설명
    TYPE_DESCRIPTIONS = {
        "D": {
            "name": "주도형 (Dominance)",
            "description": "결과 지향적이고 직접적이며 단호한 성향",
            "keywords": ["결단력", "자신감", "직접적", "경쟁적"],
            "strengths": ["빠른 의사결정", "목표 달성력", "리더십", "도전 정신"],
            "weaknesses": ["참을성 부족", "둔감함", "지배적", "충동적"],
            "communication": "요점만 말하고, 결과에 초점을 맞춰 소통",
            "work_style": "빠르게 행동하고 결과를 중시",
        },
        "I": {
            "name": "사교형 (Influence)",
            "description": "열정적이고 사교적이며 낙관적인 성향",
            "keywords": ["열정", "사교성", "낙관적", "설득력"],
            "strengths": ["팀 분위기 조성", "네트워킹", "창의적 아이디어", "동기 부여"],
            "weaknesses": ["세부사항 간과", "충동적", "비조직적", "과대 약속"],
            "communication": "친근하고 감정적으로 소통",
            "work_style": "협업을 선호하고 인정받기를 원함",
        },
        "S": {
            "name": "안정형 (Steadiness)",
            "description": "차분하고 인내심이 강하며 협조적인 성향",
            "keywords": ["인내심", "신뢰성", "협조적", "차분함"],
            "strengths": ["팀워크", "경청", "신뢰성", "인내심"],
            "weaknesses": ["변화 저항", "결단력 부족", "갈등 회피", "수동적"],
            "communication": "부드럽고 지지적으로 소통",
            "work_style": "안정적인 환경에서 꾸준히 일함",
        },
        "C": {
            "name": "신중형 (Conscientiousness)",
            "description": "분석적이고 정확하며 체계적인 성향",
            "keywords": ["정확성", "분석적", "체계적", "품질 중시"],
            "strengths": ["분석력", "정확성", "품질 관리", "문제 해결"],
            "weaknesses": ["비판적", "완벽주의", "의사결정 지연", "융통성 부족"],
            "communication": "논리적이고 데이터 기반으로 소통",
            "work_style": "체계적으로 계획하고 실행",
        },
    }

    # 복합 유형 설명
    COMPOSITE_TYPES = {
        "Di": "목표 지향적이면서 사람들을 이끄는 리더",
        "Dc": "분석적 사고와 결단력을 겸비한 전략가",
        "Id": "사교적이면서 결과를 추구하는 영향력자",
        "Is": "따뜻하고 지지적인 팀 플레이어",
        "Si": "협조적이면서 긍정적인 조력자",
        "Sc": "신중하고 꼼꼼한 지원자",
        "Cd": "분석적이면서 추진력 있는 문제 해결사",
        "Cs": "정확하고 신뢰할 수 있는 전문가",
    }

    async def calculate_result(
        self, session_id: str
    ) -> Tuple[dict[str, Any], str]:
        responses = await self.get_responses(session_id)

        # 각 유형별 점수 계산
        scores = {"D": 0, "I": 0, "S": 0, "C": 0}

        for response in responses:
            question = response.get("questions", {})
            answer = response.get("answer")
            scoring = question.get("scoring_weights", {})

            if answer is not None and scoring:
                for disc_type, weight in scoring.items():
                    if disc_type in scores:
                        if isinstance(answer, (int, float)):
                            scores[disc_type] += weight * answer
                        elif isinstance(answer, str) and answer in scoring:
                            scores[disc_type] += scoring[answer]

        # 정규화 (0-100 스케일)
        max_score = max(scores.values()) if scores.values() else 1
        normalized = {k: round(v / max_score * 100, 1) for k, v in scores.items()}

        # 주요 유형과 보조 유형 결정
        sorted_types = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        primary = sorted_types[0][0]
        secondary = sorted_types[1][0] if len(sorted_types) > 1 else ""

        # 복합 유형 코드 (예: Di, Cd)
        result_type = f"{primary}{secondary.lower()}" if secondary else primary

        raw_scores = {
            "D": scores["D"],
            "I": scores["I"],
            "S": scores["S"],
            "C": scores["C"],
            "D_normalized": normalized["D"],
            "I_normalized": normalized["I"],
            "S_normalized": normalized["S"],
            "C_normalized": normalized["C"],
            "primary": primary,
            "secondary": secondary,
        }

        return raw_scores, result_type

    def interpret_result(
        self, raw_scores: dict[str, Any], result_type: str
    ) -> dict[str, Any]:
        primary = raw_scores.get("primary", result_type[0])
        primary_info = self.TYPE_DESCRIPTIONS.get(primary, {})

        return {
            "result_type": result_type,
            "primary_type": primary,
            "primary_name": primary_info.get("name", ""),
            "description": primary_info.get("description", ""),
            "keywords": primary_info.get("keywords", []),
            "strengths": primary_info.get("strengths", []),
            "weaknesses": primary_info.get("weaknesses", []),
            "communication_style": primary_info.get("communication", ""),
            "work_style": primary_info.get("work_style", ""),
            "composite_description": self.COMPOSITE_TYPES.get(result_type, ""),
            "scores": {
                "D": raw_scores.get("D_normalized", 0),
                "I": raw_scores.get("I_normalized", 0),
                "S": raw_scores.get("S_normalized", 0),
                "C": raw_scores.get("C_normalized", 0),
            },
        }
