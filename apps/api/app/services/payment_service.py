"""
토스페이먼츠 결제 서비스
"""

import base64
from typing import Optional
from datetime import datetime
from uuid import uuid4
import httpx

from app.config import settings
from app.services.supabase_client import get_supabase


# 리포트 가격 (원)
REPORT_PRICES = {
    "basic": 9900,
    "pro": 29900,
    "premium": 59900,
}

# 리포트 이름
REPORT_NAMES = {
    "basic": "Basic 리포트",
    "pro": "Pro 리포트",
    "premium": "Premium 리포트",
}

TOSS_API_URL = "https://api.tosspayments.com/v1/payments"


class PaymentService:
    """토스페이먼츠 결제 서비스"""

    def __init__(self):
        self.supabase = get_supabase()
        self.client_key = getattr(settings, "toss_client_key", "")
        self.secret_key = getattr(settings, "toss_secret_key", "")

    def _get_auth_header(self) -> str:
        """Basic Auth 헤더 생성"""
        credentials = f"{self.secret_key}:"
        encoded = base64.b64encode(credentials.encode()).decode()
        return f"Basic {encoded}"

    async def prepare_payment(
        self, user_id: str, report_type: str, success_url: str, fail_url: str
    ) -> dict:
        """결제 준비 - 클라이언트에 전달할 정보 생성"""
        amount = REPORT_PRICES.get(report_type)
        if not amount:
            raise ValueError(f"Invalid report type: {report_type}")

        order_id = f"ORDER_{uuid4().hex[:16].upper()}"
        order_name = f"Metaphoi {REPORT_NAMES.get(report_type, report_type)}"

        # 결제 레코드 생성
        result = self.supabase.table("payments").insert({
            "user_id": user_id,
            "amount": amount,
            "order_id": order_id,
            "status": "pending",
        }).execute()

        payment = result.data[0] if result.data else None

        if not payment:
            raise Exception("결제 레코드 생성 실패")

        return {
            "payment_id": payment["id"],
            "order_id": order_id,
            "order_name": order_name,
            "amount": amount,
            "client_key": self.client_key,
            "success_url": success_url,
            "fail_url": fail_url,
            "report_type": report_type,
        }

    async def confirm_payment(
        self, payment_key: str, order_id: str, amount: int
    ) -> dict:
        """토스페이먼츠 결제 승인"""
        # 결제 레코드 조회
        payment = self.supabase.table("payments") \
            .select("*") \
            .eq("order_id", order_id) \
            .single() \
            .execute()

        if not payment.data:
            raise ValueError("결제 정보를 찾을 수 없습니다.")

        payment_data = payment.data

        # 금액 검증
        if payment_data["amount"] != amount:
            raise ValueError("결제 금액이 일치하지 않습니다.")

        # 이미 완료된 결제인지 확인
        if payment_data["status"] == "completed":
            return {
                "payment_id": payment_data["id"],
                "status": "completed",
                "message": "이미 완료된 결제입니다.",
            }

        # 토스페이먼츠 API 호출
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
                        "Authorization": self._get_auth_header(),
                        "Content-Type": "application/json",
                    },
                    timeout=30.0,
                )

                if response.status_code != 200:
                    error_data = response.json()
                    self._update_payment_status(
                        payment_data["id"],
                        "failed",
                        error_message=error_data.get("message"),
                    )
                    raise Exception(f"결제 승인 실패: {error_data.get('message')}")

                toss_result = response.json()

            except httpx.TimeoutException:
                self._update_payment_status(payment_data["id"], "failed", error_message="결제 승인 시간 초과")
                raise Exception("결제 승인 시간 초과")

            except httpx.HTTPError as e:
                self._update_payment_status(payment_data["id"], "failed", error_message=str(e))
                raise Exception(f"결제 오류: {str(e)}")

        # 결제 성공 업데이트
        self.supabase.table("payments").update({
            "status": "completed",
            "payment_key": payment_key,
            "paid_at": toss_result.get("approvedAt", datetime.now().isoformat()),
        }).eq("id", payment_data["id"]).execute()

        return {
            "payment_id": payment_data["id"],
            "status": "completed",
            "amount": amount,
            "approved_at": toss_result.get("approvedAt"),
            "receipt_url": toss_result.get("receipt", {}).get("url"),
        }

    async def cancel_payment(
        self,
        payment_id: str,
        cancel_reason: str = "고객 요청",
        cancel_amount: Optional[int] = None,
    ) -> dict:
        """결제 취소 (환불)"""
        payment = self.supabase.table("payments") \
            .select("*") \
            .eq("id", payment_id) \
            .single() \
            .execute()

        if not payment.data:
            raise ValueError("결제 정보를 찾을 수 없습니다.")

        payment_data = payment.data

        if payment_data["status"] != "completed":
            raise ValueError("완료된 결제만 취소할 수 있습니다.")

        payment_key = payment_data.get("payment_key")
        if not payment_key:
            raise ValueError("결제 키가 없습니다.")

        refund_amount = cancel_amount or payment_data["amount"]

        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    f"{TOSS_API_URL}/{payment_key}/cancel",
                    json={
                        "cancelReason": cancel_reason,
                        "cancelAmount": refund_amount,
                    },
                    headers={
                        "Authorization": self._get_auth_header(),
                        "Content-Type": "application/json",
                    },
                    timeout=30.0,
                )

                if response.status_code != 200:
                    error_data = response.json()
                    raise Exception(f"결제 취소 실패: {error_data.get('message')}")

                cancel_result = response.json()

            except Exception as e:
                raise Exception(f"결제 취소 오류: {str(e)}")

        # 상태 업데이트
        new_status = "refunded" if refund_amount == payment_data["amount"] else "partial_refunded"
        self.supabase.table("payments").update({
            "status": new_status,
        }).eq("id", payment_id).execute()

        return {
            "payment_id": payment_id,
            "status": new_status,
            "refund_amount": refund_amount,
            "canceled_at": cancel_result.get("cancels", [{}])[0].get("canceledAt"),
        }

    async def get_payment(self, payment_id: str) -> Optional[dict]:
        """결제 정보 조회"""
        result = self.supabase.table("payments") \
            .select("*, reports(id, report_type)") \
            .eq("id", payment_id) \
            .single() \
            .execute()

        if not result.data:
            return None

        payment = result.data
        return {
            "payment_id": payment["id"],
            "user_id": payment["user_id"],
            "order_id": payment["order_id"],
            "amount": payment["amount"],
            "status": payment["status"],
            "paid_at": payment.get("paid_at"),
            "created_at": payment["created_at"],
            "report": payment.get("reports"),
        }

    async def get_user_payments(self, user_id: str, limit: int = 20) -> list[dict]:
        """사용자 결제 내역 조회"""
        result = self.supabase.table("payments") \
            .select("*, reports(id, report_type)") \
            .eq("user_id", user_id) \
            .order("created_at", desc=True) \
            .limit(limit) \
            .execute()

        return [
            {
                "payment_id": p["id"],
                "order_id": p["order_id"],
                "amount": p["amount"],
                "status": p["status"],
                "paid_at": p.get("paid_at"),
                "created_at": p["created_at"],
                "report": p.get("reports"),
            }
            for p in (result.data or [])
        ]

    async def link_report_to_payment(self, payment_id: str, report_id: str) -> None:
        """결제와 리포트 연결"""
        self.supabase.table("payments").update({
            "report_id": report_id,
        }).eq("id", payment_id).execute()

    def _update_payment_status(
        self, payment_id: str, status: str, error_message: Optional[str] = None
    ) -> None:
        """결제 상태 업데이트"""
        update_data = {"status": status}
        if error_message:
            update_data["error_message"] = error_message

        self.supabase.table("payments").update(update_data).eq("id", payment_id).execute()


# 싱글톤 인스턴스
_payment_service: Optional[PaymentService] = None


def get_payment_service() -> PaymentService:
    """결제 서비스 인스턴스 반환"""
    global _payment_service
    if _payment_service is None:
        _payment_service = PaymentService()
    return _payment_service


# 기존 함수 호환성 유지
async def prepare_payment(user_id: str, report_type: str) -> dict:
    """결제 준비 (기존 API 호환)"""
    service = get_payment_service()
    return await service.prepare_payment(
        user_id=user_id,
        report_type=report_type,
        success_url="",
        fail_url="",
    )


async def confirm_payment(payment_key: str, order_id: str, amount: int) -> Optional[dict]:
    """결제 승인 (기존 API 호환)"""
    service = get_payment_service()
    try:
        return await service.confirm_payment(payment_key, order_id, amount)
    except Exception:
        return None


async def get_payment(payment_id: str) -> Optional[dict]:
    """결제 정보 조회 (기존 API 호환)"""
    service = get_payment_service()
    return await service.get_payment(payment_id)
