"""
publish_omf_diagnostic.py — OmniMindFlow diagnostic funnel scheduler

Publishes the 3-clip diagnostic funnel to Telegram (main + VIP) and saves
videos as private VK drafts. Runs via Windows Task Scheduler (weekly, Mon 09:00).

Deduplication: state is kept in funnel-state.json next to this script.
Re-running within COOLDOWN_DAYS won't duplicate posts.

Usage:
  python -X utf8 scripts/publish_omf_diagnostic.py           # normal run
  python -X utf8 scripts/publish_omf_diagnostic.py --force   # skip cooldown check
  python -X utf8 scripts/publish_omf_diagnostic.py --dry-run # no actual posting
"""

import sys
import os
import json
import subprocess
import time
from datetime import datetime, timezone, timedelta
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
os.environ["PYTHONIOENCODING"] = "utf-8"

# ── Paths ─────────────────────────────────────────────────────────────────────
HERE   = Path(__file__).parent
ROOT   = HERE.parent
STATE  = HERE / "funnel-state.json"

# ── Config ────────────────────────────────────────────────────────────────────
COOLDOWN_DAYS = 6          # minimum days between funnel runs
VIP_LINK      = "https://t.me/+_J9ySMVtWnQ3OWFi"

# Load env
def _load_env():
    ev = {}
    env_file = ROOT / "tg-bot" / ".env"
    if env_file.exists():
        for line in env_file.read_text(encoding="utf-8").splitlines():
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, _, v = line.partition("=")
            ev[k.strip()] = v.strip().strip('"')
    return ev

ENV = _load_env()
TG_MAIN = ENV.get("OMF_CHANNEL_PROFILES_ID", "")
TG_VIP  = ENV.get("OMF_CHANNEL_VIP_ID", "")

# ── Args ──────────────────────────────────────────────────────────────────────
FORCE   = "--force"   in sys.argv
DRY_RUN = "--dry-run" in sys.argv

# ── State helpers ─────────────────────────────────────────────────────────────
def load_state() -> dict:
    if STATE.exists():
        try:
            # utf-8-sig strips BOM written by PowerShell Out-File
            return json.loads(STATE.read_text(encoding="utf-8-sig"))
        except Exception:
            pass
    return {}

def save_state(s: dict):
    # Always write without BOM so both Python and PowerShell can read it cleanly
    STATE.write_text(json.dumps(s, ensure_ascii=False, indent=2), encoding="utf-8")

# ── Dedup check ───────────────────────────────────────────────────────────────
def should_publish(state: dict) -> bool:
    if FORCE:
        return True
    last = state.get("last_published")
    if not last:
        return True
    last_dt = datetime.fromisoformat(last)
    diff = datetime.now(timezone.utc) - last_dt
    if diff.days < COOLDOWN_DAYS:
        print(f"  [skip] Последняя публикация {diff.days}д назад (cooldown {COOLDOWN_DAYS}д). "
              f"Добавь --force для принудительного запуска.")
        return False
    return True

# ── Clip generation via Node.js ───────────────────────────────────────────────
CLIPS = [
    ROOT / "funnel-1-pain.mp4",
    ROOT / "funnel-2-proof.mp4",
    ROOT / "funnel-3-invite.mp4",
]

def generate_clips(force_regen: bool = False):
    """Call funnel-omf.mjs to generate all 3 clips (no posting).
    In dry-run mode, reuses existing clips if they exist."""
    clips_exist = all(c.exists() for c in CLIPS)

    if DRY_RUN and clips_exist and not force_regen:
        sizes = [f"{c.name} ({c.stat().st_size // 1024}KB)" for c in CLIPS]
        print("  [dry-run] Используем существующие клипы:")
        for s in sizes:
            print(f"    {s}")
        return

    print("  Генерирую клипы через Node.js…")
    cmd = [
        "node", str(HERE / "funnel-omf.mjs"),
        "--vip-link", VIP_LINK,
        # no --post: generation only
    ]
    result = subprocess.run(cmd, cwd=str(ROOT),
                            encoding="utf-8", errors="replace",
                            env={**os.environ, "PYTHONIOENCODING": "utf-8"})
    if result.returncode != 0:
        raise RuntimeError(
            "Генерация клипов завершилась с ошибкой. "
            "Возможная причина: TTS недоступен (корпоративный прокси). "
            "Запусти вручную: node scripts/funnel-omf.mjs --vip-link ..."
        )
    missing = [c for c in CLIPS if not c.exists()]
    if missing:
        raise FileNotFoundError(f"Клипы не созданы: {[c.name for c in missing]}")
    print("  Клипы готовы.")

# ── Telegram posting ──────────────────────────────────────────────────────────
def post_clips():
    from telegram_publisher import send_video, send_text

    # Clip 1 and 2 → main channel only
    pairs = [
        (CLIPS[0], "OmniMindFlow: разработчик теряет 98 минут в день",     [TG_MAIN]),
        (CLIPS[1], "OmniMindFlow: стендап с 45 до 8 минут",                [TG_MAIN]),
        (CLIPS[2], "OmniMindFlow: бесплатная диагностика workflow",         [TG_MAIN, TG_VIP]),
    ]

    for clip_path, caption, channels in pairs:
        for ch in channels:
            ch_label = "VIP" if ch == TG_VIP else "main"
            print(f"  → Telegram [{ch_label}] {clip_path.name}… ", end="", flush=True)
            if DRY_RUN:
                print("(dry-run, пропускаю)")
                continue
            try:
                r = send_video(ch, str(clip_path), caption)
                print(f"message_id={r['message_id']}")
            except Exception as e:
                print(f"ОШИБКА: {e}")
            time.sleep(2)  # flood guard

    # VIP text announcement after clip 3
    vip_text = (
        "🎯 <b>Бесплатная диагностика workflow — запись открыта</b>\n\n"
        "За 30 минут разберём:\n"
        "• Где команда теряет время прямо сейчас\n"
        "• Какие задачи автоматизируются за 1 неделю\n"
        "• Конкретный план под ваш стек и процессы\n\n"
        f"<b>Мест: 5.</b> Только для подписчиков VIP-канала.\n\n"
        f"Записаться: {VIP_LINK}"
    )
    print("  → Telegram [VIP] текстовый анонс… ", end="", flush=True)
    if not DRY_RUN:
        try:
            r = send_text(TG_VIP, vip_text)
            print(f"message_id={r['message_id']}")
        except Exception as e:
            print(f"ОШИБКА: {e}")
    else:
        print("(dry-run)")

# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    print(f"\n{'='*55}")
    print(f"  OmniMindFlow Diagnostic Funnel Publisher")
    print(f"  {datetime.now():%Y-%m-%d %H:%M} | dry-run={DRY_RUN} | force={FORCE}")
    print(f"{'='*55}")

    state = load_state()
    if not should_publish(state):
        return

    try:
        generate_clips()
        post_clips()

        if not DRY_RUN:
            state["last_published"] = datetime.now(timezone.utc).isoformat()
            state["run_count"] = state.get("run_count", 0) + 1
            save_state(state)
            print(f"\n  Состояние сохранено → {STATE}")

        print(f"\n  {'(dry-run) ' if DRY_RUN else ''}Воронка опубликована!")

    except Exception as e:
        print(f"\n  КРИТИЧЕСКАЯ ОШИБКА: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
