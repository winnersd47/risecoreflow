"""Одноразовый скрипт — создаёт Telegram-сессию и выводит base64 для GitHub Secrets.

Запуск (из папки RiseCoreFlow):
    python knowledge_base/generate_session.py

После выполнения:
1. Добавьте полученную строку как GitHub Secret KB_TG_SESSION_B64
   (Settings → Secrets and variables → Actions → New repository secret)
2. Добавьте остальные секреты из вашего .env как GitHub Secrets:
   KB_TG_API_ID     (TELEGRAM_API_ID из .env)
   KB_TG_API_HASH   (TELEGRAM_API_HASH из .env)
   YANDEX_API_KEY   (из .env)
   YANDEX_FOLDER_ID (из .env)
"""
import asyncio
import base64
import os
from pathlib import Path

try:
    import socks
    _SOCKS = True
except ImportError:
    _SOCKS = False

from telethon import TelegramClient

API_ID   = int(os.getenv("TELEGRAM_API_ID",   "0"))
API_HASH = os.getenv("TELEGRAM_API_HASH",     "")
SESSION  = str(Path(__file__).parent / "data" / "kb_fetcher")

SOCKS5_HOST = os.getenv("SOCKS5_HOST", "")
SOCKS5_PORT = int(os.getenv("SOCKS5_PORT", "18001"))
SOCKS5_USER = os.getenv("SOCKS5_USER", "")
SOCKS5_PASS = os.getenv("SOCKS5_PASS", "")


async def main():
    Path(SESSION).parent.mkdir(parents=True, exist_ok=True)

    proxy = None
    if _SOCKS and SOCKS5_HOST:
        proxy = (socks.SOCKS5, SOCKS5_HOST, SOCKS5_PORT, True, SOCKS5_USER, SOCKS5_PASS)
        print(f"Используем прокси {SOCKS5_HOST}:{SOCKS5_PORT}")

    async with TelegramClient(SESSION, API_ID, API_HASH, proxy=proxy) as client:
        me = await client.get_me()
        print(f"✓ Авторизован как: {me.first_name} (@{me.username})")

    session_file = Path(SESSION + ".session")
    b64 = base64.b64encode(session_file.read_bytes()).decode()

    print("\n" + "=" * 60)
    print("Добавьте в GitHub Secrets как KB_TG_SESSION_B64:")
    print("=" * 60)
    print(b64)
    print("=" * 60)
    print("\nPath: Settings → Secrets → Actions → New repository secret")


if __name__ == "__main__":
    asyncio.run(main())
