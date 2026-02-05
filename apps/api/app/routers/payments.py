from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.services.payment_service import get_payment_service, REPORT_PRICES
from app.services.report_service import get_report_service
from app.routers.auth import get_current_user

router = APIRouter()


class PaymentPrepareRequest(BaseModel):
    report_type: str  # basic, pro, premium
    success_url: str
    fail_url: str


class PaymentConfirmRequest(BaseModel):
    payment_key: str
    order_id: str
    amount: int


class PaymentCancelRequest(BaseModel):
    cancel_reason: str = "고객 요청"
    cancel_amount: Optional[int] = None


@router.get("/prices")
async def get_prices():
    """리포트 가격 조회"""
    return {
        "prices": [
            {"type": "basic", "name": "Basic 리포트", "price": REPORT_PRICES["basic"]},
            {"type": "pro", "name": "Pro 리포트", "price": REPORT_PRICES["pro"]},
            {"type": "premium", "name": "Premium 리포트", "price": REPORT_PRICES["premium"]},
        ]
    }


@router.post("/prepare")
async def prepare(
    request: PaymentPrepareRequest,
    current_user: Annotated[dict, Depends(get_current_user)],
):
    """결제 준비 - 토스페이먼츠 결제 정보 생성"""
    payment_service = get_payment_service()

    try:
        payment_data = await payment_service.prepare_payment(
            user_id=current_user["id"],
            report_type=request.report_type,
            success_url=request.success_url,
            fail_url=request.fail_url,
        )
        return payment_data
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"결제 준비 중 오류: {str(e)}",
        )


@router.post("/confirm")
async def confirm(
    request: PaymentConfirmRequest,
    current_user: Annotated[dict, Depends(get_current_user)],
):
    """결제 승인 - 토스페이먼츠 결제 완료 처리"""
    payment_service = get_payment_service()
    report_service = get_report_service()

    try:
        result = await payment_service.confirm_payment(
            payment_key=request.payment_key,
            order_id=request.order_id,
            amount=request.amount,
        )

        # 결제 성공 시 리포트 자동 생성
        if result["status"] == "completed":
            # report_type을 결제 정보에서 가져오기 (또는 amount로 추론)
            report_type = "basic"
            if request.amount == REPORT_PRICES["pro"]:
                report_type = "pro"
            elif request.amount == REPORT_PRICES["premium"]:
                report_type = "premium"

            try:
                report_result = await report_service.generate_report(
                    user_id=current_user["id"],
                    report_type=report_type,
                )

                # 결제와 리포트 연결
                await payment_service.link_report_to_payment(
                    result["payment_id"],
                    report_result["report_id"],
                )

                result["report_id"] = report_result["report_id"]
                result["report_type"] = report_type
            except Exception as e:
                # 리포트 생성 실패해도 결제는 성공
                result["report_error"] = str(e)

        return result

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"결제 승인 중 오류: {str(e)}",
        )


@router.post("/{payment_id}/cancel")
async def cancel_payment(
    payment_id: str,
    request: PaymentCancelRequest,
    current_user: Annotated[dict, Depends(get_current_user)],
):
    """결제 취소 (환불)"""
    payment_service = get_payment_service()

    # 결제 정보 조회 및 권한 확인
    payment = await payment_service.get_payment(payment_id)
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="결제를 찾을 수 없습니다.",
        )

    if payment["user_id"] != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="이 결제에 대한 권한이 없습니다.",
        )

    try:
        result = await payment_service.cancel_payment(
            payment_id=payment_id,
            cancel_reason=request.cancel_reason,
            cancel_amount=request.cancel_amount,
        )
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"결제 취소 중 오류: {str(e)}",
        )


@router.get("")
async def list_payments(
    current_user: Annotated[dict, Depends(get_current_user)],
    limit: int = 20,
):
    """사용자 결제 내역 조회"""
    payment_service = get_payment_service()
    payments = await payment_service.get_user_payments(current_user["id"], limit)
    return {"payments": payments}


@router.get("/{payment_id}")
async def get_payment_status(
    payment_id: str,
    current_user: Annotated[dict, Depends(get_current_user)],
):
    """결제 상태 조회"""
    payment_service = get_payment_service()
    payment = await payment_service.get_payment(payment_id)

    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="결제를 찾을 수 없습니다.",
        )

    if payment["user_id"] != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="이 결제에 대한 권한이 없습니다.",
        )

    return {"payment": payment}
