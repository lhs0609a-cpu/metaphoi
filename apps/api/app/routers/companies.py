from typing import Annotated, Optional, List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel

from app.routers.company_auth import get_current_company_member
from app.services.supabase_client import get_supabase

router = APIRouter()


class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    industry: Optional[str] = None
    size_range: Optional[str] = None
    description: Optional[str] = None
    logo_url: Optional[str] = None
    website: Optional[str] = None
    location: Optional[str] = None
    culture_tags: Optional[List[str]] = None
    team_atmosphere: Optional[str] = None


class TeamProfileCreate(BaseModel):
    team_name: str
    team_size: Optional[int] = None
    ideal_abilities: Optional[dict] = None
    ideal_culture_tags: Optional[List[str]] = None
    current_team_types: Optional[dict] = None
    description: Optional[str] = None


class TeamProfileUpdate(BaseModel):
    team_name: Optional[str] = None
    team_size: Optional[int] = None
    ideal_abilities: Optional[dict] = None
    ideal_culture_tags: Optional[List[str]] = None
    current_team_types: Optional[dict] = None
    description: Optional[str] = None


@router.get("/{company_id}")
async def get_company(company_id: str):
    supabase = get_supabase()

    result = (
        supabase.table("companies")
        .select("*")
        .eq("id", company_id)
        .single()
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=404, detail="Company not found")

    return result.data


@router.put("/{company_id}")
async def update_company(
    company_id: str,
    data: CompanyUpdate,
    current_member: Annotated[dict, Depends(get_current_company_member)],
):
    if current_member["company_id"] != company_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    supabase = get_supabase()
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    if not update_data:
        return current_member.get("companies", {})

    result = (
        supabase.table("companies")
        .update(update_data)
        .eq("id", company_id)
        .execute()
    )

    return result.data[0] if result.data else {}


@router.get("/")
async def list_companies(
    industry: Optional[str] = Query(None),
    size_range: Optional[str] = Query(None),
    limit: int = Query(20, le=50),
    offset: int = Query(0),
):
    supabase = get_supabase()

    query = supabase.table("companies").select("*")

    if industry:
        query = query.eq("industry", industry)
    if size_range:
        query = query.eq("size_range", size_range)

    query = query.range(offset, offset + limit - 1).order("created_at", desc=True)
    result = query.execute()

    return {"companies": result.data or [], "total": len(result.data or [])}


@router.post("/teams")
async def create_team_profile(
    data: TeamProfileCreate,
    current_member: Annotated[dict, Depends(get_current_company_member)],
):
    supabase = get_supabase()

    insert_data = {
        "company_id": current_member["company_id"],
        "team_name": data.team_name,
        "team_size": data.team_size,
        "ideal_abilities": data.ideal_abilities,
        "ideal_culture_tags": data.ideal_culture_tags,
        "current_team_types": data.current_team_types,
        "description": data.description,
    }

    result = supabase.table("company_team_profiles").insert(insert_data).execute()

    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create team profile")

    return result.data[0]


@router.get("/teams/list")
async def list_team_profiles(
    current_member: Annotated[dict, Depends(get_current_company_member)],
):
    supabase = get_supabase()

    result = (
        supabase.table("company_team_profiles")
        .select("*")
        .eq("company_id", current_member["company_id"])
        .order("created_at", desc=True)
        .execute()
    )

    return result.data or []


@router.put("/teams/{team_id}")
async def update_team_profile(
    team_id: str,
    data: TeamProfileUpdate,
    current_member: Annotated[dict, Depends(get_current_company_member)],
):
    supabase = get_supabase()

    existing = (
        supabase.table("company_team_profiles")
        .select("*")
        .eq("id", team_id)
        .eq("company_id", current_member["company_id"])
        .single()
        .execute()
    )
    if not existing.data:
        raise HTTPException(status_code=404, detail="Team not found")

    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    if not update_data:
        return existing.data

    result = (
        supabase.table("company_team_profiles")
        .update(update_data)
        .eq("id", team_id)
        .execute()
    )

    return result.data[0] if result.data else existing.data


@router.delete("/teams/{team_id}")
async def delete_team_profile(
    team_id: str,
    current_member: Annotated[dict, Depends(get_current_company_member)],
):
    supabase = get_supabase()

    existing = (
        supabase.table("company_team_profiles")
        .select("id")
        .eq("id", team_id)
        .eq("company_id", current_member["company_id"])
        .execute()
    )
    if not existing.data:
        raise HTTPException(status_code=404, detail="Team not found")

    supabase.table("company_team_profiles").delete().eq("id", team_id).execute()
    return {"message": "Team deleted"}
