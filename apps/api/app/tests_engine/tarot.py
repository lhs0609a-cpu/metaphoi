from typing import Tuple, Any

from app.tests_engine.base import BaseTestEngine, register_engine


@register_engine
class TarotEngine(BaseTestEngine):
    """타로 카드 검사 엔진 (이미지 선택 기반)"""

    test_code = "tarot"
    test_name = "타로 성격 검사"

    # 주요 아르카나 카드와 성격 특성
    MAJOR_ARCANA = {
        0: {"name": "바보", "keywords": ["자유", "모험", "순수", "새로운 시작"], "element": "공기"},
        1: {"name": "마법사", "keywords": ["창의성", "의지력", "기술", "집중"], "element": "불"},
        2: {"name": "여사제", "keywords": ["직관", "지혜", "비밀", "잠재의식"], "element": "물"},
        3: {"name": "여황제", "keywords": ["풍요", "양육", "자연", "창조성"], "element": "땅"},
        4: {"name": "황제", "keywords": ["권위", "구조", "리더십", "안정"], "element": "불"},
        5: {"name": "교황", "keywords": ["전통", "교육", "영적지도", "신념"], "element": "땅"},
        6: {"name": "연인", "keywords": ["사랑", "선택", "조화", "관계"], "element": "공기"},
        7: {"name": "전차", "keywords": ["의지", "결단", "승리", "통제"], "element": "물"},
        8: {"name": "힘", "keywords": ["용기", "인내", "내면의 힘", "자기통제"], "element": "불"},
        9: {"name": "은둔자", "keywords": ["성찰", "지혜", "내면탐구", "고독"], "element": "땅"},
        10: {"name": "운명의 수레바퀴", "keywords": ["변화", "운명", "기회", "순환"], "element": "불"},
        11: {"name": "정의", "keywords": ["균형", "공정", "진실", "책임"], "element": "공기"},
        12: {"name": "매달린 사람", "keywords": ["희생", "새로운 관점", "인내", "깨달음"], "element": "물"},
        13: {"name": "죽음", "keywords": ["변화", "전환", "끝과 시작", "재탄생"], "element": "물"},
        14: {"name": "절제", "keywords": ["균형", "조화", "인내", "적응"], "element": "불"},
        15: {"name": "악마", "keywords": ["속박", "물질주의", "그림자", "유혹"], "element": "땅"},
        16: {"name": "탑", "keywords": ["급변", "깨달음", "해방", "진실"], "element": "불"},
        17: {"name": "별", "keywords": ["희망", "영감", "평화", "치유"], "element": "공기"},
        18: {"name": "달", "keywords": ["환상", "직관", "무의식", "불안"], "element": "물"},
        19: {"name": "태양", "keywords": ["성공", "기쁨", "활력", "낙관"], "element": "불"},
        20: {"name": "심판", "keywords": ["부활", "갱신", "결정", "자기평가"], "element": "불"},
        21: {"name": "세계", "keywords": ["완성", "성취", "통합", "여행"], "element": "땅"},
    }

    # 원소별 성격 특성
    ELEMENTS = {
        "불": {"trait": "열정적이고 행동지향적", "abilities": ["리더십", "추진력", "창의성"]},
        "물": {"trait": "감성적이고 직관적", "abilities": ["공감능력", "직관력", "적응력"]},
        "공기": {"trait": "지적이고 소통능력이 뛰어남", "abilities": ["분석력", "소통능력", "객관성"]},
        "땅": {"trait": "안정적이고 실용적", "abilities": ["인내심", "실행력", "신뢰성"]},
    }

    async def calculate_result(
        self, session_id: str
    ) -> Tuple[dict[str, Any], str]:
        responses = await self.get_responses(session_id)

        selected_cards = []
        element_counts = {"불": 0, "물": 0, "공기": 0, "땅": 0}
        all_keywords = []

        for response in responses:
            answer = response.get("answer")
            question = response.get("questions", {})
            position = question.get("scoring_weights", {}).get("position", "general")

            if answer is not None:
                card_id = int(answer) if isinstance(answer, (int, str)) else 0
                if card_id in self.MAJOR_ARCANA:
                    card = self.MAJOR_ARCANA[card_id]
                    selected_cards.append({
                        "id": card_id,
                        "name": card["name"],
                        "position": position,
                        "keywords": card["keywords"],
                    })
                    element = card["element"]
                    element_counts[element] += 1
                    all_keywords.extend(card["keywords"])

        # 주요 원소 결정
        primary_element = max(element_counts.items(), key=lambda x: x[1])[0]

        # 핵심 키워드 추출 (빈도 기반)
        keyword_freq = {}
        for kw in all_keywords:
            keyword_freq[kw] = keyword_freq.get(kw, 0) + 1
        top_keywords = sorted(keyword_freq.items(), key=lambda x: x[1], reverse=True)[:5]

        # 결과 유형
        result_type = f"{primary_element}-{selected_cards[0]['name']}" if selected_cards else "Unknown"

        raw_scores = {
            "selected_cards": selected_cards,
            "element_counts": element_counts,
            "primary_element": primary_element,
            "top_keywords": [kw[0] for kw in top_keywords],
        }

        return raw_scores, result_type

    def interpret_result(
        self, raw_scores: dict[str, Any], result_type: str
    ) -> dict[str, Any]:
        selected_cards = raw_scores.get("selected_cards", [])
        primary_element = raw_scores.get("primary_element", "불")
        element_counts = raw_scores.get("element_counts", {})
        top_keywords = raw_scores.get("top_keywords", [])

        element_info = self.ELEMENTS.get(primary_element, {})

        # 카드별 해석
        card_readings = []
        position_meanings = {
            "past": "과거의 영향",
            "present": "현재 상황",
            "future": "미래의 가능성",
            "advice": "조언",
            "general": "전반적 특성",
        }

        for card in selected_cards:
            card_readings.append({
                "card_name": card["name"],
                "position": position_meanings.get(card["position"], card["position"]),
                "keywords": card["keywords"],
                "interpretation": self._interpret_card(card["id"], card["position"]),
            })

        return {
            "result_type": result_type,
            "primary_element": primary_element,
            "element_trait": element_info.get("trait", ""),
            "related_abilities": element_info.get("abilities", []),
            "element_distribution": element_counts,
            "card_readings": card_readings,
            "core_keywords": top_keywords,
            "overall_reading": self._get_overall_reading(selected_cards, primary_element),
            "advice": self._get_advice(top_keywords, primary_element),
        }

    def _interpret_card(self, card_id: int, position: str) -> str:
        card = self.MAJOR_ARCANA.get(card_id, {})
        name = card.get("name", "")
        keywords = card.get("keywords", [])

        interpretations = {
            0: "새로운 시작과 순수한 도전정신을 상징합니다.",
            1: "창의적 능력과 잠재력을 발휘할 때입니다.",
            2: "직관을 믿고 내면의 목소리에 귀 기울여야 합니다.",
            3: "풍요와 성장의 에너지가 함께합니다.",
            4: "리더십을 발휘하고 구조를 세울 때입니다.",
            5: "전통적 가치와 지혜를 배울 때입니다.",
            6: "중요한 선택의 기로에 서 있습니다.",
            7: "강한 의지로 장애물을 극복할 수 있습니다.",
            8: "내면의 힘과 인내심이 필요합니다.",
            9: "자기 성찰과 내면 탐구가 필요한 시기입니다.",
            10: "변화의 바람이 불어옵니다.",
            11: "공정함과 균형을 추구해야 합니다.",
            12: "새로운 관점으로 상황을 바라볼 필요가 있습니다.",
            13: "끝맺음과 새로운 시작이 함께합니다.",
            14: "인내와 균형이 열쇠입니다.",
            15: "속박에서 벗어날 필요가 있습니다.",
            16: "예상치 못한 변화가 깨달음을 가져옵니다.",
            17: "희망과 영감이 당신을 이끕니다.",
            18: "직관을 믿되 환상에 주의하세요.",
            19: "성공과 기쁨이 찾아옵니다.",
            20: "자기 평가와 갱신의 시간입니다.",
            21: "목표 달성과 완성의 에너지입니다.",
        }

        return interpretations.get(card_id, f"{name} 카드는 {', '.join(keywords)}를 상징합니다.")

    def _get_overall_reading(self, cards: list, element: str) -> str:
        if not cards:
            return "선택된 카드가 없습니다."

        element_info = self.ELEMENTS.get(element, {})
        trait = element_info.get("trait", "")

        card_names = [c["name"] for c in cards[:3]]

        return f"당신의 내면에는 {trait} 특성이 강합니다. {', '.join(card_names)} 카드가 선택되어, 현재 당신에게는 변화와 성장의 에너지가 흐르고 있습니다."

    def _get_advice(self, keywords: list, element: str) -> str:
        if "변화" in keywords or "전환" in keywords:
            return "변화를 두려워하지 말고 새로운 기회로 받아들이세요."
        elif "직관" in keywords or "지혜" in keywords:
            return "내면의 목소리에 귀 기울이고 직관을 신뢰하세요."
        elif "리더십" in keywords or "권위" in keywords:
            return "주도적으로 상황을 이끌어 나가세요."
        elif "균형" in keywords or "조화" in keywords:
            return "삶의 균형을 찾고 조화롭게 나아가세요."
        else:
            return "지금의 자신을 믿고 한 걸음씩 나아가세요."
