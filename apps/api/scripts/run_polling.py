import asyncio
import logging
import signal
import sys
from typing import Optional
import httpx

from apps.api.src.core.config import settings
from apps.api.src.application.agent import stampy_agent

# Configuración de logs con formato legible
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S"
)
logger = logging.getLogger("stampy.polling")


async def run_telegram_polling():
    bot_token = settings.TELEGRAM_BOT_TOKEN
    if not bot_token:
        logger.error(
            "❌ No se encontró TELEGRAM_BOT_TOKEN en las variables de entorno (.env).\n"
            "   Por favor crea tu bot con @BotFather en Telegram y agrégalo a tu archivo .env:\n"
            "   TELEGRAM_BOT_TOKEN=tu_token_aqui"
        )
        return

    base_url = f"https://api.telegram.org/bot{bot_token}"

    async with httpx.AsyncClient(timeout=40.0) as client:
        # 1. Verificar identidad del bot
        try:
            me_res = await client.get(f"{base_url}/getMe")
            me_res.raise_for_status()
            bot_info = me_res.json().get("result", {})
            bot_username = bot_info.get("username", "StampyBot")
            logger.info(f"🤖 Stampy Polling iniciado exitosamente como @{bot_username}")
        except Exception as e:
            logger.error(f"❌ Error al conectar con Telegram: {e}")
            return

        # 2. Desactivar cualquier webhook previo para permitir polling
        try:
            await client.post(f"{base_url}/deleteWebhook", json={"drop_pending_updates": False})
            logger.info("⚡ Webhooks previos desactivados. Modo Long Polling activo (Cero ngrok requerido).")
        except Exception as e:
            logger.warning(f"Advertencia al limpiar webhook: {e}")

        logger.info("👂 Stampy está escuchando mensajes, audios y tickets en Telegram. ¡Pruébalo ahora!\n")

        offset = 0

        while True:
            try:
                # 3. getUpdates con long polling (timeout 30s)
                poll_res = await client.post(
                    f"{base_url}/getUpdates",
                    json={"offset": offset, "timeout": 30, "allowed_updates": ["message"]}
                )

                if poll_res.status_code != 200:
                    logger.warning(f"Telegram respondió con status {poll_res.status_code}. Reintentando en 3s...")
                    await asyncio.sleep(3)
                    continue

                data = poll_res.json()
                updates = data.get("result", [])

                for update in updates:
                    offset = update["update_id"] + 1
                    message = update.get("message")
                    if not message:
                        continue

                    chat_id = message.get("chat", {}).get("id")
                    from_user = message.get("from", {}).get("first_name", "Usuario")
                    text = message.get("text") or message.get("caption") or ""

                    # Determinar tipo de medio
                    media_type = "TEXT"
                    if "photo" in message:
                        media_type = "PHOTO"
                        logger.info(f"📸 Foto de ticket recibida de {from_user} ({chat_id})")
                    elif "voice" in message or "audio" in message:
                        media_type = "VOICE"
                        logger.info(f"🎙️ Nota de voz recibida de {from_user} ({chat_id})")
                    else:
                        logger.info(f"💬 Mensaje recibido de {from_user} ({chat_id}): \"{text}\"")

                    # Notificación inicial no bloqueante
                    try:
                        await client.post(
                            f"{base_url}/sendMessage",
                            json={
                                "chat_id": chat_id,
                                "text": "Stampy está inspeccionando tu gasto... 🔍"
                            }
                        )
                    except Exception as e:
                        logger.warning(f"No se pudo enviar mensaje de espera: {e}")

                    # Ejecución del agente de LangGraph
                    config = {"configurable": {"thread_id": f"tg-polling-{chat_id}"}}
                    initial_state = {
                        "messages": [],
                        "user_id": str(chat_id),
                        "telegram_chat_id": chat_id,
                        "active_mode": "BUSINESS",  # Por defecto negocio
                        "raw_input_text": text,
                        "media_type": media_type
                    }

                    result = stampy_agent.invoke(initial_state, config)
                    stamped_response = result.get("stamped_response", "[ ✦ AUDITADO // OK ]")

                    # Enviar respuesta sellada
                    await client.post(
                        f"{base_url}/sendMessage",
                        json={
                            "chat_id": chat_id,
                            "text": stamped_response,
                            "parse_mode": "Markdown"
                        }
                    )
                    logger.info(f"✅ Sello estampado enviado a {from_user} ({chat_id})\n")

            except asyncio.CancelledError:
                logger.info("Deteniendo polling...")
                break
            except Exception as e:
                logger.error(f"Error en bucle de polling: {e}. Reintentando en 3s...")
                await asyncio.sleep(3)


def main():
    def signal_handler(sig, frame):
        logger.info("\n🛑 Deteniendo Stampy Polling de forma segura...")
        sys.exit(0)

    signal.signal(signal.SIGINT, signal_handler)

    try:
        asyncio.run(run_telegram_polling())
    except KeyboardInterrupt:
        logger.info("\n🛑 Deteniendo Stampy Polling de forma segura...")


if __name__ == "__main__":
    main()
