from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.services.test_service import get_user_test_results, get_test_result_by_code
from app.routers.auth import get_current_user

router = APIRouter()


@router.get("")
async def list_results(
    current_user: Annotated[dict, Depends(get_current_user)],
):
    """검사 결과 목록 조회"""
    results = await get_user_test_results(current_user["id"])
    return {"results": results}


@router.get("/{test_code}")
async def get_result(
    test_code: str,
    current_user: Annotated[dict, Depends(get_current_user)],
):
    """특정 검사 결과 조회"""
    result = await get_test_result_by_code(current_user["id"], test_code)

    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No result found for test '{test_code}'",
        )

    return {"result": result}
