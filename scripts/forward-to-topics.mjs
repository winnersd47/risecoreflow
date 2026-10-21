import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.resolve(__dirname, "../dev.db"));
const BOT_TOKEN = "8942312432:AAH2veIFPzRiJIavz9VuG2ILgk3AUY7HaHU";
const AIGC_GROUP = -1003780381762;

async function api(method, body) {
  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

// Latest send per (projectId + type) since today
const rows = db.prepare(`
  SELECT l.chatId, l.messageId, l.chatLabel, f.type, p.id AS projectId, p.botSettings, l.sentAt
  FROM SendLog l
  JOIN TelegramFunnelStep f ON l.stepId = f.id
  JOIN Project p ON l.projectId = p.id
  WHERE l.sentAt > '2026-06-25T12:00:00Z'
  ORDER BY l.sentAt DESC
`).all();

// Deduplicate: keep most recent per project+type
const seen = new Set();
const toForward = [];
for (const r of rows) {
  const key = `${r.projectId}:${r.type}`;
  if (!seen.has(key)) {
    seen.add(key);
    toForward.push(r);
  }
}

const typeOrder = { story: 1, pain: 2, tip: 3, case: 4, offer: 5 };
toForward.sort((a, b) => {
  if (a.projectId !== b.projectId) return a.projectId.localeCompare(b.projectId);
  return (typeOrder[a.type] || 9) - (typeOrder[b.type] || 9);
});

console.log(`Forwarding ${toForward.length} messages to AIGC topics...\n`);

for (const r of toForward) {
  const settings = JSON.parse(r.botSettings || "{}");
  const topicId = settings.targetGroupTopicId ?? null;
  const res = await api("forwardMessage", {
    chat_id: AIGC_GROUP,
    from_chat_id: parseInt(r.chatId),
    message_id: r.messageId,
    message_thread_id: topicId,
  });
  if (res.ok) {
    console.log(`✓ [${r.chatLabel}] ${r.type} → topic ${topicId ?? "General"} (AIGC msg ${res.result.message_id})`);
  } else {
    console.log(`✗ [${r.chatLabel}] ${r.type}: ${res.description}`);
  }
  // Small delay to avoid rate limiting
  await new Promise(r => setTimeout(r, 300));
}

db.close();
console.log("\nDone.");
