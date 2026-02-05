"""
Metaphoi 서비스 모듈
"""

from app.services.supabase_client import get_supabase
from app.services.auth_service import (
    create_user,
    authenticate_user,
    get_current_user,
)
from app.services.test_service import (
    get_test_by_code,
    get_all_tests,
    start_test_session,
    submit_response,
    complete_test,
)
from app.services.ability_service import (
    get_user_abilities,
    calculate_abilities,
)
from app.services.ai_service import (
    AIAnalysisService,
    get_ai_service,
)
from app.services.report_service import (
    ReportService,
    get_report_service,
    REPORT_PRICES,
)
from app.services.payment_service import (
    PaymentService,
    get_payment_service,
)

__all__ = [
    # Supabase
    "get_supabase",
    # Auth
    "create_user",
    "authenticate_user",
    "get_current_user",
    # Test
    "get_test_by_code",
    "get_all_tests",
    "start_test_session",
    "submit_response",
    "complete_test",
    # Ability
    "get_user_abilities",
    "calculate_abilities",
    # AI
    "AIAnalysisService",
    "get_ai_service",
    # Report
    "ReportService",
    "get_report_service",
    "REPORT_PRICES",
    # Payment
    "PaymentService",
    "get_payment_service",
]
