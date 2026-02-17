from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel

from app.routers.auth import get_current_user
from app.routers.company_auth import get_current_company_member
from app.services.matching_service import calculate_fit_score
from app.services.supabase_client import get_supabase

router = APIRouter()


class InterestCreate(BaseModel):
    to_type: str  # 'seeker' or 'company'
    to_id: str
    job_posting_id: Optional[str] = None
    message: Optional[str] = None


class InterestRespond(BaseModel):
    status: str  # 'accepted' or 'declined'


# ---- 구직자 관심 표시 ----

@router.post("/interests/seeker")
async def create_seeker_interest(
    data: InterestCreate,
    current_user: Annotated[dict, Depends(get_current_user)],
):
    supabase = get_supabase()

    # 구직자 프로필 확인
    profile = (
        supabase.table("seeker_profiles")
        .select("id")
        .eq("user_id", current_user["id"])
        .single()
        .execute()
    )
    if not profile.data:
        raise HTTPException(status_code=400, detail="Seeker profile required")

    seeker_id = profile.data["id"]

    # 중복 확인
    existing = (
        supabase.table("interests")
        .select("id")
        .eq("from_type", "seeker")
        .eq("from_id", seeker_id)
        .eq("to_id", data.to_id)
        .execute()
    )
    if existing.data:
        raise HTTPException(status_code=400, detail="Interest already sent")

    insert_data = {
        "from_type": "seeker",
        "from_id": seeker_id,
        "to_type": "company",
        "to_id": data.to_id,
        "job_posting_id": data.job_posting_id,
        "message": data.message,
    }

    result = supabase.table("interests").insert(insert_data).execute()

    # 양방향 매칭 확인
    reverse = (
        supabase.table("interests")
        .select("id")
        .eq("from_type", "company")
        .eq("from_id", data.to_id)
        .eq("to_id", seeker_id)
        .eq("status", "pending")
        .execute()
    )

    match_created = None
    if reverse.data:
        match_created = await _create_match(seeker_id, data.to_id, data.job_posting_id, supabase)
        supabase.table("interests").update({"status": "accepted"}).eq("id", reverse.data[0]["id"]).execute()
        supabase.table("interests").update({"status": "accepted"}).eq("id", result.data[0]["id"]).execute()

    return {
        "interest": result.data[0] if result.data else None,
        "match": match_created,
    }


# ---- 기업 관심 표시 ----

@router.post("/interests/company")
async def create_company_interest(
    data: InterestCreate,
    current_member: Annotated[dict, Depends(get_current_company_member)],
):
    supabase = get_supabase()
    company_id = current_member["company_id"]

    # 중복 확인
    existing = (
        supabase.table("interests")
        .select("id")
        .eq("from_type", "company")
        .eq("from_id", company_id)
        .eq("to_id", data.to_id)
        .execute()
    )
    if existing.data:
        raise HTTPException(status_code=400, detail="Interest already sent")

    insert_data = {
        "from_type": "company",
        "from_id": company_id,
        "to_type": "seeker",
        "to_id": data.to_id,
        "job_posting_id": data.job_posting_id,
        "message": data.message,
    }

    result = supabase.table("interests").insert(insert_data).execute()

    # 양방향 매칭 확인
    reverse = (
        supabase.table("interests")
        .select("id")
        .eq("from_type", "seeker")
        .eq("from_id", data.to_id)
        .eq("to_id", company_id)
        .eq("status", "pending")
        .execute()
    )

    match_created = None
    if reverse.data:
        match_created = await _create_match(data.to_id, company_id, data.job_posting_id, supabase)
        supabase.table("interests").update({"status": "accepted"}).eq("id", reverse.data[0]["id"]).execute()
        supabase.table("interests").update({"status": "accepted"}).eq("id", result.data[0]["id"]).execute()

    return {
        "interest": result.data[0] if result.data else None,
        "match": match_created,
    }


async def _create_match(seeker_profile_id: str, company_id: str, job_posting_id: Optional[str], supabase):
    # 매칭 점수 계산
    seeker = supabase.table("seeker_profiles").select("*").eq("id", seeker_profile_id).single().execute()
    company = supabase.table("companies").select("*").eq("id", company_id).single().execute()

    job = None
    if job_posting_id:
        job_result = supabase.table("job_postings").select("*").eq("id", job_posting_id).single().execute()
        job = job_result.data

    fit_score = calculate_fit_score(
        seeker.data or {},
        job or {},
        company.data,
        None,
    )

    match_data = {
        "seeker_profile_id": seeker_profile_id,
        "company_id": company_id,
        "job_posting_id": job_posting_id,
        "fit_score": fit_score,
    }

    result = supabase.table("matches").insert(match_data).execute()
    return result.data[0] if result.data else None


# ---- 관심 응답 ----

@router.put("/interests/{interest_id}/respond")
async def respond_to_interest(
    interest_id: str,
    data: InterestRespond,
    current_user: Annotated[dict, Depends(get_current_user)],
):
    supabase = get_supabase()

    interest = (
        supabase.table("interests")
        .select("*")
        .eq("id", interest_id)
        .single()
        .execute()
    )
    if not interest.data:
        raise HTTPException(status_code=404, detail="Interest not found")

    supabase.table("interests").update({"status": data.status}).eq("id", interest_id).execute()

    match_created = None
    if data.status == "accepted":
        i = interest.data
        if i["to_type"] == "seeker":
            profile = supabase.table("seeker_profiles").select("id").eq("user_id", current_user["id"]).single().execute()
            if profile.data:
                match_created = await _create_match(
                    profile.data["id"], i["from_id"], i.get("job_posting_id"), supabase
                )
        elif i["from_type"] == "seeker":
            match_created = await _create_match(
                i["from_id"], i["to_id"], i.get("job_posting_id"), supabase
            )

    return {"status": data.status, "match": match_created}


# ---- 관심 목록 ----

@router.get("/interests/sent/seeker")
async def get_seeker_sent_interests(
    current_user: Annotated[dict, Depends(get_current_user)],
):
    supabase = get_supabase()

    profile = (
        supabase.table("seeker_profiles")
        .select("id")
        .eq("user_id", current_user["id"])
        .single()
        .execute()
    )
    if not profile.data:
        return []

    result = (
        supabase.table("interests")
        .select("*, job_postings(title, companies(name))")
        .eq("from_type", "seeker")
        .eq("from_id", profile.data["id"])
        .order("created_at", desc=True)
        .execute()
    )

    return result.data or []


@router.get("/interests/received/seeker")
async def get_seeker_received_interests(
    current_user: Annotated[dict, Depends(get_current_user)],
):
    supabase = get_supabase()

    profile = (
        supabase.table("seeker_profiles")
        .select("id")
        .eq("user_id", current_user["id"])
        .single()
        .execute()
    )
    if not profile.data:
        return []

    result = (
        supabase.table("interests")
        .select("*, job_postings(title, companies(name))")
        .eq("to_type", "seeker")
        .eq("to_id", profile.data["id"])
        .order("created_at", desc=True)
        .execute()
    )

    return result.data or []


@router.get("/interests/sent/company")
async def get_company_sent_interests(
    current_member: Annotated[dict, Depends(get_current_company_member)],
):
    supabase = get_supabase()

    result = (
        supabase.table("interests")
        .select("*, seeker_profiles(display_name, headline)")
        .eq("from_type", "company")
        .eq("from_id", current_member["company_id"])
        .order("created_at", desc=True)
        .execute()
    )

    return result.data or []


@router.get("/interests/received/company")
async def get_company_received_interests(
    current_member: Annotated[dict, Depends(get_current_company_member)],
):
    supabase = get_supabase()

    result = (
        supabase.table("interests")
        .select("*, seeker_profiles(display_name, headline)")
        .eq("to_type", "company")
        .eq("to_id", current_member["company_id"])
        .order("created_at", desc=True)
        .execute()
    )

    return result.data or []


# ---- 매칭 ----

@router.get("/matches/seeker")
async def get_seeker_matches(
    current_user: Annotated[dict, Depends(get_current_user)],
):
    supabase = get_supabase()

    profile = (
        supabase.table("seeker_profiles")
        .select("id")
        .eq("user_id", current_user["id"])
        .single()
        .execute()
    )
    if not profile.data:
        return []

    result = (
        supabase.table("matches")
        .select("*, companies(name, logo_url, industry, location), job_postings(title)")
        .eq("seeker_profile_id", profile.data["id"])
        .eq("status", "active")
        .order("matched_at", desc=True)
        .execute()
    )

    return result.data or []


@router.get("/matches/company")
async def get_company_matches(
    current_member: Annotated[dict, Depends(get_current_company_member)],
):
    supabase = get_supabase()

    result = (
        supabase.table("matches")
        .select("*, seeker_profiles(display_name, headline, abilities_snapshot), job_postings(title)")
        .eq("company_id", current_member["company_id"])
        .eq("status", "active")
        .order("matched_at", desc=True)
        .execute()
    )

    return result.data or []


@router.get("/matches/{match_id}")
async def get_match_detail(match_id: str):
    supabase = get_supabase()

    result = (
        supabase.table("matches")
        .select("*, seeker_profiles(*, users(name, email)), companies(*), job_postings(*)")
        .eq("id", match_id)
        .single()
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=404, detail="Match not found")

    return result.data


@router.get("/matches/{match_id}/fit")
async def get_match_fit_detail(match_id: str):
    supabase = get_supabase()

    match = (
        supabase.table("matches")
        .select("*")
        .eq("id", match_id)
        .single()
        .execute()
    )
    if not match.data:
        raise HTTPException(status_code=404, detail="Match not found")

    return match.data.get("fit_score", {})
