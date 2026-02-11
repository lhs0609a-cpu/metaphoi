from datetime import datetime, timedelta
from typing import Optional

from app.config import settings
from app.services.auth_service import (
    get_password_hash,
    verify_password,
    create_access_token,
    decode_token,
)
from app.services.supabase_client import get_supabase


def create_company_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    data["token_type"] = "company"
    return create_access_token(data, expires_delta)


def decode_company_token(token: str):
    token_data = decode_token(token)
    if token_data is None:
        return None
    if getattr(token_data, "token_type", None) != "company":
        return None
    return token_data


async def create_company_and_member(
    company_name: str,
    email: str,
    password: str,
    member_name: str,
    industry: Optional[str] = None,
    size_range: Optional[str] = None,
    website: Optional[str] = None,
    location: Optional[str] = None,
) -> Optional[dict]:
    supabase = get_supabase()

    existing = (
        supabase.table("company_members")
        .select("id")
        .eq("email", email)
        .execute()
    )
    if existing.data:
        return None

    company_result = (
        supabase.table("companies")
        .insert({
            "name": company_name,
            "industry": industry,
            "size_range": size_range,
            "website": website,
            "location": location,
        })
        .execute()
    )
    if not company_result.data:
        return None

    company = company_result.data[0]
    password_hash = get_password_hash(password)

    member_result = (
        supabase.table("company_members")
        .insert({
            "company_id": company["id"],
            "email": email,
            "password_hash": password_hash,
            "name": member_name,
            "role": "admin",
        })
        .execute()
    )
    if not member_result.data:
        return None

    member = member_result.data[0]
    return {"company": company, "member": member}


async def authenticate_company_member(email: str, password: str) -> Optional[dict]:
    supabase = get_supabase()

    result = (
        supabase.table("company_members")
        .select("*, companies(*)")
        .eq("email", email)
        .eq("is_active", True)
        .single()
        .execute()
    )

    if not result.data:
        return None

    member = result.data
    if not verify_password(password, member.get("password_hash", "")):
        return None

    return member


async def get_company_member_by_id(member_id: str) -> Optional[dict]:
    supabase = get_supabase()

    result = (
        supabase.table("company_members")
        .select("*, companies(*)")
        .eq("id", member_id)
        .eq("is_active", True)
        .single()
        .execute()
    )

    return result.data if result.data else None
