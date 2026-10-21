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
  const data = await res.json();
  if (!data.ok) throw new Error(`${method} failed: ${JSON.stringify(data)}`);
  return data.result;
}

// Check group
const chat = await api("getChat", { chat_id: AIGC_GROUP });
console.log("Group:", chat.title);
console.log("Forum mode:", chat.is_forum ?? false);

if (!chat.is_forum) {
  console.log("\n⚠️  Forum topics are NOT enabled in this group.");
  console.log("   Enable them: Group Settings → Topics → On");
  console.log("   Then re-run this script.\n");
  db.close();
  process.exit(1);
}

// Topic colors: blue, gold, purple
const projects = [
  { id: "cf1b70179ca6988ee74a86e4", name: "OmniMindFlow",  color: 7322096  },  // blue
  { id: "c72714de25a46517b596e9cb", name: "WinExtraFlow",  color: 16766590 },  // gold
  { id: "c9ace9bc69b9b114a13e885a", name: "AutoEvoFlow",   color: 13338331 },  // purple
];

for (const proj of projects) {
  try {
    const topic = await api("createForumTopic", {
      chat_id: AIGC_GROUP,
      name: proj.name,
      icon_color: proj.color,
    });
    const threadId = topic.message_thread_id;
    console.log(`✓ Created "${proj.name}" → thread_id: ${threadId}`);

    const row = db.prepare("SELECT botSettings FROM Project WHERE id=?").get(proj.id);
    if (row) {
      const settings = JSON.parse(row.botSettings || "{}");
      settings.targetGroupTopicId = threadId;
      db.prepare("UPDATE Project SET botSettings=?, updatedAt=? WHERE id=?")
        .run(JSON.stringify(settings), new Date().toISOString(), proj.id);
      console.log(`  → Saved to DB`);
    }
  } catch (e) {
    console.error(`✗ ${proj.name}:`, e.message);
  }
}

db.close();
console.log("\nDone. Restart bot.py to pick up new topic IDs.");
