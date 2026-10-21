import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.resolve(__dirname, "../dev.db"));
const BOT_TOKEN = "8942312432:AAH2veIFPzRiJIavz9VuG2ILgk3AUY7HaHU";

async function del(chatId, msgId) {
  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/deleteMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, message_id: msgId }),
  });
  const data = await res.json();
  return data.ok;
}

// 1. Delete from SendLog
const rows = db.prepare("SELECT chatId, chatLabel, messageId FROM SendLog ORDER BY sentAt").all();
console.log(`Deleting ${rows.length} messages from SendLog...`);
let ok = 0, fail = 0;

for (const r of rows) {
  const success = await del(parseInt(r.chatId), r.messageId);
  console.log(success ? "✓" : "✗", r.chatLabel?.slice(0, 25).padEnd(25), "msg", r.messageId);
  success ? ok++ : fail++;
  await new Promise(r => setTimeout(r, 80));
}

// 2. Clear SendLog
db.prepare("DELETE FROM SendLog").run();
console.log("\nSendLog cleared.");
console.log(`Done: ${ok} deleted, ${fail} already gone`);
db.close();
