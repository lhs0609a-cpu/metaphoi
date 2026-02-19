from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.services.test_service import get_user_test_results, get_test_result_by_code
from app.services.supabase_client import get_supabase
from app.routers.auth import get_current_user
from app.rate_limit import anon_save_limiter, anon_read_limiter, count_limiter

router = APIRouter()

SOCIAL_PROOF_SEED = 12800


class ComprehensiveSaveRequest(BaseModel):
    comprehensive_profile: dict
    abilities_snapshot: list
    personal_info: Optional[dict] = None
    answers: Optional[dict] = None


class AnonymousSaveRequest(BaseModel):
    session_id: str
    comprehensive_profile: dict
    abilities_snapshot: list
    personal_info: Optional[dict] = None
    answers: Optional[dict] = None


class ClaimRequest(BaseModel):
    session_id: str


# --- 익명 / 카운터 엔드포인트 (auth 불필요, 위에 배치) ---


@router.post("/comprehensive/anonymous", dependencies=[Depends(anon_save_limiter)])
async def save_anonymous_result(data: AnonymousSaveRequest):
    """비로그인 사용자의 검사 결과를 session_id로 저장 (upsert)"""
    supabase = get_supabase()

    existing = (
        supabase.table("comprehensive_results")
        .select("id")
        .eq("session_id", data.session_id)
        .execute()
    )

    row = {
        "session_id": data.session_id,
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
            detail="Failed to save anonymous results",
        )

    return {"saved": True, "id": result.data[0]["id"]}


@router.get("/comprehensive/anonymous/{session_id}", dependencies=[Depends(anon_read_limiter)])
async def get_anonymous_result(session_id: str):
    """session_id로 익명 검사 결과 조회"""
    supabase = get_supabase()

    result = (
        supabase.table("comprehensive_results")
        .select("*")
        .eq("session_id", session_id)
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No result found for this session",
        )

    return {"result": result.data[0]}


@router.post("/comprehensive/claim")
async def claim_anonymous_result(
    data: ClaimRequest,
    current_user: Annotated[dict, Depends(get_current_user)],
):
    """익명 결과를 로그인 사용자에게 연결 (session_id → user_id)"""
    supabase = get_supabase()

    existing = (
        supabase.table("comprehensive_results")
        .select("id, user_id")
        .eq("session_id", data.session_id)
        .execute()
    )

    if not existing.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No anonymous result found for this session",
        )

    row = existing.data[0]
    if row["user_id"] and row["user_id"] != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This result is already claimed by another user",
        )

    result = (
        supabase.table("comprehensive_results")
        .update({"user_id": current_user["id"]})
        .eq("id", row["id"])
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to claim result",
        )

    return {"claimed": True, "id": row["id"]}


@router.get("/comprehensive/count", dependencies=[Depends(count_limiter)])
async def get_completion_count():
    """검사 완료 수 (SEED + 실제 DB 카운트)"""
    supabase = get_supabase()

    result = (
        supabase.table("comprehensive_results")
        .select("id", count="exact")
        .execute()
    )

    real_count = result.count if result.count is not None else 0
    return {"count": SOCIAL_PROOF_SEED + real_count}


# --- 인증 필수 엔드포인트 ---


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
