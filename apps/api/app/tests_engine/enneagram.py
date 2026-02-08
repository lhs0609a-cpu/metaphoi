from typing import Tuple, Any

from app.tests_engine.base import BaseTestEngine, register_engine


@register_engine
class EnneagramEngine(BaseTestEngine):
    """에니어그램 검사 엔진"""

    test_code = "enneagram"
    test_name = "에니어그램 성격 유형 검사"

    # 9가지 유형 설명
    TYPE_DESCRIPTIONS = {
        1: {
            "name": "개혁가 (The Reformer)",
            "core_desire": "올바르게 살고 싶다",
            "core_fear": "나쁜 사람이 되는 것",
            "description": "원칙적이고 이상주의적이며 윤리적인 유형. 옳고 그름에 대한 강한 감각을 가지고 있습니다.",
            "strengths": ["정직함", "책임감", "자기 규율", "목적 의식"],
            "weaknesses": ["비판적", "완벽주의", "융통성 부족", "자기 비판"],
            "growth_direction": 7,  # 스트레스 시 4, 성장 시 7
            "stress_direction": 4,
        },
        2: {
            "name": "조력자 (The Helper)",
            "core_desire": "사랑받고 싶다",
            "core_fear": "사랑받지 못하는 것",
            "description": "배려심 깊고 대인 관계 지향적이며 관대한 유형. 다른 사람을 돕는 것에서 의미를 찾습니다.",
            "strengths": ["배려심", "관대함", "공감 능력", "따뜻함"],
            "weaknesses": ["자기희생", "소유욕", "조종적", "인정 욕구"],
            "growth_direction": 4,
            "stress_direction": 8,
        },
        3: {
            "name": "성취자 (The Achiever)",
            "core_desire": "가치 있는 존재가 되고 싶다",
            "core_fear": "가치 없는 존재가 되는 것",
            "description": "성공 지향적이고 적응력이 뛰어나며 추진력 있는 유형. 성취와 이미지를 중요시합니다.",
            "strengths": ["야망", "자신감", "효율성", "적응력"],
            "weaknesses": ["이미지 집착", "경쟁심", "감정 회피", "허영심"],
            "growth_direction": 6,
            "stress_direction": 9,
        },
        4: {
            "name": "예술가 (The Individualist)",
            "core_desire": "자신만의 정체성을 찾고 싶다",
            "core_fear": "평범해지는 것",
            "description": "감수성이 풍부하고 자아 인식이 강하며 독창적인 유형. 깊은 감정과 의미를 추구합니다.",
            "strengths": ["창의성", "직관력", "공감 능력", "진정성"],
            "weaknesses": ["우울함", "질투심", "자기 몰두", "변덕"],
            "growth_direction": 1,
            "stress_direction": 2,
        },
        5: {
            "name": "탐구자 (The Investigator)",
            "core_desire": "유능하고 지식이 풍부해지고 싶다",
            "core_fear": "무능하고 쓸모없어지는 것",
            "description": "분석적이고 통찰력 있으며 지적인 유형. 지식 습득과 이해에 집중합니다.",
            "strengths": ["분석력", "객관성", "통찰력", "자립심"],
            "weaknesses": ["고립", "인색함", "초연함", "비밀주의"],
            "growth_direction": 8,
            "stress_direction": 7,
        },
        6: {
            "name": "충성가 (The Loyalist)",
            "core_desire": "안전과 지지를 얻고 싶다",
            "core_fear": "지지와 안내 없이 홀로 남겨지는 것",
            "description": "헌신적이고 책임감 있으며 안전 지향적인 유형. 신뢰와 충성을 중요시합니다.",
            "strengths": ["충성심", "책임감", "근면함", "용기"],
            "weaknesses": ["불안", "의심", "방어적", "우유부단"],
            "growth_direction": 9,
            "stress_direction": 3,
        },
        7: {
            "name": "열정가 (The Enthusiast)",
            "core_desire": "만족하고 충족되고 싶다",
            "core_fear": "박탈당하고 고통받는 것",
            "description": "다재다능하고 낙관적이며 자발적인 유형. 새로운 경험과 즐거움을 추구합니다.",
            "strengths": ["낙관성", "다재다능", "자발성", "모험심"],
            "weaknesses": ["산만함", "충동적", "회피적", "무책임"],
            "growth_direction": 5,
            "stress_direction": 1,
        },
        8: {
            "name": "도전자 (The Challenger)",
            "core_desire": "자신을 보호하고 통제하고 싶다",
            "core_fear": "다른 사람에게 통제당하는 것",
            "description": "강하고 지배적이며 자신감 있는 유형. 독립성과 영향력을 중요시합니다.",
            "strengths": ["자신감", "결단력", "리더십", "보호 본능"],
            "weaknesses": ["지배적", "대립적", "과도한 강인함", "통제욕"],
            "growth_direction": 2,
            "stress_direction": 5,
        },
        9: {
            "name": "중재자 (The Peacemaker)",
            "core_desire": "평화와 조화를 유지하고 싶다",
            "core_fear": "상실과 분리",
            "description": "수용적이고 신뢰할 수 있으며 안정적인 유형. 조화와 평화를 추구합니다.",
            "strengths": ["평화로움", "수용성", "신뢰성", "지지력"],
            "weaknesses": ["수동적", "게으름", "고집", "자기 방치"],
            "growth_direction": 3,
            "stress_direction": 6,
        },
    }

    # 날개 유형 설명
    WING_DESCRIPTIONS = {
        "1w9": "이상주의자 - 평화롭고 원칙적인",
        "1w2": "옹호자 - 도움을 주고 원칙적인",
        "2w1": "하인 - 도움을 주고 원칙적인",
        "2w3": "주최자 - 야심 있고 매력적인",
        "3w2": "매력가 - 사교적이고 성취 지향적인",
        "3w4": "전문가 - 진지하고 성취 지향적인",
        "4w3": "귀족 - 야심 있고 창의적인",
        "4w5": "보헤미안 - 지적이고 창의적인",
        "5w4": "우상파괴자 - 창의적이고 분석적인",
        "5w6": "문제해결사 - 분석적이고 신중한",
        "6w5": "방어자 - 신중하고 충성스러운",
        "6w7": "친구 - 활기차고 충성스러운",
        "7w6": "연예인 - 재미있고 책임감 있는",
        "7w8": "현실주의자 - 대담하고 활기찬",
        "8w7": "독립자 - 대담하고 자신감 있는",
        "8w9": "곰 - 강하고 차분한",
        "9w8": "심판자 - 차분하고 강인한",
        "9w1": "몽상가 - 이상주의적이고 평화로운",
    }

    async def calculate_result(
        self, session_id: str
    ) -> Tuple[dict[str, Any], str]:
        responses = await self.get_responses(session_id)

        # 각 유형별 점수 계산 (1-9)
        scores = {i: 0 for i in range(1, 10)}

        for response in responses:
            question = response.get("questions", {})
            answer = response.get("answer")
            scoring = question.get("scoring_weights", {})

            if answer is not None and scoring:
                for type_num, weight in scoring.items():
                    type_int = int(type_num) if isinstance(type_num, str) else type_num
                    if type_int in scores:
                        if isinstance(answer, (int, float)):
                            scores[type_int] += weight * answer
                        elif isinstance(answer, str):
                            scores[type_int] += weight

        # 주요 유형 결정
        sorted_types = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        primary_type = sorted_types[0][0]

        # 날개 결정 (인접 유형 중 높은 점수)
        wing_options = [
            primary_type - 1 if primary_type > 1 else 9,
            primary_type + 1 if primary_type < 9 else 1,
        ]
        wing = max(wing_options, key=lambda x: scores[x])

        result_type = f"{primary_type}w{wing}"

        raw_scores = {
            **{str(k): v for k, v in scores.items()},
            "primary_type": primary_type,
            "wing": wing,
            "top_three": [t[0] for t in sorted_types[:3]],
        }

        return raw_scores, result_type

    def interpret_result(
        self, raw_scores: dict[str, Any], result_type: str
    ) -> dict[str, Any]:
        primary_type = raw_scores.get("primary_type", 1)
        type_info = self.TYPE_DESCRIPTIONS.get(primary_type, {})

        return {
            "result_type": result_type,
            "primary_type": primary_type,
            "type_name": type_info.get("name", ""),
            "core_desire": type_info.get("core_desire", ""),
            "core_fear": type_info.get("core_fear", ""),
            "description": type_info.get("description", ""),
            "strengths": type_info.get("strengths", []),
            "weaknesses": type_info.get("weaknesses", []),
            "growth_direction": type_info.get("growth_direction"),
            "stress_direction": type_info.get("stress_direction"),
            "wing_description": self.WING_DESCRIPTIONS.get(result_type, ""),
            "scores": {str(k): v for k, v in raw_scores.items() if k not in ["primary_type", "wing", "top_three"]},
            "top_three_types": raw_scores.get("top_three", []),
        }
