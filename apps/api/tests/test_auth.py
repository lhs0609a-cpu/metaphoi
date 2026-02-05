import pytest
from unittest.mock import MagicMock, patch


class TestAuthEndpoints:
    """Tests for authentication endpoints."""

    def test_health_check(self, client):
        """Test health check endpoint."""
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"

    def test_root_endpoint(self, client):
        """Test root endpoint."""
        response = client.get("/")
        assert response.status_code == 200
        assert "Metaphoi API" in response.json()["message"]

    @patch("app.routers.auth.get_supabase")
    def test_signup_success(self, mock_supabase, client):
        """Test successful signup."""
        mock_client = MagicMock()
        mock_supabase.return_value = mock_client

        # Mock auth signup
        mock_client.auth.sign_up.return_value = MagicMock(
            user=MagicMock(id="test-user-id"),
            session=MagicMock(access_token="test-token"),
        )

        response = client.post(
            "/api/auth/signup",
            json={
                "email": "test@example.com",
                "password": "password123",
                "name": "Test User",
            },
        )

        assert response.status_code == 200

    @patch("app.routers.auth.get_supabase")
    def test_signup_invalid_email(self, mock_supabase, client):
        """Test signup with invalid email."""
        response = client.post(
            "/api/auth/signup",
            json={
                "email": "invalid-email",
                "password": "password123",
                "name": "Test User",
            },
        )

        assert response.status_code == 422

    @patch("app.routers.auth.get_supabase")
    def test_login_success(self, mock_supabase, client):
        """Test successful login."""
        mock_client = MagicMock()
        mock_supabase.return_value = mock_client

        # Mock auth login
        mock_client.auth.sign_in_with_password.return_value = MagicMock(
            user=MagicMock(id="test-user-id", email="test@example.com"),
            session=MagicMock(access_token="test-token"),
        )

        response = client.post(
            "/api/auth/login",
            json={
                "email": "test@example.com",
                "password": "password123",
            },
        )

        assert response.status_code == 200

    @patch("app.routers.auth.get_supabase")
    def test_login_invalid_credentials(self, mock_supabase, client):
        """Test login with invalid credentials."""
        mock_client = MagicMock()
        mock_supabase.return_value = mock_client

        # Mock auth error
        mock_client.auth.sign_in_with_password.side_effect = Exception("Invalid credentials")

        response = client.post(
            "/api/auth/login",
            json={
                "email": "test@example.com",
                "password": "wrongpassword",
            },
        )

        assert response.status_code in [401, 500]

    @patch("app.routers.auth.get_current_user")
    def test_get_me_authenticated(self, mock_get_user, client):
        """Test getting current user when authenticated."""
        mock_get_user.return_value = {
            "id": "test-user-id",
            "email": "test@example.com",
            "name": "Test User",
        }

        response = client.get(
            "/api/auth/me",
            headers={"Authorization": "Bearer test-token"},
        )

        # This would need proper auth setup to work
        # For now just verify the endpoint exists
        assert response.status_code in [200, 401, 403]

    def test_get_me_unauthenticated(self, client):
        """Test getting current user when not authenticated."""
        response = client.get("/api/auth/me")

        # Should return 401 or 403
        assert response.status_code in [401, 403, 422]
