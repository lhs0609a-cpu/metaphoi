from typing import Tuple, Any

from app.tests_engine.base import BaseTestEngine, register_engine


@register_engine
class GallupEngine(BaseTestEngine):
    """Gallup 강점 검사 엔진"""

    test_code = "gallup"
    test_name = "Gallup 강점 검사"

    # 34개 강점 테마
    STRENGTHS = {
        # 실행력 (Executing)
        "achiever": {"name": "성취", "domain": "실행력", "description": "끊임없이 일하고 성취하는 것에서 만족을 느낍니다."},
        "arranger": {"name": "배열", "domain": "실행력", "description": "복잡한 상황에서 최선의 구성을 찾아냅니다."},
        "belief": {"name": "신념", "domain": "실행력", "description": "핵심 가치관이 행동의 방향을 정합니다."},
        "consistency": {"name": "공정", "domain": "실행력", "description": "모든 사람을 동등하게 대하려 합니다."},
        "deliberative": {"name": "신중", "domain": "실행력", "description": "결정을 내리기 전 주의 깊게 살핍니다."},
        "discipline": {"name": "규율", "domain": "실행력", "description": "일상과 구조를 통해 세상에 질서를 부여합니다."},
        "focus": {"name": "집중", "domain": "실행력", "description": "목표를 정하고 그것을 향해 나아갑니다."},
        "responsibility": {"name": "책임", "domain": "실행력", "description": "약속한 것을 반드시 이행합니다."},
        "restorative": {"name": "복구", "domain": "실행력", "description": "문제를 해결하는 것을 좋아합니다."},

        # 영향력 (Influencing)
        "activator": {"name": "활성화", "domain": "영향력", "description": "생각을 행동으로 옮기게 만듭니다."},
        "command": {"name": "지휘", "domain": "영향력", "description": "상황을 장악하고 결정을 내립니다."},
        "communication": {"name": "커뮤니케이션", "domain": "영향력", "description": "생각을 말로 잘 표현합니다."},
        "competition": {"name": "경쟁", "domain": "영향력", "description": "다른 사람의 성과와 비교하여 자신을 측정합니다."},
        "maximizer": {"name": "극대화", "domain": "영향력", "description": "강점을 자극하여 우수성을 추구합니다."},
        "self_assurance": {"name": "자기확신", "domain": "영향력", "description": "내면의 나침반이 결정의 확신을 줍니다."},
        "significance": {"name": "중요성", "domain": "영향력", "description": "다른 사람들에게 의미 있는 존재가 되고 싶어합니다."},
        "woo": {"name": "사교", "domain": "영향력", "description": "새로운 사람을 만나 마음을 사로잡습니다."},

        # 관계 구축 (Relationship Building)
        "adaptability": {"name": "적응", "domain": "관계구축", "description": "흐름을 따라가며 현재에 집중합니다."},
        "connectedness": {"name": "연결", "domain": "관계구축", "description": "모든 것이 연결되어 있다고 믿습니다."},
        "developer": {"name": "발전", "domain": "관계구축", "description": "다른 사람의 잠재력을 인식하고 키워줍니다."},
        "empathy": {"name": "공감", "domain": "관계구축", "description": "다른 사람의 감정을 느낍니다."},
        "harmony": {"name": "조화", "domain": "관계구축", "description": "갈등보다 합의점을 찾습니다."},
        "includer": {"name": "포용", "domain": "관계구축", "description": "소외된 사람을 받아들입니다."},
        "individualization": {"name": "개별화", "domain": "관계구축", "description": "각 사람의 고유한 특성에 관심을 가집니다."},
        "positivity": {"name": "긍정", "domain": "관계구축", "description": "열정이 전염되어 다른 사람을 고무시킵니다."},
        "relator": {"name": "친밀", "domain": "관계구축", "description": "가까운 관계에서 깊은 만족을 얻습니다."},

        # 전략적 사고 (Strategic Thinking)
        "analytical": {"name": "분석", "domain": "전략사고", "description": "데이터에서 패턴과 연결고리를 찾습니다."},
        "context": {"name": "맥락", "domain": "전략사고", "description": "과거를 이해하여 현재를 파악합니다."},
        "futuristic": {"name": "미래지향", "domain": "전략사고", "description": "미래에 대한 비전이 영감을 줍니다."},
        "ideation": {"name": "아이디어", "domain": "전략사고", "description": "새로운 아이디어에 매료됩니다."},
        "input": {"name": "수집", "domain": "전략사고", "description": "정보를 수집하고 보관합니다."},
        "intellection": {"name": "사색", "domain": "전략사고", "description": "지적 활동과 토론을 좋아합니다."},
        "learner": {"name": "학습", "domain": "전략사고", "description": "배우는 과정 자체를 즐깁니다."},
        "strategic": {"name": "전략", "domain": "전략사고", "description": "대안적 방법을 빠르게 파악합니다."},
    }

    async def calculate_result(
        self, session_id: str
    ) -> Tuple[dict[str, Any], str]:
        responses = await self.get_responses(session_id)

        # 각 강점별 점수 계산
        scores = {strength: 0 for strength in self.STRENGTHS.keys()}

        for response in responses:
            question = response.get("questions", {})
            answer = response.get("answer")
            scoring = question.get("scoring_weights", {})

            if answer is not None and scoring:
                for strength, weight in scoring.items():
                    if strength in scores:
                        if isinstance(answer, (int, float)):
                            scores[strength] += weight * answer

        # 상위 5개 강점 도출
        sorted_strengths = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        top_5 = [s[0] for s in sorted_strengths[:5]]

        # 도메인별 점수 집계
        domain_scores = {"실행력": 0, "영향력": 0, "관계구축": 0, "전략사고": 0}
        for strength, score in scores.items():
            domain = self.STRENGTHS[strength]["domain"]
            domain_scores[domain] += score

        result_type = "-".join(top_5[:3])  # 상위 3개로 유형 표시

        raw_scores = {
            "strength_scores": scores,
            "top_5": top_5,
            "domain_scores": domain_scores,
        }

        return raw_scores, result_type

    def interpret_result(
        self, raw_scores: dict[str, Any], result_type: str
    ) -> dict[str, Any]:
        top_5 = raw_scores.get("top_5", [])
        scores = raw_scores.get("strength_scores", {})
        domain_scores = raw_scores.get("domain_scores", {})

        top_strengths = []
        for rank, strength_code in enumerate(top_5, 1):
            strength_info = self.STRENGTHS.get(strength_code, {})
            top_strengths.append({
                "rank": rank,
                "code": strength_code,
                "name": strength_info.get("name", ""),
                "domain": strength_info.get("domain", ""),
                "description": strength_info.get("description", ""),
                "score": scores.get(strength_code, 0),
            })

        # 도메인 분석
        primary_domain = max(domain_scores.items(), key=lambda x: x[1])[0]

        return {
            "result_type": result_type,
            "top_5_strengths": top_strengths,
            "domain_scores": domain_scores,
            "primary_domain": primary_domain,
            "domain_interpretation": self._get_domain_interpretation(primary_domain),
            "action_items": self._get_action_items(top_5[:3]),
        }

    def _get_domain_interpretation(self, domain: str) -> str:
        interpretations = {
            "실행력": "목표를 달성하고 일을 완수하는 데 뛰어납니다. 계획을 실행에 옮기는 능력이 강점입니다.",
            "영향력": "다른 사람들을 설득하고 영향을 미치는 데 뛰어납니다. 리더십과 소통 능력이 강점입니다.",
            "관계구축": "팀을 하나로 묶고 관계를 형성하는 데 뛰어납니다. 사람들과의 유대감이 강점입니다.",
            "전략사고": "정보를 분석하고 더 나은 의사결정을 이끌어내는 데 뛰어납니다. 통찰력이 강점입니다.",
        }
        return interpretations.get(domain, "")

    def _get_action_items(self, top_strengths: list) -> list[str]:
        """상위 강점을 활용한 행동 제안"""
        action_items = []
        for strength in top_strengths:
            if strength == "achiever":
                action_items.append("일일 목표를 설정하고 성취감을 기록하세요")
            elif strength == "learner":
                action_items.append("새로운 기술이나 지식을 배울 기회를 찾으세요")
            elif strength == "strategic":
                action_items.append("복잡한 문제를 해결하는 역할을 맡으세요")
            elif strength == "communication":
                action_items.append("발표나 글쓰기 기회를 적극 활용하세요")
            elif strength == "empathy":
                action_items.append("팀원들의 감정을 살피고 지지하는 역할을 하세요")
            else:
                action_items.append(f"{self.STRENGTHS.get(strength, {}).get('name', strength)} 강점을 일상에서 활용할 기회를 찾으세요")
        return action_items
