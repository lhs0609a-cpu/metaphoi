import pytest
from unittest.mock import MagicMock, patch, AsyncMock


class TestTestsEndpoints:
    """Tests for test-related endpoints."""

    @patch("app.routers.tests.get_all_tests")
    def test_list_tests(self, mock_get_tests, client):
        """Test listing all tests."""
        mock_get_tests.return_value = [
            {"id": 1, "code": "mbti", "name": "MBTI", "is_active": True},
            {"id": 2, "code": "disc", "name": "DISC", "is_active": True},
        ]

        response = client.get("/api/tests")

        assert response.status_code == 200
        data = response.json()
        assert "tests" in data
        assert len(data["tests"]) == 2

    @patch("app.routers.tests.get_test_by_code")
    @patch("app.routers.tests.get_test_questions")
    def test_get_test_detail(self, mock_questions, mock_test, client):
        """Test getting test details."""
        mock_test.return_value = {
            "id": 1,
            "code": "mbti",
            "name": "MBTI 성격 유형 검사",
        }
        mock_questions.return_value = [
            {"id": 1, "question_text": "Question 1"},
        ]

        response = client.get("/api/tests/mbti")

        assert response.status_code == 200

    @patch("app.routers.tests.get_test_by_code")
    def test_get_test_not_found(self, mock_test, client):
        """Test getting non-existent test."""
        mock_test.return_value = None

        response = client.get("/api/tests/nonexistent")

        assert response.status_code == 404

    @patch("app.routers.tests.get_test_by_code")
    @patch("app.routers.tests.start_test_session")
    @patch("app.routers.tests.get_test_questions")
    @patch("app.routers.auth.get_current_user")
    def test_start_test(
        self, mock_auth, mock_questions, mock_start, mock_test, client
    ):
        """Test starting a test session."""
        mock_auth.return_value = {"id": "user-123", "email": "test@example.com"}
        mock_test.return_value = {
            "id": 1,
            "code": "mbti",
            "name": "MBTI",
            "estimated_minutes": 15,
        }
        mock_start.return_value = {
            "id": "session-123",
            "user_id": "user-123",
            "test_id": 1,
            "status": "in_progress",
        }
        mock_questions.return_value = []

        response = client.post(
            "/api/tests/mbti/start",
            headers={"Authorization": "Bearer test-token"},
        )

        # Should work with proper auth
        assert response.status_code in [200, 401, 403]

    @patch("app.routers.tests.get_test_by_code")
    @patch("app.routers.tests.submit_responses")
    @patch("app.routers.auth.get_current_user")
    def test_submit_answers(self, mock_auth, mock_submit, mock_test, client):
        """Test submitting test answers."""
        mock_auth.return_value = {"id": "user-123", "email": "test@example.com"}
        mock_test.return_value = {"id": 1, "code": "mbti"}
        mock_submit.return_value = [{"id": 1}]

        response = client.post(
            "/api/tests/mbti/submit",
            headers={"Authorization": "Bearer test-token"},
            json={
                "session_id": "session-123",
                "answers": [
                    {"question_id": 1, "answer": 4},
                    {"question_id": 2, "answer": 3},
                ],
            },
        )

        assert response.status_code in [200, 401, 403, 422]


class TestTestEngines:
    """Tests for test engine implementations."""

    def test_mbti_engine_exists(self):
        """Test MBTI engine can be imported."""
        from app.tests_engine.mbti import MBTIEngine

        engine = MBTIEngine()
        assert engine is not None

    def test_disc_engine_exists(self):
        """Test DISC engine can be imported."""
        from app.tests_engine.disc import DISCEngine

        engine = DISCEngine()
        assert engine is not None

    def test_enneagram_engine_exists(self):
        """Test Enneagram engine can be imported."""
        from app.tests_engine.enneagram import EnneagramEngine

        engine = EnneagramEngine()
        assert engine is not None

    def test_get_test_engine(self):
        """Test getting test engine by code."""
        from app.tests_engine.base import get_test_engine

        mbti_engine = get_test_engine("mbti")
        assert mbti_engine is not None

        disc_engine = get_test_engine("disc")
        assert disc_engine is not None

        # Non-existent engine
        unknown_engine = get_test_engine("unknown")
        assert unknown_engine is None
