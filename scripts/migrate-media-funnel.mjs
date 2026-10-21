import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.resolve(__dirname, "../dev.db"));

const cols = db.prepare("PRAGMA table_info(TelegramFunnelStep)").all().map(c => c.name);

if (!cols.includes("mediaUrl")) {
  db.exec("ALTER TABLE TelegramFunnelStep ADD COLUMN mediaUrl TEXT");
  console.log("Added mediaUrl column.");
} else {
  console.log("mediaUrl already exists.");
}

if (!cols.includes("mediaType")) {
  db.exec("ALTER TABLE TelegramFunnelStep ADD COLUMN mediaType TEXT DEFAULT 'photo'");
  console.log("Added mediaType column.");
} else {
  console.log("mediaType already exists.");
}

db.close();
console.log("Migration done.");
