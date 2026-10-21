import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.resolve(__dirname, "../dev.db"));

db.exec(`
  CREATE TABLE IF NOT EXISTS TelegramFunnelStep (
    id TEXT PRIMARY KEY,
    projectId TEXT NOT NULL,
    type TEXT NOT NULL,
    title TEXT,
    content TEXT,
    status TEXT DEFAULT 'draft',
    scheduledAt TEXT,
    sortOrder INTEGER DEFAULT 0,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS SubscriberSource (
    id TEXT PRIMARY KEY,
    projectId TEXT NOT NULL,
    type TEXT NOT NULL,
    name TEXT NOT NULL,
    subscribersGained INTEGER DEFAULT 0,
    spent REAL DEFAULT 0,
    startDate TEXT,
    notes TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  );
`);

console.log("Telegram tables ready.");
db.close();
