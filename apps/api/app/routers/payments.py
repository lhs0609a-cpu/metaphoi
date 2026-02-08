from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.services.payment_service import (
    prepare_payment,
    confirm_payment,
    get_payment,
)
from app.routers.auth import get_current_user

router = APIRouter()


class PaymentPrepareRequest(BaseModel):
    report_type: str  # basic, pro, premium


class PaymentConfirmRequest(BaseModel):
    payment_key: str
    order_id: str
    amount: int


@router.post("/prepare")
async def prepare(
    request: PaymentPrepareRequest,
    current_user: Annotated[dict, Depends(get_current_user)],
):
    """결제 준비"""
    try:
        payment_data = await prepare_payment(
            current_user["id"], request.report_type
        )
        return payment_data
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.post("/confirm")
async def confirm(
    request: PaymentConfirmRequest,
    current_user: Annotated[dict, Depends(get_current_user)],
):
    """결제 승인"""
    result = await confirm_payment(
        request.payment_key, request.order_id, request.amount
    )

    if not result:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment confirmation failed",
        )

    return result


@router.get("/{payment_id}")
async def get_payment_status(
    payment_id: str,
    current_user: Annotated[dict, Depends(get_current_user)],
):
    """결제 상태 조회"""
    payment = await get_payment(payment_id)

    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found",
        )

    if payment["user_id"] != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this payment",
        )

    return {"payment": payment}
