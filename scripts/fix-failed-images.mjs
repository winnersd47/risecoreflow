import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.resolve(__dirname, "../dev.db"));

const WP = "https://commons.wikimedia.org/wiki/Special:FilePath";
const now = new Date().toISOString();
const past = "2026-06-24T12:00:00.000Z";

// Get project IDs
const OMF = db.prepare("SELECT id FROM Project WHERE name LIKE '%OmniMind%'").get()?.id;
const AEF = db.prepare("SELECT id FROM Project WHERE name LIKE '%AutoEvo%'").get()?.id;

console.log("OMF id:", OMF);
console.log("AEF id:", AEF);

const fixes = [
  // OMF tip: "5 вещей, которые OmniMindFlow делает за 30 секунд"
  // Laptop_collage.jpg was failing — use simpler filename with no special chars
  {
    projectId: OMF,
    type: "tip",
    // Multiple laptops on desk — Wikipedia "Laptop" article main image
    mediaUrl: `${WP}/Laptop_October_2008-1.jpg`,
    desc: "Laptop on a desk",
  },
  // AEF story: "Почему мы создали AutoEvoFlow" — Porsche URL has ( ) and , chars
  {
    projectId: AEF,
    type: "story",
    // Porsche 911 GT3 — clean filename, no special chars
    mediaUrl: `${WP}/Porsche_911_GT3_RS_(992)_IAA_Munich_2021.jpg`,
    desc: "Porsche 911 GT3 RS (clean URL)",
  },
  // AEF pain: "Вопрос, на который нет ответа — пока" — BMW URL has (1)
  {
    projectId: AEF,
    type: "pain",
    // BMW 3 series F30 — clean filename
    mediaUrl: `${WP}/BMW_3_Series_F30_LCI_%E2%80%93_Frontansicht%2C_7._Oktober_2015%2C_D%C3%BCsseldorf.jpg`,
    desc: "BMW 3 series",
  },
];

// Actually, let's try URL-encoding approach for existing filenames first
// Then fall back to alternatives
const urlEncodedFixes = [
  {
    projectId: OMF,
    type: "tip",
    // Simple direct Wikipedia image with no special chars
    mediaUrl: `${WP}/Laptop_October_2008-1.jpg`,
    desc: "Laptop on desk",
  },
  {
    projectId: AEF,
    type: "story",
    // Porsche 911 1 million — URL encode the special chars
    mediaUrl: encodeURI(`${WP}/Porsche_911_No_1000000,_70_Years_Porsche_Sports_Car,_Berlin_(1X7A3888).jpg`),
    desc: "Porsche 911 1 million (URL-encoded)",
  },
  {
    projectId: AEF,
    type: "pain",
    // BMW 520d — URL encode (1)
    mediaUrl: encodeURI(`${WP}/2018_BMW_520d_M_Sport_Automatic_2.0_(1).jpg`),
    desc: "BMW 520d (URL-encoded)",
  },
];

const upd = db.prepare(
  "UPDATE TelegramFunnelStep SET mediaUrl=?, status='sending', scheduledAt=?, updatedAt=? WHERE projectId=? AND type=?"
);

console.log("\nApplying URL-encoded fixes:");
for (const f of urlEncodedFixes) {
  if (!f.projectId) { console.log("✗ No project ID for", f.type); continue; }
  const r = upd.run(f.mediaUrl, past, now, f.projectId, f.type);
  console.log(r.changes ? "✓" : "✗", f.type.padEnd(7), f.desc);
  console.log("  URL:", f.mediaUrl.slice(0, 90));
}

db.close();
