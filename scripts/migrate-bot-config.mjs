import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.resolve(__dirname, "../dev.db"));

// Add botSettings column to Project if not exists
const cols = db.prepare("PRAGMA table_info(Project)").all().map(c => c.name);
if (!cols.includes("botSettings")) {
  db.exec(`ALTER TABLE Project ADD COLUMN botSettings TEXT`);
  console.log("Added botSettings column to Project.");
} else {
  console.log("botSettings column already exists.");
}

// Seed default config for OmniMindFlow project
const proj = db.prepare("SELECT id FROM Project WHERE name = 'OmniMindFlow'").get();
if (proj) {
  const defaultSettings = JSON.stringify({
    token: process.env.TELEGRAM_BOT_TOKEN || "",
    sourceChannels: [
      { id: "-1003686120408", label: "Profiles Channel" },
      { id: "-1004443980058", label: "VIP Channel" },
    ],
    targetGroupId: "-1003780381762",
    targetGroupLabel: "AI Growth Club",
    forwardTags: ["#repost", "#aigc"],
  });
  db.prepare("UPDATE Project SET botSettings = ? WHERE id = ?").run(defaultSettings, proj.id);
  console.log("Seeded default bot config for OmniMindFlow.");
}

db.close();
console.log("Bot config migration done.");
