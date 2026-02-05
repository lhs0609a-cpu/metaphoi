from typing import Tuple, Any

from app.tests_engine.base import BaseTestEngine, register_engine


@register_engine
class MMPIEngine(BaseTestEngine):
    """MMPI 간이 검사 엔진"""

    test_code = "mmpi"
    test_name = "MMPI 간이 검사"

    # 타당도 척도
    VALIDITY_SCALES = {
        "L": {"name": "거짓말 척도", "description": "사회적으로 바람직한 방향으로 응답하려는 경향"},
        "F": {"name": "비전형 척도", "description": "비일관적이거나 과장된 응답 경향"},
        "K": {"name": "교정 척도", "description": "방어적 태도의 정도"},
    }

    # 임상 척도 (간이 버전 - 주요 척도만)
    CLINICAL_SCALES = {
        "Hs": {"name": "건강염려증", "description": "신체적 증상에 대한 과도한 걱정"},
        "D": {"name": "우울증", "description": "우울감, 무력감, 삶에 대한 불만족"},
        "Hy": {"name": "히스테리", "description": "스트레스 상황에서의 신체적 반응"},
        "Pd": {"name": "반사회성", "description": "사회적 규범에 대한 저항, 충동성"},
        "Pa": {"name": "편집증", "description": "의심, 불신, 과민성"},
        "Pt": {"name": "강박증", "description": "불안, 걱정, 강박적 사고"},
        "Sc": {"name": "조현병", "description": "현실 접촉의 어려움, 사회적 소외감"},
        "Ma": {"name": "경조증", "description": "과잉 활동, 과대감, 충동성"},
        "Si": {"name": "내향성", "description": "사회적 내향성, 소극성"},
    }

    async def calculate_result(
        self, session_id: str
    ) -> Tuple[dict[str, Any], str]:
        responses = await self.get_responses(session_id)

        # 척도별 원점수 계산
        validity_scores = {"L": 0, "F": 0, "K": 0}
        clinical_scores = {scale: 0 for scale in self.CLINICAL_SCALES}

        for response in responses:
            question = response.get("questions", {})
            answer = response.get("answer")
            scoring = question.get("scoring_weights", {})

            if answer is not None and scoring:
                # True/False 형식의 응답
                answer_bool = answer in [True, "true", "True", 1, "1", "yes", "예"]

                for scale, weight_info in scoring.items():
                    if isinstance(weight_info, dict):
                        weight = weight_info.get("true" if answer_bool else "false", 0)
                    else:
                        weight = weight_info if answer_bool else 0

                    if scale in validity_scores:
                        validity_scores[scale] += weight
                    elif scale in clinical_scores:
                        clinical_scores[scale] += weight

        # T점수 변환 (평균 50, 표준편차 10)
        # 간이 검사이므로 원점수를 근사적으로 T점수로 변환
        def to_t_score(raw: float, scale: str) -> int:
            # 각 척도별 대략적인 평균/표준편차 사용
            max_raw = 10  # 간이 버전 기준
            normalized = (raw / max_raw) * 100
            t = 50 + (normalized - 50) * 0.3
            return max(30, min(90, round(t)))

        validity_t = {scale: to_t_score(score, scale) for scale, score in validity_scores.items()}
        clinical_t = {scale: to_t_score(score, scale) for scale, score in clinical_scores.items()}

        # 프로파일 유형 결정 (가장 높은 2개 척도)
        sorted_clinical = sorted(clinical_t.items(), key=lambda x: x[1], reverse=True)
        profile_type = f"{sorted_clinical[0][0]}-{sorted_clinical[1][0]}" if len(sorted_clinical) >= 2 else "Normal"

        raw_scores = {
            "validity_raw": validity_scores,
            "validity_t": validity_t,
            "clinical_raw": clinical_scores,
            "clinical_t": clinical_t,
            "highest_scales": [s[0] for s in sorted_clinical[:3]],
        }

        return raw_scores, profile_type

    def interpret_result(
        self, raw_scores: dict[str, Any], result_type: str
    ) -> dict[str, Any]:
        validity_t = raw_scores.get("validity_t", {})
        clinical_t = raw_scores.get("clinical_t", {})
        highest_scales = raw_scores.get("highest_scales", [])

        # 타당도 분석
        validity_analysis = self._analyze_validity(validity_t)

        # 임상 척도 분석
        clinical_analysis = []
        for scale, t_score in clinical_t.items():
            scale_info = self.CLINICAL_SCALES.get(scale, {})
            level = self._get_level(t_score)
            clinical_analysis.append({
                "scale": scale,
                "name": scale_info.get("name", ""),
                "description": scale_info.get("description", ""),
                "t_score": t_score,
                "level": level,
                "interpretation": self._get_scale_interpretation(scale, t_score),
            })

        # 전체 프로파일 해석
        profile_interpretation = self._interpret_profile(highest_scales, clinical_t)

        return {
            "profile_type": result_type,
            "validity_analysis": validity_analysis,
            "validity_conclusion": self._get_validity_conclusion(validity_t),
            "clinical_analysis": clinical_analysis,
            "profile_interpretation": profile_interpretation,
            "highest_scales": [
                {
                    "scale": s,
                    "name": self.CLINICAL_SCALES.get(s, {}).get("name", ""),
                    "t_score": clinical_t.get(s, 50),
                }
                for s in highest_scales
            ],
            "recommendations": self._get_recommendations(highest_scales, clinical_t),
            "disclaimer": "이 검사는 간이 버전으로, 정확한 심리 평가를 위해서는 전문가의 정식 검사가 필요합니다.",
        }

    def _get_level(self, t_score: int) -> str:
        if t_score >= 70:
            return "상승"
        elif t_score >= 60:
            return "약간상승"
        elif t_score >= 40:
            return "정상"
        else:
            return "낮음"

    def _analyze_validity(self, validity_t: dict) -> list[dict]:
        analysis = []
        for scale, t_score in validity_t.items():
            scale_info = self.VALIDITY_SCALES.get(scale, {})
            interpretation = ""

            if scale == "L":
                if t_score >= 65:
                    interpretation = "자신을 지나치게 좋게 보이려는 경향이 있습니다."
                else:
                    interpretation = "솔직하게 응답한 것으로 보입니다."
            elif scale == "F":
                if t_score >= 70:
                    interpretation = "일관성 없는 응답이나 과장된 호소가 있을 수 있습니다."
                else:
                    interpretation = "일관된 응답 패턴을 보입니다."
            elif scale == "K":
                if t_score >= 65:
                    interpretation = "방어적인 태도로 응답했을 수 있습니다."
                else:
                    interpretation = "적절한 수준의 자기개방을 보입니다."

            analysis.append({
                "scale": scale,
                "name": scale_info.get("name", ""),
                "t_score": t_score,
                "interpretation": interpretation,
            })
        return analysis

    def _get_validity_conclusion(self, validity_t: dict) -> str:
        l_score = validity_t.get("L", 50)
        f_score = validity_t.get("F", 50)

        if f_score >= 80:
            return "응답의 일관성에 문제가 있을 수 있어 결과 해석에 주의가 필요합니다."
        elif l_score >= 70:
            return "다소 방어적인 태도로 응답했을 가능성이 있습니다."
        else:
            return "응답이 신뢰할 만한 수준입니다."

    def _get_scale_interpretation(self, scale: str, t_score: int) -> str:
        if t_score < 60:
            return "정상 범위입니다."

        interpretations = {
            "Hs": "신체적 증상에 대한 관심이 높을 수 있습니다.",
            "D": "우울감이나 무력감을 경험하고 있을 수 있습니다.",
            "Hy": "스트레스 상황에서 신체적 반응이 나타날 수 있습니다.",
            "Pd": "규칙이나 권위에 대한 불만이 있을 수 있습니다.",
            "Pa": "타인에 대한 불신이나 예민함이 있을 수 있습니다.",
            "Pt": "걱정이나 불안감이 있을 수 있습니다.",
            "Sc": "사회적 소외감이나 독특한 사고를 가질 수 있습니다.",
            "Ma": "에너지가 넘치거나 충동적일 수 있습니다.",
            "Si": "사회적 상황에서 불편함을 느낄 수 있습니다.",
        }
        return interpretations.get(scale, "")

    def _interpret_profile(self, highest_scales: list, clinical_t: dict) -> str:
        if not highest_scales:
            return "전반적으로 정상 범위의 프로파일을 보입니다."

        high_count = sum(1 for s in highest_scales if clinical_t.get(s, 50) >= 65)

        if high_count == 0:
            return "임상적으로 유의미한 상승이 없는 정상 프로파일입니다."
        elif high_count == 1:
            return f"{self.CLINICAL_SCALES.get(highest_scales[0], {}).get('name', '')} 척도가 약간 상승되어 있습니다."
        else:
            return "여러 척도에서 상승이 관찰되어 전문가 상담이 권장됩니다."

    def _get_recommendations(self, highest_scales: list, clinical_t: dict) -> list[str]:
        recommendations = []

        for scale in highest_scales[:2]:
            t_score = clinical_t.get(scale, 50)
            if t_score >= 65:
                if scale == "D":
                    recommendations.append("스트레스 관리와 긍정적 활동을 늘려보세요.")
                elif scale == "Pt":
                    recommendations.append("이완 기법이나 명상을 시도해보세요.")
                elif scale == "Si":
                    recommendations.append("소규모 사회 활동부터 시작해보세요.")
                elif scale in ["Hs", "Hy"]:
                    recommendations.append("규칙적인 운동과 건강한 생활습관을 유지하세요.")

        if not recommendations:
            recommendations.append("현재 심리적으로 안정된 상태입니다. 꾸준히 자기관리를 해주세요.")

        return recommendations
