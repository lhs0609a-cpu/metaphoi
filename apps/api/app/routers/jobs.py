from typing import Annotated, Optional, List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel

from app.routers.company_auth import get_current_company_member
from app.services.supabase_client import get_supabase

router = APIRouter()


class JobPostingCreate(BaseModel):
    title: str
    description: Optional[str] = None
    team_profile_id: Optional[str] = None
    required_abilities: Optional[dict] = None
    preferred_culture: Optional[List[str]] = None
    preferred_types: Optional[dict] = None
    conditions: Optional[dict] = None
    status: Optional[str] = "active"


class JobPostingUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    team_profile_id: Optional[str] = None
    required_abilities: Optional[dict] = None
    preferred_culture: Optional[List[str]] = None
    preferred_types: Optional[dict] = None
    conditions: Optional[dict] = None
    status: Optional[str] = None


@router.post("/")
async def create_job_posting(
    data: JobPostingCreate,
    current_member: Annotated[dict, Depends(get_current_company_member)],
):
    supabase = get_supabase()

    insert_data = {
        "company_id": current_member["company_id"],
        "title": data.title,
        "description": data.description,
        "team_profile_id": data.team_profile_id,
        "required_abilities": data.required_abilities,
        "preferred_culture": data.preferred_culture,
        "preferred_types": data.preferred_types,
        "conditions": data.conditions,
        "status": data.status,
    }

    result = supabase.table("job_postings").insert(insert_data).execute()

    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create job posting")

    return result.data[0]


@router.get("/")
async def list_job_postings(
    company_id: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    limit: int = Query(20, le=50),
    offset: int = Query(0),
):
    supabase = get_supabase()

    query = supabase.table("job_postings").select("*, companies(name, logo_url, industry, location)")

    if company_id:
        query = query.eq("company_id", company_id)
    else:
        query = query.eq("status", "active")

    if status_filter:
        query = query.eq("status", status_filter)

    query = query.range(offset, offset + limit - 1).order("created_at", desc=True)
    result = query.execute()

    return {"jobs": result.data or [], "total": len(result.data or [])}


@router.get("/{job_id}")
async def get_job_posting(job_id: str):
    supabase = get_supabase()

    result = (
        supabase.table("job_postings")
        .select("*, companies(name, logo_url, industry, location, culture_tags, description)")
        .eq("id", job_id)
        .single()
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=404, detail="Job posting not found")

    return result.data


@router.put("/{job_id}")
async def update_job_posting(
    job_id: str,
    data: JobPostingUpdate,
    current_member: Annotated[dict, Depends(get_current_company_member)],
):
    supabase = get_supabase()

    existing = (
        supabase.table("job_postings")
        .select("*")
        .eq("id", job_id)
        .eq("company_id", current_member["company_id"])
        .single()
        .execute()
    )
    if not existing.data:
        raise HTTPException(status_code=404, detail="Job posting not found")

    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    if not update_data:
        return existing.data

    result = (
        supabase.table("job_postings")
        .update(update_data)
        .eq("id", job_id)
        .execute()
    )

    return result.data[0] if result.data else existing.data


@router.delete("/{job_id}")
async def close_job_posting(
    job_id: str,
    current_member: Annotated[dict, Depends(get_current_company_member)],
):
    supabase = get_supabase()

    existing = (
        supabase.table("job_postings")
        .select("id")
        .eq("id", job_id)
        .eq("company_id", current_member["company_id"])
        .execute()
    )
    if not existing.data:
        raise HTTPException(status_code=404, detail="Job posting not found")

    supabase.table("job_postings").update({"status": "closed"}).eq("id", job_id).execute()
    return {"message": "Job posting closed"}


@router.get("/{job_id}/candidates")
async def get_job_candidates(
    job_id: str,
    current_member: Annotated[dict, Depends(get_current_company_member)],
    limit: int = Query(20, le=50),
    offset: int = Query(0),
):
    supabase = get_supabase()

    # 공고 확인
    job = (
        supabase.table("job_postings")
        .select("*")
        .eq("id", job_id)
        .eq("company_id", current_member["company_id"])
        .single()
        .execute()
    )
    if not job.data:
        raise HTTPException(status_code=404, detail="Job posting not found")

    # 활성 구직자 조회
    seekers_result = (
        supabase.table("seeker_profiles")
        .select("*")
        .eq("is_active", True)
        .neq("visibility", "hidden")
        .range(offset, offset + limit - 1)
        .execute()
    )

    seekers = seekers_result.data or []

    # 매칭 점수 계산
    from app.services.matching_service import calculate_fit_score

    candidates = []
    for seeker in seekers:
        fit_score = calculate_fit_score(seeker, job.data, None, None)
        seeker.pop("user_id", None)
        candidates.append({
            "seeker": seeker,
            "fit_score": fit_score,
        })

    candidates.sort(key=lambda x: x["fit_score"]["total"], reverse=True)

    return {"candidates": candidates, "total": len(candidates)}
