"""Настройки knowledge base. Переменные среды перекрывают дефолты."""
import os
from pathlib import Path

# ── Пути ──────────────────────────────────────────────────────────────────────
KB_DIR    = Path(__file__).parent / "data"
KB_DIR.mkdir(exist_ok=True)

DB_PATH    = KB_DIR / "knowledge.db"
TG_SESSION = str(KB_DIR / "kb_fetcher")   # путь к .session-файлу Telethon

# ── Telegram API ───────────────────────────────────────────────────────────────
TG_API_ID   = int(os.getenv("TELEGRAM_API_ID",   "0"))
TG_API_HASH = os.getenv("TELEGRAM_API_HASH",     "")

# ── SOCKS5 прокси (корпоративная сеть; пусто = прямое подключение из CI) ──────
SOCKS5_HOST = os.getenv("SOCKS5_HOST", "")   # локально задать в .env
SOCKS5_PORT = int(os.getenv("SOCKS5_PORT", "18001"))
SOCKS5_USER = os.getenv("SOCKS5_USER", "")
SOCKS5_PASS = os.getenv("SOCKS5_PASS", "")

# ── Yandex Embeddings ─────────────────────────────────────────────────────────
YANDEX_API_KEY   = os.getenv("YANDEX_API_KEY",   "")   # обязателен — задать в .env / GitHub Secret
YANDEX_FOLDER_ID = os.getenv("YANDEX_FOLDER_ID", "")
YANDEX_DOC_MODEL = f"emb://{YANDEX_FOLDER_ID}/text-search-doc/latest"
YANDEX_QRY_MODEL = f"emb://{YANDEX_FOLDER_ID}/text-search-query/latest"

SKIP_SSL_VERIFY = os.getenv("SKIP_SSL_VERIFY", "true").lower() == "true"

# ── Источники ─────────────────────────────────────────────────────────────────
CHANNELS = ["oqode"]   # Нейросетевые покои — главный источник

# ── Параметры поиска ──────────────────────────────────────────────────────────
FETCH_LIMIT  = 500    # постов при первом запуске
TOP_K        = 4      # результатов поиска
MIN_POST_LEN = 60     # символов (короче = спам/кнопки)
MIN_SCORE    = 0.72   # порог косинусной схожести
EMBED_BATCH  = 100    # эмбеддингов за запуск (Yandex rate limit)
EMBED_PAUSE  = 0.12   # сек между запросами к Yandex (≈8 RPS)
