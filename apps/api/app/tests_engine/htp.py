from typing import Tuple, Any
import json

from app.tests_engine.base import BaseTestEngine, register_engine


@register_engine
class HTPEngine(BaseTestEngine):
    """HTP (House-Tree-Person) 그림 검사 엔진"""

    test_code = "htp"
    test_name = "HTP 그림 심리 검사"

    # 그림 요소별 해석 기준
    HOUSE_ELEMENTS = {
        "size": {
            "large": "자기 확대 욕구, 자신감",
            "small": "위축감, 열등감",
            "normal": "적절한 자기상",
        },
        "door": {
            "large": "개방적, 사회적",
            "small": "폐쇄적, 방어적",
            "absent": "고립감, 접근 불가",
        },
        "windows": {
            "many": "환경에 대한 관심, 개방성",
            "few": "내향적, 폐쇄적",
            "curtains": "방어성, 프라이버시 중시",
        },
        "chimney": {
            "present": "따뜻함, 가정에 대한 욕구",
            "smoke": "감정 표현, 긴장",
            "absent": "감정 억제",
        },
        "roof": {
            "large": "환상, 상상력 풍부",
            "small": "현실적, 실용적",
        },
    }

    TREE_ELEMENTS = {
        "trunk": {
            "thick": "자아 강도, 안정감",
            "thin": "자아 취약성",
            "scarred": "심리적 상처",
        },
        "branches": {
            "reaching_up": "성취욕, 낙관",
            "drooping": "우울감, 무력감",
            "broken": "좌절 경험",
        },
        "roots": {
            "visible": "안정 욕구, 근원에 대한 관심",
            "absent": "불안정감",
        },
        "leaves": {
            "many": "활력, 성장",
            "few": "에너지 부족",
            "falling": "상실감",
        },
        "fruit": {
            "present": "성취, 결실",
            "absent": "노력 중",
        },
    }

    PERSON_ELEMENTS = {
        "size": {
            "large": "자기 확대, 자신감",
            "small": "자기 비하, 열등감",
        },
        "head": {
            "large": "지적 관심, 통제 욕구",
            "small": "지적 열등감",
        },
        "eyes": {
            "large": "관찰력, 의심",
            "closed": "현실 회피",
            "detailed": "사회적 관심",
        },
        "arms": {
            "outstretched": "개방적, 환경과의 접촉 욕구",
            "hidden": "방어적, 죄책감",
            "absent": "무력감",
        },
        "legs": {
            "long": "자율성, 독립 욕구",
            "short": "억압, 제한",
            "absent": "이동성 부족",
        },
    }

    async def calculate_result(
        self, session_id: str
    ) -> Tuple[dict[str, Any], str]:
        responses = await self.get_responses(session_id)

        # 그림 분석 결과 수집 (AI 분석 또는 사용자 자가 평가)
        drawings = {"house": {}, "tree": {}, "person": {}}
        analysis_notes = []

        for response in responses:
            question = response.get("questions", {})
            answer = response.get("answer")
            drawing_type = question.get("scoring_weights", {}).get("type", "house")

            if answer is not None:
                if isinstance(answer, dict):
                    drawings[drawing_type] = answer
                elif isinstance(answer, str):
                    try:
                        drawings[drawing_type] = json.loads(answer)
                    except:
                        # 이미지 URL 또는 Base64 데이터인 경우
                        drawings[drawing_type]["image_data"] = answer

        # 각 그림별 점수 산출
        house_score = self._analyze_house(drawings.get("house", {}))
        tree_score = self._analyze_tree(drawings.get("tree", {}))
        person_score = self._analyze_person(drawings.get("person", {}))

        # 종합 분석
        overall_traits = self._determine_traits(house_score, tree_score, person_score)

        raw_scores = {
            "house_analysis": house_score,
            "tree_analysis": tree_score,
            "person_analysis": person_score,
            "overall_traits": overall_traits,
        }

        # 결과 유형 (주요 특성 기반)
        primary_trait = overall_traits[0] if overall_traits else "분석필요"
        result_type = primary_trait

        return raw_scores, result_type

    def _analyze_house(self, drawing: dict) -> dict:
        """집 그림 분석"""
        features = drawing.get("features", {})
        analysis = {
            "security": 50,  # 안정감
            "family": 50,    # 가정에 대한 태도
            "openness": 50,  # 개방성
        }

        if features.get("size") == "large":
            analysis["security"] += 15
        elif features.get("size") == "small":
            analysis["security"] -= 15

        if features.get("door") == "large":
            analysis["openness"] += 20
        elif features.get("door") == "small":
            analysis["openness"] -= 15

        if features.get("chimney") == "present":
            analysis["family"] += 15

        if features.get("windows") == "many":
            analysis["openness"] += 10

        return {
            "scores": analysis,
            "interpretation": self._get_house_interpretation(analysis),
        }

    def _analyze_tree(self, drawing: dict) -> dict:
        """나무 그림 분석"""
        features = drawing.get("features", {})
        analysis = {
            "ego_strength": 50,  # 자아 강도
            "growth": 50,        # 성장 욕구
            "stability": 50,     # 안정성
        }

        if features.get("trunk") == "thick":
            analysis["ego_strength"] += 20
        elif features.get("trunk") == "thin":
            analysis["ego_strength"] -= 15

        if features.get("branches") == "reaching_up":
            analysis["growth"] += 20
        elif features.get("branches") == "drooping":
            analysis["growth"] -= 20

        if features.get("roots") == "visible":
            analysis["stability"] += 15
        elif features.get("roots") == "absent":
            analysis["stability"] -= 10

        if features.get("leaves") == "many":
            analysis["growth"] += 10

        return {
            "scores": analysis,
            "interpretation": self._get_tree_interpretation(analysis),
        }

    def _analyze_person(self, drawing: dict) -> dict:
        """사람 그림 분석"""
        features = drawing.get("features", {})
        analysis = {
            "self_concept": 50,  # 자아상
            "social": 50,        # 사회성
            "autonomy": 50,      # 자율성
        }

        if features.get("size") == "large":
            analysis["self_concept"] += 15
        elif features.get("size") == "small":
            analysis["self_concept"] -= 20

        if features.get("arms") == "outstretched":
            analysis["social"] += 20
        elif features.get("arms") == "hidden":
            analysis["social"] -= 15

        if features.get("eyes") == "detailed":
            analysis["social"] += 10

        if features.get("legs") == "long":
            analysis["autonomy"] += 15

        return {
            "scores": analysis,
            "interpretation": self._get_person_interpretation(analysis),
        }

    def _determine_traits(self, house: dict, tree: dict, person: dict) -> list:
        """종합 특성 도출"""
        traits = []

        house_scores = house.get("scores", {})
        tree_scores = tree.get("scores", {})
        person_scores = person.get("scores", {})

        # 안정성
        stability = (house_scores.get("security", 50) + tree_scores.get("stability", 50)) / 2
        if stability >= 60:
            traits.append("안정지향적")
        elif stability < 40:
            traits.append("변화추구적")

        # 사회성
        social = (house_scores.get("openness", 50) + person_scores.get("social", 50)) / 2
        if social >= 60:
            traits.append("사교적")
        elif social < 40:
            traits.append("내향적")

        # 자아강도
        ego = (tree_scores.get("ego_strength", 50) + person_scores.get("self_concept", 50)) / 2
        if ego >= 60:
            traits.append("자신감있음")
        elif ego < 40:
            traits.append("자기성찰필요")

        # 성장욕구
        if tree_scores.get("growth", 50) >= 60:
            traits.append("성장지향적")

        return traits if traits else ["균형잡힌"]

    def _get_house_interpretation(self, scores: dict) -> str:
        security = scores.get("security", 50)
        openness = scores.get("openness", 50)

        if security >= 60 and openness >= 60:
            return "가정에 대해 안정감을 느끼며 외부 세계에도 개방적입니다."
        elif security >= 60:
            return "가정은 안식처이지만 외부와의 경계를 중시합니다."
        elif openness >= 60:
            return "사회적 관계를 중시하지만 내면의 안정이 필요합니다."
        else:
            return "가정과 외부 세계 모두에서 더 많은 안정감이 필요합니다."

    def _get_tree_interpretation(self, scores: dict) -> str:
        ego = scores.get("ego_strength", 50)
        growth = scores.get("growth", 50)

        if ego >= 60 and growth >= 60:
            return "건강한 자아를 바탕으로 성장과 발전을 추구합니다."
        elif ego >= 60:
            return "안정적인 자아를 가지고 있으나 새로운 도전이 필요합니다."
        elif growth >= 60:
            return "성장 욕구가 강하며 자아 강화가 이를 뒷받침할 것입니다."
        else:
            return "내면의 안정과 성장에 대한 관심이 필요합니다."

    def _get_person_interpretation(self, scores: dict) -> str:
        self_concept = scores.get("self_concept", 50)
        social = scores.get("social", 50)

        if self_concept >= 60 and social >= 60:
            return "긍정적인 자기상과 활발한 사회적 관계를 가지고 있습니다."
        elif self_concept >= 60:
            return "자신에 대해 긍정적이나 타인과의 관계 확장이 도움이 됩니다."
        elif social >= 60:
            return "타인과의 관계를 중시하며 자기 인식 강화가 필요합니다."
        else:
            return "자기 이해와 사회적 관계 모두에서 성장의 기회가 있습니다."

    def interpret_result(
        self, raw_scores: dict[str, Any], result_type: str
    ) -> dict[str, Any]:
        house = raw_scores.get("house_analysis", {})
        tree = raw_scores.get("tree_analysis", {})
        person = raw_scores.get("person_analysis", {})
        traits = raw_scores.get("overall_traits", [])

        return {
            "result_type": result_type,
            "house_analysis": {
                "scores": house.get("scores", {}),
                "interpretation": house.get("interpretation", ""),
                "meaning": "집은 가정, 안정, 자기의 영역을 상징합니다.",
            },
            "tree_analysis": {
                "scores": tree.get("scores", {}),
                "interpretation": tree.get("interpretation", ""),
                "meaning": "나무는 자아의 성장, 생명력, 무의식을 상징합니다.",
            },
            "person_analysis": {
                "scores": person.get("scores", {}),
                "interpretation": person.get("interpretation", ""),
                "meaning": "사람은 자기상, 대인관계, 신체상을 상징합니다.",
            },
            "overall_traits": traits,
            "overall_interpretation": self._get_overall_interpretation(traits),
            "recommendations": self._get_recommendations(house, tree, person),
            "disclaimer": "그림 분석은 전문가의 해석이 필요하며, 이 결과는 참고용입니다.",
        }

    def _get_overall_interpretation(self, traits: list) -> str:
        if "안정지향적" in traits and "사교적" in traits:
            return "안정적인 기반 위에서 활발한 사회생활을 하는 균형 잡힌 성격입니다."
        elif "성장지향적" in traits and "자신감있음" in traits:
            return "자신감을 바탕으로 지속적인 성장과 발전을 추구하는 성격입니다."
        elif "내향적" in traits:
            return "내면의 세계를 중시하며 깊이 있는 사고를 하는 성격입니다."
        else:
            return "다양한 측면에서 균형을 이루고 있는 성격입니다."

    def _get_recommendations(self, house: dict, tree: dict, person: dict) -> list[str]:
        recommendations = []

        house_security = house.get("scores", {}).get("security", 50)
        tree_ego = tree.get("scores", {}).get("ego_strength", 50)
        person_social = person.get("scores", {}).get("social", 50)

        if house_security < 50:
            recommendations.append("일상에서 안정감을 느낄 수 있는 루틴을 만들어보세요.")
        if tree_ego < 50:
            recommendations.append("자신의 강점을 인식하고 긍정적 자기대화를 실천해보세요.")
        if person_social < 50:
            recommendations.append("소규모 모임이나 활동을 통해 사회적 연결을 넓혀보세요.")

        if not recommendations:
            recommendations.append("현재의 균형 잡힌 상태를 유지하세요.")

        return recommendations
