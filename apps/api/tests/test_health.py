from fastapi.testclient import TestClient
from apps.api.src.presentation.main import app

client = TestClient(app)


def test_health_check_returns_healthy():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data


def test_root_returns_welcome():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "Bienvenido" in data["message"]
