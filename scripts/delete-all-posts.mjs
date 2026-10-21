import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.resolve(__dirname, "../dev.db"));
const BOT_TOKEN = "8942312432:AAH2veIFPzRiJIavz9VuG2ILgk3AUY7HaHU";
const AIGC_GROUP = -1003780381762;

async function del(chatId, msgId) {
  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/deleteMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, message_id: msgId }),
  });
  const data = await res.json();
  return data.ok;
}

// 1. Delete from project channels + early AIGC (from SendLog)
const rows = db.prepare("SELECT chatId, chatLabel, messageId FROM SendLog ORDER BY sentAt").all();
console.log(`Deleting ${rows.length} messages from SendLog...`);
let ok = 0, fail = 0;
for (const r of rows) {
  const success = await del(parseInt(r.chatId), r.messageId);
  console.log(success ? "✓" : "✗", r.chatLabel?.slice(0, 28).padEnd(28), "msg", r.messageId);
  success ? ok++ : fail++;
  await new Promise(r => setTimeout(r, 50)); // rate limit
}

// 2. Delete AIGC topic forwards (msgs 50–79 sent by forward-to-topics.mjs)
console.log("\nDeleting AIGC topic forwards (50–79)...");
for (let msgId = 50; msgId <= 79; msgId++) {
  const success = await del(AIGC_GROUP, msgId);
  console.log(success ? "✓" : "✗", "AIGC group msg", msgId);
  ok += success ? 1 : 0;
  fail += success ? 0 : 1;
  await new Promise(r => setTimeout(r, 50));
}

// 3. Clear SendLog
db.prepare("DELETE FROM SendLog").run();
console.log("\nSendLog cleared.");
console.log(`\nDone: ${ok} deleted, ${fail} failed (already deleted or not found)`);
db.close();
