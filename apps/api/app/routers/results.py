from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.services.test_service import get_user_test_results, get_test_result_by_code
from app.services.supabase_client import get_supabase
from app.routers.auth import get_current_user

router = APIRouter()


class ComprehensiveSaveRequest(BaseModel):
    comprehensive_profile: dict
    abilities_snapshot: list
    personal_info: Optional[dict] = None
    answers: Optional[dict] = None


@router.get("")
async def list_results(
    current_user: Annotated[dict, Depends(get_current_user)],
):
    """검사 결과 목록 조회"""
    results = await get_user_test_results(current_user["id"])
    return {"results": results}


@router.get("/comprehensive")
async def get_comprehensive_result(
    current_user: Annotated[dict, Depends(get_current_user)],
):
    """종합 검사 결과 조회"""
    supabase = get_supabase()

    result = (
        supabase.table("comprehensive_results")
        .select("*")
        .eq("user_id", current_user["id"])
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No comprehensive result found",
        )

    return {"result": result.data[0]}


@router.post("/comprehensive")
async def save_comprehensive_result(
    data: ComprehensiveSaveRequest,
    current_user: Annotated[dict, Depends(get_current_user)],
):
    """종합 검사 결과 서버 저장"""
    supabase = get_supabase()

    # Upsert: 기존 결과가 있으면 업데이트, 없으면 생성
    existing = (
        supabase.table("comprehensive_results")
        .select("id")
        .eq("user_id", current_user["id"])
        .execute()
    )

    row = {
        "user_id": current_user["id"],
        "comprehensive_profile": data.comprehensive_profile,
        "abilities_snapshot": data.abilities_snapshot,
        "personal_info": data.personal_info,
        "answers": data.answers,
    }

    if existing.data:
        result = (
            supabase.table("comprehensive_results")
            .update(row)
            .eq("id", existing.data[0]["id"])
            .execute()
        )
    else:
        result = (
            supabase.table("comprehensive_results")
            .insert(row)
            .execute()
        )

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save results",
        )

    return {"saved": True, "id": result.data[0]["id"]}


@router.get("/{test_code}")
async def get_result(
    test_code: str,
    current_user: Annotated[dict, Depends(get_current_user)],
):
    """특정 검사 결과 조회"""
    result = await get_test_result_by_code(current_user["id"], test_code)

    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No result found for test '{test_code}'",
        )

    return {"result": result}
