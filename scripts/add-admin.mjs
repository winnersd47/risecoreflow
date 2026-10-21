import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.resolve(__dirname, "../dev.db");

const db = new Database(DB_PATH);

const email = "winnersd@gmail.com";
const password = "Yjhnljcn/95";
const username = "admin";
const plan = "agency";

// Check if already exists
const existing = db.prepare("SELECT id FROM User WHERE email = ?").get(email);
if (existing) {
  console.log("User already exists:", email);
  db.close();
  process.exit(0);
}

const id = crypto.randomUUID();
const passwordHash = bcrypt.hashSync(password, 12);
const referralCode = crypto.randomBytes(3).toString("hex").toUpperCase();
const now = new Date().toISOString();

db.prepare(`
  INSERT INTO User (id, email, username, passwordHash, plan, planExpiresAt, referralCode, createdAt, updatedAt)
  VALUES (?, ?, ?, ?, ?, NULL, ?, ?, ?)
`).run(id, email, username, passwordHash, plan, referralCode, now, now);

console.log("Admin created:");
console.log("  ID:", id);
console.log("  Email:", email);
console.log("  Plan:", plan);
console.log("  Referral:", referralCode);

db.close();
