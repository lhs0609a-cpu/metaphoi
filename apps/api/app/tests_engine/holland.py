from typing import Tuple, Any

from app.tests_engine.base import BaseTestEngine, register_engine


@register_engine
class HollandEngine(BaseTestEngine):
    """Holland 직업흥미 검사 엔진 (RIASEC)"""

    test_code = "holland"
    test_name = "Holland 직업흥미 검사"

    # 6가지 직업 흥미 유형
    TYPES = {
        "R": {
            "name": "실재형 (Realistic)",
            "description": "기계, 도구, 동물, 야외 활동을 선호하며 실용적이고 구체적인 일을 좋아합니다.",
            "keywords": ["실용적", "기계적", "솔직한", "신체적"],
            "careers": ["엔지니어", "기술자", "농부", "조종사", "기계공", "건축가"],
            "work_activities": ["도구 사용", "기계 조작", "야외 활동", "신체 활동"],
        },
        "I": {
            "name": "탐구형 (Investigative)",
            "description": "아이디어, 사고, 분석을 선호하며 연구하고 탐구하는 것을 좋아합니다.",
            "keywords": ["분석적", "지적", "호기심", "독립적"],
            "careers": ["과학자", "연구원", "의사", "프로그래머", "데이터분석가", "수학자"],
            "work_activities": ["연구", "분석", "문제해결", "실험"],
        },
        "A": {
            "name": "예술형 (Artistic)",
            "description": "창의성, 자기표현, 예술적 활동을 선호하며 자유롭고 독창적인 환경을 좋아합니다.",
            "keywords": ["창의적", "독창적", "상상력", "감수성"],
            "careers": ["디자이너", "작가", "음악가", "배우", "화가", "사진작가"],
            "work_activities": ["창작", "디자인", "예술 활동", "자기표현"],
        },
        "S": {
            "name": "사회형 (Social)",
            "description": "사람들과 함께 일하고 돕는 것을 선호하며 교육, 상담, 서비스를 좋아합니다.",
            "keywords": ["협력적", "친절한", "이해심", "도움"],
            "careers": ["교사", "상담사", "사회복지사", "간호사", "HR전문가", "코치"],
            "work_activities": ["교육", "상담", "봉사", "협력"],
        },
        "E": {
            "name": "진취형 (Enterprising)",
            "description": "리더십, 설득, 영향력을 선호하며 목표 달성과 성공을 추구합니다.",
            "keywords": ["야심적", "리더십", "설득력", "경쟁적"],
            "careers": ["경영자", "영업사원", "변호사", "정치인", "마케터", "창업가"],
            "work_activities": ["관리", "설득", "협상", "리더십"],
        },
        "C": {
            "name": "관습형 (Conventional)",
            "description": "체계, 질서, 데이터 관리를 선호하며 정확하고 꼼꼼한 일을 좋아합니다.",
            "keywords": ["체계적", "정확한", "실무적", "꼼꼼한"],
            "careers": ["회계사", "행정직", "은행원", "비서", "사서", "세무사"],
            "work_activities": ["데이터 관리", "문서 작업", "정리", "계산"],
        },
    }

    # 유형 조합별 직업 추천
    TYPE_COMBINATIONS = {
        "RIA": ["건축가", "산업디자이너", "기술 컨설턴트"],
        "RIS": ["물리치료사", "운동코치", "직업훈련사"],
        "RIE": ["엔지니어 관리자", "기술 창업가"],
        "IAS": ["심리학자", "인류학자", "UX연구원"],
        "IAE": ["제품 개발자", "기술 전략가"],
        "ASE": ["광고 기획자", "이벤트 기획자", "콘텐츠 기획자"],
        "SEC": ["인사 담당자", "교육 행정가", "사회복지 행정가"],
        "ECS": ["영업 관리자", "프랜차이즈 운영자"],
    }

    async def calculate_result(
        self, session_id: str
    ) -> Tuple[dict[str, Any], str]:
        responses = await self.get_responses(session_id)

        # 각 유형별 점수 계산
        scores = {"R": 0, "I": 0, "A": 0, "S": 0, "E": 0, "C": 0}

        for response in responses:
            question = response.get("questions", {})
            answer = response.get("answer")
            scoring = question.get("scoring_weights", {})

            if answer is not None and scoring:
                for type_code, weight in scoring.items():
                    if type_code in scores:
                        if isinstance(answer, (int, float)):
                            scores[type_code] += weight * answer
                        elif isinstance(answer, str) and answer in scoring:
                            scores[type_code] += scoring[answer]

        # 상위 3개 유형으로 Holland 코드 생성
        sorted_types = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        holland_code = "".join([t[0] for t in sorted_types[:3]])

        # 정규화 (0-100)
        max_score = max(scores.values()) if max(scores.values()) > 0 else 1
        normalized = {k: round(v / max_score * 100, 1) for k, v in scores.items()}

        raw_scores = {
            "scores": scores,
            "normalized": normalized,
            "ranking": [t[0] for t in sorted_types],
        }

        return raw_scores, holland_code

    def interpret_result(
        self, raw_scores: dict[str, Any], result_type: str
    ) -> dict[str, Any]:
        normalized = raw_scores.get("normalized", {})
        ranking = raw_scores.get("ranking", [])

        # 상위 3개 유형 상세 정보
        top_types = []
        for i, type_code in enumerate(ranking[:3]):
            type_info = self.TYPES.get(type_code, {})
            top_types.append({
                "rank": i + 1,
                "code": type_code,
                "name": type_info.get("name", ""),
                "description": type_info.get("description", ""),
                "keywords": type_info.get("keywords", []),
                "score": normalized.get(type_code, 0),
            })

        # 직업 추천
        career_recommendations = self._get_career_recommendations(result_type)

        # 적합한 작업 환경
        work_environments = self._get_work_environments(ranking[:2])

        return {
            "holland_code": result_type,
            "top_3_types": top_types,
            "all_scores": normalized,
            "career_recommendations": career_recommendations,
            "work_environments": work_environments,
            "summary": self._get_summary(ranking[:2]),
        }

    def _get_career_recommendations(self, code: str) -> list[dict]:
        """Holland 코드 기반 직업 추천"""
        recommendations = []

        # 주 유형의 직업들
        primary = code[0] if code else "R"
        primary_careers = self.TYPES.get(primary, {}).get("careers", [])
        for career in primary_careers[:3]:
            recommendations.append({"career": career, "match": "높음", "type": primary})

        # 조합 유형의 직업들
        combo = code[:3] if len(code) >= 3 else code
        combo_careers = self.TYPE_COMBINATIONS.get(combo, [])
        for career in combo_careers:
            recommendations.append({"career": career, "match": "매우높음", "type": combo})

        return recommendations[:6]

    def _get_work_environments(self, top_types: list) -> list[str]:
        """적합한 작업 환경 추천"""
        environments = []
        for type_code in top_types:
            activities = self.TYPES.get(type_code, {}).get("work_activities", [])
            environments.extend(activities)
        return list(set(environments))[:6]

    def _get_summary(self, top_types: list) -> str:
        """결과 요약"""
        if not top_types:
            return ""

        primary = self.TYPES.get(top_types[0], {}).get("name", "")
        secondary = self.TYPES.get(top_types[1], {}).get("name", "") if len(top_types) > 1 else ""

        if secondary:
            return f"당신은 주로 {primary}의 특성을 가지며, {secondary}의 특성도 함께 가지고 있습니다."
        return f"당신은 주로 {primary}의 특성을 가지고 있습니다."
