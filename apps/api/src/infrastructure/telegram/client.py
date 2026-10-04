from typing import Optional, Dict, Any
import httpx

from apps.api.src.core.config import settings


class TelegramBotClient:
    """Cliente HTTP asíncrono para comunicarse con la Telegram Bot API."""

    def __init__(self, bot_token: Optional[str] = None):
        self.bot_token = bot_token or settings.TELEGRAM_BOT_TOKEN
        self.base_url = f"https://api.telegram.org/bot{self.bot_token}" if self.bot_token else None

    async def send_message(
        self,
        chat_id: int,
        text: str,
        parse_mode: str = "Markdown",
        reply_markup: Optional[Dict[str, Any]] = None
    ) -> Optional[dict]:
        """Envía un mensaje de texto al chat de Telegram."""
        if not self.base_url:
            # Modo Simulación Local / Sin Token configurado
            return {"mock": True, "chat_id": chat_id, "text": text}

        payload: Dict[str, Any] = {
            "chat_id": chat_id,
            "text": text,
            "parse_mode": parse_mode
        }
        if reply_markup:
            payload["reply_markup"] = reply_markup

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(f"{self.base_url}/sendMessage", json=payload)
                response.raise_for_status()
                return response.json()
        except httpx.HTTPError as exc:
            import logging
            logging.getLogger("stampy.telegram.client").warning(
                f"No se pudo enviar mensaje al chat {chat_id}: {exc}"
            )
            return None

    async def edit_message_text(
        self,
        chat_id: int,
        message_id: int,
        text: str,
        parse_mode: str = "Markdown",
        reply_markup: Optional[Dict[str, Any]] = None
    ) -> Optional[dict]:
        """Edita un mensaje existente (ej. de 'analizando' al sello verde)."""
        if not self.base_url:
            return {"mock": True, "chat_id": chat_id, "message_id": message_id, "text": text}

        payload: Dict[str, Any] = {
            "chat_id": chat_id,
            "message_id": message_id,
            "text": text,
            "parse_mode": parse_mode
        }
        if reply_markup:
            payload["reply_markup"] = reply_markup

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(f"{self.base_url}/editMessageText", json=payload)
                response.raise_for_status()
                return response.json()
        except httpx.HTTPError as exc:
            import logging
            logging.getLogger("stampy.telegram.client").warning(
                f"No se pudo editar mensaje {message_id} en chat {chat_id}: {exc}"
            )
            return None


telegram_client = TelegramBotClient()
