from typing import Tuple, Any

from app.tests_engine.base import BaseTestEngine, register_engine


@register_engine
class FaceEngine(BaseTestEngine):
    """관상 분석 엔진 (이미지 분석 기반)"""

    test_code = "face"
    test_name = "관상 분석"

    # 얼굴 부위별 해석 기준
    FACE_PARTS = {
        "forehead": {
            "wide": {"trait": "지적 능력, 계획성", "career": "학자, 기획자"},
            "narrow": {"trait": "실행력, 집중력", "career": "전문가, 장인"},
            "high": {"trait": "이상주의, 철학적", "career": "예술가, 사상가"},
            "low": {"trait": "현실적, 실용적", "career": "사업가, 기술자"},
        },
        "eyebrows": {
            "thick": {"trait": "강한 의지, 결단력", "personality": "적극적"},
            "thin": {"trait": "섬세함, 예민함", "personality": "신중함"},
            "straight": {"trait": "논리적, 원칙적", "personality": "냉철함"},
            "curved": {"trait": "부드러움, 유연성", "personality": "온화함"},
        },
        "eyes": {
            "large": {"trait": "감수성, 표현력", "fortune": "예술 재능"},
            "small": {"trait": "관찰력, 분석력", "fortune": "사업 수완"},
            "round": {"trait": "호기심, 활발함", "fortune": "대인 관계 좋음"},
            "long": {"trait": "지혜, 통찰력", "fortune": "학문 성취"},
        },
        "nose": {
            "high": {"trait": "자존심, 야망", "fortune": "재물운"},
            "straight": {"trait": "정직, 신뢰", "fortune": "사회적 성공"},
            "round_tip": {"trait": "인정 많음, 온화함", "fortune": "인복"},
            "pointed": {"trait": "예리함, 비판적", "fortune": "분석력"},
        },
        "mouth": {
            "large": {"trait": "적극적, 사교적", "fortune": "표현 능력"},
            "small": {"trait": "내성적, 신중함", "fortune": "절제력"},
            "thick_lips": {"trait": "감성적, 정열적", "fortune": "예술성"},
            "thin_lips": {"trait": "이성적, 절제력", "fortune": "논리력"},
        },
        "chin": {
            "strong": {"trait": "의지력, 인내심", "fortune": "말년운 좋음"},
            "weak": {"trait": "유연함, 적응력", "fortune": "변화 적응"},
            "round": {"trait": "온화함, 포용력", "fortune": "가정운"},
            "pointed": {"trait": "예민함, 직관력", "fortune": "예술 재능"},
        },
        "face_shape": {
            "oval": {"trait": "균형, 조화", "personality": "다방면 재능"},
            "round": {"trait": "사교성, 낙천적", "personality": "친화력"},
            "square": {"trait": "안정, 신뢰", "personality": "책임감"},
            "long": {"trait": "지적, 품위", "personality": "고상함"},
            "heart": {"trait": "창의적, 감성적", "personality": "예술성"},
        },
    }

    # 오행 분류
    FIVE_ELEMENTS_FACE = {
        "목": {
            "features": "길고 가는 얼굴, 높은 이마, 가느다란 눈썹",
            "trait": "창의적, 성장 지향적, 인자함",
            "careers": ["교육자", "예술가", "의사", "성직자"],
        },
        "화": {
            "features": "뾰족한 이마, 날카로운 눈, 붉은 기운",
            "trait": "열정적, 표현력, 리더십",
            "careers": ["정치인", "연예인", "마케터", "운동선수"],
        },
        "토": {
            "features": "넓고 각진 얼굴, 두꺼운 입술, 큰 코",
            "trait": "안정적, 신뢰, 포용력",
            "careers": ["사업가", "부동산", "농업", "건축가"],
        },
        "금": {
            "features": "각진 턱, 높은 광대뼈, 흰 피부",
            "trait": "결단력, 정의감, 원칙적",
            "careers": ["법조인", "군인", "금융인", "엔지니어"],
        },
        "수": {
            "features": "둥근 얼굴, 깊은 눈, 두꺼운 귀",
            "trait": "지혜, 적응력, 직관력",
            "careers": ["학자", "외교관", "상담사", "철학자"],
        },
    }

    async def calculate_result(
        self, session_id: str
    ) -> Tuple[dict[str, Any], str]:
        responses = await self.get_responses(session_id)

        # 얼굴 특성 수집 (AI 분석 또는 자가 평가)
        face_features = {}
        image_data = None

        for response in responses:
            question = response.get("questions", {})
            answer = response.get("answer")
            feature_type = question.get("scoring_weights", {}).get("feature", "")

            if answer is not None:
                if isinstance(answer, dict):
                    face_features.update(answer)
                elif isinstance(answer, str):
                    if feature_type:
                        face_features[feature_type] = answer
                    elif answer.startswith("data:image") or answer.startswith("http"):
                        image_data = answer

        # 각 부위별 분석
        part_analysis = {}
        for part, value in face_features.items():
            if part in self.FACE_PARTS and value in self.FACE_PARTS[part]:
                part_analysis[part] = self.FACE_PARTS[part][value]

        # 오행 판단 (특성 종합)
        element = self._determine_element(face_features)

        # 종합 점수 계산
        scores = self._calculate_scores(face_features, part_analysis)

        raw_scores = {
            "face_features": face_features,
            "part_analysis": part_analysis,
            "element": element,
            "scores": scores,
            "has_image": image_data is not None,
        }

        result_type = f"{element}형 관상"

        return raw_scores, result_type

    def _determine_element(self, features: dict) -> str:
        """오행 판단"""
        element_scores = {"목": 0, "화": 0, "토": 0, "금": 0, "수": 0}

        # 얼굴형 기반
        face_shape = features.get("face_shape", "")
        shape_elements = {
            "long": "목",
            "oval": "목",
            "heart": "화",
            "pointed": "화",
            "square": "토",
            "wide": "토",
            "angular": "금",
            "high_cheekbone": "금",
            "round": "수",
            "soft": "수",
        }
        if face_shape in shape_elements:
            element_scores[shape_elements[face_shape]] += 2

        # 이마 기반
        forehead = features.get("forehead", "")
        if forehead in ["wide", "high"]:
            element_scores["목"] += 1
        elif forehead in ["narrow"]:
            element_scores["금"] += 1

        # 눈 기반
        eyes = features.get("eyes", "")
        if eyes in ["large", "round"]:
            element_scores["수"] += 1
        elif eyes in ["small", "long"]:
            element_scores["금"] += 1

        # 가장 높은 오행
        return max(element_scores.items(), key=lambda x: x[1])[0]

    def _calculate_scores(self, features: dict, analysis: dict) -> dict:
        """종합 점수 계산"""
        scores = {
            "fortune": 50,      # 재물운
            "career": 50,       # 사업운
            "relationship": 50, # 대인운
            "health": 50,       # 건강운
            "wisdom": 50,       # 지혜
        }

        # 코 (재물운)
        nose = features.get("nose", "")
        if nose in ["high", "straight"]:
            scores["fortune"] += 15
            scores["career"] += 10
        elif nose == "round_tip":
            scores["relationship"] += 15

        # 이마 (지혜, 사업운)
        forehead = features.get("forehead", "")
        if forehead in ["wide", "high"]:
            scores["wisdom"] += 15
            scores["career"] += 10

        # 입 (대인운)
        mouth = features.get("mouth", "")
        if mouth in ["large", "thick_lips"]:
            scores["relationship"] += 15

        # 턱 (건강운, 말년운)
        chin = features.get("chin", "")
        if chin in ["strong", "round"]:
            scores["health"] += 15

        # 눈 (지혜, 대인운)
        eyes = features.get("eyes", "")
        if eyes in ["large", "round"]:
            scores["relationship"] += 10
        elif eyes in ["long", "small"]:
            scores["wisdom"] += 10

        return scores

    def interpret_result(
        self, raw_scores: dict[str, Any], result_type: str
    ) -> dict[str, Any]:
        part_analysis = raw_scores.get("part_analysis", {})
        element = raw_scores.get("element", "토")
        scores = raw_scores.get("scores", {})
        features = raw_scores.get("face_features", {})

        element_info = self.FIVE_ELEMENTS_FACE.get(element, {})

        # 부위별 해석 정리
        face_readings = []
        part_names = {
            "forehead": "이마",
            "eyebrows": "눈썹",
            "eyes": "눈",
            "nose": "코",
            "mouth": "입",
            "chin": "턱",
            "face_shape": "얼굴형",
        }

        for part, analysis in part_analysis.items():
            face_readings.append({
                "part": part_names.get(part, part),
                "trait": analysis.get("trait", ""),
                "fortune": analysis.get("fortune", analysis.get("personality", "")),
            })

        # 운세 해석
        fortune_reading = self._get_fortune_reading(scores)

        return {
            "result_type": result_type,
            "element": {
                "type": element,
                "features": element_info.get("features", ""),
                "trait": element_info.get("trait", ""),
            },
            "face_readings": face_readings,
            "scores": scores,
            "fortune_summary": fortune_reading,
            "career_recommendations": element_info.get("careers", []),
            "strengths": self._get_strengths(scores, part_analysis),
            "advice": self._get_advice(element, scores),
            "disclaimer": "관상 분석은 전통적 해석을 기반으로 하며, 참고용으로만 활용하세요.",
        }

    def _get_fortune_reading(self, scores: dict) -> dict:
        """운세 종합 해석"""
        readings = {}

        if scores.get("fortune", 50) >= 60:
            readings["재물운"] = "재물에 대한 복이 있으며, 노력에 따른 보상이 따릅니다."
        else:
            readings["재물운"] = "안정적인 재정 관리와 꾸준한 노력이 필요합니다."

        if scores.get("career", 50) >= 60:
            readings["사업운"] = "사업 수완이 있으며, 리더십을 발휘할 기회가 있습니다."
        else:
            readings["사업운"] = "협력과 꾸준한 노력으로 성과를 이룰 수 있습니다."

        if scores.get("relationship", 50) >= 60:
            readings["대인운"] = "대인 관계가 원만하며, 귀인의 도움을 받을 수 있습니다."
        else:
            readings["대인운"] = "소통을 늘리고 인간관계에 관심을 기울이세요."

        if scores.get("health", 50) >= 60:
            readings["건강운"] = "건강한 기운이 있으며, 활력이 넘칩니다."
        else:
            readings["건강운"] = "건강 관리에 신경 쓰고 규칙적인 생활을 하세요."

        return readings

    def _get_strengths(self, scores: dict, analysis: dict) -> list[str]:
        """강점 도출"""
        strengths = []

        if scores.get("wisdom", 50) >= 60:
            strengths.append("뛰어난 지적 능력과 통찰력")
        if scores.get("fortune", 50) >= 60:
            strengths.append("재물을 모으는 복")
        if scores.get("relationship", 50) >= 60:
            strengths.append("사람을 끌어들이는 매력")
        if scores.get("career", 50) >= 60:
            strengths.append("사업적 수완과 리더십")

        # 부위별 강점
        for part, info in analysis.items():
            trait = info.get("trait", "")
            if trait and len(strengths) < 5:
                strengths.append(trait)

        return strengths[:5] if strengths else ["균형 잡힌 관상"]

    def _get_advice(self, element: str, scores: dict) -> str:
        """조언"""
        advice_map = {
            "목": "창의성을 살리고 교육이나 예술 분야에서 능력을 발휘하세요.",
            "화": "열정을 잘 조절하고 리더십을 발휘할 기회를 찾으세요.",
            "토": "안정적인 기반을 다지고 신뢰를 쌓아가세요.",
            "금": "원칙을 지키되 유연함도 갖추면 더 큰 성공이 따릅니다.",
            "수": "지혜를 활용하고 깊은 사고력으로 문제를 해결하세요.",
        }
        return advice_map.get(element, "자신의 강점을 살리고 꾸준히 노력하세요.")
