"""
리포트 생성 서비스
사용자의 검사 결과와 능력치를 종합하여 리포트를 생성합니다.
"""

from datetime import datetime, timedelta
from typing import Optional
from uuid import uuid4

from app.services.supabase_client import get_supabase
from app.services.ai_service import get_ai_service
from app.services.ability_service import calculate_abilities, get_user_abilities


# 리포트 가격 (원)
REPORT_PRICES = {
    "basic": 9900,
    "pro": 29900,
    "premium": 59900,
}

# 리포트 만료 기간 (일)
REPORT_EXPIRY = {
    "basic": 30,
    "pro": 90,
    "premium": 365,
}


class ReportService:
    """리포트 생성 서비스"""

    def __init__(self):
        self.supabase = get_supabase()
        self.ai_service = get_ai_service()

    async def get_report_preview(self, user_id: str) -> dict:
        """무료 미리보기 데이터를 생성합니다."""
        # 능력치 계산
        abilities = await calculate_abilities(user_id)

        # 검사 결과 조회
        test_results = await self._get_test_results(user_id)

        # 기본 통계
        total_tests = len(test_results)
        completed_tests = [r["test_code"] for r in test_results]

        # 상위 3개 강점 (블러 처리)
        top_abilities = sorted(
            [(a.code, a.name, a.score) for cat in abilities.categories for a in cat.abilities],
            key=lambda x: x[2],
            reverse=True
        )[:3]

        return {
            "total_tests_completed": total_tests,
            "completed_tests": completed_tests,
            "reliability_score": abilities.reliability,
            "total_ability_score": abilities.total_score,
            "max_ability_score": abilities.max_total_score,
            "top_strengths_preview": [
                {"name": a[1], "score_range": f"{int(a[2]-2)}-{int(a[2]+2)}", "blurred": True}
                for a in top_abilities
            ],
            "available_reports": [
                {
                    "type": "basic",
                    "name": "Basic 리포트",
                    "price": REPORT_PRICES["basic"],
                    "features": ["능력치 요약", "강점 분석", "직업 추천 3개"],
                },
                {
                    "type": "pro",
                    "name": "Pro 리포트",
                    "price": REPORT_PRICES["pro"],
                    "features": ["상세 능력치 분석", "성장 영역 분석", "직업 추천 10개", "PDF 다운로드"],
                },
                {
                    "type": "premium",
                    "name": "Premium 리포트",
                    "price": REPORT_PRICES["premium"],
                    "features": ["전문가 수준 분석", "1:1 맞춤 조언", "성장 로드맵", "AI 코칭", "1년 열람"],
                },
            ],
            "min_tests_required": 5,
            "can_generate": total_tests >= 5,
        }

    async def generate_report(
        self, user_id: str, report_type: str = "basic"
    ) -> dict:
        """리포트를 생성합니다."""
        if report_type not in REPORT_PRICES:
            raise ValueError(f"Invalid report type: {report_type}")

        # 능력치 계산
        abilities_response = await calculate_abilities(user_id)

        # 검사 결과 조회
        test_results = await self._get_test_results(user_id)

        if len(test_results) < 5:
            raise ValueError("최소 5개 이상의 검사를 완료해야 합니다.")

        # 사용자 정보 조회
        user_info = await self._get_user_info(user_id)

        # 능력치 데이터 변환
        abilities_data = []
        for cat in abilities_response.categories:
            for ability in cat.abilities:
                abilities_data.append({
                    "code": ability.code,
                    "name": ability.name,
                    "category": ability.category,
                    "score": ability.score,
                    "max_score": ability.max_score,
                    "confidence": ability.confidence,
                })

        # AI 리포트 생성
        ai_report = await self.ai_service.generate_report(
            user_info=user_info,
            abilities=abilities_data,
            test_results=test_results,
            report_type=report_type
        )

        # 직업 추천 (Pro, Premium)
        career_recommendations = None
        if report_type in ["pro", "premium"]:
            career_recommendations = await self.ai_service.generate_career_recommendations(
                abilities_data, test_results
            )

        # 성장 로드맵 (Premium only)
        growth_roadmap = None
        if report_type == "premium":
            growth_roadmap = await self.ai_service.generate_growth_roadmap(abilities_data)

        # 리포트 데이터 구성
        report_data = {
            "report_type": report_type,
            "generated_at": datetime.now().isoformat(),
            "user_info": {
                "name": user_info.get("name"),
                "tests_completed": len(test_results),
            },
            "summary": {
                "total_score": abilities_response.total_score,
                "max_score": abilities_response.max_total_score,
                "reliability": abilities_response.reliability,
                "completed_tests": abilities_response.completed_tests,
            },
            "abilities": {
                cat.category: [
                    {
                        "name": a.name,
                        "score": a.score,
                        "max_score": a.max_score,
                        "level": self._get_ability_level(a.score),
                    }
                    for a in cat.abilities
                ]
                for cat in abilities_response.categories
            },
            "ai_analysis": ai_report,
            "career_recommendations": career_recommendations,
            "growth_roadmap": growth_roadmap,
        }

        # 리포트 저장
        report_id = await self._save_report(user_id, report_type, report_data)

        return {
            "report_id": report_id,
            "report_type": report_type,
            "data": report_data,
            "expires_at": (datetime.now() + timedelta(days=REPORT_EXPIRY[report_type])).isoformat(),
        }

    async def get_report(self, report_id: str, user_id: str) -> Optional[dict]:
        """저장된 리포트를 조회합니다."""
        result = (
            self.supabase.table("reports")
            .select("*")
            .eq("id", report_id)
            .eq("user_id", user_id)
            .single()
            .execute()
        )

        if not result.data:
            return None

        report = result.data

        # 만료 확인
        expires_at = datetime.fromisoformat(report["expires_at"].replace("Z", "+00:00"))
        if expires_at < datetime.now(expires_at.tzinfo):
            return {"error": "리포트가 만료되었습니다.", "expired": True}

        return {
            "report_id": report["id"],
            "report_type": report["report_type"],
            "data": report["report_data"],
            "generated_at": report["generated_at"],
            "expires_at": report["expires_at"],
        }

    async def get_user_reports(self, user_id: str) -> list[dict]:
        """사용자의 모든 리포트 목록을 조회합니다."""
        result = (
            self.supabase.table("reports")
            .select("id, report_type, generated_at, expires_at")
            .eq("user_id", user_id)
            .order("generated_at", desc=True)
            .execute()
        )

        return [
            {
                "report_id": r["id"],
                "report_type": r["report_type"],
                "generated_at": r["generated_at"],
                "expires_at": r["expires_at"],
                "is_expired": datetime.fromisoformat(
                    r["expires_at"].replace("Z", "+00:00")
                ) < datetime.now(datetime.now().astimezone().tzinfo),
            }
            for r in (result.data or [])
        ]

    async def _get_test_results(self, user_id: str) -> list[dict]:
        """사용자의 검사 결과를 조회합니다."""
        result = (
            self.supabase.table("test_results")
            .select("*, tests(code, name)")
            .eq("user_id", user_id)
            .execute()
        )

        return [
            {
                "test_code": r["tests"]["code"],
                "test_name": r["tests"]["name"],
                "result_type": r.get("result_type"),
                "raw_scores": r.get("raw_scores"),
                "processed_result": r.get("processed_result"),
                "created_at": r.get("created_at"),
            }
            for r in (result.data or [])
            if r.get("tests")
        ]

    async def _get_user_info(self, user_id: str) -> dict:
        """사용자 정보를 조회합니다."""
        result = (
            self.supabase.table("users")
            .select("name, birth_date, gender, blood_type")
            .eq("id", user_id)
            .single()
            .execute()
        )

        return result.data or {}

    async def _save_report(
        self, user_id: str, report_type: str, report_data: dict
    ) -> str:
        """리포트를 데이터베이스에 저장합니다."""
        report_id = str(uuid4())
        expires_at = datetime.now() + timedelta(days=REPORT_EXPIRY[report_type])

        self.supabase.table("reports").insert({
            "id": report_id,
            "user_id": user_id,
            "report_type": report_type,
            "report_data": report_data,
            "generated_at": datetime.now().isoformat(),
            "expires_at": expires_at.isoformat(),
        }).execute()

        return report_id

    def _get_ability_level(self, score: float) -> str:
        """능력치 점수를 레벨로 변환합니다."""
        if score >= 18:
            return "최상"
        elif score >= 15:
            return "상"
        elif score >= 12:
            return "중상"
        elif score >= 8:
            return "중"
        elif score >= 5:
            return "중하"
        else:
            return "하"


# 싱글톤 인스턴스
_report_service: Optional[ReportService] = None


def get_report_service() -> ReportService:
    """리포트 서비스 인스턴스를 반환합니다."""
    global _report_service
    if _report_service is None:
        _report_service = ReportService()
    return _report_service
