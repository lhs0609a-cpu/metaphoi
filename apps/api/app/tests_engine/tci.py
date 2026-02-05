from typing import Tuple, Any

from app.tests_engine.base import BaseTestEngine, register_engine


@register_engine
class TCIEngine(BaseTestEngine):
    """TCI (Temperament and Character Inventory) 기질 및 성격 검사 엔진"""

    test_code = "tci"
    test_name = "TCI 기질 및 성격 검사"

    # 4가지 기질 차원
    TEMPERAMENTS = {
        "NS": {
            "name": "자극추구 (Novelty Seeking)",
            "high": "탐험적, 충동적, 무질서한, 열정적",
            "low": "신중한, 절제된, 체계적, 냉정한",
        },
        "HA": {
            "name": "위험회피 (Harm Avoidance)",
            "high": "걱정이 많은, 비관적, 수줍은, 쉽게 지치는",
            "low": "낙관적, 대담한, 외향적, 활기찬",
        },
        "RD": {
            "name": "사회적 민감성 (Reward Dependence)",
            "high": "감상적, 개방적, 따뜻한, 헌신적",
            "low": "실용적, 냉담한, 독립적, 무관심한",
        },
        "PS": {
            "name": "인내력 (Persistence)",
            "high": "근면한, 결단력 있는, 완벽주의적",
            "low": "게으른, 불안정한, 포기가 빠른",
        },
    }

    # 3가지 성격 차원
    CHARACTERS = {
        "SD": {
            "name": "자율성 (Self-Directedness)",
            "high": "책임감 있는, 목표지향적, 자기수용적",
            "low": "비난하는, 목표가 없는, 자기비하적",
        },
        "CO": {
            "name": "연대감 (Cooperativeness)",
            "high": "사회적으로 관용적, 공감적, 도움이 되는",
            "low": "사회적으로 편협한, 무관심한, 적대적",
        },
        "ST": {
            "name": "자기초월 (Self-Transcendence)",
            "high": "자아초월적, 영적, 이상주의적",
            "low": "자아중심적, 물질주의적, 실용적",
        },
    }

    async def calculate_result(
        self, session_id: str
    ) -> Tuple[dict[str, Any], str]:
        responses = await self.get_responses(session_id)

        # 각 차원별 점수 계산
        scores = {
            "NS": 0, "HA": 0, "RD": 0, "PS": 0,  # 기질
            "SD": 0, "CO": 0, "ST": 0,  # 성격
        }
        max_scores = {
            "NS": 40, "HA": 35, "RD": 24, "PS": 8,
            "SD": 44, "CO": 42, "ST": 33,
        }

        for response in responses:
            question = response.get("questions", {})
            answer = response.get("answer")
            scoring = question.get("scoring_weights", {})

            if answer is not None and scoring:
                for dimension, weight in scoring.items():
                    if dimension in scores:
                        if isinstance(answer, (int, float)):
                            scores[dimension] += weight * answer
                        elif answer == True or answer == "true":
                            scores[dimension] += weight

        # T점수로 변환 (평균 50, 표준편차 10)
        t_scores = {}
        for dim, score in scores.items():
            max_score = max_scores.get(dim, 100)
            percentile = (score / max_score) * 100 if max_score > 0 else 50
            t_scores[dim] = round(50 + (percentile - 50) * 0.2, 1)

        # 주요 기질 유형 결정
        temperament_profile = self._determine_profile(scores, ["NS", "HA", "RD", "PS"])
        character_profile = self._determine_profile(scores, ["SD", "CO", "ST"])

        result_type = f"{temperament_profile}-{character_profile}"

        raw_scores = {
            **scores,
            "t_scores": t_scores,
            "temperament_profile": temperament_profile,
            "character_profile": character_profile,
        }

        return raw_scores, result_type

    def _determine_profile(self, scores: dict, dimensions: list) -> str:
        """높은 점수의 차원들을 조합하여 프로필 생성"""
        high_dims = []
        for dim in dimensions:
            # 상위 50% 이상이면 high로 판단
            if dim in ["NS", "HA", "RD", "PS"]:
                threshold = {"NS": 20, "HA": 17, "RD": 12, "PS": 4}
            else:
                threshold = {"SD": 22, "CO": 21, "ST": 16}

            if scores.get(dim, 0) >= threshold.get(dim, 0):
                high_dims.append(dim[0])  # 첫 글자만

        return "".join(high_dims) if high_dims else "Balanced"

    def interpret_result(
        self, raw_scores: dict[str, Any], result_type: str
    ) -> dict[str, Any]:
        t_scores = raw_scores.get("t_scores", {})

        temperament_analysis = []
        for dim, info in self.TEMPERAMENTS.items():
            score = t_scores.get(dim, 50)
            level = "높음" if score >= 55 else "낮음" if score <= 45 else "보통"
            description = info["high"] if score >= 55 else info["low"] if score <= 45 else "균형잡힌"
            temperament_analysis.append({
                "dimension": dim,
                "name": info["name"],
                "t_score": score,
                "level": level,
                "description": description,
            })

        character_analysis = []
        for dim, info in self.CHARACTERS.items():
            score = t_scores.get(dim, 50)
            level = "높음" if score >= 55 else "낮음" if score <= 45 else "보통"
            description = info["high"] if score >= 55 else info["low"] if score <= 45 else "균형잡힌"
            character_analysis.append({
                "dimension": dim,
                "name": info["name"],
                "t_score": score,
                "level": level,
                "description": description,
            })

        return {
            "result_type": result_type,
            "temperament_profile": raw_scores.get("temperament_profile"),
            "character_profile": raw_scores.get("character_profile"),
            "temperament_analysis": temperament_analysis,
            "character_analysis": character_analysis,
            "overall_interpretation": self._get_overall_interpretation(t_scores),
        }

    def _get_overall_interpretation(self, t_scores: dict) -> str:
        """전체적인 해석 생성"""
        sd = t_scores.get("SD", 50)
        co = t_scores.get("CO", 50)

        if sd >= 55 and co >= 55:
            return "성숙하고 적응력이 뛰어난 성격으로, 자기 자신과 타인 모두에게 긍정적인 태도를 보입니다."
        elif sd >= 55:
            return "자기 주도적이고 목표 지향적이나, 대인관계에서 더 많은 공감과 협력이 필요할 수 있습니다."
        elif co >= 55:
            return "타인과의 관계에서 협력적이고 공감적이나, 자기 자신의 목표와 가치를 더 명확히 할 필요가 있습니다."
        else:
            return "성격 발달의 여지가 있으며, 자기 이해와 대인관계 기술 향상을 통해 더 성숙해질 수 있습니다."
