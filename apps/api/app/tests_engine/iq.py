from typing import Tuple, Any

from app.tests_engine.base import BaseTestEngine, register_engine


@register_engine
class IQEngine(BaseTestEngine):
    """IQ 테스트 엔진 (간이 지능검사)"""

    test_code = "iq"
    test_name = "IQ 테스트"

    # IQ 범위별 해석
    IQ_RANGES = {
        (130, 200): {"label": "매우 우수", "description": "상위 2% 이내의 뛰어난 지적 능력"},
        (120, 129): {"label": "우수", "description": "상위 10% 이내의 우수한 지적 능력"},
        (110, 119): {"label": "평균 상", "description": "평균 이상의 지적 능력"},
        (90, 109): {"label": "평균", "description": "일반적인 지적 능력"},
        (80, 89): {"label": "평균 하", "description": "평균 이하의 지적 능력"},
        (70, 79): {"label": "경계선", "description": "지적 기능의 경계선 수준"},
        (0, 69): {"label": "낮음", "description": "지적 기능의 제한이 있을 수 있음"},
    }

    # 하위 영역
    DOMAINS = {
        "verbal": {"name": "언어 이해", "description": "어휘력, 언어 추론, 독해력"},
        "numerical": {"name": "수리 논리", "description": "수학적 추론, 계산 능력"},
        "spatial": {"name": "공간 지각", "description": "도형 추론, 공간 관계 파악"},
        "pattern": {"name": "패턴 인식", "description": "규칙 발견, 순서 추론"},
        "memory": {"name": "작업 기억", "description": "정보 유지 및 처리 능력"},
        "speed": {"name": "처리 속도", "description": "빠른 정보 처리 능력"},
    }

    async def calculate_result(
        self, session_id: str
    ) -> Tuple[dict[str, Any], str]:
        responses = await self.get_responses(session_id)

        # 영역별 점수 계산
        domain_scores = {domain: {"correct": 0, "total": 0} for domain in self.DOMAINS}
        total_correct = 0
        total_questions = 0
        total_time = 0

        for response in responses:
            question = response.get("questions", {})
            answer = response.get("answer")
            scoring = question.get("scoring_weights", {})
            correct_answer = scoring.get("correct_answer")
            domain = scoring.get("domain", "pattern")
            response_time = response.get("response_time_ms", 0)

            total_questions += 1
            total_time += response_time

            if domain in domain_scores:
                domain_scores[domain]["total"] += 1

            # 정답 체크
            is_correct = False
            if correct_answer is not None:
                if isinstance(answer, (int, float)) and isinstance(correct_answer, (int, float)):
                    is_correct = abs(answer - correct_answer) < 0.01
                else:
                    is_correct = str(answer) == str(correct_answer)

            if is_correct:
                total_correct += 1
                if domain in domain_scores:
                    domain_scores[domain]["correct"] += 1

        # 원점수 계산 (정답률 기반)
        raw_score = (total_correct / total_questions * 100) if total_questions > 0 else 0

        # IQ 점수 변환 (정규분포 기반, 평균 100, 표준편차 15)
        # 간이 검사이므로 근사치 사용
        iq_score = round(70 + (raw_score * 0.6))  # 70-130 범위
        iq_score = max(70, min(145, iq_score))  # 범위 제한

        # 영역별 백분율 계산
        domain_percentages = {}
        for domain, data in domain_scores.items():
            if data["total"] > 0:
                domain_percentages[domain] = round(data["correct"] / data["total"] * 100, 1)
            else:
                domain_percentages[domain] = 0

        # 평균 응답 시간
        avg_response_time = (total_time / total_questions) if total_questions > 0 else 0

        # IQ 범위 결정
        iq_label = "평균"
        for (low, high), info in self.IQ_RANGES.items():
            if low <= iq_score <= high:
                iq_label = info["label"]
                break

        raw_scores = {
            "iq_score": iq_score,
            "raw_score": raw_score,
            "total_correct": total_correct,
            "total_questions": total_questions,
            "domain_scores": domain_percentages,
            "avg_response_time_ms": round(avg_response_time),
        }

        return raw_scores, str(iq_score)

    def interpret_result(
        self, raw_scores: dict[str, Any], result_type: str
    ) -> dict[str, Any]:
        iq_score = raw_scores.get("iq_score", 100)
        domain_scores = raw_scores.get("domain_scores", {})

        # IQ 범위 해석
        iq_interpretation = {"label": "평균", "description": "일반적인 지적 능력"}
        for (low, high), info in self.IQ_RANGES.items():
            if low <= iq_score <= high:
                iq_interpretation = info
                break

        # 영역별 분석
        domain_analysis = []
        for domain, percentage in domain_scores.items():
            domain_info = self.DOMAINS.get(domain, {})
            level = "우수" if percentage >= 80 else "양호" if percentage >= 60 else "보통" if percentage >= 40 else "노력필요"
            domain_analysis.append({
                "domain": domain,
                "name": domain_info.get("name", domain),
                "description": domain_info.get("description", ""),
                "score": percentage,
                "level": level,
            })

        # 강점/약점 분석
        sorted_domains = sorted(domain_analysis, key=lambda x: x["score"], reverse=True)
        strengths = [d["name"] for d in sorted_domains[:2]]
        weaknesses = [d["name"] for d in sorted_domains[-2:] if d["score"] < 60]

        # 백분위 추정 (정규분포 기반)
        percentile = self._estimate_percentile(iq_score)

        return {
            "iq_score": iq_score,
            "iq_label": iq_interpretation["label"],
            "iq_description": iq_interpretation["description"],
            "percentile": percentile,
            "domain_analysis": domain_analysis,
            "strengths": strengths,
            "weaknesses": weaknesses,
            "recommendation": self._get_recommendation(iq_score, weaknesses),
            "disclaimer": "이 검사는 간이 지능검사로, 정확한 IQ 측정을 위해서는 전문가의 공식 검사가 필요합니다.",
        }

    def _estimate_percentile(self, iq: int) -> int:
        """IQ 점수를 백분위로 변환"""
        # 정규분포 근사
        percentiles = {
            145: 99, 140: 99, 135: 99, 130: 98,
            125: 95, 120: 91, 115: 84, 110: 75,
            105: 63, 100: 50, 95: 37, 90: 25,
            85: 16, 80: 9, 75: 5, 70: 2
        }
        for score, pct in sorted(percentiles.items(), reverse=True):
            if iq >= score:
                return pct
        return 1

    def _get_recommendation(self, iq: int, weaknesses: list) -> str:
        """개선 권장사항"""
        if iq >= 120:
            return "뛰어난 지적 능력을 가지고 있습니다. 복잡한 문제 해결과 창의적 사고가 필요한 분야에서 능력을 발휘할 수 있습니다."
        elif iq >= 100:
            base = "양호한 지적 능력을 보입니다."
            if weaknesses:
                return f"{base} {', '.join(weaknesses)} 영역의 훈련을 통해 더욱 발전할 수 있습니다."
            return base
        else:
            return "꾸준한 학습과 훈련을 통해 지적 능력을 향상시킬 수 있습니다. 특히 기초적인 문제부터 차근차근 연습하는 것이 좋습니다."
