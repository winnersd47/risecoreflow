"""Eval-набор для /ask — прогоняет вопросы через _ask_ai и сохраняет ответы.

Использование:
    python -X utf8 scripts/eval-ask.py              # прогон эталонного набора
    python -X utf8 scripts/eval-ask.py --from-logs  # взять вопросы из AiLog (если есть)
    python -X utf8 scripts/eval-ask.py --compare baseline.json  # diff с предыдущим прогоном

Результат пишется в scripts/eval-results-<timestamp>.json
"""

import asyncio
import json
import os
import sys
import sqlite3
import time
from datetime import datetime, UTC
from pathlib import Path

ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(ROOT / "tg-bot"))

os.environ.setdefault("BOT_TOKEN", "dummy")  # не нужен для eval

from dotenv import load_dotenv
load_dotenv(ROOT / "tg-bot" / ".env")

# Импортируем только нужное из бота
from bot import _ask_ai, SKIP_SSL_VERIFY  # noqa: E402

# ── Эталонный набор вопросов ─────────────────────────────────────────────────
EVAL_SET = [
    # OmniMindFlow
    {"project": "omf", "question": "Как автоматизировать утренний стендап команды?"},
    {"project": "omf", "question": "Что такое Flow Score и как его улучшить?"},
    {"project": "omf", "question": "Как OmniMindFlow помогает PM-у?"},
    {"project": "omf", "question": "Какие профили есть в системе?"},
    {"project": "omf", "question": "Как делегировать code review с помощью AI?"},
    {"project": "omf", "question": "Что такое квесты в OmniMindFlow?"},
    {"project": "omf", "question": "Чем OmniMindFlow отличается от обычного таск-менеджера?"},
    # WinExtraFlow
    {"project": "wef", "question": "Что такое WEF Score?"},
    {"project": "wef", "question": "Из каких факторов состоит оценка сигнала?"},
    {"project": "wef", "question": "Как работает copy trading в WinExtraFlow?"},
    {"project": "wef", "question": "Что значит WEF Score 85?"},
    {"project": "wef", "question": "Как выбрать провайдера сигналов?"},
    {"project": "wef", "question": "Что такое Sharpe Ratio в контексте WEF?"},
    {"project": "wef", "question": "Как WinExtraFlow помогает новичку в трейдинге?"},
    # AutoEvoFlow
    {"project": "aef", "question": "Как AutoEvoFlow снижает расходы на автопарк?"},
    {"project": "aef", "question": "Какие данные нужно внести для анализа парка?"},
    {"project": "aef", "question": "Что такое умная аналитика парка?"},
]


async def run_eval(questions: list[dict]) -> list[dict]:
    results = []
    for i, item in enumerate(questions, 1):
        project = item["project"]
        question = item["question"]
        print(f"[{i}/{len(questions)}] {project}: {question[:60]}...", end=" ", flush=True)
        t0 = time.monotonic()
        answer, backend, success, attempts = await _ask_ai(question, project)
        elapsed = round((time.monotonic() - t0) * 1000)
        print(f"→ {backend} ({elapsed}ms) {'✓' if success else '✗'}")
        results.append({
            "project": project,
            "question": question,
            "backend": backend,
            "success": success,
            "latency_ms": elapsed,
            "attempts": attempts,
            "answer": answer[:800] if success else None,
        })
        await asyncio.sleep(0.5)  # rate-limit buffer
    return results


def load_from_logs(n: int = 20) -> list[dict]:
    db_path = ROOT / "dev.db"
    if not db_path.exists():
        print("dev.db not found, using built-in eval set")
        return EVAL_SET
    with sqlite3.connect(db_path) as c:
        rows = c.execute(
            "SELECT DISTINCT question, project FROM AiLog "
            "WHERE success=1 ORDER BY created_at DESC LIMIT ?", (n,)
        ).fetchall()
    if not rows:
        print("No logs yet, using built-in eval set")
        return EVAL_SET
    print(f"Loaded {len(rows)} questions from AiLog")
    return [{"question": q, "project": p} for q, p in rows]


def compare_with_baseline(current: list[dict], baseline_path: str):
    with open(baseline_path, encoding="utf-8") as f:
        baseline = json.load(f)
    baseline_map = {(r["project"], r["question"]): r for r in baseline.get("results", [])}
    print("\n── DIFF vs baseline ──────────────────────────────────")
    for r in current:
        key = (r["project"], r["question"])
        prev = baseline_map.get(key)
        if not prev:
            print(f"NEW: [{r['project']}] {r['question'][:50]}")
            continue
        if prev["backend"] != r["backend"]:
            print(f"PROVIDER CHANGE: [{r['project']}] {r['question'][:50]}")
            print(f"  was={prev['backend']} now={r['backend']}")
        lat_diff = r["latency_ms"] - prev.get("latency_ms", 0)
        if abs(lat_diff) > 5000:
            sign = "+" if lat_diff > 0 else ""
            print(f"LATENCY SPIKE: [{r['project']}] {r['question'][:50]} ({sign}{lat_diff}ms)")


async def main():
    from_logs = "--from-logs" in sys.argv
    compare_path = None
    if "--compare" in sys.argv:
        idx = sys.argv.index("--compare")
        compare_path = sys.argv[idx + 1] if idx + 1 < len(sys.argv) else None

    questions = load_from_logs() if from_logs else EVAL_SET
    print(f"\nRunning eval: {len(questions)} questions\n")

    results = await run_eval(questions)

    success_rate = sum(1 for r in results if r["success"]) / len(results) * 100
    by_backend: dict[str, int] = {}
    for r in results:
        by_backend[r["backend"]] = by_backend.get(r["backend"], 0) + 1

    print(f"\n── SUMMARY ───────────────────────────────────────────")
    print(f"Success rate: {success_rate:.0f}%")
    print(f"Providers: {by_backend}")
    avg_lat = sum(r["latency_ms"] for r in results) / len(results)
    print(f"Avg latency: {avg_lat:.0f}ms")

    out = {
        "timestamp": datetime.now(UTC).isoformat(),
        "total": len(results),
        "success_rate": round(success_rate, 1),
        "by_backend": by_backend,
        "avg_latency_ms": round(avg_lat),
        "results": results,
    }

    ts = datetime.now(UTC).strftime("%Y%m%d_%H%M%S")
    out_path = Path(__file__).parent / f"eval-results-{ts}.json"
    out_path.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\nSaved → {out_path}")

    if compare_path:
        compare_with_baseline(results, compare_path)


if __name__ == "__main__":
    asyncio.run(main())
