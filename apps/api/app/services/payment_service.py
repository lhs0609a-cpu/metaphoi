from typing import Optional
from uuid import uuid4
import httpx

from app.config import settings
from app.services.supabase_client import get_supabase


REPORT_PRICES = {
    "basic": 9900,
    "pro": 29900,
    "premium": 59900,
}

TOSS_API_URL = "https://api.tosspayments.com/v1/payments"


async def prepare_payment(user_id: str, report_type: str) -> dict:
    """결제 준비"""
    supabase = get_supabase()

    amount = REPORT_PRICES.get(report_type)
    if not amount:
        raise ValueError(f"Invalid report type: {report_type}")

    order_id = f"ORDER_{uuid4().hex[:16].upper()}"

    # Create payment record
    result = (
        supabase.table("payments")
        .insert(
            {
                "user_id": user_id,
                "amount": amount,
                "order_id": order_id,
                "status": "pending",
            }
        )
        .execute()
    )

    payment = result.data[0] if result.data else None

    return {
        "payment_id": payment["id"],
        "order_id": order_id,
        "amount": amount,
        "order_name": f"Metaphoi {report_type.capitalize()} 리포트",
        "client_key": settings.toss_client_key,
    }


async def confirm_payment(
    payment_key: str, order_id: str, amount: int
) -> Optional[dict]:
    """토스페이먼츠 결제 승인"""
    supabase = get_supabase()

    # Get payment record
    payment = (
        supabase.table("payments")
        .select("*")
        .eq("order_id", order_id)
        .single()
        .execute()
    )

    if not payment.data:
        return None

    if payment.data["amount"] != amount:
        return None

    # Call Toss API to confirm payment
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{TOSS_API_URL}/confirm",
                json={
                    "paymentKey": payment_key,
                    "orderId": order_id,
                    "amount": amount,
                },
                headers={
                    "Authorization": f"Basic {settings.toss_secret_key}",
                    "Content-Type": "application/json",
                },
            )
            response.raise_for_status()
            toss_result = response.json()
        except httpx.HTTPError as e:
            # Update payment status to failed
            supabase.table("payments").update({"status": "failed"}).eq(
                "id", payment.data["id"]
            ).execute()
            return None

    # Update payment status
    supabase.table("payments").update(
        {
            "status": "completed",
            "payment_key": payment_key,
            "paid_at": toss_result.get("approvedAt"),
        }
    ).eq("id", payment.data["id"]).execute()

    return {
        "payment_id": payment.data["id"],
        "status": "completed",
        "amount": amount,
    }


async def get_payment(payment_id: str) -> Optional[dict]:
    """결제 정보 조회"""
    supabase = get_supabase()

    result = (
        supabase.table("payments")
        .select("*")
        .eq("id", payment_id)
        .single()
        .execute()
    )

    return result.data
