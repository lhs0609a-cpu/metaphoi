from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel

from app.routers.auth import get_current_user
from app.services.report_service import get_report_service
from app.services.ability_service import calculate_abilities

router = APIRouter()


class ReportGenerateRequest(BaseModel):
    type: str  # basic, pro, premium


@router.get("/preview")
async def preview_report(
    current_user: Annotated[dict, Depends(get_current_user)],
):
    """무료 리포트 미리보기"""
    report_service = get_report_service()
    preview = await report_service.get_report_preview(current_user["id"])
    return preview


@router.get("")
async def list_reports(
    current_user: Annotated[dict, Depends(get_current_user)],
):
    """사용자의 리포트 목록 조회"""
    report_service = get_report_service()
    reports = await report_service.get_user_reports(current_user["id"])
    return {"reports": reports}


@router.post("/generate")
async def generate_report(
    request: ReportGenerateRequest,
    current_user: Annotated[dict, Depends(get_current_user)],
):
    """리포트 생성 (결제 완료 후 호출)"""
    report_service = get_report_service()

    try:
        result = await report_service.generate_report(
            user_id=current_user["id"],
            report_type=request.type,
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
            detail=f"리포트 생성 중 오류가 발생했습니다: {str(e)}",
        )


@router.get("/{report_id}")
async def get_report(
    report_id: str,
    current_user: Annotated[dict, Depends(get_current_user)],
):
    """리포트 조회"""
    report_service = get_report_service()
    report = await report_service.get_report(report_id, current_user["id"])

    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="리포트를 찾을 수 없습니다.",
        )

    if report.get("expired"):
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail="리포트가 만료되었습니다.",
        )

    return report
