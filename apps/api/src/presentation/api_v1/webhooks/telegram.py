import logging
from typing import Dict, Any, Optional
from fastapi import APIRouter, Header, HTTPException, BackgroundTasks, status
from pydantic import BaseModel

from apps.api.src.core.config import settings
from apps.api.src.application.agent import stampy_agent
from apps.api.src.infrastructure.telegram.client import telegram_client

logger = logging.getLogger("stampy.telegram")
router = APIRouter(prefix="/telegram", tags=["Telegram Ingestion"])


class SimulationPayload(BaseModel):
    chat_id: int = 123456789
    text: str
    active_mode: str = "BUSINESS"  # BUSINESS | PERSONAL


async def process_telegram_update_background(chat_id: int, text: str, media_type: str, user_id: str):
    """Tarea asíncrona que procesa la ingesta con LangGraph y responde al usuario."""
    try:
        config = {"configurable": {"thread_id": f"tg-chat-{chat_id}"}}
        initial_state = {
            "messages": [],
            "user_id": user_id,
            "telegram_chat_id": chat_id,
            "active_mode": "BUSINESS",  # Por defecto negocio; conmutable
            "raw_input_text": text,
            "media_type": media_type
        }

        # Ejecución del cerebro de Stampy
        result = stampy_agent.invoke(initial_state, config)
        stamped_text = result.get("stamped_response", "[ ✦ AUDITADO // OK ]")

        # Notificar a Telegram con el sello
        await telegram_client.send_message(chat_id=chat_id, text=stamped_text)

    except Exception as e:
        logger.error(f"Error procesando actualización de Telegram en chat {chat_id}: {e}", exc_info=True)
        await telegram_client.send_message(
            chat_id=chat_id,
            text="⚠️ Stampy encontró un error inesperado al auditar este comprobante. Por favor intenta de nuevo."
        )


@router.post("/webhook", status_code=status.HTTP_200_OK)
async def telegram_webhook(
    update: Dict[str, Any],
    background_tasks: BackgroundTasks,
    x_telegram_bot_api_secret_token: Optional[str] = Header(None)
):
    """
    Endpoint oficial de Webhook para Telegram.
    Responde en < 100 ms y despacha el procesamiento a BackgroundTasks.
    """
    # 1. Validación de Token Secreto si está configurado en producción
    if settings.TELEGRAM_WEBHOOK_SECRET:
        if x_telegram_bot_api_secret_token != settings.TELEGRAM_WEBHOOK_SECRET:
            raise HTTPException(status_code=403, detail="Secret token inválido")

    # 2. Extracción de datos del Update
    message = update.get("message") or update.get("edited_message")
    if not message:
        return {"status": "ignored", "reason": "No message field"}

    chat_id = message.get("chat", {}).get("id")
    if not chat_id:
        return {"status": "ignored", "reason": "No chat id"}

    text = message.get("text") or message.get("caption") or ""
    sender_id = str(message.get("from", {}).get("id", chat_id))

    media_type = "TEXT"
    if "photo" in message:
        media_type = "PHOTO"
    elif "voice" in message or "audio" in message:
        media_type = "VOICE"
    elif "document" in message:
        media_type = "PHOTO"  # Tratado como comprobante PDF/imagen

    # 3. Despacho no bloqueante
    background_tasks.add_task(
        process_telegram_update_background,
        chat_id=chat_id,
        text=text,
        media_type=media_type,
        user_id=sender_id
    )

    return {"status": "accepted", "chat_id": chat_id, "media_type": media_type}


@router.post("/simulate", tags=["Telegram Simulation"])
async def simulate_telegram_input(payload: SimulationPayload):
    """
    Endpoint síncrono para simular y probar la ingesta de Telegram desde
    el Dashboard Web o desde scripts locales sin depender de un bot real en vivo.
    """
    config = {"configurable": {"thread_id": f"sim-{payload.chat_id}"}}
    initial_state = {
        "messages": [],
        "user_id": f"sim-user-{payload.chat_id}",
        "telegram_chat_id": payload.chat_id,
        "active_mode": payload.active_mode,
        "raw_input_text": payload.text,
        "media_type": "TEXT"
    }

    result = stampy_agent.invoke(initial_state, config)
    return {
        "status": "success",
        "stamped_response": result.get("stamped_response"),
        "extraction": result.get("extraction"),
        "audit_flags": result.get("audit_flags")
    }
