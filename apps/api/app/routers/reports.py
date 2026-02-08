from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.services.supabase_client import get_supabase
from app.services.ability_service import calculate_abilities
from app.routers.auth import get_current_user

router = APIRouter()


class ReportGenerateRequest(BaseModel):
    type: str  # basic, pro, premium


@router.get("/preview")
async def preview_report(
    current_user: Annotated[dict, Depends(get_current_user)],
):
    """무료 미리보기 (블러 처리된 결과)"""
    abilities = await calculate_abilities(current_user["id"])

    # 미리보기에서는 일부 데이터만 보여줌
    preview_data = {
        "total_score": abilities.total_score,
        "max_total_score": abilities.max_total_score,
        "reliability": abilities.reliability,
        "completed_tests": abilities.completed_tests,
        "pending_tests": abilities.pending_tests,
        "categories_preview": [
            {
                "category": cat.category,
                "abilities_count": len(cat.abilities),
                # 일부 능력치만 보여주고 나머지는 블러
                "sample_abilities": [
                    {
                        "name": ab.name,
                        "score": ab.score if i < 2 else None,
                        "blurred": i >= 2,
                    }
                    for i, ab in enumerate(cat.abilities)
                ],
            }
            for cat in abilities.categories
        ],
        "is_preview": True,
    }

    return preview_data


@router.post("/generate")
async def generate_report(
    request: ReportGenerateRequest,
    current_user: Annotated[dict, Depends(get_current_user)],
):
    """리포트 생성"""
    supabase = get_supabase()

    # Check if user has paid for this report type
    payment = (
        supabase.table("payments")
        .select("*")
        .eq("user_id", current_user["id"])
        .eq("status", "completed")
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )

    # For now, allow generation (payment check can be stricter in production)
    abilities = await calculate_abilities(current_user["id"])

    report_data = {
        "type": request.type,
        "abilities": abilities.model_dump(),
    }

    # Add additional content based on report type
    if request.type in ["pro", "premium"]:
        report_data["detailed_analysis"] = await _generate_detailed_analysis(
            current_user["id"], abilities
        )
        report_data["career_recommendations"] = await _generate_career_recommendations(
            abilities
        )

    if request.type == "premium":
        report_data["growth_roadmap"] = await _generate_growth_roadmap(abilities)

    # Save report
    result = (
        supabase.table("reports")
        .insert(
            {
                "user_id": current_user["id"],
                "report_type": request.type,
                "report_data": report_data,
            }
        )
        .execute()
    )

    return {
        "report_id": result.data[0]["id"] if result.data else None,
        "report_data": report_data,
    }


@router.get("/{report_id}")
async def get_report(
    report_id: str,
    current_user: Annotated[dict, Depends(get_current_user)],
):
    """리포트 조회"""
    supabase = get_supabase()

    result = (
        supabase.table("reports")
        .select("*")
        .eq("id", report_id)
        .eq("user_id", current_user["id"])
        .single()
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found",
        )

    return {"report": result.data}


async def _generate_detailed_analysis(user_id: str, abilities) -> dict:
    """상세 분석 생성 (Pro/Premium)"""
    # TODO: AI 분석 연동
    return {
        "strengths": [
            ab.name
            for cat in abilities.categories
            for ab in cat.abilities
            if ab.score >= 14
        ],
        "weaknesses": [
            ab.name
            for cat in abilities.categories
            for ab in cat.abilities
            if ab.score < 10
        ],
        "analysis_text": "상세 분석은 AI 연동 후 생성됩니다.",
    }


async def _generate_career_recommendations(abilities) -> list[dict]:
    """직업 추천 생성 (Pro/Premium)"""
    # TODO: AI 분석 연동
    return [
        {"career": "소프트웨어 개발자", "fit_score": 85},
        {"career": "프로젝트 매니저", "fit_score": 78},
        {"career": "UX 디자이너", "fit_score": 72},
    ]


async def _generate_growth_roadmap(abilities) -> dict:
    """성장 로드맵 생성 (Premium)"""
    # TODO: AI 분석 연동
    return {
        "short_term": ["집중력 향상을 위한 명상 습관 기르기"],
        "mid_term": ["리더십 역량 개발 프로그램 참여"],
        "long_term": ["전문 분야 심화 학습 및 네트워킹 확대"],
    }
