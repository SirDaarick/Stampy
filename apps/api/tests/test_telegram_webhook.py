from fastapi.testclient import TestClient
from apps.api.src.presentation.main import app

from apps.api.src.core.config import settings

client = TestClient(app)

def get_auth_headers():
    if settings.TELEGRAM_WEBHOOK_SECRET:
        return {"X-Telegram-Bot-Api-Secret-Token": settings.TELEGRAM_WEBHOOK_SECRET}
    return {}


def test_telegram_webhook_accepts_valid_text_update():
    payload = {
        "update_id": 10001,
        "message": {
            "message_id": 42,
            "from": {"id": 998877, "first_name": "Erick", "username": "erick_dev"},
            "chat": {"id": 998877, "type": "private"},
            "date": 1728000000,
            "text": "Gasté $350 en verduras"
        }
    }

    response = client.post("/api/v1/telegram/webhook", json=payload, headers=get_auth_headers())
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "accepted"
    assert data["chat_id"] == 998877
    assert data["media_type"] == "TEXT"


def test_telegram_webhook_detects_photo_media():
    payload = {
        "update_id": 10002,
        "message": {
            "message_id": 43,
            "from": {"id": 998877},
            "chat": {"id": 998877},
            "date": 1728000000,
            "caption": "Ticket de la despensa de hoy",
            "photo": [
                {"file_id": "photo_thumb_123", "file_size": 1024},
                {"file_id": "photo_full_123", "file_size": 20480}
            ]
        }
    }

    response = client.post("/api/v1/telegram/webhook", json=payload, headers=get_auth_headers())
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "accepted"
    assert data["media_type"] == "PHOTO"


def test_telegram_webhook_ignores_empty_or_non_message_updates():
    payload = {"update_id": 10003}  # Sin mensaje
    response = client.post("/api/v1/telegram/webhook", json=payload, headers=get_auth_headers())
    assert response.status_code == 200
    assert response.json()["status"] == "ignored"


def test_telegram_simulation_endpoint():
    payload = {
        "chat_id": 888999,
        "text": "Gasté $500 en insumos de café",
        "active_mode": "BUSINESS"
    }

    response = client.post("/api/v1/telegram/simulate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "[ ✦ AUDITADO // OK ]" in data["stamped_response"]
    assert "MODO NEGOCIO" in data["stamped_response"]
