"""Загрузка постов из Telegram-каналов через Telethon.

Запуск:  python -m knowledge_base.fetch_oqode   (из корня RiseCoreFlow)
"""
import asyncio
import logging
from datetime import timezone

from telethon import TelegramClient

try:
    import socks
    _SOCKS_OK = True
except ImportError:
    _SOCKS_OK = False

from .config import (
    TG_API_ID, TG_API_HASH, TG_SESSION,
    SOCKS5_HOST, SOCKS5_PORT, SOCKS5_USER, SOCKS5_PASS,
    CHANNELS, FETCH_LIMIT, MIN_POST_LEN,
)
from .db import upsert_post, max_post_id

logger = logging.getLogger(__name__)


def _make_client() -> TelegramClient:
    # Прокси только если задан хост (локально) и pysocks установлен
    proxy = None
    if _SOCKS_OK and SOCKS5_HOST:
        proxy = (socks.SOCKS5, SOCKS5_HOST, SOCKS5_PORT, True, SOCKS5_USER, SOCKS5_PASS)
        logger.info("Using SOCKS5 proxy %s:%d", SOCKS5_HOST, SOCKS5_PORT)
    else:
        logger.info("Direct Telegram connection (no proxy)")
    return TelegramClient(TG_SESSION, TG_API_ID, TG_API_HASH, proxy=proxy)


async def fetch_channel(channel: str, client: TelegramClient) -> int:
    since_id = max_post_id(channel)
    logger.info("Fetching @%s (since id=%d) …", channel, since_id)
    try:
        entity = await client.get_entity(channel)
    except Exception as e:
        logger.error("Cannot resolve @%s: %s", channel, e)
        return 0

    new_count = 0
    async for msg in client.iter_messages(entity, limit=FETCH_LIMIT,
                                           min_id=since_id, reverse=True):
        text = (msg.text or "").strip()
        if len(text) < MIN_POST_LEN:
            continue
        date_str = msg.date.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
        if upsert_post(msg.id, channel, date_str, text,
                       f"https://t.me/{channel}/{msg.id}", None):
            new_count += 1

    logger.info("@%s: %d new posts", channel, new_count)
    return new_count


async def fetch_all() -> dict[str, int]:
    async with _make_client() as client:
        return {ch: await fetch_channel(ch, client) for ch in CHANNELS}


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    print(asyncio.run(fetch_all()))
