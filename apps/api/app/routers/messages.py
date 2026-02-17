from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel

from app.routers.auth import get_current_user
from app.routers.company_auth import get_current_company_member
from app.services.supabase_client import get_supabase

router = APIRouter()


class MessageSend(BaseModel):
    content: str


# ---- 구직자 메시지 ----

@router.get("/conversations/seeker")
async def get_seeker_conversations(
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

    matches = (
        supabase.table("matches")
        .select("id, company_id, companies(name, logo_url), job_postings(title), matched_at")
        .eq("seeker_profile_id", profile.data["id"])
        .eq("status", "active")
        .order("matched_at", desc=True)
        .execute()
    )

    conversations = []
    for match in (matches.data or []):
        last_msg = (
            supabase.table("messages")
            .select("content, sender_type, created_at, read_at")
            .eq("match_id", match["id"])
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )

        unread = (
            supabase.table("messages")
            .select("id", count="exact")
            .eq("match_id", match["id"])
            .eq("sender_type", "company")
            .is_("read_at", "null")
            .execute()
        )

        conversations.append({
            "match_id": match["id"],
            "company": match.get("companies"),
            "job_title": match.get("job_postings", {}).get("title") if match.get("job_postings") else None,
            "last_message": last_msg.data[0] if last_msg.data else None,
            "unread_count": unread.count if hasattr(unread, 'count') else 0,
        })

    return conversations


@router.get("/conversations/seeker/{match_id}")
async def get_seeker_conversation_messages(
    match_id: str,
    current_user: Annotated[dict, Depends(get_current_user)],
    limit: int = Query(50, le=100),
    offset: int = Query(0),
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
        raise HTTPException(status_code=400, detail="Profile required")

    # 매칭 확인
    match = (
        supabase.table("matches")
        .select("id")
        .eq("id", match_id)
        .eq("seeker_profile_id", profile.data["id"])
        .execute()
    )
    if not match.data:
        raise HTTPException(status_code=404, detail="Match not found")

    # 읽음 처리
    supabase.table("messages").update({"read_at": "now()"}).eq("match_id", match_id).eq("sender_type", "company").is_("read_at", "null").execute()

    # 메시지 조회
    result = (
        supabase.table("messages")
        .select("*")
        .eq("match_id", match_id)
        .order("created_at")
        .range(offset, offset + limit - 1)
        .execute()
    )

    return result.data or []


@router.post("/conversations/seeker/{match_id}")
async def send_seeker_message(
    match_id: str,
    data: MessageSend,
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
        raise HTTPException(status_code=400, detail="Profile required")

    match = (
        supabase.table("matches")
        .select("id")
        .eq("id", match_id)
        .eq("seeker_profile_id", profile.data["id"])
        .execute()
    )
    if not match.data:
        raise HTTPException(status_code=404, detail="Match not found")

    insert_data = {
        "match_id": match_id,
        "sender_type": "seeker",
        "sender_id": profile.data["id"],
        "content": data.content,
    }

    result = supabase.table("messages").insert(insert_data).execute()
    return result.data[0] if result.data else {}


# ---- 기업 메시지 ----

@router.get("/conversations/company")
async def get_company_conversations(
    current_member: Annotated[dict, Depends(get_current_company_member)],
):
    supabase = get_supabase()
    company_id = current_member["company_id"]

    matches = (
        supabase.table("matches")
        .select("id, seeker_profile_id, seeker_profiles(display_name, headline), job_postings(title), matched_at")
        .eq("company_id", company_id)
        .eq("status", "active")
        .order("matched_at", desc=True)
        .execute()
    )

    conversations = []
    for match in (matches.data or []):
        last_msg = (
            supabase.table("messages")
            .select("content, sender_type, created_at, read_at")
            .eq("match_id", match["id"])
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )

        unread = (
            supabase.table("messages")
            .select("id", count="exact")
            .eq("match_id", match["id"])
            .eq("sender_type", "seeker")
            .is_("read_at", "null")
            .execute()
        )

        conversations.append({
            "match_id": match["id"],
            "seeker": match.get("seeker_profiles"),
            "job_title": match.get("job_postings", {}).get("title") if match.get("job_postings") else None,
            "last_message": last_msg.data[0] if last_msg.data else None,
            "unread_count": unread.count if hasattr(unread, 'count') else 0,
        })

    return conversations


@router.get("/conversations/company/{match_id}")
async def get_company_conversation_messages(
    match_id: str,
    current_member: Annotated[dict, Depends(get_current_company_member)],
    limit: int = Query(50, le=100),
    offset: int = Query(0),
):
    supabase = get_supabase()

    match = (
        supabase.table("matches")
        .select("id")
        .eq("id", match_id)
        .eq("company_id", current_member["company_id"])
        .execute()
    )
    if not match.data:
        raise HTTPException(status_code=404, detail="Match not found")

    # 읽음 처리
    supabase.table("messages").update({"read_at": "now()"}).eq("match_id", match_id).eq("sender_type", "seeker").is_("read_at", "null").execute()

    result = (
        supabase.table("messages")
        .select("*")
        .eq("match_id", match_id)
        .order("created_at")
        .range(offset, offset + limit - 1)
        .execute()
    )

    return result.data or []


@router.post("/conversations/company/{match_id}")
async def send_company_message(
    match_id: str,
    data: MessageSend,
    current_member: Annotated[dict, Depends(get_current_company_member)],
):
    supabase = get_supabase()

    match = (
        supabase.table("matches")
        .select("id")
        .eq("id", match_id)
        .eq("company_id", current_member["company_id"])
        .execute()
    )
    if not match.data:
        raise HTTPException(status_code=404, detail="Match not found")

    insert_data = {
        "match_id": match_id,
        "sender_type": "company",
        "sender_id": current_member["company_id"],
        "content": data.content,
    }

    result = supabase.table("messages").insert(insert_data).execute()
    return result.data[0] if result.data else {}


@router.put("/{message_id}/read")
async def mark_message_read(message_id: str):
    supabase = get_supabase()

    result = (
        supabase.table("messages")
        .update({"read_at": "now()"})
        .eq("id", message_id)
        .execute()
    )

    return result.data[0] if result.data else {}
