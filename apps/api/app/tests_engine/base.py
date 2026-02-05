from abc import ABC, abstractmethod
from typing import Optional, Tuple, Any

from app.services.supabase_client import get_supabase


class BaseTestEngine(ABC):
    """검사 엔진 베이스 클래스"""

    test_code: str
    test_name: str

    @abstractmethod
    async def calculate_result(
        self, session_id: str
    ) -> Tuple[dict[str, Any], str]:
        """
        검사 결과를 계산합니다.

        Args:
            session_id: 검사 세션 ID

        Returns:
            Tuple[raw_scores, result_type]
            - raw_scores: 원점수 딕셔너리
            - result_type: 결과 유형 (예: MBTI의 "INTJ")
        """
        pass

    @abstractmethod
    def interpret_result(
        self, raw_scores: dict[str, Any], result_type: str
    ) -> dict[str, Any]:
        """
        결과를 해석합니다.

        Args:
            raw_scores: 원점수
            result_type: 결과 유형

        Returns:
            해석 결과 딕셔너리
        """
        pass

    async def get_responses(self, session_id: str) -> list[dict]:
        """세션의 모든 응답을 가져옵니다."""
        supabase = get_supabase()

        result = (
            supabase.table("responses")
            .select("*, questions(*)")
            .eq("session_id", session_id)
            .order("questions(question_number)")
            .execute()
        )

        return result.data or []

    def calculate_fraud_score(self, responses: list[dict]) -> float:
        """
        부정행위 점수를 계산합니다.
        0.0 ~ 1.0 사이의 값 (높을수록 부정행위 의심)
        """
        if not responses:
            return 0.0

        fraud_indicators = []

        # 1. 응답 시간 분석
        response_times = [
            r.get("response_time_ms", 0)
            for r in responses
            if r.get("response_time_ms")
        ]
        if response_times:
            avg_time = sum(response_times) / len(response_times)

            # 너무 빠른 응답 (평균 1초 미만)
            if avg_time < 1000:
                fraud_indicators.append(0.3)

            # 너무 일정한 응답 시간
            if len(response_times) > 5:
                time_variance = sum(
                    (t - avg_time) ** 2 for t in response_times
                ) / len(response_times)
                if time_variance < 10000:  # 매우 일정한 패턴
                    fraud_indicators.append(0.2)

        # 2. 응답 패턴 분석
        answers = [r.get("answer") for r in responses]
        if answers:
            # 모든 응답이 같은 경우
            if len(set(str(a) for a in answers if a is not None)) <= 2:
                fraud_indicators.append(0.4)

        return min(1.0, sum(fraud_indicators))


# 엔진 레지스트리
_engines: dict[str, type[BaseTestEngine]] = {}


def register_engine(engine_class: type[BaseTestEngine]) -> type[BaseTestEngine]:
    """검사 엔진을 등록하는 데코레이터"""
    _engines[engine_class.test_code] = engine_class
    return engine_class


def get_test_engine(test_code: str) -> Optional[BaseTestEngine]:
    """테스트 코드로 엔진 인스턴스를 가져옵니다."""
    engine_class = _engines.get(test_code)
    if engine_class:
        return engine_class()
    return None
