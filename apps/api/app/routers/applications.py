from typing import Annotated, Optional, List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel

from app.routers.auth import get_current_user
from app.routers.company_auth import get_current_company_member
from app.services.supabase_client import get_supabase

router = APIRouter()

VALID_STAGES = [
    "applied", "screening", "interview_scheduled", "interviewing",
    "evaluation", "offer", "hired", "rejected",
]


class ApplicationCreate(BaseModel):
    match_id: str
    job_posting_id: str


class StageUpdate(BaseModel):
    stage: str


class InterviewCreate(BaseModel):
    round: Optional[int] = 1
    interview_type: Optional[str] = None
    scheduled_at: Optional[str] = None
    duration_minutes: Optional[int] = 60
    location: Optional[str] = None
    interviewer_names: Optional[List[str]] = None
    notes: Optional[str] = None


class InterviewUpdate(BaseModel):
    scheduled_at: Optional[str] = None
    duration_minutes: Optional[int] = None
    location: Optional[str] = None
    interviewer_names: Optional[List[str]] = None
    notes: Optional[str] = None
    status: Optional[str] = None


class EvaluationCreate(BaseModel):
    scores: Optional[dict] = None
    overall_rating: Optional[int] = None
    strengths: Optional[str] = None
    concerns: Optional[str] = None
    recommendation: Optional[str] = None


class NoteCreate(BaseModel):
    content: str


# ---- 지원 ----

@router.post("/")
async def create_application(
    data: ApplicationCreate,
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
        raise HTTPException(status_code=400, detail="Seeker profile required")

    match = (
        supabase.table("matches")
        .select("*")
        .eq("id", data.match_id)
        .eq("seeker_profile_id", profile.data["id"])
        .single()
        .execute()
    )
    if not match.data:
        raise HTTPException(status_code=404, detail="Match not found")

    # 중복 지원 방지
    existing = (
        supabase.table("applications")
        .select("id")
        .eq("match_id", data.match_id)
        .eq("job_posting_id", data.job_posting_id)
        .execute()
    )
    if existing.data:
        raise HTTPException(status_code=400, detail="Already applied")

    insert_data = {
        "match_id": data.match_id,
        "seeker_profile_id": profile.data["id"],
        "job_posting_id": data.job_posting_id,
        "company_id": match.data["company_id"],
        "stage": "applied",
    }

    result = supabase.table("applications").insert(insert_data).execute()

    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create application")

    return result.data[0]


@router.get("/seeker")
async def list_seeker_applications(
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
        supabase.table("applications")
        .select("*, job_postings(title, companies(name, logo_url)), matches(fit_score)")
        .eq("seeker_profile_id", profile.data["id"])
        .order("applied_at", desc=True)
        .execute()
    )

    return result.data or []


@router.get("/company")
async def list_company_applications(
    current_member: Annotated[dict, Depends(get_current_company_member)],
    job_id: Optional[str] = Query(None),
    stage: Optional[str] = Query(None),
):
    supabase = get_supabase()

    query = (
        supabase.table("applications")
        .select("*, seeker_profiles(display_name, headline, abilities_snapshot), job_postings(title), matches(fit_score)")
        .eq("company_id", current_member["company_id"])
    )

    if job_id:
        query = query.eq("job_posting_id", job_id)
    if stage:
        query = query.eq("stage", stage)

    result = query.order("applied_at", desc=True).execute()
    return result.data or []


@router.get("/{app_id}")
async def get_application(app_id: str):
    supabase = get_supabase()

    result = (
        supabase.table("applications")
        .select(
            "*, seeker_profiles(*, users(name, email)), "
            "job_postings(*, companies(name)), "
            "matches(fit_score)"
        )
        .eq("id", app_id)
        .single()
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=404, detail="Application not found")

    return result.data


@router.put("/{app_id}/stage")
async def update_application_stage(
    app_id: str,
    data: StageUpdate,
    current_member: Annotated[dict, Depends(get_current_company_member)],
):
    if data.stage not in VALID_STAGES:
        raise HTTPException(status_code=400, detail=f"Invalid stage: {data.stage}")

    supabase = get_supabase()

    existing = (
        supabase.table("applications")
        .select("id")
        .eq("id", app_id)
        .eq("company_id", current_member["company_id"])
        .execute()
    )
    if not existing.data:
        raise HTTPException(status_code=404, detail="Application not found")

    result = (
        supabase.table("applications")
        .update({"stage": data.stage})
        .eq("id", app_id)
        .execute()
    )

    return result.data[0] if result.data else {}


# ---- 면접 ----

@router.post("/{app_id}/interviews")
async def create_interview(
    app_id: str,
    data: InterviewCreate,
    current_member: Annotated[dict, Depends(get_current_company_member)],
):
    supabase = get_supabase()

    app = (
        supabase.table("applications")
        .select("id")
        .eq("id", app_id)
        .eq("company_id", current_member["company_id"])
        .execute()
    )
    if not app.data:
        raise HTTPException(status_code=404, detail="Application not found")

    insert_data = {
        "application_id": app_id,
        "round": data.round,
        "interview_type": data.interview_type,
        "scheduled_at": data.scheduled_at,
        "duration_minutes": data.duration_minutes,
        "location": data.location,
        "interviewer_names": data.interviewer_names,
        "notes": data.notes,
    }

    result = supabase.table("interviews").insert(insert_data).execute()

    # 자동으로 stage 업데이트
    supabase.table("applications").update({"stage": "interview_scheduled"}).eq("id", app_id).execute()

    return result.data[0] if result.data else {}


@router.get("/{app_id}/interviews")
async def list_interviews(app_id: str):
    supabase = get_supabase()

    result = (
        supabase.table("interviews")
        .select("*, evaluations(*)")
        .eq("application_id", app_id)
        .order("round")
        .execute()
    )

    return result.data or []


@router.put("/interviews/{interview_id}")
async def update_interview(
    interview_id: str,
    data: InterviewUpdate,
    current_member: Annotated[dict, Depends(get_current_company_member)],
):
    supabase = get_supabase()

    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")

    result = (
        supabase.table("interviews")
        .update(update_data)
        .eq("id", interview_id)
        .execute()
    )

    return result.data[0] if result.data else {}


# ---- 평가 ----

@router.post("/interviews/{interview_id}/evaluations")
async def create_evaluation(
    interview_id: str,
    data: EvaluationCreate,
    current_member: Annotated[dict, Depends(get_current_company_member)],
):
    supabase = get_supabase()

    insert_data = {
        "interview_id": interview_id,
        "evaluator_member_id": current_member["id"],
        "scores": data.scores,
        "overall_rating": data.overall_rating,
        "strengths": data.strengths,
        "concerns": data.concerns,
        "recommendation": data.recommendation,
    }

    result = supabase.table("evaluations").insert(insert_data).execute()

    return result.data[0] if result.data else {}


# ---- 내부 메모 ----

@router.post("/{app_id}/notes")
async def create_application_note(
    app_id: str,
    data: NoteCreate,
    current_member: Annotated[dict, Depends(get_current_company_member)],
):
    supabase = get_supabase()

    insert_data = {
        "application_id": app_id,
        "author_member_id": current_member["id"],
        "content": data.content,
    }

    result = supabase.table("application_notes").insert(insert_data).execute()

    return result.data[0] if result.data else {}


@router.get("/{app_id}/notes")
async def list_application_notes(
    app_id: str,
    current_member: Annotated[dict, Depends(get_current_company_member)],
):
    supabase = get_supabase()

    result = (
        supabase.table("application_notes")
        .select("*, company_members(name)")
        .eq("application_id", app_id)
        .order("created_at", desc=True)
        .execute()
    )

    return result.data or []


# ---- 오퍼 & 채용 ----

@router.put("/{app_id}/offer")
async def send_offer(
    app_id: str,
    current_member: Annotated[dict, Depends(get_current_company_member)],
):
    supabase = get_supabase()

    existing = (
        supabase.table("applications")
        .select("id")
        .eq("id", app_id)
        .eq("company_id", current_member["company_id"])
        .execute()
    )
    if not existing.data:
        raise HTTPException(status_code=404, detail="Application not found")

    result = (
        supabase.table("applications")
        .update({"stage": "offer"})
        .eq("id", app_id)
        .execute()
    )

    return result.data[0] if result.data else {}


@router.put("/{app_id}/hire")
async def confirm_hire(
    app_id: str,
    current_member: Annotated[dict, Depends(get_current_company_member)],
):
    supabase = get_supabase()

    app = (
        supabase.table("applications")
        .select("*, matches(id)")
        .eq("id", app_id)
        .eq("company_id", current_member["company_id"])
        .single()
        .execute()
    )
    if not app.data:
        raise HTTPException(status_code=404, detail="Application not found")

    # 지원 상태 업데이트
    supabase.table("applications").update({"stage": "hired"}).eq("id", app_id).execute()

    # 매칭 상태 업데이트
    if app.data.get("matches"):
        match_id = app.data["matches"]["id"] if isinstance(app.data["matches"], dict) else app.data.get("match_id")
        if match_id:
            supabase.table("matches").update({"status": "hired"}).eq("id", match_id).execute()

    # 공고 상태 업데이트
    supabase.table("job_postings").update({"status": "filled"}).eq("id", app.data["job_posting_id"]).execute()

    return {"message": "Hire confirmed", "application_id": app_id}
