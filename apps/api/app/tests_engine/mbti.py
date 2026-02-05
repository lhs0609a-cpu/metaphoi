from typing import Tuple, Any

from app.tests_engine.base import BaseTestEngine, register_engine


@register_engine
class MBTIEngine(BaseTestEngine):
    """MBTI 검사 엔진"""

    test_code = "mbti"
    test_name = "MBTI 성격 유형 검사"

    # 4가지 지표별 설명
    DIMENSIONS = {
        "E-I": {"E": "외향(Extraversion)", "I": "내향(Introversion)"},
        "S-N": {"S": "감각(Sensing)", "N": "직관(iNtuition)"},
        "T-F": {"T": "사고(Thinking)", "F": "감정(Feeling)"},
        "J-P": {"J": "판단(Judging)", "P": "인식(Perceiving)"},
    }

    # 16가지 유형별 설명
    TYPE_DESCRIPTIONS = {
        "INTJ": {
            "name": "전략가",
            "description": "독창적인 사고와 강한 의지력을 가진 전략적 사고가",
            "strengths": ["전략적 사고", "독립심", "높은 기준", "결단력"],
            "weaknesses": ["감정 표현 부족", "비판적", "완벽주의"],
        },
        "INTP": {
            "name": "논리술사",
            "description": "지식에 대한 끊임없는 갈증을 가진 혁신적인 발명가",
            "strengths": ["분석력", "객관성", "독창성", "논리적 사고"],
            "weaknesses": ["실용성 부족", "사회성 부족", "우유부단"],
        },
        "ENTJ": {
            "name": "통솔자",
            "description": "대담하고 상상력이 풍부한 강한 의지의 리더",
            "strengths": ["리더십", "자신감", "효율성", "전략적 사고"],
            "weaknesses": ["참을성 부족", "거만함", "냉정함"],
        },
        "ENTP": {
            "name": "변론가",
            "description": "도전을 즐기는 영리하고 호기심 많은 사상가",
            "strengths": ["지적 호기심", "재치", "창의성", "자신감"],
            "weaknesses": ["논쟁적", "실용성 부족", "집중력 부족"],
        },
        "INFJ": {
            "name": "옹호자",
            "description": "조용하고 신비로우며 영감을 주는 이상주의자",
            "strengths": ["통찰력", "원칙주의", "열정", "이타심"],
            "weaknesses": ["완벽주의", "번아웃 취약", "예민함"],
        },
        "INFP": {
            "name": "중재자",
            "description": "항상 선을 행할 준비가 된 시적이고 친절한 이타주의자",
            "strengths": ["공감 능력", "창의성", "열정", "헌신"],
            "weaknesses": ["비현실적", "자기비판", "고립 성향"],
        },
        "ENFJ": {
            "name": "선도자",
            "description": "청중을 사로잡는 카리스마와 영감을 주는 리더",
            "strengths": ["카리스마", "이타심", "신뢰성", "리더십"],
            "weaknesses": ["지나친 이상주의", "자기희생", "예민함"],
        },
        "ENFP": {
            "name": "활동가",
            "description": "열정적이고 창의적이며 사교적인 자유로운 영혼",
            "strengths": ["열정", "창의성", "사교성", "긍정적"],
            "weaknesses": ["집중력 부족", "지나친 감정", "실용성 부족"],
        },
        "ISTJ": {
            "name": "현실주의자",
            "description": "사실에 근거한 실용적이고 신뢰할 수 있는 유형",
            "strengths": ["책임감", "신뢰성", "꼼꼼함", "인내심"],
            "weaknesses": ["고집", "변화 저항", "감정 표현 부족"],
        },
        "ISFJ": {
            "name": "수호자",
            "description": "헌신적이고 따뜻한 보호자",
            "strengths": ["지지력", "신뢰성", "인내심", "관찰력"],
            "weaknesses": ["자기희생", "변화 저항", "지나친 겸손"],
        },
        "ESTJ": {
            "name": "경영자",
            "description": "탁월한 관리자, 물건과 사람을 잘 관리하는 유형",
            "strengths": ["조직력", "헌신", "정직", "의지력"],
            "weaknesses": ["고집", "융통성 부족", "사회적 지위 중시"],
        },
        "ESFJ": {
            "name": "집정관",
            "description": "세심하고 사교적이며 인기 있는 유형",
            "strengths": ["책임감", "충성심", "사교성", "배려심"],
            "weaknesses": ["인정 욕구", "비판에 예민", "이타적 과잉"],
        },
        "ISTP": {
            "name": "장인",
            "description": "대담하고 실용적인 실험가",
            "strengths": ["논리적", "문제해결 능력", "위기 대처", "실용적"],
            "weaknesses": ["둔감함", "위험 추구", "약속 회피"],
        },
        "ISFP": {
            "name": "모험가",
            "description": "유연하고 매력적인 예술가",
            "strengths": ["매력", "예술성", "호기심", "열정"],
            "weaknesses": ["예측 불가", "자존감 이슈", "경쟁 회피"],
        },
        "ESTP": {
            "name": "사업가",
            "description": "영리하고 활기차며 날카로운 인지력의 소유자",
            "strengths": ["대담함", "합리성", "직접적", "사교적"],
            "weaknesses": ["무감각", "인내심 부족", "규칙 무시"],
        },
        "ESFP": {
            "name": "연예인",
            "description": "자발적이고 활기차며 재미있는 유형",
            "strengths": ["대담함", "독창성", "미적 감각", "실용성"],
            "weaknesses": ["예민함", "집중력 부족", "장기 계획 부족"],
        },
    }

    async def calculate_result(
        self, session_id: str
    ) -> Tuple[dict[str, Any], str]:
        responses = await self.get_responses(session_id)

        # 각 지표별 점수 계산
        scores = {"E": 0, "I": 0, "S": 0, "N": 0, "T": 0, "F": 0, "J": 0, "P": 0}

        for response in responses:
            question = response.get("questions", {})
            answer = response.get("answer")
            scoring = question.get("scoring_weights", {})

            if answer is not None and scoring:
                # 응답에 따른 점수 가산
                for indicator, weight in scoring.items():
                    if indicator in scores:
                        if isinstance(answer, int):
                            scores[indicator] += weight * answer
                        elif isinstance(answer, str) and answer in scoring:
                            scores[indicator] += scoring[answer]

        # 유형 결정
        type_code = ""
        type_code += "E" if scores["E"] >= scores["I"] else "I"
        type_code += "S" if scores["S"] >= scores["N"] else "N"
        type_code += "T" if scores["T"] >= scores["F"] else "F"
        type_code += "J" if scores["J"] >= scores["P"] else "P"

        # 각 지표별 선호도 퍼센트 계산
        raw_scores = {
            "type": type_code,
            "E": scores["E"],
            "I": scores["I"],
            "S": scores["S"],
            "N": scores["N"],
            "T": scores["T"],
            "F": scores["F"],
            "J": scores["J"],
            "P": scores["P"],
            "E_I_pct": self._calc_percentage(scores["E"], scores["I"]),
            "S_N_pct": self._calc_percentage(scores["S"], scores["N"]),
            "T_F_pct": self._calc_percentage(scores["T"], scores["F"]),
            "J_P_pct": self._calc_percentage(scores["J"], scores["P"]),
        }

        return raw_scores, type_code

    def _calc_percentage(self, a: float, b: float) -> dict[str, float]:
        total = abs(a) + abs(b)
        if total == 0:
            return {"first": 50, "second": 50}
        return {
            "first": round(abs(a) / total * 100, 1),
            "second": round(abs(b) / total * 100, 1),
        }

    def interpret_result(
        self, raw_scores: dict[str, Any], result_type: str
    ) -> dict[str, Any]:
        type_info = self.TYPE_DESCRIPTIONS.get(
            result_type,
            {
                "name": "Unknown",
                "description": "",
                "strengths": [],
                "weaknesses": [],
            },
        )

        return {
            "type": result_type,
            "type_name": type_info["name"],
            "description": type_info["description"],
            "strengths": type_info["strengths"],
            "weaknesses": type_info["weaknesses"],
            "dimensions": {
                "E-I": {
                    "result": result_type[0],
                    "E_label": self.DIMENSIONS["E-I"]["E"],
                    "I_label": self.DIMENSIONS["E-I"]["I"],
                    "percentage": raw_scores.get("E_I_pct", {}),
                },
                "S-N": {
                    "result": result_type[1],
                    "S_label": self.DIMENSIONS["S-N"]["S"],
                    "N_label": self.DIMENSIONS["S-N"]["N"],
                    "percentage": raw_scores.get("S_N_pct", {}),
                },
                "T-F": {
                    "result": result_type[2],
                    "T_label": self.DIMENSIONS["T-F"]["T"],
                    "F_label": self.DIMENSIONS["T-F"]["F"],
                    "percentage": raw_scores.get("T_F_pct", {}),
                },
                "J-P": {
                    "result": result_type[3],
                    "J_label": self.DIMENSIONS["J-P"]["J"],
                    "P_label": self.DIMENSIONS["J-P"]["P"],
                    "percentage": raw_scores.get("J_P_pct", {}),
                },
            },
        }
