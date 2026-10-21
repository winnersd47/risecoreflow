import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.resolve(__dirname, "../dev.db"));
const OMF = "cf1b70179ca6988ee74a86e4";
const WEF = "c72714de25a46517b596e9cb";
const now = new Date().toISOString();
const past = "2026-06-24T12:00:00.000Z";

const WP = "https://commons.wikimedia.org/wiki/Special:FilePath";

const updates = [
  // ─── OmniMindFlow ────────────────────────────────────────────────────────────
  {
    p: OMF, type: "story",
    // Text: "3 companies, developers losing 2+ hours on routine"
    img: `${WP}/Pair_Programming_3.jpg`,
    desc: "Two developers reviewing code together",
  },
  {
    p: OMF, type: "pain",
    // Text: "98 minutes/day wasted: 35min status, 25min updates, 20min switching"
    img: `${WP}/Man_Overworked_At_Work.jpg`,
    desc: "Overworked person at desk",
  },
  {
    p: OMF, type: "tip",
    // Text: "5 features: morning brief, code review, content plan, metrics, Telegram funnel"
    img: `${WP}/Laptop_collage.jpg`,
    desc: "Collection of modern laptops / multiple devices",
  },
  {
    p: OMF, type: "case",
    // Text: "Standup from 45 min → 8 min, AI gathered context, one dashboard instead of three tables"
    img: `${WP}/Daily_sprint_meeting.jpg`,
    desc: "Daily sprint standup meeting in progress",
  },
  {
    p: OMF, type: "offer",
    // Text: "Register, promo RISECOREFLOW, 30 days Pro free, Growth Engine"
    // Unsplash business/growth chart — confirmed as business finance image
    img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1280&q=80",
    desc: "Business growth chart",
  },

  // ─── WinExtraFlow ─────────────────────────────────────────────────────────────
  {
    p: WEF, type: "story",
    // Text: "Trader opens 5-7 Telegram channels, 3 analytics sites, 2 exchanges every morning"
    img: `${WP}/NY_stock_exchange_traders_floor_LC-U9-10548-6.jpg`,
    desc: "NYSE traders on exchange floor — represents trading activity",
  },
  {
    p: WEF, type: "pain",
    // Text: "Subscribed to 10 signal channels, all claim 85%+ win rate, nobody shows losing trades"
    img: `${WP}/Day_of_stock_price_changes.png`,
    desc: "Stock price changes throughout a trading day",
  },
  {
    p: WEF, type: "tip",
    // Text: "WEF Score 0-100, 9 factors: Sharpe Ratio, Profit Factor, Max Drawdown, Risk/Reward"
    img: `${WP}/Soporte-resistencia_reverseroles.jpg`,
    desc: "Technical analysis chart showing support and resistance levels",
  },
  {
    p: WEF, type: "case",
    // Text: "MOEX investor, 2 years experience, improved from -6% to +10% quarterly"
    img: `${WP}/Moscow_Exhacnge_main_building.jpg`,
    desc: "Moscow Exchange building — exactly matches MOEX in case text",
  },
  {
    p: WEF, type: "offer",
    // Text: "WEF Score real-time, 77 strategies, signals from 9 exchanges, portfolio analysis"
    img: `${WP}/Algorithmic_Trading._Percentage_of_Market_Volume.png`,
    desc: "Algorithmic trading volume chart — AI-driven signal analysis",
  },
];

const upd = db.prepare(`
  UPDATE TelegramFunnelStep
  SET mediaUrl=?, status='scheduled', scheduledAt=?, updatedAt=?
  WHERE projectId=? AND type=?
`);

let count = 0;
for (const u of updates) {
  const r = upd.run(u.img, past, now, u.p, u.type);
  const proj = u.p === OMF ? "OMF" : "WEF";
  console.log(r.changes ? "✓" : "✗", proj, u.type.padEnd(7), u.desc);
  count += r.changes;
}

console.log(`\nUpdated and scheduled: ${count} / 10`);
db.close();
