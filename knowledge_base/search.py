"""Поиск по базе знаний — интерфейс для бота.

    from knowledge_base.search import search_kb_async
    ctx = await search_kb_async("как работает LoRA fine-tuning?")
"""
import asyncio
import logging

from .db import search_by_embedding, search_by_keyword, count_posts
from .yandex_embed import embed_query

logger = logging.getLogger(__name__)

_HEADER = (
    "📚 [Контекст из базы знаний AIGrowth — последние новости об ИИ из @oqode]\n"
    "{items}\n[Конец контекста]\n"
)
_ITEM = "• {date} — {text}"


def _fmt(results: list[dict]) -> str:
    if not results:
        return ""
    items = "\n".join(_ITEM.format(date=r["date"], text=r["text"][:400]) for r in results)
    return _HEADER.format(items=items)


def search_kb_sync(query: str) -> str:
    if count_posts() == 0:
        return ""
    emb = embed_query(query)
    if emb:
        results = search_by_embedding(emb)
        if results:
            return _fmt(results)
    try:
        return _fmt(search_by_keyword(query))
    except Exception as e:
        logger.debug("FTS fallback failed: %s", e)
        return ""


async def search_kb_async(query: str) -> str:
    """Async-обёртка — не блокирует event loop бота."""
    return await asyncio.to_thread(search_kb_sync, query)


# Алиас
search_kb = search_kb_async
