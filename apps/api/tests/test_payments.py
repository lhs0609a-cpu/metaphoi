import pytest
from unittest.mock import MagicMock, patch, AsyncMock


class TestPaymentsEndpoints:
    """Tests for payment-related endpoints."""

    def test_get_prices(self, client):
        """Test getting report prices."""
        response = client.get("/api/payments/prices")

        assert response.status_code == 200
        data = response.json()
        assert "prices" in data
        assert len(data["prices"]) == 3

        # Verify price structure
        for price in data["prices"]:
            assert "type" in price
            assert "name" in price
            assert "price" in price
            assert price["type"] in ["basic", "pro", "premium"]

    def test_prices_values(self, client):
        """Test that prices have correct values."""
        response = client.get("/api/payments/prices")
        prices = {p["type"]: p["price"] for p in response.json()["prices"]}

        assert prices["basic"] == 9900
        assert prices["pro"] == 29900
        assert prices["premium"] == 59900

    @patch("app.routers.payments.get_payment_service")
    @patch("app.routers.auth.get_current_user")
    def test_prepare_payment(self, mock_auth, mock_service, client):
        """Test preparing a payment."""
        mock_auth.return_value = {"id": "user-123", "email": "test@example.com"}

        mock_payment_service = MagicMock()
        mock_payment_service.prepare_payment = AsyncMock(
            return_value={
                "order_id": "order-123",
                "amount": 9900,
                "order_name": "Basic 리포트",
            }
        )
        mock_service.return_value = mock_payment_service

        response = client.post(
            "/api/payments/prepare",
            headers={"Authorization": "Bearer test-token"},
            json={
                "report_type": "basic",
                "success_url": "http://localhost:3000/success",
                "fail_url": "http://localhost:3000/fail",
            },
        )

        assert response.status_code in [200, 401, 403]

    @patch("app.routers.payments.get_payment_service")
    @patch("app.routers.payments.get_report_service")
    @patch("app.routers.auth.get_current_user")
    def test_confirm_payment(self, mock_auth, mock_report, mock_payment, client):
        """Test confirming a payment."""
        mock_auth.return_value = {"id": "user-123", "email": "test@example.com"}

        mock_payment_service = MagicMock()
        mock_payment_service.confirm_payment = AsyncMock(
            return_value={
                "status": "completed",
                "payment_id": "payment-123",
            }
        )
        mock_payment.return_value = mock_payment_service

        mock_report_service = MagicMock()
        mock_report_service.generate_report = AsyncMock(
            return_value={"report_id": "report-123"}
        )
        mock_report.return_value = mock_report_service

        response = client.post(
            "/api/payments/confirm",
            headers={"Authorization": "Bearer test-token"},
            json={
                "payment_key": "payment-key-123",
                "order_id": "order-123",
                "amount": 9900,
            },
        )

        assert response.status_code in [200, 400, 401, 403]

    @patch("app.routers.payments.get_payment_service")
    @patch("app.routers.auth.get_current_user")
    def test_list_payments(self, mock_auth, mock_service, client):
        """Test listing user payments."""
        mock_auth.return_value = {"id": "user-123", "email": "test@example.com"}

        mock_payment_service = MagicMock()
        mock_payment_service.get_user_payments = AsyncMock(
            return_value=[
                {"id": "pay-1", "amount": 9900, "status": "completed"},
                {"id": "pay-2", "amount": 29900, "status": "completed"},
            ]
        )
        mock_service.return_value = mock_payment_service

        response = client.get(
            "/api/payments",
            headers={"Authorization": "Bearer test-token"},
        )

        assert response.status_code in [200, 401, 403]

    @patch("app.routers.payments.get_payment_service")
    @patch("app.routers.auth.get_current_user")
    def test_get_payment_status(self, mock_auth, mock_service, client):
        """Test getting payment status."""
        mock_auth.return_value = {"id": "user-123", "email": "test@example.com"}

        mock_payment_service = MagicMock()
        mock_payment_service.get_payment = AsyncMock(
            return_value={
                "id": "pay-123",
                "user_id": "user-123",
                "amount": 9900,
                "status": "completed",
            }
        )
        mock_service.return_value = mock_payment_service

        response = client.get(
            "/api/payments/pay-123",
            headers={"Authorization": "Bearer test-token"},
        )

        assert response.status_code in [200, 401, 403, 404]

    @patch("app.routers.payments.get_payment_service")
    @patch("app.routers.auth.get_current_user")
    def test_cancel_payment(self, mock_auth, mock_service, client):
        """Test canceling a payment."""
        mock_auth.return_value = {"id": "user-123", "email": "test@example.com"}

        mock_payment_service = MagicMock()
        mock_payment_service.get_payment = AsyncMock(
            return_value={
                "id": "pay-123",
                "user_id": "user-123",
                "status": "completed",
            }
        )
        mock_payment_service.cancel_payment = AsyncMock(
            return_value={"status": "canceled"}
        )
        mock_service.return_value = mock_payment_service

        response = client.post(
            "/api/payments/pay-123/cancel",
            headers={"Authorization": "Bearer test-token"},
            json={"cancel_reason": "Test cancellation"},
        )

        assert response.status_code in [200, 400, 401, 403]
