"""AIGrowth Unified Telegram Bot — manages OmniMindFlow + WinExtraFlow.

One bot (@AIgrowthsbot) publishes to all channels:
- OmniMindFlow: Profiles channel + VIP channel
- WinExtraFlow: Signals channel + VIP channel
- Shared: AI Growth Club (auto-forward by #repost #aigc)

User-facing features (Syntx AI mechanics):
- Token/credit economy (5 free credits on signup)
- Referral program (deep links, +5 new user, +10 referrer on first AI call)
- Inline keyboard navigation (main menu → project → actions)
- AI chat per project (/ask omf|wef question) — credited only on success
- Balance display (/balance, /ref)
- Onboarding flow (/start with optional ref deep link)

Admin commands (require ADMIN_IDS in .env):
  /omf {day}    — publish OmniMindFlow post
  /wef {day}    — publish WinExtraFlow post
  /omf_schedule / /wef_schedule — content plans
  /custom {project} {text} — publish custom text
  /test         — test all channels
  /market       — BTC + Fear & Greed
  /funnel       — list scheduled funnel steps from RiseCoreFlow DB
  /channels     — list channel IDs
  /help         — admin: command list; user: available commands

Usage: python bot.py
"""

import json
import os
import logging
import secrets
import sqlite3
import time
from pathlib import Path

from dotenv import load_dotenv
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, LabeledPrice
from telegram.ext import (
    Application, CommandHandler, MessageHandler,
    CallbackQueryHandler, PreCheckoutQueryHandler, ContextTypes, filters,
)

load_dotenv()
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

# ── Core config ────────────────────────────────────────────────────────────────
BOT_TOKEN = os.getenv("BOT_TOKEN", "")
DB_PATH = Path(__file__).parent.parent / "dev.db"
SCHEDULER_INTERVAL = int(os.getenv("SCHEDULER_INTERVAL", "60"))

# ADMIN_IDS: comma-separated Telegram user IDs allowed to use publishing commands.
# If empty — admin commands are open to all (backward-compat, logs a warning at startup).
ADMIN_IDS: set[int] = set(
    int(x.strip()) for x in os.getenv("ADMIN_IDS", "").split(",") if x.strip().isdigit()
)

# SSL: set SKIP_SSL_VERIFY=true in .env only on a corporate DPI network.
# Disables cert validation — carry this risk consciously.
SKIP_SSL_VERIFY = os.getenv("SKIP_SSL_VERIFY", "false").lower() in ("1", "true", "yes")

# OmniMindFlow channels
OMF_PROFILES = int(os.getenv("OMF_CHANNEL_PROFILES_ID", "0"))
OMF_VIP = int(os.getenv("OMF_CHANNEL_VIP_ID", "0"))

# WinExtraFlow channels
WEF_SIGNALS = int(os.getenv("WEF_CHANNEL_SIGNALS_ID", "0"))
WEF_VIP = int(os.getenv("WEF_CHANNEL_VIP_ID", "0"))

# Shared
AIGC_GROUP = int(os.getenv("GROUP_AIGC_ID", "0"))
FORWARD_TAGS = [t.strip().lower() for t in os.getenv("FORWARD_TAGS", "#repost,#aigc").split(",")]

# Economy
CREDITS_SIGNUP = 5
CREDITS_REF_BONUS = 5    # new user gets +5 when joining via referral
CREDITS_REF_REWARD = 10  # referrer gets +10 on referred user's first successful AI call

# YooKassa payment token (from @BotFather → Payments → YooKassa)
YOOKASSA_PAYMENT_TOKEN = os.getenv("YOOKASSA_PAYMENT_TOKEN", "")

# Credit packages: (label, credits, price_rub, description)
CREDIT_PACKAGES = [
    ("pack_50",  50,  99,  "50 кредитов"),
    ("pack_200", 200, 299, "200 кредитов — выгоднее на 25%"),
    ("pack_500", 500, 599, "500 кредитов — выгоднее на 40%"),
]

# Module-level bot username cache — filled once in main()
_BOT_USERNAME: str = ""


# ═══ OMNIMINDFLOW CONTENT (Wave 1) ═══════════════════════════════════════════
OMF_WAVE = {
    1: "We counted.\n\nThe average professional spends 2.5 hours a day on routine they could have stopped doing long ago.\n\nWe created OmniMindFlow -- an AI operating system for people tired of working for their tools instead of having tools work for them.\n\nNot another task manager. Not another AI chat.\n\nA work OS -- tailored to your profession.\n\nSubscribe. First content in 2 days.\n\nWhat's your profession? Comment below.\n\n-> omnimindflow.com\n\n#repost #aigc #omnimindflow",
    3: "Code review takes 1.5 hours/day for the average developer.\n\nWhat OmniMindFlow AI does in 30 seconds:\n\n- Reads diff, highlights risks\n- Checks code style compliance\n- Finds potential bugs by patterns\n- Drafts PR comments\n- Suggests branch names\n\nYou keep the human judgment.\nDelegate the rest.\n\nTry Developer profile free 7 days ->\nomnimindflow.com/profile/developer\n\n#repost #aigc #omnimindflow",
    5: "Quick question:\n\nHow much time do you spend daily on routine -- status updates, switching tools, manual info gathering?\n\n- Under 30 min\n- 30-60 min\n- 1-2 hours\n- 2+ hours\n\nResults in 2 days.\n\n#repost #aigc",
    7: "A typical founder's day:\n\n08:30 standup\n10:00 investor call\n11:30 bug triage\n13:00 sales\n15:00 1:1 with CTO\n16:30 pitch deck fixes\n18:00 board update\n20:00 metrics nobody checked\n\nBetween this -- 47 Slack messages.\n\nThe problem isn't time management.\nThe problem is no operating system.\n\nFounder OS in OmniMindFlow:\nOne place. Every morning.\n\n-> omnimindflow.com\n\n#repost #aigc #omnimindflow",
    9: "Roadmap lies.\n\nNot because the PM plans badly.\nBecause roadmaps are built on assumptions that reality constantly disproves.\n\nIn OmniMindFlow, the PM profile is built on hypotheses, not wishful thinking:\n\n- Each roadmap item = hypothesis with metric\n- Tasks module shows real team velocity\n- AI updates forecast based on facts\n\nTry PM profile free ->\nomnimindflow.com/profile/product-manager\n\n#repost #aigc #omnimindflow",
    12: "Poll results: you spend on routine\n\n73% of you spend more than 1 hour daily.\n\nWhat eats this time:\n1. Gathering status from sources -- 35 min\n2. Writing updates manually -- 25 min\n3. Switching between tools -- 20 min\n4. Searching for info -- 18 min\n\nTotal: 98 minutes. Every day.\n\nAll of this is automatable. Fully.\n\n#repost #aigc #omnimindflow",
    14: "Founder OS: what a work morning looks like\n\n06:45. Open OmniMindFlow.\n\nFlow Score: 74\n2 critical alerts\n18 new messages, 3 need response now\n4 meetings, first in 2 hours\n7 tasks today\n\nAI brief: 'Team closed 12 tasks yesterday. Blocker from Anton needs your decision. Investor wrote at 23:00 -- neutral tone. Recommend reply before noon.'\n\n3 decisions made before first coffee.\n\n-> omnimindflow.com\n\n#repost #aigc #omnimindflow",
    28: "Last month:\n- Platform launched\n- Most popular profiles: Developer, PM, Founder\n\nToday is the last day for 7 free days with no limits.\n\nFull access to your profile.\nAll modules, AI assistant, quests, analytics.\n\nAfter -- from $19/month.\nNow -- free.\n\n-> omnimindflow.com\n\n#repost #aigc #omnimindflow",
}


# ═══ WINEXTRAFLOW CONTENT (Wave 1) ═══════════════════════════════════════════
WEF_WAVE = {
    1: "We counted.\n\nThe average trader checks 5-7 Telegram channels, 3 analytics sites and 2 exchanges every morning.\n\nThat's 40+ minutes before the first trade.\n\nWe created WinExtraFlow -- an AI platform for trading signals.\n\n150+ AI components analyze 9 factors and give one WEF Score: 0 to 100.\n\nBuy or not -- you decide.\nBut now you have data, not intuition.\n\nSubscribe. What do you trade? MOEX, crypto or forex?\n\n-> winextraflow.com\n\n#repost #aigc #winextraflow",
    3: "You got a signal: BUY BTCUSDT.\n\nWhat WinExtraFlow does in 2 seconds:\n\n- Checks provider: win rate 72%, Sharpe 1.8\n- Calculates Risk/Reward: 1:2.3\n- Detects market regime: uptrend\n- Spam filter check\n- Outputs TP1/TP2/TP3 + SL + position size\n\nResult: WEF Score 87%\nStrong signal.\n\nTry free -> winextraflow.com\nPromo AIGROWTH14 -- 14 days Premium.\n\n#repost #aigc #winextraflow",
    5: "Quick question:\n\nHow do you evaluate signals before entering a trade?\n\n- Chart + RSI/MACD\n- Trust the channel\n- AI/bot\n- Gut feeling\n\nResults in 2 days.\n\n#repost #aigc",
    7: "Typical MOEX investor morning:\n\n09:00 terminal\n09:30 check 3 Telegram channels\n10:20 is the market up or down?\n10:40 wait until lunch\n14:00 market already moved.\n\nIn WinExtraFlow -- one page:\n- Market regime + 27 tickers live\n- AI rating per signal\n- Heatmap by sector\n\n5 minutes instead of 2 hours.\n\n-> winextraflow.com\n\n#repost #aigc #winextraflow",
    9: "\"I can't trade. But I want to earn.\"\n\nCopy trading:\n\n1. Pick provider by WEF Score\n2. Connect exchange (9 exchanges)\n3. System copies trades automatically\n\n77 strategies. 50 MT5 advisors. 16 TradingView.\n\nStart free -> winextraflow.com\n\n#repost #aigc #winextraflow",
    12: "WEF Score checks 9 factors:\n\n1. Risk Management\n2. Risk/Reward Ratio\n3. Provider History\n4. Signal Frequency\n5. Sharpe Ratio\n6. Profit Factor\n7. Max Drawdown\n8. Time Decay\n9. Signal Completeness\n\n200 AI components. 99 sources. 2 seconds.\n\nPromo AIGROWTH14 -- 14 days free.\n-> winextraflow.com\n\nNot investment advice.\n\n#repost #aigc #winextraflow",
    14: "Trader morning with WinExtraFlow:\n\nBUY SBER 312.50 | WEF 87% | TP 340 SL 298\nBUY BTCUSDT 67,200 | WEF 74%\nSELL EURUSD 1.0892 | WEF 62%\n\nMOEX: Uptrend (78%)\nCrypto: Ranging (64%)\n\nAI: \"14 SBER signals in 30 days. Win Rate: 72%. Strong bullish bias.\"\n\n-> winextraflow.com\n\n#repost #aigc #winextraflow",
    28: "This month:\n- 1,284 signals with AI rating\n- 77 strategies\n- 200 AI components from 99 sources\n\nLast day of AIGROWTH14.\n14 days Premium free.\n\nFrom 1,490 RUB/mo ($16 Pro) or 2,990 RUB/mo ($33 Premium).\nNow -- free.\n\n-> winextraflow.com\n\nPayment: RU cards (SBP 0.7%) / Visa-MC USD/EUR / crypto (USDT 0.4%)\n\nNot investment advice.\n\n#repost #aigc #winextraflow",
}


# ═══ USER ECONOMY ═════════════════════════════════════════════════════════════

def _ensure_tables():
    with sqlite3.connect(DB_PATH) as db:
        db.execute("""
            CREATE TABLE IF NOT EXISTS BotUser (
                id            TEXT PRIMARY KEY,
                username      TEXT,
                full_name     TEXT,
                credits       INTEGER DEFAULT 5,
                ref_code      TEXT UNIQUE,
                referred_by   TEXT,
                joined_at     TEXT,
                last_active   TEXT,
                first_ai_done INTEGER DEFAULT 0
            )
        """)
        db.execute("""
            CREATE TABLE IF NOT EXISTS AiLog (
                id              TEXT PRIMARY KEY,
                user_id         TEXT NOT NULL,
                project         TEXT NOT NULL,
                question        TEXT NOT NULL,
                backend         TEXT,
                success         INTEGER DEFAULT 0,
                providers_tried TEXT DEFAULT '[]',
                first_error     TEXT,
                created_at      TEXT NOT NULL
            )
        """)
        # Migrate existing AiLog table (idempotent)
        for col, col_def in [("providers_tried", "TEXT DEFAULT '[]'"), ("first_error", "TEXT")]:
            try:
                db.execute(f"ALTER TABLE AiLog ADD COLUMN {col} {col_def}")
            except sqlite3.OperationalError:
                pass  # column already exists
        db.execute("""
            CREATE TABLE IF NOT EXISTS SendLog (
                id          TEXT PRIMARY KEY,
                projectId   TEXT NOT NULL,
                stepId      TEXT,
                chatId      TEXT NOT NULL,
                chatLabel   TEXT,
                textPreview TEXT,
                messageId   INTEGER,
                sentAt      TEXT NOT NULL
            )
        """)
        db.commit()
    logger.info("DB tables ready: BotUser, AiLog, SendLog")


def _new_id() -> str:
    return "c" + secrets.token_hex(16)[:23]


def _generate_ref_code() -> str:
    # "R" + 8 uppercase hex chars → 4-billion possible values, near-zero collision chance
    return "R" + secrets.token_hex(4).upper()


def _get_user(user_id: int) -> dict | None:
    try:
        with sqlite3.connect(DB_PATH) as db:
            row = db.execute(
                "SELECT id, username, full_name, credits, ref_code, referred_by, first_ai_done "
                "FROM BotUser WHERE id=?",
                (str(user_id),),
            ).fetchone()
        if row:
            return {
                "id": row[0], "username": row[1], "full_name": row[2],
                "credits": row[3], "ref_code": row[4],
                "referred_by": row[5], "first_ai_done": row[6],
            }
    except Exception as e:
        logger.error("_get_user error: %s", e)
    return None


def _register_user(user_id: int, username: str, full_name: str,
                   referred_by: str | None = None) -> dict | None:
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc).isoformat()
    credits = CREDITS_SIGNUP + (CREDITS_REF_BONUS if referred_by else 0)

    for _ in range(5):  # retry if generated ref_code happens to collide
        ref_code = _generate_ref_code()
        try:
            with sqlite3.connect(DB_PATH) as db:
                # Check if already registered (idempotent)
                if db.execute("SELECT 1 FROM BotUser WHERE id=?", (str(user_id),)).fetchone():
                    return _get_user(user_id)
                # Check if generated code is already taken
                if db.execute("SELECT 1 FROM BotUser WHERE ref_code=?", (ref_code,)).fetchone():
                    continue
                db.execute(
                    """INSERT INTO BotUser
                       (id, username, full_name, credits, ref_code, referred_by,
                        joined_at, last_active, first_ai_done)
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)""",
                    (str(user_id), username or "", full_name or "",
                     credits, ref_code, referred_by, now, now),
                )
                db.commit()
            return _get_user(user_id)
        except sqlite3.IntegrityError:
            continue
        except Exception as e:
            logger.error("_register_user error: %s", e)
            return None

    logger.error("_register_user: exhausted retries for user %s", user_id)
    return None


def _ensure_user(user, referred_by: str | None = None) -> dict:
    """Get or auto-register a Telegram user. referred_by is only applied on first registration."""
    data = _get_user(user.id)
    if not data:
        full_name = f"{user.first_name or ''} {user.last_name or ''}".strip()
        data = _register_user(user.id, user.username or "", full_name, referred_by)
    else:
        _touch_active(user.id)
    return data or {"credits": 0, "ref_code": "?", "referred_by": None, "first_ai_done": 0}


def _touch_active(user_id: int):
    from datetime import datetime, timezone
    try:
        with sqlite3.connect(DB_PATH) as db:
            db.execute(
                "UPDATE BotUser SET last_active=? WHERE id=?",
                (datetime.now(timezone.utc).isoformat(), str(user_id)),
            )
            db.commit()
    except Exception:
        pass


def _spend_credit(user_id: int) -> bool:
    try:
        with sqlite3.connect(DB_PATH) as db:
            cur = db.execute(
                "UPDATE BotUser SET credits=credits-1 WHERE id=? AND credits>0",
                (str(user_id),),
            )
            db.commit()
        return cur.rowcount > 0
    except Exception as e:
        logger.error("_spend_credit error: %s", e)
        return False


def _give_referral_reward(user_id: int) -> str | None:
    """Mark user's first AI call done and credit their referrer. Single atomic transaction."""
    try:
        with sqlite3.connect(DB_PATH) as db:
            row = db.execute(
                "SELECT referred_by, first_ai_done FROM BotUser WHERE id=?",
                (str(user_id),),
            ).fetchone()
            if not row or row[1]:  # already done or user not found
                return None

            referrer_ref_code = row[0]
            # Atomic guard: only one concurrent request wins the reward
            cur = db.execute(
                "UPDATE BotUser SET first_ai_done=1 WHERE id=? AND first_ai_done=0",
                (str(user_id),),
            )
            if cur.rowcount == 0:
                db.commit()
                return None  # another concurrent /ask already claimed it

            if not referrer_ref_code:
                db.commit()
                return None

            ref_row = db.execute(
                "SELECT id FROM BotUser WHERE ref_code=?", (referrer_ref_code,)
            ).fetchone()

            if ref_row:
                referrer_id = ref_row[0]
                if referrer_id == str(user_id):  # self-referral guard
                    db.commit()
                    return None
                db.execute(
                    "UPDATE BotUser SET credits=credits+? WHERE id=?",
                    (CREDITS_REF_REWARD, referrer_id),
                )
                db.commit()
                return referrer_id

            db.commit()
    except Exception as e:
        logger.error("_give_referral_reward error: %s", e)
    return None


def _log_ai(user_id: int, project: str, question: str, backend: str, success: bool,
            attempts: list | None = None):
    from datetime import datetime, timezone
    first_error = None
    if attempts:
        errors = [a["error"] for a in attempts if a.get("error")]
        first_error = errors[0] if errors else None
    try:
        with sqlite3.connect(DB_PATH) as db:
            db.execute(
                "INSERT INTO AiLog (id, user_id, project, question, backend, success, "
                "providers_tried, first_error, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (_new_id(), str(user_id), project, question[:500], backend, int(success),
                 json.dumps(attempts or [], ensure_ascii=False),
                 first_error, datetime.now(timezone.utc).isoformat()),
            )
            db.commit()
    except Exception as e:
        logger.error("_log_ai error: %s", e)


# ═══ ADMIN GUARD ══════════════════════════════════════════════════════════════

async def _require_admin(update: Update) -> bool:
    """Return True if user is allowed to run admin commands."""
    if not ADMIN_IDS:
        # Not configured — open access with a log warning
        logger.warning("Admin command by %s (ADMIN_IDS not set)", update.effective_user.id)
        return True
    if update.effective_user.id in ADMIN_IDS:
        return True
    await update.message.reply_text("⛔ Нет доступа.")
    return False


# ═══ BOT USERNAME CACHE ═══════════════════════════════════════════════════════

async def _bot_username(bot) -> str:
    global _BOT_USERNAME
    if not _BOT_USERNAME:
        me = await bot.get_me()
        _BOT_USERNAME = me.username
    return _BOT_USERNAME


def _ref_link(ref_code: str) -> str:
    return f"https://t.me/{_BOT_USERNAME}?start={ref_code}" if _BOT_USERNAME else f"(запусти бота, код: {ref_code})"


# ═══ AI BACKEND ══════════════════════════════════════════════════════════════

_AI_CONTEXTS = {
    "omf": (
        "Ты AI-ассистент OmniMindFlow — платформы для оптимизации рабочих процессов с помощью AI. "
        "Отвечай кратко и по делу, на русском языке. "
        "Фокус: автоматизация, workflow, AI OS для разработчиков, PM-ов и основателей стартапов."
    ),
    "wef": (
        "Ты AI-ассистент WinExtraFlow — платформы для AI-оценки торговых сигналов. "
        "Отвечай кратко и по делу, на русском языке. "
        "Фокус: WEF Score, риск-менеджмент, copy trading, оценка сигналов. "
        "Не давай конкретных торговых рекомендаций — это не инвестиционный совет."
    ),
    "aef": (
        "Ты AI-ассистент AutoEvoFlow — платформы для владельцев автопарков и автовладельцев. "
        "Отвечай кратко и по делу, на русском языке. "
        "Фокус: снижение затрат на обслуживание, умная аналитика парка, автоматизация техобслуживания."
    ),
}

_AI_FALLBACK = "Извини, AI-движок временно недоступен. Попробуй позже."

# Keywords that trigger live market data injection for WEF questions
_MARKET_KEYWORDS = frozenset([
    "рынок", "рынке", "рынка", "btc", "биткоин", "страх", "жадность",
    "fear", "greed", "сигнал", "сейчас", "сегодня", "покупать", "продавать",
    "цена", "курс", "памп", "дамп", "pump", "dump", "bull", "bear",
    "бычий", "медвежий", "тренд", "движение",
])


def _detect_market_intent(question: str) -> bool:
    q = question.lower()
    return any(kw in q for kw in _MARKET_KEYWORDS)


async def _fetch_market_snapshot() -> str | None:
    """Returns a compact market context string to prepend to WEF questions, or None on failure."""
    import httpx
    try:
        async with httpx.AsyncClient(timeout=8, verify=not SKIP_SSL_VERIFY) as c:
            fg = (await c.get("https://api.alternative.me/fng/?limit=1")).json()
            btc = (await c.get(
                "https://api.coingecko.com/api/v3/simple/price"
                "?ids=bitcoin&vs_currencies=usd&include_24hr_change=true"
            )).json()
        fg_val = fg["data"][0]["value"]
        fg_label = fg["data"][0]["value_classification"]
        btc_price = btc["bitcoin"]["usd"]
        btc_change = round(btc["bitcoin"]["usd_24h_change"], 1)
        return (
            f"[РЫНОЧНЫЕ ДАННЫЕ: Fear&Greed={fg_val} ({fg_label}), "
            f"BTC=${btc_price:,.0f} ({btc_change:+.1f}% за 24ч). "
            f"Используй эти данные в ответе если уместно.]"
        )
    except Exception as e:
        logger.warning("_fetch_market_snapshot: %s", e)
        return None


async def _ask_ai(question: str, project: str = "omf") -> tuple[str, str, bool, list]:
    """Returns (answer, backend_name, is_success, attempts).

    attempts — list of {provider, latency_ms, error} for observability.
    Credits are charged only when is_success=True.
    """
    import httpx
    attempts: list[dict] = []
    system = _AI_CONTEXTS.get(project, _AI_CONTEXTS["omf"])
    ssl = not SKIP_SSL_VERIFY

    # 1. Anthropic Claude (preferred)
    api_key = os.getenv("ANTHROPIC_API_KEY", "")
    if api_key:
        t0 = time.monotonic()
        try:
            async with httpx.AsyncClient(timeout=30, verify=ssl) as c:
                r = await c.post(
                    "https://api.anthropic.com/v1/messages",
                    headers={
                        "x-api-key": api_key,
                        "anthropic-version": "2023-06-01",
                        "content-type": "application/json; charset=utf-8",
                    },
                    content=json.dumps({
                        "model": "claude-haiku-4-5-20251001",
                        "max_tokens": 512,
                        "system": system,
                        "messages": [{"role": "user", "content": question}],
                    }).encode("utf-8"),
                )
            data = r.json()
            latency = round((time.monotonic() - t0) * 1000)
            if data.get("content"):
                attempts.append({"provider": "anthropic", "latency_ms": latency, "error": None})
                return data["content"][0]["text"], "anthropic", True, attempts
            attempts.append({"provider": "anthropic", "latency_ms": latency,
                             "error": f"no content: {str(data)[:120]}"})
        except Exception as e:
            latency = round((time.monotonic() - t0) * 1000)
            attempts.append({"provider": "anthropic", "latency_ms": latency, "error": str(e)[:200]})
            logger.warning("Anthropic AI: %s", e)

    # 2. YandexGPT
    ya_key = os.getenv("YANDEX_API_KEY", "")
    ya_folder = os.getenv("YANDEX_FOLDER_ID", "")
    if ya_key and ya_folder:
        t0 = time.monotonic()
        try:
            async with httpx.AsyncClient(timeout=30, verify=ssl) as c:
                r = await c.post(
                    "https://llm.api.cloud.yandex.net/foundationModels/v1/completion",
                    headers={
                        "Authorization": f"Api-Key {ya_key}",
                        "Content-Type": "application/json; charset=utf-8",
                    },
                    content=json.dumps({
                        "modelUri": f"gpt://{ya_folder}/yandexgpt-lite/latest",
                        "completionOptions": {"stream": False, "temperature": 0.6, "maxTokens": 512},
                        "messages": [
                            {"role": "system", "text": system},
                            {"role": "user", "text": question},
                        ],
                    }).encode("utf-8"),
                )
            data = r.json()
            latency = round((time.monotonic() - t0) * 1000)
            alts = data.get("result", {}).get("alternatives", [])
            if alts:
                attempts.append({"provider": "yandex", "latency_ms": latency, "error": None})
                return alts[0]["message"]["text"], "yandex", True, attempts
            attempts.append({"provider": "yandex", "latency_ms": latency,
                             "error": f"no alternatives: {str(data)[:120]}"})
        except Exception as e:
            latency = round((time.monotonic() - t0) * 1000)
            attempts.append({"provider": "yandex", "latency_ms": latency, "error": str(e)[:200]})
            logger.warning("YandexGPT: %s", e)

    # 3. Groq (free tier: 30 req/min, Llama-3.3-70B, ~200ms)
    groq_key = os.getenv("GROQ_API_KEY", "")
    if groq_key:
        t0 = time.monotonic()
        try:
            async with httpx.AsyncClient(timeout=30, verify=ssl) as c:
                r = await c.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={"Authorization": f"Bearer {groq_key}",
                             "Content-Type": "application/json"},
                    content=json.dumps({
                        "model": "llama-3.3-70b-versatile",
                        "messages": [
                            {"role": "system", "content": system},
                            {"role": "user", "content": question},
                        ],
                        "max_tokens": 512,
                    }).encode("utf-8"),
                )
            data = r.json()
            latency = round((time.monotonic() - t0) * 1000)
            choices = data.get("choices", [])
            if choices:
                attempts.append({"provider": "groq", "latency_ms": latency, "error": None})
                return choices[0]["message"]["content"], "groq", True, attempts
            attempts.append({"provider": "groq", "latency_ms": latency,
                             "error": f"no choices: {str(data)[:120]}"})
        except Exception as e:
            latency = round((time.monotonic() - t0) * 1000)
            attempts.append({"provider": "groq", "latency_ms": latency, "error": str(e)[:200]})
            logger.warning("Groq: %s", e)

    # 4. OpenRouter (free models: mistral-7b, phi-3, llama-3)
    or_key = os.getenv("OPENROUTER_API_KEY", "")
    if or_key:
        t0 = time.monotonic()
        try:
            async with httpx.AsyncClient(timeout=30, verify=ssl) as c:
                r = await c.post(
                    "https://openrouter.ai/api/v1/chat/completions",
                    headers={"Authorization": f"Bearer {or_key}",
                             "Content-Type": "application/json"},
                    content=json.dumps({
                        "model": "mistralai/mistral-7b-instruct:free",
                        "messages": [
                            {"role": "system", "content": system},
                            {"role": "user", "content": question},
                        ],
                        "max_tokens": 512,
                    }).encode("utf-8"),
                )
            data = r.json()
            latency = round((time.monotonic() - t0) * 1000)
            choices = data.get("choices", [])
            if choices:
                attempts.append({"provider": "openrouter", "latency_ms": latency, "error": None})
                return choices[0]["message"]["content"], "openrouter", True, attempts
            attempts.append({"provider": "openrouter", "latency_ms": latency,
                             "error": f"no choices: {str(data)[:120]}"})
        except Exception as e:
            latency = round((time.monotonic() - t0) * 1000)
            attempts.append({"provider": "openrouter", "latency_ms": latency, "error": str(e)[:200]})
            logger.warning("OpenRouter: %s", e)

    # 5. Gemini (requires valid AIza... key from aistudio.google.com)
    gemini_key = os.getenv("GEMINI_API_KEY", "")
    if gemini_key and gemini_key.startswith("AIza"):
        t0 = time.monotonic()
        try:
            async with httpx.AsyncClient(timeout=30, verify=ssl) as c:
                r = await c.post(
                    f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={gemini_key}",
                    content=json.dumps({
                        "system_instruction": {"parts": [{"text": system}]},
                        "contents": [{"parts": [{"text": question}]}],
                        "generationConfig": {"maxOutputTokens": 512},
                    }).encode("utf-8"),
                    headers={"Content-Type": "application/json"},
                )
            data = r.json()
            latency = round((time.monotonic() - t0) * 1000)
            candidates = data.get("candidates", [])
            if candidates:
                attempts.append({"provider": "gemini", "latency_ms": latency, "error": None})
                return candidates[0]["content"]["parts"][0]["text"], "gemini", True, attempts
            attempts.append({"provider": "gemini", "latency_ms": latency,
                             "error": f"no candidates: {str(data)[:120]}"})
        except Exception as e:
            latency = round((time.monotonic() - t0) * 1000)
            attempts.append({"provider": "gemini", "latency_ms": latency, "error": str(e)[:200]})
            logger.warning("Gemini: %s", e)

    return _AI_FALLBACK, "none", False, attempts


# ═══ INLINE KEYBOARDS ═════════════════════════════════════════════════════════

def _main_menu_kb() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup([
        [
            InlineKeyboardButton("🤖 OmniMindFlow", callback_data="menu:omf"),
            InlineKeyboardButton("📈 WinExtraFlow", callback_data="menu:wef"),
        ],
        [
            InlineKeyboardButton("🚗 AutoEvoFlow", callback_data="menu:aef"),
        ],
        [
            InlineKeyboardButton("💰 Мой баланс", callback_data="menu:balance"),
            InlineKeyboardButton("👥 Реферальная", callback_data="menu:ref"),
        ],
    ])


def _omf_menu_kb() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup([
        [
            InlineKeyboardButton("💬 Спросить AI", callback_data="ask:omf"),
            InlineKeyboardButton("📊 Workflow Tips", callback_data="tips:omf"),
        ],
        [
            InlineKeyboardButton("📅 Контент-план", callback_data="schedule:omf"),
            InlineKeyboardButton("◀️ Назад", callback_data="menu:main"),
        ],
    ])


def _wef_menu_kb() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup([
        [
            InlineKeyboardButton("💬 Спросить AI", callback_data="ask:wef"),
            InlineKeyboardButton("📉 Рынок", callback_data="market:wef"),
        ],
        [
            InlineKeyboardButton("📅 Контент-план", callback_data="schedule:wef"),
            InlineKeyboardButton("◀️ Назад", callback_data="menu:main"),
        ],
    ])


def _aef_menu_kb() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup([
        [InlineKeyboardButton("🔍 Найти потери в парке", callback_data="aef:funnel:start")],
        [
            InlineKeyboardButton("💬 Спросить AI", callback_data="ask:aef"),
            InlineKeyboardButton("📊 Статистика парка", callback_data="stats:aef"),
        ],
        [
            InlineKeyboardButton("◀️ Назад", callback_data="menu:main"),
        ],
    ])


def _buy_kb() -> InlineKeyboardMarkup:
    rows = []
    for pack_id, credits, price, label in CREDIT_PACKAGES:
        rows.append([InlineKeyboardButton(
            f"💳 {label} — {price}₽",
            callback_data=f"buy:{pack_id}",
        )])
    rows.append([InlineKeyboardButton("◀️ Назад", callback_data="menu:balance")])
    return InlineKeyboardMarkup(rows)


def _back_kb(target: str = "menu:main") -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup([[InlineKeyboardButton("◀️ Назад", callback_data=target)]])


# ─── AEF Funnel keyboards ─────────────────────────────────────────────────────

def _aef_role_kb() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup([
        [InlineKeyboardButton("👔 Владелец / директор", callback_data="aef:role:owner")],
        [InlineKeyboardButton("📋 Логист / менеджер",   callback_data="aef:role:logist")],
        [InlineKeyboardButton("🚗 Диспетчер",           callback_data="aef:role:dispatcher")],
        [InlineKeyboardButton("◀️ Назад",               callback_data="menu:aef")],
    ])


def _aef_size_kb() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup([
        [
            InlineKeyboardButton("1–5 машин",   callback_data="aef:size:small"),
            InlineKeyboardButton("6–20 машин",  callback_data="aef:size:mid"),
        ],
        [
            InlineKeyboardButton("21–50 машин", callback_data="aef:size:large"),
            InlineKeyboardButton("50+ машин",   callback_data="aef:size:xl"),
        ],
        [InlineKeyboardButton("◀️ Назад", callback_data="aef:funnel:start")],
    ])


def _aef_track_kb() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup([
        [InlineKeyboardButton("📊 Excel / Google Таблицы",     callback_data="aef:track:excel")],
        [InlineKeyboardButton("🗒️ По памяти / на бумаге",      callback_data="aef:track:memory")],
        [InlineKeyboardButton("💻 1С или другая программа",    callback_data="aef:track:1c")],
        [InlineKeyboardButton("🔧 Специальный сервис (WMS/TMS)", callback_data="aef:track:saas")],
        [InlineKeyboardButton("◀️ Назад", callback_data="aef:funnel:size")],
    ])


def _aef_after_audit_kb() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup([
        [InlineKeyboardButton("✅ Открыл, смотрю",  callback_data="aef:audit:got")],
        [InlineKeyboardButton("📌 Сохраню на потом", callback_data="aef:audit:later")],
        [InlineKeyboardButton("◀️ В меню",           callback_data="menu:aef")],
    ])


def _aef_book_kb() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup([
        [
            InlineKeyboardButton("🌅 Утро (9–12)",  callback_data="aef:time:morning"),
            InlineKeyboardButton("☀️ День (12–17)", callback_data="aef:time:day"),
        ],
        [InlineKeyboardButton("🌆 Вечер (17–20)", callback_data="aef:time:evening")],
        [InlineKeyboardButton("◀️ В меню", callback_data="menu:aef")],
    ])


# ═══ HELPER ═══════════════════════════════════════════════════════════════════

async def _publish(context, channel_id, text, forward_to_aigc=True):
    msg = await context.bot.send_message(chat_id=channel_id, text=text)
    result = f"sent (msg_id: {msg.message_id})"
    if forward_to_aigc and AIGC_GROUP and any(tag in text.lower() for tag in FORWARD_TAGS):
        try:
            await context.bot.forward_message(
                chat_id=AIGC_GROUP, from_chat_id=channel_id, message_id=msg.message_id
            )
            result += " + forwarded to AIGC"
        except Exception as e:
            result += f" (forward failed: {e})"
    return result


# ═══ USER COMMANDS ════════════════════════════════════════════════════════════

async def cmd_start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    print(f"CMD_START called by {update.effective_user.id}", flush=True)
    logger.info("CMD_START: user=%s", update.effective_user.id)
    user = update.effective_user
    referred_by = context.args[0] if context.args else None
    is_new = _get_user(user.id) is None
    user_data = _ensure_user(user, referred_by=referred_by if is_new else None)
    credits = user_data["credits"]

    if is_new:
        bonus_note = (
            f"\n\n🎁 <b>+{CREDITS_REF_BONUS} бонусных кредитов</b> за приглашение!"
            if referred_by else ""
        )
        text = (
            f"Привет, {user.first_name}! 👋\n\n"
            f"<b>AIGrowth Bot</b> — твой AI-помощник для:\n"
            f"• OmniMindFlow — AI OS для работы\n"
            f"• WinExtraFlow — анализ торговых сигналов\n\n"
            f"🎉 Тебе начислено <b>{credits} кредитов</b> — это бесплатные AI-запросы.{bonus_note}\n\n"
            f"Выбери проект:"
        )
    else:
        text = (
            f"С возвращением, {user.first_name}!\n\n"
            f"Кредиты: <b>{credits}</b>\n\n"
            f"Выбери проект:"
        )
    await update.message.reply_text(text, parse_mode="HTML", reply_markup=_main_menu_kb())


async def cmd_help(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user
    if ADMIN_IDS and user.id in ADMIN_IDS:
        await update.message.reply_text(
            "<b>Admin commands</b>\n\n"
            "/omf {day} — опубликовать OMF пост\n"
            "/wef {day} — опубликовать WEF пост\n"
            "/omf_schedule, /wef_schedule — планы контента\n"
            "/custom omf|wef {текст} — произвольный пост\n"
            "/test — тест всех каналов\n"
            "/channels — ID всех каналов\n"
            "/market — BTC + Fear & Greed\n"
            "/funnel — воронка из БД\n"
            "/stats_ai {days} — статистика AI-провайдеров\n\n"
            "<b>Пользовательские</b>\n"
            "/balance — кредиты\n"
            "/ref — реферальная ссылка\n"
            "/ask omf|wef {вопрос} — AI-чат\n"
            "/brand_plan — контент-план дня (личный бренд)",
            parse_mode="HTML",
        )
    else:
        await update.message.reply_text(
            "<b>Доступные команды</b>\n\n"
            "/balance — кредиты и реферальная ссылка\n"
            "/ref — реферальная ссылка\n"
            "/ask omf {вопрос} — AI-ассистент OmniMindFlow\n"
            "/ask wef {вопрос} — AI-ассистент WinExtraFlow\n\n"
            "Или нажми кнопку /start для меню.",
            parse_mode="HTML",
        )


async def cmd_balance(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user
    user_data = _ensure_user(user)
    ref_link = _ref_link(user_data["ref_code"])
    await update.message.reply_text(
        f"<b>Твой баланс</b>\n\n"
        f"Кредиты: <b>{user_data['credits']}</b>\n"
        f"1 кредит = 1 успешный AI-запрос\n\n"
        f"Пополнить: приглашай друзей\n\n"
        f"Реферальная ссылка:\n<code>{ref_link}</code>\n"
        f"(+{CREDITS_REF_BONUS} другу, +{CREDITS_REF_REWARD} тебе за его первый запрос)",
        parse_mode="HTML",
    )


async def cmd_ref(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user
    user_data = _ensure_user(user)
    ref_link = _ref_link(user_data["ref_code"])
    await update.message.reply_text(
        f"<b>Реферальная программа</b>\n\n"
        f"Твоя ссылка:\n<code>{ref_link}</code>\n\n"
        f"• Друг получает +{CREDITS_REF_BONUS} кредитов при старте\n"
        f"• Ты получаешь +{CREDITS_REF_REWARD} кредитов когда\n"
        f"  друг сделает первый AI-запрос\n\n"
        f"Код: <code>{user_data['ref_code']}</code>",
        parse_mode="HTML",
    )


async def cmd_aef(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Start AEF onboarding funnel — fleet audit lead magnet."""
    _ensure_user(update.effective_user)
    context.user_data.pop("aef_role", None)
    context.user_data.pop("aef_size", None)
    context.user_data.pop("aef_track", None)
    await update.message.reply_text(
        "🚛 <b>AutoEvoFlow — Аудит автопарка</b>\n\n"
        "Несколько быстрых вопросов — подберу нужный инструмент.\n\n"
        "Ваша роль в компании?",
        parse_mode="HTML",
        reply_markup=_aef_role_kb(),
    )


async def cmd_brand_plan(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Show current week's personal brand posting checklist."""
    from datetime import date
    DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"]
    PLAN = [
        ("Пн", "Кейс с цифрами (OmniMindFlow или WinExtraFlow)", "case_standup | case_routine_98 | case_wef_signal"),
        ("Вт", "Лайфхак / инструмент", "tip_morning_routine | tip_wef_score"),
        ("Ср", "Комментарии в 3 чужих каналах + ответы на свои", "— (без поста, работа с охватом)"),
        ("Чт", "Разбор мифа или личное мнение", "myth_ai_replace | myth_trading_bot | opinion_ai_tools"),
        ("Пт", "Закулисье / личное (20%)", "personal_behind_scenes | personal_failure | personal_how_i_use"),
        ("Сб", "FAQ или история", "faq_omf_start | faq_wef_providers | story_why_omf"),
        ("Вс", "Аналитика / серийный пост", "serial_mistake_1 | serial_mistake_2 | opinion_copy_trading"),
    ]
    today_idx = date.today().weekday()  # 0=Пн, 6=Вс
    lines = ["<b>📅 Контент-план недели (80/20)</b>\n"]
    for i, (day, task, keys) in enumerate(PLAN):
        marker = "▶" if i == today_idx else "•"
        bold_open = "<b>" if i == today_idx else ""
        bold_close = "</b>" if i == today_idx else ""
        lines.append(f"{marker} {bold_open}{day}: {task}{bold_close}")
    lines.append("")
    lines.append(f"<b>Сегодня ({DAYS[today_idx]}):</b>")
    day_name, task, keys = PLAN[today_idx]
    lines.append(f"Тип: {task}")
    lines.append(f"Готовые посты: <code>{keys}</code>")
    lines.append("")
    lines.append("Опубликовать пост:")
    lines.append("<code>python -X utf8 scripts/brand-posts.py publish next</code>")
    lines.append("")
    lines.append("Посмотреть план на неделю:")
    lines.append("<code>python -X utf8 scripts/brand-posts.py week</code>")
    lines.append("")
    lines.append("Формула: <b>80% экспертиза + 20% личное</b>")
    lines.append("KPI: 1 000+ охват на пост, +500 подписчиков/мес")
    await update.message.reply_text("\n".join(lines), parse_mode="HTML")


async def cmd_ask(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """AI chat. Credits are charged only on a successful AI response."""
    user = update.effective_user

    if not context.args or len(context.args) < 2:
        await update.message.reply_text(
            "<b>Использование:</b> /ask omf|wef {вопрос}\n\n"
            "Примеры:\n"
            "<code>/ask omf Как автоматизировать стендап?</code>\n"
            "<code>/ask wef Как читать WEF Score?</code>",
            parse_mode="HTML",
        )
        return

    project = context.args[0].lower()
    if project not in ("omf", "wef", "aef"):
        await update.message.reply_text("Проект должен быть omf, wef или aef")
        return

    question = " ".join(context.args[1:])
    user_data = _ensure_user(user)

    if user_data["credits"] <= 0:
        ref_link = _ref_link(user_data["ref_code"])
        await update.message.reply_text(
            "❌ <b>Нет кредитов</b>\n\n"
            "Пригласи друга и получи +10 кредитов:\n"
            f"<code>{ref_link}</code>",
            parse_mode="HTML",
        )
        return

    # Agentic WEF: inject live market data when question is about market state
    enriched_question = question
    if project == "wef" and _detect_market_intent(question):
        snapshot = await _fetch_market_snapshot()
        if snapshot:
            enriched_question = snapshot + "\n\n" + question

    await context.bot.send_chat_action(chat_id=update.effective_chat.id, action="typing")
    answer, backend, success, attempts = await _ask_ai(enriched_question, project)
    _log_ai(user.id, project, question, backend, success, attempts)

    if success:
        charged = _spend_credit(user.id)
        if not charged:
            # Another concurrent request already drained the last credit
            await update.message.reply_text(
                "❌ Кредиты закончились — другой запрос успел их потратить.",
                parse_mode="HTML",
            )
            return
        referrer_id = _give_referral_reward(user.id)
        # Read actual balance after deduction
        updated = _get_user(user.id)
        actual_credits = updated["credits"] if updated else user_data["credits"] - 1
        project_label = "OmniMindFlow" if project == "omf" else "WinExtraFlow"
        await update.message.reply_text(
            f"<b>{project_label} AI</b>\n\n{answer}\n\n"
            f"<i>Кредиты: {actual_credits}</i>",
            parse_mode="HTML",
        )
        if referrer_id:
            try:
                await context.bot.send_message(
                    chat_id=int(referrer_id),
                    text=(
                        f"🎉 Твой приглашённый сделал первый AI-запрос — "
                        f"тебе начислено +{CREDITS_REF_REWARD} кредитов!"
                    ),
                )
            except Exception:
                pass
    else:
        await update.message.reply_text(answer)


# ═══ INLINE CALLBACKS ═════════════════════════════════════════════════════════

async def callback_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()

    user = query.from_user
    data = query.data
    user_data = _ensure_user(user)
    credits = user_data["credits"]
    ref_code = user_data["ref_code"]

    if data == "menu:main":
        await query.edit_message_text(
            f"Главное меню\n\nКредиты: <b>{credits}</b>",
            parse_mode="HTML",
            reply_markup=_main_menu_kb(),
        )

    elif data == "menu:omf":
        await query.edit_message_text(
            "<b>OmniMindFlow</b>\n\n"
            "AI OS для разработчиков, PM-ов и основателей.\n"
            "Автоматизируй рутину. Работай с 10× эффективностью.\n\n"
            f"Кредиты: <b>{credits}</b>",
            parse_mode="HTML",
            reply_markup=_omf_menu_kb(),
        )

    elif data == "menu:wef":
        await query.edit_message_text(
            "<b>WinExtraFlow</b>\n\n"
            "AI-платформа для оценки торговых сигналов.\n"
            "150+ AI компонентов, WEF Score 0–100.\n\n"
            f"Кредиты: <b>{credits}</b>",
            parse_mode="HTML",
            reply_markup=_wef_menu_kb(),
        )

    elif data == "menu:aef":
        await query.edit_message_text(
            "<b>AutoEvoFlow</b>\n\n"
            "AI для автовладельцев и автопарков.\n"
            "Прозрачные затраты, умная аналитика, автоматизация обслуживания.\n\n"
            f"Кредиты: <b>{credits}</b>",
            parse_mode="HTML",
            reply_markup=_aef_menu_kb(),
        )

    elif data == "menu:balance":
        ref_link = _ref_link(ref_code)
        buy_btn = InlineKeyboardButton("💳 Купить кредиты", callback_data="menu:buy")
        await query.edit_message_text(
            f"<b>Баланс</b>\n\n"
            f"Кредиты: <b>{credits}</b>\n"
            f"1 кредит = 1 успешный AI-запрос\n\n"
            f"Реферальная ссылка:\n<code>{ref_link}</code>\n"
            f"(+{CREDITS_REF_BONUS} другу, +{CREDITS_REF_REWARD} тебе за его первый запрос)",
            parse_mode="HTML",
            reply_markup=InlineKeyboardMarkup([
                [buy_btn],
                [InlineKeyboardButton("◀️ Назад", callback_data="menu:main")],
            ]),
        )

    elif data == "menu:buy":
        if not YOOKASSA_PAYMENT_TOKEN:
            await query.edit_message_text(
                "⚠️ Оплата пока не настроена.\n\nАдминистратор ещё не подключил ЮKassa.",
                reply_markup=_back_kb("menu:balance"),
            )
            return
        await query.edit_message_text(
            "<b>Купить кредиты</b>\n\n"
            "Выбери пакет:\n\n"
            "• 50 кредитов — 99₽\n"
            "• 200 кредитов — 299₽ (−25%)\n"
            "• 500 кредитов — 599₽ (−40%)\n\n"
            "Оплата картой РФ через ЮKassa.",
            parse_mode="HTML",
            reply_markup=_buy_kb(),
        )

    elif data == "menu:ref":
        ref_link = _ref_link(ref_code)
        await query.edit_message_text(
            f"<b>Реферальная программа</b>\n\n"
            f"Твоя ссылка:\n<code>{ref_link}</code>\n\n"
            f"• Друг: +{CREDITS_REF_BONUS} кредитов при регистрации\n"
            f"• Ты: +{CREDITS_REF_REWARD} кредитов за его первый AI-запрос\n\n"
            f"Код: <code>{ref_code}</code>",
            parse_mode="HTML",
            reply_markup=_back_kb(),
        )

    elif data == "ask:omf":
        await query.edit_message_text(
            "💬 <b>AI-ассистент OmniMindFlow</b>\n\n"
            f"Кредиты: <b>{credits}</b>\n\n"
            "Задай вопрос командой:\n"
            "<code>/ask omf Как автоматизировать стендап?</code>",
            parse_mode="HTML",
            reply_markup=_back_kb("menu:omf"),
        )

    elif data == "ask:wef":
        await query.edit_message_text(
            "💬 <b>AI-ассистент WinExtraFlow</b>\n\n"
            f"Кредиты: <b>{credits}</b>\n\n"
            "Задай вопрос командой:\n"
            "<code>/ask wef Как читать WEF Score?</code>",
            parse_mode="HTML",
            reply_markup=_back_kb("menu:wef"),
        )

    elif data == "ask:aef":
        await query.edit_message_text(
            "💬 <b>AI-ассистент AutoEvoFlow</b>\n\n"
            f"Кредиты: <b>{credits}</b>\n\n"
            "Задай вопрос командой:\n"
            "<code>/ask aef Как снизить расходы на автопарк?</code>",
            parse_mode="HTML",
            reply_markup=_back_kb("menu:aef"),
        )

    elif data == "stats:aef":
        await query.edit_message_text(
            "📊 <b>AutoEvoFlow — Статистика</b>\n\n"
            "Аналитика автопарка доступна в личном кабинете.\n\n"
            "→ autoevoflow.com\n\n"
            "Вопросы: <code>/ask aef {вопрос}</code>",
            parse_mode="HTML",
            reply_markup=_back_kb("menu:aef"),
        )

    elif data == "tips:omf":
        await query.edit_message_text(
            "<b>Workflow Tips — OmniMindFlow</b>\n\n"
            "1️⃣ Утренний брифинг: открой дашборд — AI уже собрал сводку\n"
            "2️⃣ Code review: делегируй черновую проверку, сам — ключевые решения\n"
            "3️⃣ Стендап: 45 минут → 8 с AI-саммари задач\n"
            "4️⃣ Flow Score: следи, держи выше 60\n"
            "5️⃣ Квесты: выполняй → разблокируй продвинутые модули\n\n"
            "Задай конкретный вопрос: /ask omf {вопрос}",
            parse_mode="HTML",
            reply_markup=_back_kb("menu:omf"),
        )

    elif data == "schedule:omf":
        lines = ["<b>OmniMindFlow — контент-план</b>\n"]
        for day in sorted(OMF_WAVE.keys()):
            lines.append(f"День {day}: {OMF_WAVE[day][:55].replace(chr(10), ' ')}…")
        await query.edit_message_text(
            "\n".join(lines), parse_mode="HTML", reply_markup=_back_kb("menu:omf"),
        )

    elif data == "schedule:wef":
        lines = ["<b>WinExtraFlow — контент-план</b>\n"]
        for day in sorted(WEF_WAVE.keys()):
            lines.append(f"День {day}: {WEF_WAVE[day][:55].replace(chr(10), ' ')}…")
        await query.edit_message_text(
            "\n".join(lines), parse_mode="HTML", reply_markup=_back_kb("menu:wef"),
        )

    elif data.startswith("buy:pack_"):
        pack_id = data[len("buy:"):]
        pack = next((p for p in CREDIT_PACKAGES if p[0] == pack_id), None)
        if not pack or not YOOKASSA_PAYMENT_TOKEN:
            await query.answer("Ошибка: пакет не найден или оплата не настроена.", show_alert=True)
            return
        _, credits_cnt, price_rub, label = pack
        await context.bot.send_invoice(
            chat_id=user.id,
            title=f"AIGrowth: {label}",
            description=f"{label} для AI-запросов в OmniMindFlow, WinExtraFlow, AutoEvoFlow.",
            payload=f"{user.id}:{credits_cnt}",
            provider_token=YOOKASSA_PAYMENT_TOKEN,
            currency="RUB",
            prices=[LabeledPrice(label, price_rub * 100)],  # kopecks
            start_parameter=f"buy-{pack_id}",
        )
        await query.answer()

    # ── AEF Funnel ────────────────────────────────────────────────────────────

    elif data == "aef:funnel:start":
        context.user_data.pop("aef_role", None)
        context.user_data.pop("aef_size", None)
        context.user_data.pop("aef_track", None)
        await query.edit_message_text(
            "🚛 <b>AutoEvoFlow — Аудит автопарка</b>\n\n"
            "Несколько быстрых вопросов — подберу нужный инструмент.\n\n"
            "Ваша роль в компании?",
            parse_mode="HTML",
            reply_markup=_aef_role_kb(),
        )

    elif data == "aef:funnel:size":
        await query.edit_message_text(
            "Сколько машин в вашем парке?",
            parse_mode="HTML",
            reply_markup=_aef_size_kb(),
        )

    elif data.startswith("aef:role:"):
        role_map = {
            "aef:role:owner":      "👔 Владелец / директор",
            "aef:role:logist":     "📋 Логист / менеджер",
            "aef:role:dispatcher": "🚗 Диспетчер",
        }
        context.user_data["aef_role"] = role_map.get(data, data)
        if data == "aef:role:dispatcher":
            await query.edit_message_text(
                "Понял!\n\n"
                "Держите шаблон аудита — он покажет, где теряются деньги в парке:\n\n"
                "👉 https://claude.ai/artifact/P5BtSr1TMbb2FP52EhpoMX\n\n"
                "Пригодится для разговора с руководством 😉",
                parse_mode="HTML",
                reply_markup=_back_kb("menu:aef"),
            )
        else:
            await query.edit_message_text(
                "Хорошо!\n\nСколько машин в вашем парке?",
                parse_mode="HTML",
                reply_markup=_aef_size_kb(),
            )

    elif data.startswith("aef:size:"):
        size_map = {
            "aef:size:small": "1–5 машин",
            "aef:size:mid":   "6–20 машин",
            "aef:size:large": "21–50 машин",
            "aef:size:xl":    "50+ машин",
        }
        context.user_data["aef_size"] = size_map.get(data, data)
        await query.edit_message_text(
            f"Парк: <b>{context.user_data['aef_size']}</b>\n\n"
            "Как сейчас ведёте учёт расходов и рейсов?",
            parse_mode="HTML",
            reply_markup=_aef_track_kb(),
        )

    elif data in ("aef:track:excel", "aef:track:memory"):
        label = "Excel / Google Таблицы" if data == "aef:track:excel" else "по памяти / на бумаге"
        context.user_data["aef_track"] = label
        await query.edit_message_text(
            f"Учёт — <b>{label}</b>. Самый распространённый вариант.\n\n"
            "Сделал инструмент специально для таких ситуаций. "
            "Вводите 5 цифр — он показывает, где конкретно уходят деньги: "
            "ГСМ, ТО, простои, водители.\n\n"
            "👉 <a href=\"https://claude.ai/artifact/P5BtSr1TMbb2FP52EhpoMX\">Открыть шаблон аудита</a>\n\n"
            "Займёт 3 минуты. Бесплатно.",
            parse_mode="HTML",
            reply_markup=_aef_after_audit_kb(),
        )

    elif data in ("aef:track:1c", "aef:track:saas"):
        label = "1С" if data == "aef:track:1c" else "специальный сервис"
        context.user_data["aef_track"] = label
        await query.edit_message_text(
            f"Учёт через <b>{label}</b> — уже хороший старт.\n\n"
            "Один вопрос: вы можете прямо сейчас назвать рентабельность "
            "каждого маршрута отдельно?\n\n"
            "Если нет — задайте вопрос по экономике парка, разберу:\n\n"
            "<code>/ask aef Как считать рентабельность маршрута?</code>",
            parse_mode="HTML",
            reply_markup=_back_kb("menu:aef"),
        )

    elif data == "aef:audit:got":
        await query.edit_message_text(
            "Отлично! Пока считаете — один вопрос:\n\n"
            "Вы знаете, какая машина у вас сейчас в плюсе, а какая тянет вниз?",
            parse_mode="HTML",
            reply_markup=InlineKeyboardMarkup([
                [InlineKeyboardButton("✅ Да, примерно понимаю", callback_data="aef:know:yes")],
                [InlineKeyboardButton("❌ Честно — нет",         callback_data="aef:know:no")],
                [InlineKeyboardButton("🤷 Есть подозрения",      callback_data="aef:know:maybe")],
            ]),
        )

    elif data == "aef:audit:later":
        await query.edit_message_text(
            "Понял, ссылка сохранена!\n\n"
            "👉 https://claude.ai/artifact/P5BtSr1TMbb2FP52EhpoMX\n\n"
            "Вопросы по парку — /ask aef {вопрос}",
            parse_mode="HTML",
            reply_markup=_back_kb("menu:aef"),
        )

    elif data == "aef:know:yes":
        await query.edit_message_text(
            "Хорошо! Если захотите сверить расчёты или найти скрытые потери — "
            "могу разобрать ваши цифры вместе.\n\n"
            "20 минут, бесплатно.",
            parse_mode="HTML",
            reply_markup=InlineKeyboardMarkup([
                [InlineKeyboardButton("📞 Записаться на разбор", callback_data="aef:book")],
                [InlineKeyboardButton("◀️ В меню",               callback_data="menu:aef")],
            ]),
        )

    elif data in ("aef:know:no", "aef:know:maybe"):
        await query.edit_message_text(
            "Именно для этого и нужен разбор.\n\n"
            "Смотрим ваши реальные цифры — нахожу где теряются деньги "
            "и что с этим делать. 20 минут, бесплатно.",
            parse_mode="HTML",
            reply_markup=InlineKeyboardMarkup([
                [InlineKeyboardButton("📞 Записаться", callback_data="aef:book")],
                [InlineKeyboardButton("Позже",         callback_data="menu:aef")],
            ]),
        )

    elif data == "aef:book":
        await query.edit_message_text(
            "Отлично! Выберите удобное время для звонка:",
            parse_mode="HTML",
            reply_markup=_aef_book_kb(),
        )

    elif data.startswith("aef:time:"):
        time_map = {
            "aef:time:morning": "утро (9–12)",
            "aef:time:day":     "день (12–17)",
            "aef:time:evening": "вечер (17–20)",
        }
        chosen_time = time_map.get(data, data)
        role  = context.user_data.get("aef_role",  "не указана")
        size  = context.user_data.get("aef_size",  "не указан")
        track = context.user_data.get("aef_track", "не указан")

        admin_text = (
            f"🚛 <b>Новая запись на разбор AEF</b>\n\n"
            f"Пользователь: @{user.username or '—'} (ID: <code>{user.id}</code>)\n"
            f"Имя: {user.first_name or '—'}\n"
            f"Роль: {role}\n"
            f"Парк: {size}\n"
            f"Учёт: {track}\n"
            f"Время: <b>{chosen_time}</b>"
        )
        for admin_id in ADMIN_IDS:
            try:
                await query.get_bot().send_message(
                    chat_id=admin_id, text=admin_text, parse_mode="HTML",
                )
            except Exception as exc:
                logger.warning("AEF admin notify failed for %s: %s", admin_id, exc)

        await query.edit_message_text(
            f"✅ <b>Записано!</b>\n\n"
            f"Время: <b>{chosen_time}</b>\n\n"
            f"Свяжусь лично: @winnersd95\n\n"
            f"Подготовьтесь: возьмите примерные цифры расходов "
            f"и количество рейсов за прошлый месяц — разбор будет конкретным.",
            parse_mode="HTML",
            reply_markup=_back_kb("menu:aef"),
        )

    elif data == "market:wef":
        import httpx
        await query.edit_message_text("Загружаю данные рынка…")
        try:
            async with httpx.AsyncClient(timeout=10, verify=not SKIP_SSL_VERIFY) as client:
                fg = (await client.get("https://api.alternative.me/fng/?limit=1")).json()
                fg_val = fg["data"][0]["value"]
                fg_label = fg["data"][0]["value_classification"]
                btc = (await client.get(
                    "https://api.coingecko.com/api/v3/simple/price"
                    "?ids=bitcoin&vs_currencies=usd&include_24hr_change=true"
                )).json()
                btc_price = btc["bitcoin"]["usd"]
                btc_change = round(btc["bitcoin"]["usd_24h_change"], 1)
            text = (
                f"<b>Market Pulse</b>\n\n"
                f"Fear & Greed: {fg_val} ({fg_label})\n"
                f"BTC: ${btc_price:,.0f} ({btc_change:+.1f}%)\n\n"
                f"<i>Не является инвестиционной рекомендацией.</i>"
            )
        except Exception as e:
            text = f"Ошибка загрузки: {e}"
        await query.edit_message_text(
            text,
            parse_mode="HTML",
            reply_markup=InlineKeyboardMarkup([[
                InlineKeyboardButton("🔄 Обновить", callback_data="market:wef"),
                InlineKeyboardButton("◀️ Назад", callback_data="menu:wef"),
            ]]),
        )


# ═══ ADMIN COMMANDS ═══════════════════════════════════════════════════════════

async def cmd_stats_ai(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Show AI provider distribution and fallback stats."""
    if not await _require_admin(update):
        return
    try:
        days = int(context.args[0]) if context.args else 7
    except (ValueError, IndexError):
        days = 7
    from datetime import datetime, timedelta, timezone
    since = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
    try:
        with sqlite3.connect(DB_PATH) as db:
            total = db.execute(
                "SELECT COUNT(*) FROM AiLog WHERE created_at >= ?", (since,)
            ).fetchone()[0]
            rows = db.execute(
                "SELECT backend, COUNT(*) as cnt, "
                "SUM(CASE WHEN success=1 THEN 1 ELSE 0 END) as ok "
                "FROM AiLog WHERE created_at >= ? GROUP BY backend ORDER BY cnt DESC",
                (since,),
            ).fetchall()
            # Provider fallback rate: requests where providers_tried has >1 entry
            fallback_cnt = db.execute(
                "SELECT COUNT(*) FROM AiLog WHERE created_at >= ? "
                "AND json_array_length(providers_tried) > 1",
                (since,),
            ).fetchone()[0]
        if not rows:
            await update.message.reply_text(f"Нет AI-запросов за последние {days} дн.")
            return
        lines = [f"<b>AI-статистика за {days} дн.</b>\nВсего запросов: <b>{total}</b>\n"]
        for backend, cnt, ok in rows:
            pct = round(cnt / total * 100) if total else 0
            sr = round(ok / cnt * 100) if cnt else 0
            lines.append(f"• <b>{backend}</b>: {cnt} ({pct}%) — успех {sr}%")
        fb_pct = round(fallback_cnt / total * 100) if total else 0
        lines.append(f"\nФолбэк-запросы: {fallback_cnt} ({fb_pct}%) — ушли дальше 1-го провайдера")
        lines.append(f"\nДетали: <code>/stats_ai 30</code> — за 30 дней")
        await update.message.reply_text("\n".join(lines), parse_mode="HTML")
    except Exception as e:
        await update.message.reply_text(f"Ошибка: {e}")


async def cmd_omf_schedule(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not await _require_admin(update):
        return
    lines = ["OmniMindFlow Wave 1 (28 days)\n"]
    for day in sorted(OMF_WAVE.keys()):
        lines.append(f"  Day {day}: {OMF_WAVE[day][:60].replace(chr(10), ' ')}...")
    lines.append("\n/omf {day} — publish")
    await update.message.reply_text("\n".join(lines))


async def cmd_wef_schedule(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not await _require_admin(update):
        return
    lines = ["WinExtraFlow Wave 1 (28 days)\n"]
    for day in sorted(WEF_WAVE.keys()):
        lines.append(f"  Day {day}: {WEF_WAVE[day][:60].replace(chr(10), ' ')}...")
    lines.append("\n/wef {day} — publish")
    await update.message.reply_text("\n".join(lines))


async def cmd_omf(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not await _require_admin(update):
        return
    if not context.args:
        await update.message.reply_text("Usage: /omf {day}\nDays: " + str(sorted(OMF_WAVE.keys())))
        return
    try:
        day = int(context.args[0])
    except ValueError:
        await update.message.reply_text("Day must be a number")
        return

    text = OMF_WAVE.get(day)
    if not text:
        await update.message.reply_text(f"No OMF post for day {day}. Available: {sorted(OMF_WAVE.keys())}")
        return

    results = []
    if OMF_PROFILES:
        try:
            r = await _publish(context, OMF_PROFILES, text)
            results.append(f"Profiles: {r}")
        except Exception as e:
            results.append(f"Profiles: FAIL ({e})")

    if OMF_VIP:
        try:
            clean = text
            for tag in FORWARD_TAGS + ["#omnimindflow"]:
                clean = clean.replace(tag, "").strip()
            await context.bot.send_message(chat_id=OMF_VIP, text=clean)
            results.append("VIP: sent")
        except Exception as e:
            results.append(f"VIP: FAIL ({e})")

    await update.message.reply_text(f"OMF Day {day}:\n" + "\n".join(results))


async def cmd_wef(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not await _require_admin(update):
        return
    if not context.args:
        await update.message.reply_text("Usage: /wef {day}\nDays: " + str(sorted(WEF_WAVE.keys())))
        return
    try:
        day = int(context.args[0])
    except ValueError:
        await update.message.reply_text("Day must be a number")
        return

    text = WEF_WAVE.get(day)
    if not text:
        await update.message.reply_text(f"No WEF post for day {day}. Available: {sorted(WEF_WAVE.keys())}")
        return

    results = []
    if WEF_SIGNALS:
        try:
            r = await _publish(context, WEF_SIGNALS, text)
            results.append(f"Signals: {r}")
        except Exception as e:
            results.append(f"Signals: FAIL ({e})")

    if WEF_VIP:
        try:
            clean = text
            for tag in FORWARD_TAGS + ["#winextraflow"]:
                clean = clean.replace(tag, "").strip()
            await context.bot.send_message(chat_id=WEF_VIP, text=clean)
            results.append("VIP: sent")
        except Exception as e:
            results.append(f"VIP: FAIL ({e})")

    await update.message.reply_text(f"WEF Day {day}:\n" + "\n".join(results))


async def cmd_custom(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not await _require_admin(update):
        return
    if not context.args or len(context.args) < 2:
        await update.message.reply_text("Usage: /custom omf|wef {text}")
        return

    project = context.args[0].lower()
    text = " ".join(context.args[1:]) + "\n\n#repost #aigc"

    if project == "omf" and OMF_PROFILES:
        try:
            r = await _publish(context, OMF_PROFILES, text)
            await update.message.reply_text(f"OMF: {r}")
        except Exception as e:
            await update.message.reply_text(f"OMF: FAIL ({e})")
    elif project == "wef" and WEF_SIGNALS:
        try:
            r = await _publish(context, WEF_SIGNALS, text)
            await update.message.reply_text(f"WEF: {r}")
        except Exception as e:
            await update.message.reply_text(f"WEF: FAIL ({e})")
    else:
        await update.message.reply_text("Project must be 'omf' or 'wef'")


async def cmd_test(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not await _require_admin(update):
        return
    test_text = "Test from AIGrowth Bot\n\n#repost #aigc"
    results = []
    for name, cid in [
        ("OMF Profiles", OMF_PROFILES),
        ("OMF VIP", OMF_VIP),
        ("WEF Signals", WEF_SIGNALS),
        ("WEF VIP", WEF_VIP),
    ]:
        if cid:
            try:
                msg = await context.bot.send_message(chat_id=cid, text=f"{test_text}\nChannel: {name}")
                results.append(f"  {name}: OK (msg_id: {msg.message_id})")
                if name in ("OMF Profiles", "WEF Signals") and AIGC_GROUP:
                    try:
                        await context.bot.forward_message(
                            chat_id=AIGC_GROUP, from_chat_id=cid, message_id=msg.message_id
                        )
                        results.append("  -> AIGC forward: OK")
                    except Exception as e:
                        results.append(f"  -> AIGC forward: FAIL ({e})")
            except Exception as e:
                results.append(f"  {name}: FAIL ({e})")
        else:
            results.append(f"  {name}: not configured")
    await update.message.reply_text("Test results:\n\n" + "\n".join(results))


async def cmd_channels(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not await _require_admin(update):
        return
    await update.message.reply_text(
        "Channel IDs:\n\n"
        f"OMF Profiles: {OMF_PROFILES}\n"
        f"OMF VIP: {OMF_VIP}\n"
        f"WEF Signals: {WEF_SIGNALS}\n"
        f"WEF VIP: {WEF_VIP}\n"
        f"AI Growth Club: {AIGC_GROUP}\n"
        f"Forward tags: {FORWARD_TAGS}"
    )


async def cmd_market(update: Update, context: ContextTypes.DEFAULT_TYPE):
    import httpx
    try:
        async with httpx.AsyncClient(timeout=10, verify=not SKIP_SSL_VERIFY) as client:
            fg = (await client.get("https://api.alternative.me/fng/?limit=1")).json()
            fg_val = fg["data"][0]["value"]
            fg_label = fg["data"][0]["value_classification"]
            btc = (await client.get(
                "https://api.coingecko.com/api/v3/simple/price"
                "?ids=bitcoin&vs_currencies=usd&include_24hr_change=true"
            )).json()
            btc_price = btc["bitcoin"]["usd"]
            btc_change = round(btc["bitcoin"]["usd_24h_change"], 1)
        await update.message.reply_text(
            f"Market Pulse\n\nFear & Greed: {fg_val} ({fg_label})\n"
            f"BTC: ${btc_price:,.0f} ({btc_change:+.1f}%)"
        )
    except Exception as e:
        await update.message.reply_text(f"Error: {e}")


# ═══ FUNNEL SCHEDULER ════════════════════════════════════════════════════════

async def _send_scheduled_steps(bot) -> None:
    if not DB_PATH.exists():
        return
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc).isoformat()

    try:
        with sqlite3.connect(DB_PATH) as db:
            rows = db.execute("""
                SELECT s.id, s.projectId, s.title, s.content, s.mediaUrl, s.mediaType, p.botSettings
                FROM TelegramFunnelStep s
                JOIN Project p ON s.projectId = p.id
                WHERE s.status = 'scheduled' AND s.scheduledAt IS NOT NULL AND s.scheduledAt <= ?
            """, (now,)).fetchall()
    except sqlite3.OperationalError:
        # Tables not yet created by the Next.js app — normal at first run
        return

    for step_id, project_id, title, content, media_url, media_type, raw in rows:
        try:
            settings = json.loads(raw or "{}")
            source_channels = settings.get("sourceChannels", [])
            publish_channel = settings.get("publishChannelId") or (
                source_channels[0]["id"] if source_channels else None
            )
            if not publish_channel:
                logger.warning("Step %s: no sourceChannels, skipping", step_id)
                continue

            chat_id = int(publish_channel)
            chat_label = settings.get("publishChannelLabel") or (
                source_channels[0].get("label", "") if source_channels else ""
            )
            text = f"<b>{title}</b>\n\n{content}" if title else (content or "")

            if media_url:
                caption = text[:1024]
                if media_type == "video":
                    result = await bot.send_video(chat_id=chat_id, video=media_url, caption=caption, parse_mode="HTML")
                elif media_type == "document":
                    result = await bot.send_document(chat_id=chat_id, document=media_url, caption=caption, parse_mode="HTML")
                else:
                    result = await bot.send_photo(chat_id=chat_id, photo=media_url, caption=caption, parse_mode="HTML")
            else:
                result = await bot.send_message(
                    chat_id=chat_id, text=text,
                    parse_mode="HTML", disable_web_page_preview=True,
                )

            target_group_id = settings.get("targetGroupId")
            topic_id = settings.get("targetGroupTopicId")
            if target_group_id:
                try:
                    await bot.forward_message(
                        chat_id=int(target_group_id),
                        from_chat_id=chat_id,
                        message_id=result.message_id,
                        message_thread_id=topic_id,
                    )
                except Exception as fwd_exc:
                    logger.error("Forward to AIGC failed for step %s: %s", step_id, fwd_exc)

            with sqlite3.connect(DB_PATH) as db:
                db.execute(
                    "UPDATE TelegramFunnelStep SET status='sent', updatedAt=? WHERE id=?",
                    (now, step_id),
                )
                db.execute(
                    """INSERT INTO SendLog
                       (id, projectId, stepId, chatId, chatLabel, textPreview, messageId, sentAt)
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                    (
                        _new_id(), project_id, step_id, str(chat_id), chat_label,
                        (text[:120] + "…") if len(text) > 120 else text,
                        result.message_id, now,
                    ),
                )
                db.commit()
            logger.info("Sent funnel step '%s' → %s (%s)", title, chat_label, chat_id)

        except Exception as exc:
            logger.error("Failed to send step %s: %s", step_id, exc)


async def scheduler_job(context: ContextTypes.DEFAULT_TYPE) -> None:
    await _send_scheduled_steps(context.bot)


async def cmd_funnel(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not await _require_admin(update):
        return
    if not DB_PATH.exists():
        await update.message.reply_text("dev.db not found.")
        return
    try:
        with sqlite3.connect(DB_PATH) as db:
            rows = db.execute("""
                SELECT s.title, s.scheduledAt, s.status, p.name
                FROM TelegramFunnelStep s
                JOIN Project p ON s.projectId = p.id
                ORDER BY s.scheduledAt ASC
                LIMIT 20
            """).fetchall()
    except sqlite3.OperationalError:
        await update.message.reply_text("TelegramFunnelStep table not found (Next.js not yet run?).")
        return
    if not rows:
        await update.message.reply_text("No funnel steps in DB.")
        return
    lines = ["Funnel steps (up to 20):\n"]
    for title, scheduled_at, status, project_name in rows:
        icon = "✅" if status == "sent" else ("🕐" if status == "scheduled" else "📝")
        dt = (scheduled_at or "—")[:16].replace("T", " ")
        lines.append(f"{icon} [{project_name}] {title or '—'} | {dt} | {status}")
    await update.message.reply_text("\n".join(lines))


# ═══ PAYMENTS ════════════════════════════════════════════════════════════════

async def handle_pre_checkout(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Telegram требует ответа в течение 10 секунд — подтверждаем безусловно."""
    await update.pre_checkout_query.answer(ok=True)


async def handle_successful_payment(update: Update, context: ContextTypes.DEFAULT_TYPE):
    payment = update.message.successful_payment
    try:
        user_id_str, credits_str = payment.invoice_payload.split(":")
        credits_to_add = int(credits_str)
    except (ValueError, AttributeError):
        logger.error("Bad payment payload: %s", payment.invoice_payload)
        return

    try:
        with sqlite3.connect(DB_PATH) as db:
            db.execute(
                "UPDATE BotUser SET credits=credits+? WHERE id=?",
                (credits_to_add, user_id_str),
            )
            db.commit()
    except Exception as e:
        logger.error("Failed to credit after payment: %s", e)
        await update.message.reply_text("⚠️ Оплата прошла, но кредиты не начислены — напиши администратору.")
        return

    updated = _get_user(int(user_id_str))
    new_balance = updated["credits"] if updated else "?"
    amount_rub = payment.total_amount // 100
    await update.message.reply_text(
        f"✅ <b>Оплата прошла!</b>\n\n"
        f"Начислено: +{credits_to_add} кредитов\n"
        f"Сумма: {amount_rub}₽\n"
        f"Баланс: <b>{new_balance}</b> кредитов\n\n"
        f"Используй /ask omf|wef {{вопрос}} для AI-запроса.",
        parse_mode="HTML",
    )
    logger.info("Payment: user=%s credits=+%d total=%d", user_id_str, credits_to_add, amount_rub)


# ═══ AUTO-FORWARD ═════════════════════════════════════════════════════════════

async def auto_forward(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not update.channel_post or not AIGC_GROUP:
        return
    text = (update.channel_post.text or update.channel_post.caption or "").lower()
    if any(tag in text for tag in FORWARD_TAGS):
        try:
            await context.bot.forward_message(
                chat_id=AIGC_GROUP,
                from_chat_id=update.channel_post.chat_id,
                message_id=update.channel_post.message_id,
            )
            logger.info("Auto-forwarded msg %s to AIGC", update.channel_post.message_id)
        except Exception as e:
            logger.error("Auto-forward failed: %s", e)


# ═══ MAIN ═════════════════════════════════════════════════════════════════════

def main():
    if not BOT_TOKEN:
        print("ERROR: BOT_TOKEN not set in .env")
        return

    _ensure_tables()

    if not ADMIN_IDS:
        logger.warning(
            "ADMIN_IDS not set in .env — admin commands are open to all users. "
            "Set ADMIN_IDS=<your_telegram_id> to restrict access."
        )
    if SKIP_SSL_VERIFY:
        logger.warning("SKIP_SSL_VERIFY=true — SSL certificate validation is disabled.")

    print("AIGrowth Unified Bot starting...")
    print(f"  OMF Profiles: {OMF_PROFILES} | OMF VIP: {OMF_VIP}")
    print(f"  WEF Signals: {WEF_SIGNALS}  | WEF VIP: {WEF_VIP}")
    print(f"  AI Growth Club: {AIGC_GROUP}")
    print(f"  Funnel scheduler: every {SCHEDULER_INTERVAL}s | DB: {DB_PATH}")
    print(f"  Admin IDs: {ADMIN_IDS or '(open — set ADMIN_IDS)'}")
    print(f"  SSL verify: {not SKIP_SSL_VERIFY}")
    print(f"  Credits: signup={CREDITS_SIGNUP}, ref_bonus={CREDITS_REF_BONUS}, ref_reward={CREDITS_REF_REWARD}")

    app = Application.builder().token(BOT_TOKEN).build()

    # Cache bot username synchronously before polling starts
    import asyncio

    async def _post_init(application):
        global _BOT_USERNAME
        me = await application.bot.get_me()
        _BOT_USERNAME = me.username
        logger.info("Bot username cached: @%s", _BOT_USERNAME)

    app.post_init = _post_init

    # User-facing handlers
    app.add_handler(CommandHandler("start", cmd_start))
    app.add_handler(CommandHandler("help", cmd_help))
    app.add_handler(CommandHandler("balance", cmd_balance))
    app.add_handler(CommandHandler("ref", cmd_ref))
    app.add_handler(CommandHandler("brand_plan", cmd_brand_plan))
    app.add_handler(CommandHandler("aef", cmd_aef))
    app.add_handler(CommandHandler("ask", cmd_ask))
    app.add_handler(CallbackQueryHandler(callback_handler))

    # Admin / publishing handlers
    app.add_handler(CommandHandler("stats_ai", cmd_stats_ai))
    app.add_handler(CommandHandler("omf", cmd_omf))
    app.add_handler(CommandHandler("wef", cmd_wef))
    app.add_handler(CommandHandler("omf_schedule", cmd_omf_schedule))
    app.add_handler(CommandHandler("wef_schedule", cmd_wef_schedule))
    app.add_handler(CommandHandler("custom", cmd_custom))
    app.add_handler(CommandHandler("test", cmd_test))
    app.add_handler(CommandHandler("channels", cmd_channels))
    app.add_handler(CommandHandler("market", cmd_market))
    app.add_handler(CommandHandler("funnel", cmd_funnel))

    # Payments
    app.add_handler(PreCheckoutQueryHandler(handle_pre_checkout))
    app.add_handler(MessageHandler(filters.SUCCESSFUL_PAYMENT, handle_successful_payment))

    # Channel auto-forward
    app.add_handler(MessageHandler(filters.UpdateType.CHANNEL_POST, auto_forward))

    # Catch-all: log any unhandled message for debugging
    async def _debug_catch_all(update: Update, context: ContextTypes.DEFAULT_TYPE):
        logger.info("UNHANDLED update from %s: %s", update.effective_user, update)

    app.add_handler(MessageHandler(filters.ALL, _debug_catch_all))

    # Error handler — logs all exceptions from handlers
    async def _error_handler(update: object, context: ContextTypes.DEFAULT_TYPE):
        logger.error("Handler exception: %s", context.error, exc_info=context.error)

    app.add_error_handler(_error_handler)

    app.job_queue.run_repeating(scheduler_job, interval=SCHEDULER_INTERVAL, first=10)

    print("Bot running. Press Ctrl+C to stop.")
    app.run_polling(
        drop_pending_updates=True,
        allowed_updates=["message", "callback_query", "channel_post",
                         "edited_message", "my_chat_member", "pre_checkout_query"],
    )


if __name__ == "__main__":
    main()
