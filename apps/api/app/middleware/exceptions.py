from typing import Optional, Any


class MetaphoiException(Exception):
    """Base exception for Metaphoi API"""

    def __init__(
        self,
        message: str,
        status_code: int = 500,
        error_code: Optional[str] = None,
        details: Optional[Any] = None,
    ):
        self.message = message
        self.status_code = status_code
        self.error_code = error_code or "INTERNAL_ERROR"
        self.details = details
        super().__init__(message)


class NotFoundError(MetaphoiException):
    """Resource not found"""

    def __init__(self, message: str = "요청한 리소스를 찾을 수 없습니다.", details: Optional[Any] = None):
        super().__init__(message, status_code=404, error_code="NOT_FOUND", details=details)


class UnauthorizedError(MetaphoiException):
    """Unauthorized access"""

    def __init__(self, message: str = "인증이 필요합니다.", details: Optional[Any] = None):
        super().__init__(message, status_code=401, error_code="UNAUTHORIZED", details=details)


class ForbiddenError(MetaphoiException):
    """Forbidden access"""

    def __init__(self, message: str = "접근 권한이 없습니다.", details: Optional[Any] = None):
        super().__init__(message, status_code=403, error_code="FORBIDDEN", details=details)


class ValidationError(MetaphoiException):
    """Validation failed"""

    def __init__(self, message: str = "입력값이 유효하지 않습니다.", details: Optional[Any] = None):
        super().__init__(message, status_code=422, error_code="VALIDATION_ERROR", details=details)


class BadRequestError(MetaphoiException):
    """Bad request"""

    def __init__(self, message: str = "잘못된 요청입니다.", details: Optional[Any] = None):
        super().__init__(message, status_code=400, error_code="BAD_REQUEST", details=details)


class ConflictError(MetaphoiException):
    """Resource conflict"""

    def __init__(self, message: str = "리소스 충돌이 발생했습니다.", details: Optional[Any] = None):
        super().__init__(message, status_code=409, error_code="CONFLICT", details=details)


class PaymentError(MetaphoiException):
    """Payment related error"""

    def __init__(self, message: str = "결제 처리 중 오류가 발생했습니다.", details: Optional[Any] = None):
        super().__init__(message, status_code=402, error_code="PAYMENT_ERROR", details=details)


class ExternalServiceError(MetaphoiException):
    """External service failed"""

    def __init__(self, message: str = "외부 서비스 연동 중 오류가 발생했습니다.", details: Optional[Any] = None):
        super().__init__(message, status_code=502, error_code="EXTERNAL_SERVICE_ERROR", details=details)


class RateLimitError(MetaphoiException):
    """Rate limit exceeded"""

    def __init__(self, message: str = "요청 제한을 초과했습니다. 잠시 후 다시 시도해주세요.", details: Optional[Any] = None):
        super().__init__(message, status_code=429, error_code="RATE_LIMIT_EXCEEDED", details=details)


class TestSessionError(MetaphoiException):
    """Test session related error"""

    def __init__(self, message: str = "검사 세션 오류가 발생했습니다.", details: Optional[Any] = None):
        super().__init__(message, status_code=400, error_code="TEST_SESSION_ERROR", details=details)


class FraudDetectedError(MetaphoiException):
    """Fraud detected in test"""

    def __init__(self, message: str = "부정행위가 감지되었습니다.", details: Optional[Any] = None):
        super().__init__(message, status_code=403, error_code="FRAUD_DETECTED", details=details)
