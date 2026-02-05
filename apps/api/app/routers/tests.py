from typing import Annotated, Optional, Any

from fastapi import APIRouter, Depends, HTTPException, status, Body
from pydantic import BaseModel

from app.models.test import TestResponse, TestSubmit, TestResult
from app.services.test_service import (
    get_all_tests,
    get_test_by_code,
    get_test_questions,
    start_test_session,
    submit_responses,
    complete_test_session,
)
from app.services.fraud_detection_service import get_fraud_detection_service
from app.routers.auth import get_current_user
from app.tests_engine.base import get_test_engine

router = APIRouter()


class AnswerSubmit(BaseModel):
    question_id: int
    answer: Any
    response_time_ms: Optional[int] = None
    typing_pattern: Optional[dict] = None


class TestCompleteRequest(BaseModel):
    session_id: str


@router.get("")
async def list_tests():
    """검사 목록 조회"""
    tests = await get_all_tests()
    return {"tests": tests}


@router.get("/{code}")
async def get_test(code: str):
    """검사 상세 조회"""
    test = await get_test_by_code(code)

    if not test:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"검사 '{code}'를 찾을 수 없습니다.",
        )

    questions = await get_test_questions(test["id"])

    return TestResponse(
        test=test,
        questions=questions,
    )


@router.post("/{code}/start")
async def start_test(
    code: str,
    current_user: Annotated[dict, Depends(get_current_user)],
):
    """검사 시작 - 새 세션 생성"""
    test = await get_test_by_code(code)

    if not test:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"검사 '{code}'를 찾을 수 없습니다.",
        )

    session = await start_test_session(current_user["id"], test["id"])
    questions = await get_test_questions(test["id"])

    return {
        "session": session,
        "questions": questions,
        "test": {
            "code": test["code"],
            "name": test["name"],
            "estimated_minutes": test.get("estimated_minutes", 15),
        },
    }


@router.post("/{code}/submit")
async def submit_test(
    code: str,
    data: TestSubmit,
    current_user: Annotated[dict, Depends(get_current_user)],
):
    """답변 제출 (단일 또는 다중)"""
    test = await get_test_by_code(code)

    if not test:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"검사 '{code}'를 찾을 수 없습니다.",
        )

    responses = await submit_responses(str(data.session_id), data.answers)

    return {
        "submitted": len(responses),
        "session_id": str(data.session_id),
    }


@router.post("/{code}/answer")
async def submit_single_answer(
    code: str,
    answer: AnswerSubmit,
    session_id: str,
    current_user: Annotated[dict, Depends(get_current_user)],
):
    """단일 답변 제출 (실시간 저장용)"""
    test = await get_test_by_code(code)

    if not test:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"검사 '{code}'를 찾을 수 없습니다.",
        )

    # answer 데이터를 submit_responses 형식으로 변환
    answer_data = {
        "question_id": answer.question_id,
        "answer": answer.answer,
    }
    if answer.response_time_ms:
        answer_data["response_time_ms"] = answer.response_time_ms
    if answer.typing_pattern:
        answer_data["typing_pattern"] = answer.typing_pattern

    responses = await submit_responses(session_id, [answer_data])

    return {
        "submitted": len(responses),
        "question_id": answer.question_id,
    }


@router.post("/{code}/complete")
async def complete_test(
    code: str,
    request: TestCompleteRequest,
    current_user: Annotated[dict, Depends(get_current_user)],
):
    """검사 완료 및 결과 계산"""
    test = await get_test_by_code(code)

    if not test:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"검사 '{code}'를 찾을 수 없습니다.",
        )

    # Get test engine for scoring
    engine = get_test_engine(code)

    if not engine:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail=f"'{code}' 검사 엔진이 구현되지 않았습니다.",
        )

    try:
        # 부정행위 탐지
        fraud_service = get_fraud_detection_service()
        fraud_analysis = await fraud_service.analyze_session(request.session_id)

        # Calculate scores (engine fetches responses from DB)
        raw_scores, result_type = await engine.calculate_result(request.session_id)

        # 해석 결과 생성
        interpretation = engine.interpret_result(raw_scores, result_type)

        # Save result
        result = await complete_test_session(
            request.session_id,
            raw_scores,
            result_type,
            interpretation,
            fraud_score=fraud_analysis.get("fraud_score", 0),
        )

        if not result:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="검사 완료 처리에 실패했습니다.",
            )

        return {
            "result": result,
            "interpretation": interpretation,
            "fraud_analysis": {
                "score": fraud_analysis.get("fraud_score", 0),
                "risk_level": fraud_analysis.get("risk_level", "normal"),
                "recommendation": fraud_analysis.get("recommendation", ""),
            },
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"검사 결과 계산 중 오류: {str(e)}",
        )


@router.get("/{code}/session/{session_id}")
async def get_session_status(
    code: str,
    session_id: str,
    current_user: Annotated[dict, Depends(get_current_user)],
):
    """세션 상태 조회"""
    from app.services.supabase_client import get_supabase

    supabase = get_supabase()

    session = supabase.table("test_sessions") \
        .select("*, tests(code, name)") \
        .eq("id", session_id) \
        .eq("user_id", current_user["id"]) \
        .single() \
        .execute()

    if not session.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="세션을 찾을 수 없습니다.",
        )

    # 응답 수 조회
    responses = supabase.table("responses") \
        .select("id", count="exact") \
        .eq("session_id", session_id) \
        .execute()

    return {
        "session": session.data,
        "response_count": responses.count or 0,
    }
