from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.services.payment_service import (
    prepare_payment,
    confirm_payment,
    get_payment,
)
from app.services.supabase_client import get_supabase
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

    # 결제 성공 시 리포트 자동 생성
    supabase = get_supabase()
    payment = (
        supabase.table("payments")
        .select("*")
        .eq("order_id", request.order_id)
        .single()
        .execute()
    )

    if payment.data:
        # report_type 결정 (가격으로 역추론)
        price_to_type = {9900: "basic", 29900: "pro", 59900: "premium"}
        report_type = price_to_type.get(request.amount, "basic")

        # 리포트 생성
        report_result = (
            supabase.table("reports")
            .insert({
                "user_id": current_user["id"],
                "report_type": report_type,
                "report_data": {"payment_id": payment.data["id"], "unlocked": True},
            })
            .execute()
        )

        # 결제에 리포트 ID 연결
        if report_result.data:
            supabase.table("payments").update(
                {"report_id": report_result.data[0]["id"]}
            ).eq("id", payment.data["id"]).execute()

    return result


@router.get("/status/me")
async def get_my_payment_status(
    current_user: Annotated[dict, Depends(get_current_user)],
):
    """현재 사용자의 결제/리포트 상태 확인"""
    supabase = get_supabase()

    # 완료된 결제가 있는지 확인
    payments = (
        supabase.table("payments")
        .select("*, reports(*)")
        .eq("user_id", current_user["id"])
        .eq("status", "completed")
        .order("paid_at", desc=True)
        .execute()
    )

    if not payments.data:
        return {"has_paid": False, "report_type": None}

    # 가장 높은 등급의 리포트 반환
    tier_rank = {"premium": 3, "pro": 2, "basic": 1}
    best = max(
        payments.data,
        key=lambda p: tier_rank.get(
            (p.get("reports") or {}).get("report_type", ""),
            0,
        ),
    )

    report = best.get("reports") or {}
    return {
        "has_paid": True,
        "report_type": report.get("report_type"),
        "report_id": report.get("id"),
    }


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
