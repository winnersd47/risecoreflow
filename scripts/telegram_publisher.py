"""
Telegram Publisher — AIGrowth / OmniMindFlow
Отправка text / photo / video через Bot API без polling.
UTF-8 через content= + заголовок charset (обязательно на Windows).
"""

import sys
import os
import json
import time
import httpx

sys.stdout.reconfigure(encoding="utf-8")

# ── Config ────────────────────────────────────────────────────────────────────
ENV_FILE = os.path.join(os.path.dirname(__file__), "..", "tg-bot", ".env")

def _load_env():
    env = {}
    try:
        with open(ENV_FILE, encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                k, v = line.split("=", 1)
                env[k.strip()] = v.strip().strip('"')
    except FileNotFoundError:
        pass
    return env

_env = _load_env()
BOT_TOKEN = os.environ.get("BOT_TOKEN") or _env.get("BOT_TOKEN", "")
BASE_URL  = f"https://api.telegram.org/bot{BOT_TOKEN}"

MAX_CAPTION = 1024
MAX_TEXT    = 4096


def _trim(text: str, limit: int, footer: str = "") -> str:
    """Trim text to limit, keeping footer intact."""
    if len(text) <= limit:
        return text
    trim_to = limit - len(footer) - 4
    # cut at last newline to avoid mid-word break
    cut = text[:trim_to].rsplit("\n", 1)[0]
    return cut + "…\n" + footer


def _post(endpoint: str, payload: dict, retries: int = 3) -> dict:
    """POST JSON payload to Bot API with retry on 429 / 5xx."""
    body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    for attempt in range(retries):
        try:
            with httpx.Client(timeout=30, verify=False) as c:
                r = c.post(
                    f"{BASE_URL}/{endpoint}",
                    content=body,
                    headers={"Content-Type": "application/json; charset=utf-8"},
                )
            data = r.json()
            if data.get("ok"):
                return data["result"]
            code = data.get("error_code", 0)
            if code == 429:
                wait = data.get("parameters", {}).get("retry_after", 5)
                print(f"  [TG] flood limit, ждём {wait}s…", flush=True)
                time.sleep(wait)
                continue
            raise RuntimeError(f"Telegram {endpoint}: {data.get('description')} (code {code})")
        except httpx.RequestError as e:
            if attempt < retries - 1:
                time.sleep(3)
            else:
                raise RuntimeError(f"Telegram network error: {e}") from e
    raise RuntimeError(f"Telegram {endpoint}: превышено число попыток")


def send_text(chat_id: str, text: str, disable_notification: bool = True) -> dict:
    """sendMessage with HTML parse_mode."""
    return _post("sendMessage", {
        "chat_id": chat_id,
        "text": _trim(text, MAX_TEXT),
        "parse_mode": "HTML",
        "disable_notification": disable_notification,
    })


def send_photo(chat_id: str, photo_path: str, caption: str = "",
               disable_notification: bool = True) -> dict:
    """sendPhoto — multipart upload."""
    cap = _trim(caption, MAX_CAPTION)
    payload_meta = {
        "chat_id": chat_id,
        "caption": cap,
        "parse_mode": "HTML",
        "disable_notification": disable_notification,
    }
    with open(photo_path, "rb") as f:
        photo_bytes = f.read()
    import io
    meta_bytes = json.dumps(
        {k: v for k, v in payload_meta.items()},
        ensure_ascii=False,
    ).encode("utf-8")

    with httpx.Client(timeout=60, verify=False) as c:
        r = c.post(
            f"{BASE_URL}/sendPhoto",
            data=payload_meta,
            files={"photo": (os.path.basename(photo_path), photo_bytes, "image/jpeg")},
        )
    data = r.json()
    if not data.get("ok"):
        raise RuntimeError(f"sendPhoto: {data.get('description')}")
    return data["result"]


def send_video(chat_id: str, video_path: str, caption: str = "",
               disable_notification: bool = True) -> dict:
    """sendVideo — multipart upload, supports_streaming=true."""
    cap = _trim(caption, MAX_CAPTION)
    meta = {
        "chat_id": str(chat_id),
        "caption": cap,
        "parse_mode": "HTML",
        "supports_streaming": "true",
        "disable_notification": str(disable_notification).lower(),
    }
    with open(video_path, "rb") as f:
        video_bytes = f.read()

    with httpx.Client(timeout=120, verify=False) as c:
        r = c.post(
            f"{BASE_URL}/sendVideo",
            data=meta,
            files={"video": (os.path.basename(video_path), video_bytes, "video/mp4")},
        )
    data = r.json()
    if not data.get("ok"):
        raise RuntimeError(f"sendVideo: {data.get('description')}")
    return data["result"]


def send_poll(chat_id: str, question: str, options: list[str],
              is_anonymous: bool = True) -> dict:
    """sendPoll."""
    return _post("sendPoll", {
        "chat_id": chat_id,
        "question": question[:300],
        "options": [o[:100] for o in options[:10]],
        "is_anonymous": is_anonymous,
    })


if __name__ == "__main__":
    # Quick self-test: send a text to channel from CLI
    # python telegram_publisher.py CHANNEL_ID "Test message"
    import sys
    if len(sys.argv) >= 3:
        cid, msg = sys.argv[1], sys.argv[2]
        result = send_text(cid, msg, disable_notification=True)
        print(f"Sent message_id={result['message_id']}")
    else:
        print("Usage: python telegram_publisher.py CHANNEL_ID 'message'")
