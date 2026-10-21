/**
 * Standalone funnel sender — no Telegram polling, no conflicts.
 * Reads scheduled steps from DB, sends via HTTP API, logs to SendLog.
 */
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.resolve(__dirname, "../dev.db"));
const BOT_TOKEN = "8942312432:AAH2veIFPzRiJIavz9VuG2ILgk3AUY7HaHU";
const API = `https://api.telegram.org/bot${BOT_TOKEN}`;

async function tg(method, body) {
  const res = await fetch(`${API}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(`${method} failed: ${JSON.stringify(data)}`);
  return data.result;
}

function newId() {
  return "c" + crypto.randomBytes(12).toString("hex");
}

// Ensure SendLog exists
db.exec(`CREATE TABLE IF NOT EXISTS SendLog (
  id TEXT PRIMARY KEY,
  projectId TEXT NOT NULL,
  stepId TEXT,
  chatId TEXT NOT NULL,
  chatLabel TEXT,
  textPreview TEXT,
  messageId INTEGER,
  sentAt TEXT NOT NULL
)`);

const now = new Date().toISOString();

const rows = db.prepare(`
  SELECT s.id, s.projectId, s.title, s.content, s.mediaUrl, s.mediaType, p.botSettings, p.name AS projectName
  FROM TelegramFunnelStep s
  JOIN Project p ON s.projectId = p.id
  WHERE s.status IN ('scheduled', 'sending') AND s.scheduledAt IS NOT NULL AND s.scheduledAt <= ?
  ORDER BY p.name, s.type
`).all(now);

console.log(`Found ${rows.length} scheduled steps to send\n`);

if (rows.length === 0) {
  console.log("Nothing to send. Check that steps have status='scheduled' and scheduledAt in the past.");
  db.close();
  process.exit(0);
}

let ok = 0, fail = 0;

for (const row of rows) {
  const settings = JSON.parse(row.botSettings || "{}");
  const sourceChannels = settings.sourceChannels || [];
  const chatIdStr = settings.publishChannelId || (sourceChannels[0]?.id ?? null);
  const chatLabel = settings.publishChannelLabel || (sourceChannels[0]?.label ?? "");
  const targetGroupId = settings.targetGroupId ? parseInt(settings.targetGroupId) : null;
  const topicId = settings.targetGroupTopicId ?? null;

  if (!chatIdStr) {
    console.log(`✗ [${row.projectName}] ${row.title} — no channel configured`);
    fail++;
    continue;
  }

  const chatId = parseInt(chatIdStr);
  const text = row.title ? `<b>${row.title}</b>\n\n${row.content}` : (row.content || "");
  const caption = text.slice(0, 1024);

  try {
    let result;
    if (row.mediaUrl) {
      if (row.mediaType === "video") {
        result = await tg("sendVideo", { chat_id: chatId, video: row.mediaUrl, caption, parse_mode: "HTML" });
      } else if (row.mediaType === "document") {
        result = await tg("sendDocument", { chat_id: chatId, document: row.mediaUrl, caption, parse_mode: "HTML" });
      } else {
        result = await tg("sendPhoto", { chat_id: chatId, photo: row.mediaUrl, caption, parse_mode: "HTML" });
      }
      console.log(`✓ [${row.projectName}] ${row.title} — sendPhoto → ${chatLabel} (msg ${result.message_id})`);
    } else {
      result = await tg("sendMessage", { chat_id: chatId, text, parse_mode: "HTML", disable_web_page_preview: true });
      console.log(`✓ [${row.projectName}] ${row.title} — sendMessage → ${chatLabel} (msg ${result.message_id})`);
    }

    // Forward to AIGC group in correct topic
    if (targetGroupId) {
      try {
        const fwd = { chat_id: targetGroupId, from_chat_id: chatId, message_id: result.message_id };
        if (topicId) fwd.message_thread_id = topicId;
        await tg("forwardMessage", fwd);
        console.log(`  ↳ forwarded → AIGC group (topic=${topicId ?? "General"})`);
      } catch (e) {
        console.log(`  ↳ forward FAILED: ${e.message}`);
      }
    }

    // Update DB
    db.prepare("UPDATE TelegramFunnelStep SET status='sent', updatedAt=? WHERE id=?").run(now, row.id);
    db.prepare(`INSERT INTO SendLog (id,projectId,stepId,chatId,chatLabel,textPreview,messageId,sentAt)
                VALUES (?,?,?,?,?,?,?,?)`).run(
      newId(), row.projectId, row.id, String(chatId), chatLabel,
      text.length > 120 ? text.slice(0, 120) + "…" : text,
      result.message_id, now
    );

    ok++;
  } catch (e) {
    console.log(`✗ [${row.projectName}] ${row.title} — FAILED: ${e.message}`);
    fail++;
  }

  // Rate limit: 1 msg/sec per chat
  await new Promise(r => setTimeout(r, 1000));
}

console.log(`\n✓ Sent: ${ok}  ✗ Failed: ${fail}`);
db.close();
