"""Ручной монитор апдейтов — проверяет что приходит от Telegram."""
import httpx, json, time, sys

TOKEN = open(".env").read()
TOKEN = [l for l in TOKEN.splitlines() if l.startswith("BOT_TOKEN=")][0].split("=",1)[1].strip()

BASE = f"https://api.telegram.org/bot{TOKEN}"
offset = 0

print(f"Token: {TOKEN[:20]}...")
print("Ожидаю сообщений. Отправь /start боту прямо сейчас...\n")

for i in range(30):  # 30 итераций × timeout=3 = ~90 секунд
    try:
        r = httpx.get(f"{BASE}/getUpdates", params={"offset": offset, "timeout": 3}, timeout=10, verify=False)
        data = r.json()
        if not data.get("ok"):
            print(f"API error: {data}")
            break
        updates = data["result"]
        if updates:
            for u in updates:
                print(json.dumps(u, ensure_ascii=False, indent=2))
                offset = u["update_id"] + 1
        else:
            print(f"[{i+1}] пусто (offset={offset})", flush=True)
    except Exception as e:
        print(f"Ошибка: {e}", flush=True)
    sys.stdout.flush()

print("Мониторинг завершён.")
