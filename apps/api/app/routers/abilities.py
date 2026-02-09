from typing import Annotated

from fastapi import APIRouter, Depends

from app.models.ability import AllAbilitiesResponse
from app.services.ability_service import get_user_abilities, calculate_abilities
from app.routers.auth import get_current_user

router = APIRouter()


@router.get("")
async def get_abilities(
    current_user: Annotated[dict, Depends(get_current_user)],
):
    """전체 능력치 조회"""
    abilities = await get_user_abilities(current_user["id"])
    return {"abilities": abilities}


@router.get("/radar")
async def get_radar_data(
    current_user: Annotated[dict, Depends(get_current_user)],
) -> AllAbilitiesResponse:
    """레이더 차트 데이터 조회"""
    return await calculate_abilities(current_user["id"])


@router.post("/calculate")
async def recalculate_abilities(
    current_user: Annotated[dict, Depends(get_current_user)],
) -> AllAbilitiesResponse:
    """능력치 재계산"""
    return await calculate_abilities(current_user["id"])
