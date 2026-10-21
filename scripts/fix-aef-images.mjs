import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.resolve(__dirname, "../dev.db"));
const AEF = "c9ace9bc69b9b114a13e885a";
const now = new Date().toISOString();
const past = "2026-06-24T12:00:00.000Z";

// Wikipedia Commons Special:FilePath — confirmed infobox images from Wikipedia articles
const WP = "https://commons.wikimedia.org/wiki/Special:FilePath";

const images = {
  // Text: "Porsche 911 2023 и Porsche 911 1963 — когда именно стала такой?"
  // → Porsche 911 No. 1,000,000 — iconic green, represents the 70-year journey
  story: `${WP}/Porsche_911_No_1000000,_70_Years_Porsche_Sports_Car,_Berlin_(1X7A3888).jpg`,

  // Text: "Honda Accord, BMW 5 Series, Tesla Model S, Mercedes EQS, Audi"
  // → BMW 5 Series G30 (the exact model mentioned first in comparison)
  pain: `${WP}/2018_BMW_520d_M_Sport_Automatic_2.0_(1).jpg`,

  // Text: "BMW → Genesis, Alfa Romeo → Lancia, Jaguar → Tesla"
  // → Lexus IS 300 F-Sport (Japanese car with European DNA — the platform theme)
  tip: `${WP}/2021_Lexus_IS300_F-Sport,_Front_Left,_10-10-2021.jpg`,

  // Text: "Lexus IS (2001), BMW 3-Series E46 — cosine similarity 0.847"
  // → BMW E46 — the exact car identified as visual match for Lexus IS
  case: `${WP}/BMW_E46_front_20080328.jpg`,

  // Text: "Tesla сломала всех", "30+ брендов, 500+ поколений"
  // → Tesla Model S — the car that disrupted design DNA of the industry
  offer: `${WP}/Tesla_Model_S_(Facelift_ab_04-2016)_(cropped).jpg`,
};

const upd = db.prepare(`
  UPDATE TelegramFunnelStep
  SET mediaUrl=?, status='scheduled', scheduledAt=?, updatedAt=?
  WHERE projectId=? AND type=?
`);

let count = 0;
for (const [type, url] of Object.entries(images)) {
  const r = upd.run(url, past, now, AEF, type);
  console.log(r.changes ? "✓" : "✗", type.padEnd(7), url.split("/Special:FilePath/")[1]?.slice(0, 55));
  count += r.changes;
}

console.log(`\nUpdated and scheduled: ${count} / 5`);
db.close();
