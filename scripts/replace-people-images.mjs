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
  return res.json();
}

function newId() { return "c" + crypto.randomBytes(12).toString("hex"); }

const WP_DIRECT = "https://upload.wikimedia.org/wikipedia/commons";

// Replacements: people-free images that match post content
const replacements = [
  {
    project: "OmniMindFlow", type: "story",
    // "3 companies, AI saves 2+ hrs/day" → JavaScript code (what developers actually work with)
    mediaUrl: `${WP_DIRECT}/a/a4/JavaScript_code.png`,
    desc: "JavaScript code — no people",
  },
  {
    project: "OmniMindFlow", type: "pain",
    // "98 minutes/day wasted" → hourglass = time concept, no person
    mediaUrl: `${WP_DIRECT}/b/bc/Hourglass.jpg`,
    desc: "Hourglass — time wasted concept, no people",
  },
  {
    project: "OmniMindFlow", type: "case",
    // "Standup 45→8 min, one dashboard" → scrum task board = sprint organization
    mediaUrl: `${WP_DIRECT}/1/1b/Scrum_task_board.jpg`,
    desc: "Scrum task board — no people",
  },
  {
    project: "WinExtraFlow", type: "story",
    // "Opens 5-7 Telegram channels, 3 analytics sites, 2 exchanges" → Bloomberg Terminal
    mediaUrl: `${WP_DIRECT}/d/d8/Bloomberg_Terminal.jpg`,
    desc: "Bloomberg Terminal — no people",
  },
];

const now = new Date().toISOString();
const past = "2026-06-24T12:00:00.000Z";

for (const rep of replacements) {
  const projRow = db.prepare("SELECT id FROM Project WHERE name LIKE ?").get(`%${rep.project}%`);
  if (!projRow) { console.log("✗ project not found:", rep.project); continue; }

  // Get current step + SendLog entry
  const step = db.prepare("SELECT id FROM TelegramFunnelStep WHERE projectId=? AND type=?")
    .get(projRow.id, rep.type);
  if (!step) { console.log("✗ step not found:", rep.project, rep.type); continue; }

  const logEntry = db.prepare("SELECT messageId, chatId FROM SendLog WHERE stepId=?").get(step.id);

  // 1. Delete old message from channel
  if (logEntry) {
    const delRes = await tg("deleteMessage", {
      chat_id: parseInt(logEntry.chatId),
      message_id: logEntry.messageId,
    });
    console.log(delRes.ok ? "✓ deleted" : "✗ del failed", rep.project, rep.type, "msg", logEntry.messageId);
    // Remove from SendLog
    db.prepare("DELETE FROM SendLog WHERE stepId=?").run(step.id);
  }

  // Also delete AIGC forward (search SendLog for chatId = AIGC group)
  const aigcEntry = db.prepare("SELECT messageId, chatId FROM SendLog WHERE stepId=? AND chatId=?")
    .get(step.id, "-1003780381762");
  // Actually AIGC forwards might not be in SendLog - let's skip for now

  // 2. Update mediaUrl + reset to sending
  db.prepare("UPDATE TelegramFunnelStep SET mediaUrl=?, status='sending', scheduledAt=?, updatedAt=? WHERE id=?")
    .run(rep.mediaUrl, past, now, step.id);

  console.log(`  → updated ${rep.project} ${rep.type}: ${rep.desc}`);
}

console.log("\nNow running sender...\n");
db.close();
