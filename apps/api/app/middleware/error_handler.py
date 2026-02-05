import logging
import traceback
from typing import Union

from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from pydantic import ValidationError as PydanticValidationError

from app.middleware.exceptions import MetaphoiException

logger = logging.getLogger("metaphoi.error")


def create_error_response(
    status_code: int,
    error_code: str,
    message: str,
    details: any = None,
    request_id: str = None,
) -> dict:
    response = {
        "success": False,
        "error": {
            "code": error_code,
            "message": message,
        },
    }

    if details:
        response["error"]["details"] = details

    if request_id:
        response["error"]["request_id"] = request_id

    return response


def setup_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(MetaphoiException)
    async def metaphoi_exception_handler(
        request: Request, exc: MetaphoiException
    ) -> JSONResponse:
        request_id = getattr(request.state, "request_id", None)

        logger.warning(
            f"MetaphoiException: {exc.error_code} - {exc.message}",
            extra={
                "request_id": request_id,
                "path": request.url.path,
                "method": request.method,
                "error_code": exc.error_code,
                "status_code": exc.status_code,
            },
        )

        return JSONResponse(
            status_code=exc.status_code,
            content=create_error_response(
                status_code=exc.status_code,
                error_code=exc.error_code,
                message=exc.message,
                details=exc.details,
                request_id=request_id,
            ),
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(
        request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        request_id = getattr(request.state, "request_id", None)

        errors = []
        for error in exc.errors():
            field = ".".join(str(loc) for loc in error["loc"])
            errors.append({"field": field, "message": error["msg"], "type": error["type"]})

        logger.warning(
            f"ValidationError: {len(errors)} validation errors",
            extra={
                "request_id": request_id,
                "path": request.url.path,
                "method": request.method,
                "errors": errors,
            },
        )

        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content=create_error_response(
                status_code=422,
                error_code="VALIDATION_ERROR",
                message="입력값 검증에 실패했습니다.",
                details=errors,
                request_id=request_id,
            ),
        )

    @app.exception_handler(PydanticValidationError)
    async def pydantic_validation_exception_handler(
        request: Request, exc: PydanticValidationError
    ) -> JSONResponse:
        request_id = getattr(request.state, "request_id", None)

        errors = []
        for error in exc.errors():
            field = ".".join(str(loc) for loc in error["loc"])
            errors.append({"field": field, "message": error["msg"], "type": error["type"]})

        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content=create_error_response(
                status_code=422,
                error_code="VALIDATION_ERROR",
                message="데이터 검증에 실패했습니다.",
                details=errors,
                request_id=request_id,
            ),
        )

    @app.exception_handler(ValueError)
    async def value_error_handler(request: Request, exc: ValueError) -> JSONResponse:
        request_id = getattr(request.state, "request_id", None)

        logger.warning(
            f"ValueError: {str(exc)}",
            extra={
                "request_id": request_id,
                "path": request.url.path,
                "method": request.method,
            },
        )

        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content=create_error_response(
                status_code=400,
                error_code="BAD_REQUEST",
                message=str(exc),
                request_id=request_id,
            ),
        )

    @app.exception_handler(Exception)
    async def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        request_id = getattr(request.state, "request_id", None)

        logger.error(
            f"Unhandled exception: {type(exc).__name__} - {str(exc)}",
            extra={
                "request_id": request_id,
                "path": request.url.path,
                "method": request.method,
                "traceback": traceback.format_exc(),
            },
        )

        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=create_error_response(
                status_code=500,
                error_code="INTERNAL_ERROR",
                message="서버 내부 오류가 발생했습니다.",
                request_id=request_id,
            ),
        )
