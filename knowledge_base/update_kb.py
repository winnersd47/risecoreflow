"""Полный цикл обновления: fetch → embed → store.

Запуск:  python -m knowledge_base.update_kb   (из корня RiseCoreFlow)
"""
import asyncio
import logging
import time

from .db import count_posts, posts_without_embeddings, update_embedding
from .fetch_oqode import fetch_all
from .yandex_embed import embed_document
from .config import EMBED_BATCH, EMBED_PAUSE

logger = logging.getLogger(__name__)


async def update() -> None:
    start = time.monotonic()

    logger.info("=== Шаг 1: загрузка постов ===")
    try:
        fetch_results = await fetch_all()
        total_new = sum(fetch_results.values())
        for ch, n in fetch_results.items():
            logger.info("  @%s: %d новых постов", ch, n)
    except Exception as e:
        logger.error("Ошибка загрузки: %s", e)
        total_new = 0

    logger.info("=== Шаг 2: эмбеддинги ===")
    pending = posts_without_embeddings(limit=EMBED_BATCH)
    embedded = failed = 0
    for post in pending:
        emb = embed_document(post["text"])
        if emb:
            update_embedding(post["id"], emb)
            embedded += 1
        else:
            failed += 1
        time.sleep(EMBED_PAUSE)

    elapsed = round(time.monotonic() - start, 1)
    total = count_posts()
    still_pending = len(posts_without_embeddings(limit=1))

    logger.info(
        "=== Готово за %.1fs ===\n"
        "  Всего в базе:  %d постов\n"
        "  Новых:         %d\n"
        "  Эмбеддингов:   +%d (ошибок: %d)\n"
        "  Без эмбед:     %d",
        elapsed, total, total_new, embedded, failed, still_pending,
    )

    # Возвращаем код выхода != 0 если ничего не обновилось (для CI dry-run детекта)
    return total_new + embedded


if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s — %(message)s",
        datefmt="%H:%M:%S",
    )
    asyncio.run(update())
