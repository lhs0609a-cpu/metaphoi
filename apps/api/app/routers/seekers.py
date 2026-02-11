from typing import Annotated, Optional, List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel

from app.routers.auth import get_current_user
from app.services.supabase_client import get_supabase

router = APIRouter()


class SeekerProfileCreate(BaseModel):
    display_name: Optional[str] = None
    headline: Optional[str] = None
    desired_roles: Optional[List[str]] = []
    desired_industries: Optional[List[str]] = []
    experience_years: Optional[int] = None
    education: Optional[str] = None
    salary_range: Optional[str] = None
    location_pref: Optional[str] = None
    remote_pref: Optional[str] = None
    available_from: Optional[str] = None
    comprehensive_profile: Optional[dict] = None
    abilities_snapshot: Optional[list] = None


class SeekerProfileUpdate(BaseModel):
    display_name: Optional[str] = None
    headline: Optional[str] = None
    desired_roles: Optional[List[str]] = None
    desired_industries: Optional[List[str]] = None
    experience_years: Optional[int] = None
    education: Optional[str] = None
    salary_range: Optional[str] = None
    location_pref: Optional[str] = None
    remote_pref: Optional[str] = None
    available_from: Optional[str] = None
    is_active: Optional[bool] = None
    visibility: Optional[str] = None


@router.post("/profile")
async def create_seeker_profile(
    data: SeekerProfileCreate,
    current_user: Annotated[dict, Depends(get_current_user)],
):
    supabase = get_supabase()

    existing = (
        supabase.table("seeker_profiles")
        .select("id")
        .eq("user_id", current_user["id"])
        .execute()
    )
    if existing.data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Profile already exists",
        )

    insert_data = {
        "user_id": current_user["id"],
        "display_name": data.display_name or current_user.get("name", ""),
        "headline": data.headline,
        "desired_roles": data.desired_roles,
        "desired_industries": data.desired_industries,
        "experience_years": data.experience_years,
        "education": data.education,
        "salary_range": data.salary_range,
        "location_pref": data.location_pref,
        "remote_pref": data.remote_pref,
        "available_from": data.available_from,
        "comprehensive_profile": data.comprehensive_profile,
        "abilities_snapshot": data.abilities_snapshot,
    }

    result = supabase.table("seeker_profiles").insert(insert_data).execute()

    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create profile")

    return result.data[0]


@router.get("/profile/me")
async def get_my_seeker_profile(
    current_user: Annotated[dict, Depends(get_current_user)],
):
    supabase = get_supabase()

    result = (
        supabase.table("seeker_profiles")
        .select("*")
        .eq("user_id", current_user["id"])
        .single()
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=404, detail="Profile not found")

    return result.data


@router.put("/profile/me")
async def update_my_seeker_profile(
    data: SeekerProfileUpdate,
    current_user: Annotated[dict, Depends(get_current_user)],
):
    supabase = get_supabase()

    existing = (
        supabase.table("seeker_profiles")
        .select("id")
        .eq("user_id", current_user["id"])
        .single()
        .execute()
    )
    if not existing.data:
        raise HTTPException(status_code=404, detail="Profile not found")

    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    if not update_data:
        return existing.data

    result = (
        supabase.table("seeker_profiles")
        .update(update_data)
        .eq("user_id", current_user["id"])
        .execute()
    )

    return result.data[0] if result.data else existing.data


@router.get("/{seeker_id}")
async def get_seeker_profile(seeker_id: str):
    supabase = get_supabase()

    result = (
        supabase.table("seeker_profiles")
        .select("*")
        .eq("id", seeker_id)
        .eq("is_active", True)
        .single()
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=404, detail="Seeker not found")

    profile = result.data
    if profile.get("visibility") == "hidden":
        raise HTTPException(status_code=404, detail="Seeker not found")

    # 공개 프로필에서 실명/연락처 제거
    profile.pop("user_id", None)
    return profile


@router.get("/")
async def search_seekers(
    roles: Optional[str] = Query(None, description="Comma-separated roles"),
    min_experience: Optional[int] = Query(None),
    max_experience: Optional[int] = Query(None),
    remote_pref: Optional[str] = Query(None),
    limit: int = Query(20, le=50),
    offset: int = Query(0),
):
    supabase = get_supabase()

    query = (
        supabase.table("seeker_profiles")
        .select("*")
        .eq("is_active", True)
        .eq("visibility", "public")
    )

    if min_experience is not None:
        query = query.gte("experience_years", min_experience)
    if max_experience is not None:
        query = query.lte("experience_years", max_experience)
    if remote_pref:
        query = query.eq("remote_pref", remote_pref)

    query = query.range(offset, offset + limit - 1).order("created_at", desc=True)
    result = query.execute()

    # 공개 목록에서 user_id 제거
    seekers = result.data or []
    for s in seekers:
        s.pop("user_id", None)

    return {"seekers": seekers, "total": len(seekers)}
