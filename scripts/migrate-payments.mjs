import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.resolve(__dirname, "../dev.db"));

db.exec(`
  CREATE TABLE IF NOT EXISTS Payment (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    gateway TEXT NOT NULL DEFAULT 'yookassa',
    plan TEXT NOT NULL,
    period TEXT NOT NULL DEFAULT 'monthly',
    amount REAL NOT NULL,
    currency TEXT DEFAULT 'RUB',
    status TEXT DEFAULT 'pending',
    txId TEXT,
    createdAt TEXT NOT NULL
  );
`);

console.log("Payment table ready.");
db.close();
