import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.resolve(__dirname, "../dev.db"));
const now = new Date().toISOString();
const past = "2026-06-24T12:00:00.000Z"; // past → scheduler picks up immediately

const OMF = "cf1b70179ca6988ee74a86e4";
const WEF = "c72714de25a46517b596e9cb";
const AEF = "c9ace9bc69b9b114a13e885a";

// Unsplash URLs — topic-matched per post
const UNS = "https://images.unsplash.com";
const IMG = {
  // OmniMindFlow
  omf_story: `${UNS}/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1280&q=80`,  // team at office
  omf_pain:  `${UNS}/photo-1586473219010-2ffc57b0d282?auto=format&fit=crop&w=1280&q=80`,  // cluttered desk / overload
  omf_tip:   `${UNS}/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1280&q=80`,  // laptop with code
  omf_case:  `${UNS}/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1280&q=80`,    // analytics dashboard
  omf_offer: `${UNS}/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1280&q=80`, // growth chart / success

  // WinExtraFlow
  wef_story: `${UNS}/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1280&q=80`, // trading screens
  wef_pain:  `${UNS}/photo-1560472355-536de3962603?auto=format&fit=crop&w=1280&q=80`,    // stock market tickers
  wef_tip:   `${UNS}/photo-1642790551116-18e150f248e3?auto=format&fit=crop&w=1280&q=80`, // financial chart analysis
  wef_case:  `${UNS}/photo-1559526324-593bc073d938?auto=format&fit=crop&w=1280&q=80`,    // chart with results
  wef_offer: `${UNS}/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1280&q=80`, // coins / premium success

  // AutoEvoFlow
  aef_story: `${UNS}/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1280&q=80`, // classic Porsche 911
  aef_pain:  `${UNS}/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1280&q=80`, // multiple cars on road
  aef_tip:   `${UNS}/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1280&q=80`,   // Ferrari detail / car design
  aef_case:  `${UNS}/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1280&q=80`, // luxury sedan front
  aef_offer: `${UNS}/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&w=1280&q=80`,   // modern sports car
};

const steps = [
  { p: OMF, type: "story", img: IMG.omf_story },
  { p: OMF, type: "pain",  img: IMG.omf_pain  },
  { p: OMF, type: "tip",   img: IMG.omf_tip   },
  { p: OMF, type: "case",  img: IMG.omf_case  },
  { p: OMF, type: "offer", img: IMG.omf_offer },
  { p: WEF, type: "story", img: IMG.wef_story },
  { p: WEF, type: "pain",  img: IMG.wef_pain  },
  { p: WEF, type: "tip",   img: IMG.wef_tip   },
  { p: WEF, type: "case",  img: IMG.wef_case  },
  { p: WEF, type: "offer", img: IMG.wef_offer },
  { p: AEF, type: "story", img: IMG.aef_story },
  { p: AEF, type: "pain",  img: IMG.aef_pain  },
  { p: AEF, type: "tip",   img: IMG.aef_tip   },
  { p: AEF, type: "case",  img: IMG.aef_case  },
  { p: AEF, type: "offer", img: IMG.aef_offer },
];

const upd = db.prepare(`
  UPDATE TelegramFunnelStep
  SET status='scheduled', scheduledAt=?, mediaUrl=?, mediaType='photo', updatedAt=?
  WHERE projectId=? AND type=?
`);

let count = 0;
for (const s of steps) {
  const r = upd.run(past, s.img, now, s.p, s.type);
  const label = `${s.p.slice(-8)} ${s.type.padEnd(7)}`;
  console.log(r.changes ? "✓" : "✗", label, s.img.split("/photo-")[1]?.slice(0, 20));
  count += r.changes;
}
console.log("\nReset to scheduled:", count, "/ 15");
db.close();
