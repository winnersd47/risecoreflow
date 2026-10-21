import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.resolve(__dirname, "../dev.db"));

const past = "2026-06-24T12:00:00.000Z";
const now = new Date().toISOString();

const r = db.prepare(
  "UPDATE TelegramFunnelStep SET status='scheduled', scheduledAt=?, updatedAt=? WHERE 1=1"
).run(past, now);

console.log(`Reset ${r.changes} steps → scheduled`);

// Verify
const rows = db.prepare(
  "SELECT p.name AS project, s.type, s.status, s.mediaUrl FROM TelegramFunnelStep s JOIN Project p ON s.projectId=p.id ORDER BY p.name, s.type"
).all();

for (const row of rows) {
  const hasImg = row.mediaUrl ? "✓" : "✗ NO IMG";
  console.log(hasImg, row.status.padEnd(10), row.project.padEnd(14), row.type);
}

db.close();
