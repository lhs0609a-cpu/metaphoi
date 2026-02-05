import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch
import uuid

from app.main import app


@pytest.fixture
def client():
    """Create a test client for the FastAPI app."""
    return TestClient(app)


@pytest.fixture
def mock_supabase():
    """Mock Supabase client."""
    with patch("app.services.supabase_client.get_supabase") as mock:
        mock_client = MagicMock()
        mock.return_value = mock_client
        yield mock_client


@pytest.fixture
def test_user():
    """Test user data."""
    return {
        "id": str(uuid.uuid4()),
        "email": "test@example.com",
        "name": "Test User",
    }


@pytest.fixture
def auth_headers(test_user):
    """Generate auth headers with a mock token."""
    # In real tests, you would generate a valid JWT token
    return {"Authorization": "Bearer test-token"}


@pytest.fixture
def mock_auth(test_user):
    """Mock authentication dependency."""
    with patch("app.routers.auth.get_current_user") as mock:
        mock.return_value = test_user
        yield mock


@pytest.fixture
def sample_test():
    """Sample test data."""
    return {
        "id": 1,
        "code": "mbti",
        "name": "MBTI 성격 유형 검사",
        "description": "16가지 성격 유형을 분석하는 검사",
        "question_count": 48,
        "estimated_minutes": 15,
        "category": "personality",
        "is_active": True,
    }


@pytest.fixture
def sample_questions():
    """Sample questions data."""
    return [
        {
            "id": 1,
            "test_id": 1,
            "question_number": 1,
            "question_type": "likert",
            "question_text": "나는 새로운 사람을 만나는 것을 좋아한다.",
            "options": {"scale": 5, "labels": ["전혀 아니다", "아니다", "보통", "그렇다", "매우 그렇다"]},
        },
        {
            "id": 2,
            "test_id": 1,
            "question_number": 2,
            "question_type": "likert",
            "question_text": "나는 계획을 세우는 것을 좋아한다.",
            "options": {"scale": 5, "labels": ["전혀 아니다", "아니다", "보통", "그렇다", "매우 그렇다"]},
        },
    ]


@pytest.fixture
def sample_session(test_user, sample_test):
    """Sample test session data."""
    return {
        "id": str(uuid.uuid4()),
        "user_id": test_user["id"],
        "test_id": sample_test["id"],
        "status": "in_progress",
        "started_at": "2024-01-01T00:00:00Z",
    }
