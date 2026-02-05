from typing import Tuple, Any
from datetime import datetime

from app.tests_engine.base import BaseTestEngine, register_engine


@register_engine
class SajuEngine(BaseTestEngine):
    """사주 분석 엔진 (생년월일시 기반)"""

    test_code = "saju"
    test_name = "사주 분석"

    # 천간 (10개)
    CHEONGAN = {
        "갑": {"element": "목", "yin_yang": "양", "trait": "진취적, 리더십, 개척정신"},
        "을": {"element": "목", "yin_yang": "음", "trait": "유연함, 협조적, 적응력"},
        "병": {"element": "화", "yin_yang": "양", "trait": "열정적, 표현력, 활동적"},
        "정": {"element": "화", "yin_yang": "음", "trait": "섬세함, 예술적, 배려심"},
        "무": {"element": "토", "yin_yang": "양", "trait": "신뢰감, 중재력, 안정성"},
        "기": {"element": "토", "yin_yang": "음", "trait": "포용력, 인내심, 실용적"},
        "경": {"element": "금", "yin_yang": "양", "trait": "결단력, 정의감, 원칙적"},
        "신": {"element": "금", "yin_yang": "음", "trait": "정교함, 분석력, 예리함"},
        "임": {"element": "수", "yin_yang": "양", "trait": "지혜, 적응력, 포용력"},
        "계": {"element": "수", "yin_yang": "음", "trait": "직관력, 감수성, 창의성"},
    }

    # 지지 (12개)
    JIJI = {
        "자": {"element": "수", "animal": "쥐", "trait": "영리함, 기회포착, 사교성"},
        "축": {"element": "토", "animal": "소", "trait": "인내심, 성실함, 신중함"},
        "인": {"element": "목", "animal": "호랑이", "trait": "용맹함, 리더십, 자신감"},
        "묘": {"element": "목", "animal": "토끼", "trait": "온화함, 예술성, 직관력"},
        "진": {"element": "토", "animal": "용", "trait": "권위, 야망, 카리스마"},
        "사": {"element": "화", "animal": "뱀", "trait": "지혜, 신비감, 통찰력"},
        "오": {"element": "화", "animal": "말", "trait": "활력, 독립심, 열정"},
        "미": {"element": "토", "animal": "양", "trait": "온순함, 예술성, 동정심"},
        "신": {"element": "금", "animal": "원숭이", "trait": "재치, 영리함, 다재다능"},
        "유": {"element": "금", "animal": "닭", "trait": "정확함, 관찰력, 완벽주의"},
        "술": {"element": "토", "animal": "개", "trait": "충성심, 정의감, 신뢰성"},
        "해": {"element": "수", "animal": "돼지", "trait": "관대함, 정직함, 인내심"},
    }

    # 오행
    ELEMENTS = {
        "목": {"season": "봄", "direction": "동", "trait": "성장, 인, 창의성"},
        "화": {"season": "여름", "direction": "남", "trait": "열정, 예, 표현력"},
        "토": {"season": "환절기", "direction": "중앙", "trait": "안정, 신, 중재력"},
        "금": {"season": "가을", "direction": "서", "trait": "결단, 의, 정확함"},
        "수": {"season": "겨울", "direction": "북", "trait": "지혜, 지, 적응력"},
    }

    async def calculate_result(
        self, session_id: str
    ) -> Tuple[dict[str, Any], str]:
        responses = await self.get_responses(session_id)

        # 생년월일시 정보 추출
        birth_info = {}
        for response in responses:
            answer = response.get("answer")
            if isinstance(answer, dict):
                birth_info = answer
            elif isinstance(answer, str):
                # "YYYY-MM-DD HH:MM" 형식 파싱
                try:
                    parts = answer.replace("T", " ").split()
                    date_parts = parts[0].split("-")
                    birth_info["year"] = int(date_parts[0])
                    birth_info["month"] = int(date_parts[1])
                    birth_info["day"] = int(date_parts[2])
                    if len(parts) > 1:
                        time_parts = parts[1].split(":")
                        birth_info["hour"] = int(time_parts[0])
                except:
                    pass

        year = birth_info.get("year", 2000)
        month = birth_info.get("month", 1)
        day = birth_info.get("day", 1)
        hour = birth_info.get("hour", 12)

        # 사주팔자 계산 (간략화된 버전)
        saju = self._calculate_saju(year, month, day, hour)

        # 오행 분석
        element_counts = self._count_elements(saju)

        # 용신 (필요한 오행) 결정
        yongshin = self._determine_yongshin(element_counts)

        # 성격 특성 도출
        personality = self._analyze_personality(saju, element_counts)

        raw_scores = {
            "birth_info": birth_info,
            "saju": saju,
            "element_counts": element_counts,
            "yongshin": yongshin,
            "personality": personality,
        }

        # 결과 유형 (일간 기준)
        day_gan = saju.get("day", {}).get("gan", "갑")
        result_type = f"{day_gan}일간"

        return raw_scores, result_type

    def _calculate_saju(self, year: int, month: int, day: int, hour: int) -> dict:
        """사주 계산 (간략화된 버전)"""
        # 천간 순서
        gan_list = ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"]
        # 지지 순서
        ji_list = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"]

        # 연주 계산
        year_gan_idx = (year - 4) % 10
        year_ji_idx = (year - 4) % 12

        # 월주 계산 (간략화)
        month_gan_idx = (year_gan_idx * 2 + month) % 10
        month_ji_idx = (month + 1) % 12

        # 일주 계산 (간략화 - 실제로는 만세력 필요)
        base_date = datetime(1900, 1, 1)
        target_date = datetime(year, month, day)
        days_diff = (target_date - base_date).days
        day_gan_idx = days_diff % 10
        day_ji_idx = days_diff % 12

        # 시주 계산
        hour_ji_idx = ((hour + 1) // 2) % 12
        hour_gan_idx = (day_gan_idx * 2 + hour_ji_idx) % 10

        return {
            "year": {"gan": gan_list[year_gan_idx], "ji": ji_list[year_ji_idx]},
            "month": {"gan": gan_list[month_gan_idx], "ji": ji_list[month_ji_idx]},
            "day": {"gan": gan_list[day_gan_idx], "ji": ji_list[day_ji_idx]},
            "hour": {"gan": gan_list[hour_gan_idx], "ji": ji_list[hour_ji_idx]},
        }

    def _count_elements(self, saju: dict) -> dict:
        """오행 분포 계산"""
        counts = {"목": 0, "화": 0, "토": 0, "금": 0, "수": 0}

        for pillar in ["year", "month", "day", "hour"]:
            gan = saju.get(pillar, {}).get("gan", "")
            ji = saju.get(pillar, {}).get("ji", "")

            if gan in self.CHEONGAN:
                element = self.CHEONGAN[gan]["element"]
                counts[element] += 1

            if ji in self.JIJI:
                element = self.JIJI[ji]["element"]
                counts[element] += 1

        return counts

    def _determine_yongshin(self, element_counts: dict) -> dict:
        """용신 결정"""
        # 가장 적은 오행이 필요한 오행
        min_element = min(element_counts.items(), key=lambda x: x[1])[0]
        max_element = max(element_counts.items(), key=lambda x: x[1])[0]

        return {
            "need": min_element,
            "excess": max_element,
            "advice": f"{min_element}의 기운을 보충하고 {max_element}의 기운을 조절하세요.",
        }

    def _analyze_personality(self, saju: dict, element_counts: dict) -> dict:
        """성격 분석"""
        day_gan = saju.get("day", {}).get("gan", "갑")
        gan_info = self.CHEONGAN.get(day_gan, {})

        # 주요 특성
        primary_trait = gan_info.get("trait", "")
        element = gan_info.get("element", "목")
        element_info = self.ELEMENTS.get(element, {})

        # 오행 균형에 따른 보조 특성
        balanced = all(1 <= c <= 3 for c in element_counts.values())

        return {
            "primary_element": element,
            "primary_trait": primary_trait,
            "element_trait": element_info.get("trait", ""),
            "is_balanced": balanced,
            "balance_description": "오행이 균형 잡혀 있습니다." if balanced else "특정 오행이 강하거나 약합니다.",
        }

    def interpret_result(
        self, raw_scores: dict[str, Any], result_type: str
    ) -> dict[str, Any]:
        saju = raw_scores.get("saju", {})
        element_counts = raw_scores.get("element_counts", {})
        yongshin = raw_scores.get("yongshin", {})
        personality = raw_scores.get("personality", {})

        # 사주 표시
        saju_display = {
            "년주": f"{saju.get('year', {}).get('gan', '')}{saju.get('year', {}).get('ji', '')}",
            "월주": f"{saju.get('month', {}).get('gan', '')}{saju.get('month', {}).get('ji', '')}",
            "일주": f"{saju.get('day', {}).get('gan', '')}{saju.get('day', {}).get('ji', '')}",
            "시주": f"{saju.get('hour', {}).get('gan', '')}{saju.get('hour', {}).get('ji', '')}",
        }

        # 일간 상세 해석
        day_gan = saju.get("day", {}).get("gan", "갑")
        day_ji = saju.get("day", {}).get("ji", "자")
        gan_info = self.CHEONGAN.get(day_gan, {})
        ji_info = self.JIJI.get(day_ji, {})

        return {
            "result_type": result_type,
            "saju_display": saju_display,
            "day_master": {
                "gan": day_gan,
                "ji": day_ji,
                "element": gan_info.get("element", ""),
                "yin_yang": gan_info.get("yin_yang", ""),
                "trait": gan_info.get("trait", ""),
            },
            "zodiac": {
                "animal": ji_info.get("animal", ""),
                "trait": ji_info.get("trait", ""),
            },
            "element_distribution": element_counts,
            "primary_element": personality.get("primary_element", ""),
            "personality_traits": [
                personality.get("primary_trait", ""),
                personality.get("element_trait", ""),
            ],
            "yongshin": yongshin,
            "life_advice": self._get_life_advice(personality, yongshin),
            "career_advice": self._get_career_advice(day_gan),
            "relationship_advice": self._get_relationship_advice(element_counts),
            "disclaimer": "사주 분석은 전통적 해석을 기반으로 하며, 참고용으로만 활용하세요.",
        }

    def _get_life_advice(self, personality: dict, yongshin: dict) -> str:
        need = yongshin.get("need", "")
        advice_map = {
            "목": "나무, 식물, 푸른색과 관련된 활동이 도움됩니다. 동쪽 방향이 길합니다.",
            "화": "따뜻한 색, 활동적인 취미, 남쪽 방향이 좋습니다.",
            "토": "안정적인 환경, 중재 역할, 황토색이 도움됩니다.",
            "금": "정리정돈, 체계적인 계획, 흰색이나 금색이 좋습니다.",
            "수": "유연한 사고, 물과 관련된 활동, 검정색이 도움됩니다.",
        }
        return advice_map.get(need, "균형 잡힌 생활을 유지하세요.")

    def _get_career_advice(self, day_gan: str) -> str:
        """일간별 직업 조언"""
        career_map = {
            "갑": "리더십이 필요한 분야, 창업, 개척 분야",
            "을": "협력이 중요한 분야, 예술, 서비스업",
            "병": "표현력을 살릴 수 있는 분야, 미디어, 마케팅",
            "정": "섬세함이 필요한 분야, 디자인, 교육",
            "무": "신뢰가 중요한 분야, 금융, 부동산",
            "기": "사람을 돕는 분야, 의료, 복지",
            "경": "정의와 원칙이 필요한 분야, 법률, 행정",
            "신": "분석력이 필요한 분야, IT, 연구",
            "임": "지혜를 활용하는 분야, 컨설팅, 교육",
            "계": "창의성이 필요한 분야, 예술, 기획",
        }
        return career_map.get(day_gan, "다양한 분야에 적응력이 있습니다.")

    def _get_relationship_advice(self, element_counts: dict) -> str:
        """오행 기반 관계 조언"""
        max_element = max(element_counts.items(), key=lambda x: x[1])[0]
        advice_map = {
            "목": "인정과 격려가 필요합니다. 자유를 존중해주세요.",
            "화": "열정을 이해해주고 표현의 기회를 주세요.",
            "토": "안정감과 신뢰가 중요합니다. 일관성을 보여주세요.",
            "금": "원칙을 존중하고 논리적으로 대화하세요.",
            "수": "감정을 이해하고 유연하게 대처하세요.",
        }
        return advice_map.get(max_element, "서로의 차이를 존중하세요.")
