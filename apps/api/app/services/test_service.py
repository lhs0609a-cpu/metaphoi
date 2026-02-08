from typing import Optional
from uuid import UUID
from datetime import datetime

from app.services.supabase_client import get_supabase
from app.models.test import (
    Test,
    TestSession,
    Question,
    Response,
    TestResult,
    SessionStatus,
)


async def get_all_tests() -> list[dict]:
    supabase = get_supabase()
    result = supabase.table("tests").select("*").eq("is_active", True).execute()
    return result.data or []


async def get_test_by_code(code: str) -> Optional[dict]:
    supabase = get_supabase()
    result = supabase.table("tests").select("*").eq("code", code).single().execute()
    return result.data


async def get_test_questions(test_id: int) -> list[dict]:
    supabase = get_supabase()
    result = (
        supabase.table("questions")
        .select("*")
        .eq("test_id", test_id)
        .order("question_number")
        .execute()
    )
    return result.data or []


async def start_test_session(user_id: str, test_id: int) -> dict:
    supabase = get_supabase()

    # Check for existing in-progress session
    existing = (
        supabase.table("test_sessions")
        .select("*")
        .eq("user_id", user_id)
        .eq("test_id", test_id)
        .eq("status", "in_progress")
        .execute()
    )

    if existing.data:
        return existing.data[0]

    # Create new session
    result = (
        supabase.table("test_sessions")
        .insert(
            {
                "user_id": user_id,
                "test_id": test_id,
                "status": "in_progress",
            }
        )
        .execute()
    )

    return result.data[0] if result.data else None


async def submit_responses(
    session_id: str, answers: list[Response]
) -> list[dict]:
    supabase = get_supabase()

    responses_data = [
        {
            "session_id": session_id,
            "question_id": answer.question_id,
            "answer": answer.answer,
            "response_time_ms": answer.response_time_ms,
            "typing_pattern": answer.typing_pattern,
        }
        for answer in answers
    ]

    result = supabase.table("responses").insert(responses_data).execute()
    return result.data or []


async def complete_test_session(
    session_id: str, raw_scores: dict, result_type: str
) -> Optional[dict]:
    supabase = get_supabase()

    # Get session
    session = (
        supabase.table("test_sessions")
        .select("*")
        .eq("id", session_id)
        .single()
        .execute()
    )

    if not session.data:
        return None

    session_data = session.data

    # Calculate time spent
    started_at = datetime.fromisoformat(session_data["started_at"].replace("Z", "+00:00"))
    time_spent = int((datetime.utcnow() - started_at.replace(tzinfo=None)).total_seconds())

    # Update session
    supabase.table("test_sessions").update(
        {
            "status": "completed",
            "completed_at": datetime.utcnow().isoformat(),
            "time_spent_seconds": time_spent,
        }
    ).eq("id", session_id).execute()

    # Create test result
    result = (
        supabase.table("test_results")
        .insert(
            {
                "session_id": session_id,
                "user_id": session_data["user_id"],
                "test_id": session_data["test_id"],
                "raw_scores": raw_scores,
                "result_type": result_type,
            }
        )
        .execute()
    )

    return result.data[0] if result.data else None


async def get_user_test_results(user_id: str) -> list[dict]:
    supabase = get_supabase()

    result = (
        supabase.table("test_results")
        .select("*, tests(*)")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )

    return result.data or []


async def get_test_result_by_code(user_id: str, test_code: str) -> Optional[dict]:
    supabase = get_supabase()

    # Get test
    test = await get_test_by_code(test_code)
    if not test:
        return None

    result = (
        supabase.table("test_results")
        .select("*")
        .eq("user_id", user_id)
        .eq("test_id", test["id"])
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )

    return result.data[0] if result.data else None
