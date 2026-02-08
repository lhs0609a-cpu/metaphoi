from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.models.test import TestResponse, TestSubmit, TestResult
from app.services.test_service import (
    get_all_tests,
    get_test_by_code,
    get_test_questions,
    start_test_session,
    submit_responses,
    complete_test_session,
)
from app.routers.auth import get_current_user
from app.tests_engine.base import get_test_engine

router = APIRouter()


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
            detail=f"Test '{code}' not found",
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
    """검사 시작"""
    test = await get_test_by_code(code)

    if not test:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Test '{code}' not found",
        )

    session = await start_test_session(current_user["id"], test["id"])
    questions = await get_test_questions(test["id"])

    return {
        "session": session,
        "questions": questions,
    }


@router.post("/{code}/submit")
async def submit_test(
    code: str,
    data: TestSubmit,
    current_user: Annotated[dict, Depends(get_current_user)],
):
    """답변 제출"""
    test = await get_test_by_code(code)

    if not test:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Test '{code}' not found",
        )

    responses = await submit_responses(str(data.session_id), data.answers)

    return {"submitted": len(responses)}


@router.post("/{code}/complete")
async def complete_test(
    code: str,
    current_user: Annotated[dict, Depends(get_current_user)],
    session_id: str = None,
):
    """검사 완료 및 결과 계산"""
    test = await get_test_by_code(code)

    if not test:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Test '{code}' not found",
        )

    # Get test engine for scoring
    engine = get_test_engine(code)

    if not engine:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail=f"Test engine for '{code}' not implemented",
        )

    # Calculate scores (engine fetches responses from DB)
    raw_scores, result_type = await engine.calculate_result(session_id)

    # Save result
    result = await complete_test_session(session_id, raw_scores, result_type)

    if not result:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to complete test session",
        )

    return {
        "result": result,
        "interpretation": engine.interpret_result(raw_scores, result_type),
    }
