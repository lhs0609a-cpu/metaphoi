"""
부정행위 탐지 서비스
검사 응답의 일관성과 신뢰도를 검증합니다.
"""

import math
from datetime import datetime
from typing import Optional
from statistics import mean, stdev

from app.services.supabase_client import get_supabase


class FraudDetectionService:
    """부정행위 탐지 서비스"""

    # 탐지 임계값
    THRESHOLDS = {
        # 응답 시간 관련
        "min_response_time_ms": 500,       # 최소 응답 시간 (너무 빠름)
        "max_response_time_cv": 0.15,      # 응답 시간 변동계수 (너무 일정함)
        "min_response_time_cv": 0.8,       # 응답 시간 변동계수 (너무 랜덤함)

        # 응답 패턴 관련
        "same_answer_ratio": 0.8,          # 같은 답변 비율 임계값
        "pattern_repeat_length": 4,        # 반복 패턴 감지 길이

        # 일관성 관련
        "consistency_threshold": 0.3,       # 일관성 검사 임계값

        # 시간 관련
        "min_total_time_ratio": 0.3,       # 최소 총 소요시간 비율
        "max_total_time_ratio": 5.0,       # 최대 총 소요시간 비율
    }

    # 심각도 점수
    SEVERITY_SCORES = {
        "critical": 30,
        "high": 20,
        "medium": 10,
        "low": 5,
    }

    def __init__(self):
        self.supabase = get_supabase()

    async def analyze_session(self, session_id: str) -> dict:
        """세션의 응답 패턴을 종합 분석합니다."""
        # 응답 데이터 조회
        responses = await self._get_session_responses(session_id)
        session_info = await self._get_session_info(session_id)

        if not responses or not session_info:
            return {"error": "세션 데이터를 찾을 수 없습니다."}

        # 각종 탐지 수행
        detections = []

        # 1. 응답 시간 분석
        time_analysis = self._analyze_response_times(responses)
        if time_analysis["flags"]:
            detections.extend(time_analysis["flags"])

        # 2. 응답 패턴 분석
        pattern_analysis = self._analyze_response_patterns(responses)
        if pattern_analysis["flags"]:
            detections.extend(pattern_analysis["flags"])

        # 3. 일관성 분석 (유사 문항 간)
        consistency_analysis = self._analyze_consistency(responses)
        if consistency_analysis["flags"]:
            detections.extend(consistency_analysis["flags"])

        # 4. 총 소요시간 분석
        total_time_analysis = self._analyze_total_time(session_info, responses)
        if total_time_analysis["flags"]:
            detections.extend(total_time_analysis["flags"])

        # 5. 타이핑 패턴 분석 (텍스트 입력이 있는 경우)
        typing_analysis = self._analyze_typing_patterns(responses)
        if typing_analysis["flags"]:
            detections.extend(typing_analysis["flags"])

        # 종합 점수 계산
        fraud_score = self._calculate_fraud_score(detections)

        # 탐지 로그 저장
        await self._save_detection_logs(session_id, detections)

        # 세션 fraud_score 업데이트
        await self._update_session_fraud_score(session_id, fraud_score)

        return {
            "session_id": session_id,
            "fraud_score": fraud_score,
            "risk_level": self._get_risk_level(fraud_score),
            "detections": detections,
            "analysis": {
                "response_times": time_analysis["summary"],
                "patterns": pattern_analysis["summary"],
                "consistency": consistency_analysis["summary"],
                "total_time": total_time_analysis["summary"],
                "typing": typing_analysis["summary"],
            },
            "recommendation": self._get_recommendation(fraud_score),
        }

    def _analyze_response_times(self, responses: list[dict]) -> dict:
        """응답 시간 패턴을 분석합니다."""
        flags = []
        times = [r.get("response_time_ms", 0) for r in responses if r.get("response_time_ms")]

        if not times:
            return {"flags": [], "summary": "응답 시간 데이터 없음"}

        avg_time = mean(times)
        std_time = stdev(times) if len(times) > 1 else 0
        cv = std_time / avg_time if avg_time > 0 else 0

        # 너무 빠른 응답 감지
        fast_responses = [t for t in times if t < self.THRESHOLDS["min_response_time_ms"]]
        if len(fast_responses) > len(times) * 0.2:
            flags.append({
                "type": "fast_responses",
                "severity": "high",
                "description": f"전체의 {len(fast_responses)/len(times)*100:.1f}%가 비정상적으로 빠른 응답",
                "details": {"count": len(fast_responses), "threshold_ms": self.THRESHOLDS["min_response_time_ms"]},
            })

        # 응답 시간 변동계수가 너무 낮음 (일정한 패턴)
        if cv < self.THRESHOLDS["max_response_time_cv"] and len(times) > 5:
            flags.append({
                "type": "consistent_timing",
                "severity": "medium",
                "description": f"응답 시간이 비정상적으로 일정함 (CV={cv:.3f})",
                "details": {"cv": cv, "avg_ms": avg_time},
            })

        return {
            "flags": flags,
            "summary": {
                "avg_time_ms": round(avg_time, 1),
                "std_time_ms": round(std_time, 1),
                "cv": round(cv, 3),
                "fast_response_count": len(fast_responses),
            }
        }

    def _analyze_response_patterns(self, responses: list[dict]) -> dict:
        """응답 패턴을 분석합니다."""
        flags = []
        answers = [r.get("answer") for r in responses]

        # 같은 답변 비율
        answer_counts = {}
        for a in answers:
            key = str(a)
            answer_counts[key] = answer_counts.get(key, 0) + 1

        max_same = max(answer_counts.values()) if answer_counts else 0
        same_ratio = max_same / len(answers) if answers else 0

        if same_ratio > self.THRESHOLDS["same_answer_ratio"]:
            flags.append({
                "type": "same_answer_pattern",
                "severity": "critical",
                "description": f"동일한 답변이 {same_ratio*100:.1f}%",
                "details": {"same_ratio": same_ratio, "most_common_count": max_same},
            })

        # 반복 패턴 감지
        pattern_length = self.THRESHOLDS["pattern_repeat_length"]
        for i in range(len(answers) - pattern_length * 2):
            pattern = answers[i:i + pattern_length]
            next_seq = answers[i + pattern_length:i + pattern_length * 2]
            if pattern == next_seq:
                flags.append({
                    "type": "repeating_pattern",
                    "severity": "high",
                    "description": f"반복되는 응답 패턴 감지 (위치: {i})",
                    "details": {"pattern": pattern, "position": i},
                })
                break

        # 응답 분포 분석 (likert 척도의 경우)
        numeric_answers = [a for a in answers if isinstance(a, (int, float))]
        if numeric_answers:
            # 극단값만 선택하는 패턴
            extreme_count = sum(1 for a in numeric_answers if a in [1, 5])
            if extreme_count > len(numeric_answers) * 0.7:
                flags.append({
                    "type": "extreme_answers",
                    "severity": "medium",
                    "description": f"극단적인 답변 비율이 높음 ({extreme_count}/{len(numeric_answers)})",
                    "details": {"extreme_count": extreme_count},
                })

        return {
            "flags": flags,
            "summary": {
                "same_answer_ratio": round(same_ratio, 3),
                "answer_distribution": answer_counts,
            }
        }

    def _analyze_consistency(self, responses: list[dict]) -> dict:
        """유사 문항 간 일관성을 분석합니다."""
        flags = []

        # 역문항 쌍 분석 (질문에 reverse 표시가 있는 경우)
        inconsistent_pairs = []

        questions = {r["question_id"]: r for r in responses}

        # 같은 카테고리/척도의 문항들 비교
        scoring_groups = {}
        for r in responses:
            scoring = r.get("questions", {}).get("scoring_weights", {})
            for scale in scoring.keys():
                if scale not in ["area", "domain", "type", "field", "feature", "position"]:
                    if scale not in scoring_groups:
                        scoring_groups[scale] = []
                    scoring_groups[scale].append(r)

        # 각 척도 내 일관성 검사
        for scale, group_responses in scoring_groups.items():
            if len(group_responses) >= 3:
                numeric_answers = [
                    r.get("answer") for r in group_responses
                    if isinstance(r.get("answer"), (int, float))
                ]
                if len(numeric_answers) >= 3:
                    std = stdev(numeric_answers)
                    # 표준편차가 너무 크면 일관성 없음
                    if std > 2.0:  # 5점 척도 기준
                        inconsistent_pairs.append(scale)

        if len(inconsistent_pairs) > 2:
            flags.append({
                "type": "inconsistent_responses",
                "severity": "medium",
                "description": f"{len(inconsistent_pairs)}개 척도에서 비일관적 응답",
                "details": {"scales": inconsistent_pairs},
            })

        return {
            "flags": flags,
            "summary": {
                "inconsistent_scales": inconsistent_pairs,
                "total_scales_checked": len(scoring_groups),
            }
        }

    def _analyze_total_time(self, session_info: dict, responses: list[dict]) -> dict:
        """총 소요시간을 분석합니다."""
        flags = []

        expected_minutes = session_info.get("expected_minutes", 15)
        expected_ms = expected_minutes * 60 * 1000

        total_time_ms = sum(r.get("response_time_ms", 0) for r in responses)

        if total_time_ms > 0:
            time_ratio = total_time_ms / expected_ms

            if time_ratio < self.THRESHOLDS["min_total_time_ratio"]:
                flags.append({
                    "type": "too_fast_completion",
                    "severity": "critical",
                    "description": f"예상 시간의 {time_ratio*100:.1f}%만에 완료",
                    "details": {"expected_ms": expected_ms, "actual_ms": total_time_ms},
                })
            elif time_ratio > self.THRESHOLDS["max_total_time_ratio"]:
                flags.append({
                    "type": "too_slow_completion",
                    "severity": "low",
                    "description": f"예상 시간의 {time_ratio*100:.1f}%로 완료 (중단 가능성)",
                    "details": {"expected_ms": expected_ms, "actual_ms": total_time_ms},
                })

        return {
            "flags": flags,
            "summary": {
                "total_time_ms": total_time_ms,
                "expected_time_ms": expected_ms,
                "time_ratio": round(total_time_ms / expected_ms, 2) if expected_ms > 0 else 0,
            }
        }

    def _analyze_typing_patterns(self, responses: list[dict]) -> dict:
        """타이핑 패턴을 분석합니다 (텍스트 입력이 있는 경우)."""
        flags = []

        typing_data = []
        for r in responses:
            tp = r.get("typing_pattern")
            if tp:
                typing_data.append(tp)

        if not typing_data:
            return {"flags": [], "summary": "타이핑 데이터 없음"}

        # 키 입력 간격 분석
        all_intervals = []
        for tp in typing_data:
            intervals = tp.get("key_intervals", [])
            all_intervals.extend(intervals)

        if all_intervals and len(all_intervals) > 10:
            avg_interval = mean(all_intervals)
            std_interval = stdev(all_intervals)
            cv = std_interval / avg_interval if avg_interval > 0 else 0

            # 너무 일정한 타이핑 (봇 의심)
            if cv < 0.1:
                flags.append({
                    "type": "bot_like_typing",
                    "severity": "critical",
                    "description": "타이핑 패턴이 비정상적으로 일정함",
                    "details": {"cv": cv, "avg_interval_ms": avg_interval},
                })

            # 복사/붙여넣기 감지
            paste_events = sum(tp.get("paste_count", 0) for tp in typing_data)
            if paste_events > len(typing_data) * 0.5:
                flags.append({
                    "type": "copy_paste_detected",
                    "severity": "high",
                    "description": f"복사/붙여넣기 {paste_events}회 감지",
                    "details": {"paste_count": paste_events},
                })

        # 탭 전환 감지
        tab_switches = sum(tp.get("tab_switches", 0) for tp in typing_data)
        if tab_switches > 10:
            flags.append({
                "type": "tab_switching",
                "severity": "medium",
                "description": f"탭 전환 {tab_switches}회 감지",
                "details": {"tab_switch_count": tab_switches},
            })

        return {
            "flags": flags,
            "summary": {
                "typing_data_count": len(typing_data),
                "total_tab_switches": tab_switches,
            }
        }

    def _calculate_fraud_score(self, detections: list[dict]) -> float:
        """부정행위 점수를 계산합니다 (0-100)."""
        if not detections:
            return 0

        total_score = 0
        for detection in detections:
            severity = detection.get("severity", "low")
            total_score += self.SEVERITY_SCORES.get(severity, 5)

        return min(100, total_score)

    def _get_risk_level(self, fraud_score: float) -> str:
        """위험 수준을 반환합니다."""
        if fraud_score >= 50:
            return "high"
        elif fraud_score >= 30:
            return "medium"
        elif fraud_score >= 10:
            return "low"
        else:
            return "normal"

    def _get_recommendation(self, fraud_score: float) -> str:
        """권장 조치를 반환합니다."""
        if fraud_score >= 50:
            return "검사 결과의 신뢰도가 낮습니다. 재검사를 권장합니다."
        elif fraud_score >= 30:
            return "일부 응답 패턴이 비정상적입니다. 결과 해석 시 주의가 필요합니다."
        elif fraud_score >= 10:
            return "경미한 이상 패턴이 감지되었지만 결과는 대체로 신뢰할 수 있습니다."
        else:
            return "응답 패턴이 정상적입니다. 결과를 신뢰할 수 있습니다."

    async def _get_session_responses(self, session_id: str) -> list[dict]:
        """세션의 응답 데이터를 조회합니다."""
        result = (
            self.supabase.table("responses")
            .select("*, questions(scoring_weights)")
            .eq("session_id", session_id)
            .order("created_at")
            .execute()
        )
        return result.data or []

    async def _get_session_info(self, session_id: str) -> Optional[dict]:
        """세션 정보를 조회합니다."""
        result = (
            self.supabase.table("test_sessions")
            .select("*, tests(question_count, estimated_minutes)")
            .eq("id", session_id)
            .single()
            .execute()
        )

        if result.data:
            tests = result.data.get("tests", {})
            return {
                "expected_minutes": tests.get("estimated_minutes", 15),
                "question_count": tests.get("question_count", 20),
            }
        return None

    async def _save_detection_logs(self, session_id: str, detections: list[dict]) -> None:
        """탐지 로그를 저장합니다."""
        for detection in detections:
            self.supabase.table("fraud_detection_logs").insert({
                "session_id": session_id,
                "detection_type": detection["type"],
                "details": detection.get("details", {}),
                "severity": detection["severity"],
            }).execute()

    async def _update_session_fraud_score(self, session_id: str, fraud_score: float) -> None:
        """세션의 부정행위 점수를 업데이트합니다."""
        self.supabase.table("test_sessions").update({
            "fraud_score": fraud_score
        }).eq("id", session_id).execute()


# 싱글톤 인스턴스
_fraud_service: Optional[FraudDetectionService] = None


def get_fraud_detection_service() -> FraudDetectionService:
    """부정행위 탐지 서비스 인스턴스를 반환합니다."""
    global _fraud_service
    if _fraud_service is None:
        _fraud_service = FraudDetectionService()
    return _fraud_service
