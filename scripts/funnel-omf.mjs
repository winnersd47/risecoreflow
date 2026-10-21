/**
 * funnel-omf.mjs — OmniMindFlow diagnostic funnel
 *
 * Scheme: Pain → Proof → VIP invite (3 Reels)
 *   Clip 1 (Pain)    → Telegram main + VK draft
 *   Clip 2 (Proof)   → Telegram main + VK draft
 *   Clip 3 (Invite)  → Telegram main + Telegram VIP + VK draft
 *
 * Usage:
 *   node scripts/funnel-omf.mjs                         # generate clips only
 *   node scripts/funnel-omf.mjs --post                  # generate + publish
 *   node scripts/funnel-omf.mjs --post --vip-link URL   # custom VIP invite link
 *   node scripts/funnel-omf.mjs --post --dry-tg         # post to VK only (test)
 */

import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";
import https from "https";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const TMP = path.join(ROOT, ".tmp-funnel-omf");

// ─── Env ─────────────────────────────────────────────────────────────────────
const env = Object.fromEntries(
  fs.readFileSync(path.join(ROOT, "tg-bot/.env"), "utf-8")
    .split("\n").filter(l => l.includes("=") && !l.startsWith("#"))
    .map(l => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);

const TG_TOKEN    = env.BOT_TOKEN;
const TG_MAIN     = env.OMF_CHANNEL_PROFILES_ID;   // main content channel
const TG_VIP      = env.OMF_CHANNEL_VIP_ID;        // VIP channel
const VK_TOKEN_U  = env.VK_USER_TOKEN;             // user token for video.save
const VK_TOKEN_G  = env.VK_ACCESS_TOKEN;           // group token for wall.post
const VK_GID      = Math.abs(parseInt(env.VK_GROUP_ID || "0"));

// ─── CLI args ────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const get = (f, d) => { const i = argv.indexOf(f); return i !== -1 ? argv[i + 1] : d; };

const doPost = argv.includes("--post");
const dryTg  = argv.includes("--dry-tg");   // skip Telegram, only VK
const dryVk  = argv.includes("--dry-vk");   // skip VK, only Telegram
const vipLink = get("--vip-link", "https://t.me/+OmniMindFlowVIP");  // update with real link

// ─── Funnel definition ───────────────────────────────────────────────────────
// Clips are defined with standard vk-slideshow preset JSON format.
// imageQuery is used for Wikimedia search; falls back to colour gradient if blocked.
const FUNNEL = [
  {
    id: "funnel-1-pain",
    tgChannels: [TG_MAIN],
    vkDraft: true,
    preset: {
      title: "OmniMindFlow: разработчик теряет 98 минут в день",
      brand: "OmniMindFlow",
      voice: "ru-RU-DmitryNeural",
      slides: [
        {
          text: "98 минут в день. Столько средний разработчик тратит на рутину: стендапы, переключение контекста, ручной сбор метрик.",
          label: "Факт",
          imageQuery: "developer computer work office tired burnout",
        },
        {
          text: "8 часов в неделю — это целый рабочий день. Он уходит на копирование данных и переключения, а не на продукт.",
          label: "Цена рутины",
          imageQuery: "time clock wasted calendar stress productivity",
        },
        {
          text: "Существует способ сократить это до 12 минут. Без потери качества. Как — рассказываю в VIP-канале.",
          label: "Решение есть",
          imageQuery: "solution technology automation business growth chart",
        },
      ],
    },
  },

  {
    id: "funnel-2-proof",
    tgChannels: [TG_MAIN],
    vkDraft: true,
    preset: {
      title: "OmniMindFlow: стендап с 45 до 8 минут",
      brand: "OmniMindFlow",
      voice: "ru-RU-DmitryNeural",
      slides: [
        {
          text: "Команда из 4 разработчиков. Ежедневный стендап занимал 45 минут. Через 2 недели с OmniMindFlow — 8 минут.",
          label: "Кейс",
          imageQuery: "small team startup developers office meeting whiteboard",
        },
        {
          text: "AI-агент собирает статусы, генерирует брифинг дня, фиксирует блокеры. Команда только подтверждает — за 8 минут.",
          label: "Как работает",
          imageQuery: "artificial intelligence automation workflow dashboard saas",
        },
        {
          text: "Хочешь узнать, где именно твоя команда теряет больше всего? Бесплатная диагностика — в VIP-канале.",
          label: "Твоя очередь",
          imageQuery: "business consulting analysis meeting professional growth",
        },
      ],
    },
  },

  {
    id: "funnel-3-invite",
    tgChannels: [TG_MAIN, TG_VIP],
    vkDraft: true,
    preset: {
      title: "OmniMindFlow: бесплатная диагностика workflow",
      brand: "OmniMindFlow",
      voice: "ru-RU-DmitryNeural",
      slides: [
        {
          text: "Бесплатная диагностика workflow. 30 минут — и ты точно знаешь, где твоя команда теряет время и деньги.",
          label: "Диагностика",
          imageQuery: "business diagnosis consulting professional analysis meeting",
        },
        {
          text: "На разборе: текущий workflow, узкие места, конкретные шаги автоматизации под твою команду. Без воды.",
          label: "Что получишь",
          imageQuery: "business process optimization workflow analysis plan",
        },
        {
          text: `Только 5 мест. Только для подписчиков VIP-канала. Записаться: ${vipLink}`,
          label: "Записаться",
          imageQuery: "vip exclusive access limited offer membership premium",
        },
      ],
    },
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function banner(msg) { console.log(`\n${"═".repeat(55)}\n  ${msg}\n${"═".repeat(55)}`); }
function step(msg)   { console.log(`  ▶ ${msg}`); }
function ok(msg)     { console.log(`  ✓ ${msg}`); }
function warn(msg)   { console.warn(`  ⚠ ${msg}`); }

// Run vk-slideshow.mjs as subprocess (generation only, no posting)
function generateClip(presetJson, outPath) {
  const tmpJson = path.join(TMP, "slides-tmp.json");
  fs.writeFileSync(tmpJson, JSON.stringify(presetJson, null, 2));

  const r = spawnSync("node", [
    path.join(__dirname, "vk-slideshow.mjs"),
    "--slides", tmpJson,
    "--out", outPath,
  ], { stdio: "inherit" });

  if (r.status !== 0) throw new Error("vk-slideshow.mjs failed");
  fs.unlinkSync(tmpJson);
}

// ─── Telegram upload ──────────────────────────────────────────────────────────
function uploadToTelegram(filePath, caption, channelId) {
  return new Promise((resolve, reject) => {
    const fileBuffer = fs.readFileSync(filePath);
    const boundary = "TGFunnel" + Math.random().toString(36).slice(2);

    const textParts = [
      `--${boundary}\r\nContent-Disposition: form-data; name="chat_id"\r\n\r\n${channelId}`,
      `--${boundary}\r\nContent-Disposition: form-data; name="caption"\r\n\r\n${caption}`,
      `--${boundary}\r\nContent-Disposition: form-data; name="supports_streaming"\r\n\r\ntrue`,
    ].join("\r\n") + "\r\n";

    const fileHeader = `--${boundary}\r\nContent-Disposition: form-data; name="video"; filename="clip.mp4"\r\nContent-Type: video/mp4\r\n\r\n`;

    const body = Buffer.concat([
      Buffer.from(textParts),
      Buffer.from(fileHeader),
      fileBuffer,
      Buffer.from(`\r\n--${boundary}--\r\n`),
    ]);

    const req = https.request({
      hostname: "api.telegram.org",
      path: `/bot${TG_TOKEN}/sendVideo`,
      method: "POST",
      headers: {
        "Content-Type": `multipart/form-data; boundary=${boundary}`,
        "Content-Length": body.length,
      },
      rejectUnauthorized: false,
    }, (res) => {
      let raw = "";
      res.on("data", c => raw += c);
      res.on("end", () => {
        try {
          const data = JSON.parse(raw);
          if (!data.ok) return reject(new Error(`TG sendVideo: ${data.description || JSON.stringify(data)}`));
          const msgId = data.result.message_id;
          resolve(`https://t.me/c/${String(channelId).replace(/^-100/, "")}/${msgId}`);
        } catch (e) { reject(e); }
      });
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

// ─── Telegram text message (for VIP channel CTA) ──────────────────────────────
function sendTelegramText(channelId, text) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ chat_id: channelId, text, parse_mode: "HTML" });
    const req = https.request({
      hostname: "api.telegram.org",
      path: `/bot${TG_TOKEN}/sendMessage`,
      method: "POST",
      headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) },
      rejectUnauthorized: false,
    }, (res) => {
      let raw = "";
      res.on("data", c => raw += c);
      res.on("end", () => {
        try {
          const d = JSON.parse(raw);
          if (!d.ok) return reject(new Error(`TG sendMessage: ${d.description || JSON.stringify(d)}`));
          resolve(d.result.message_id);
        } catch (e) { reject(e); }
      });
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

// ─── VK: save video as private draft (no wall post) ──────────────────────────
// video.save with privacy_view=only_me + wallpost=0 → video only visible to owner
function uploadToVkDraft(filePath, videoTitle) {
  return new Promise(async (resolve, reject) => {
    try {
      // Step 1: get upload URL
      const saveData = await vkApi("video.save", {
        name: videoTitle,
        description: "AIGrowth | OmniMindFlow diagnostic funnel",
        wallpost: 0,           // don't publish to wall automatically
        privacy_view: "only_me",
        privacy_comment: "only_me",
      }, VK_TOKEN_U);

      // Step 2: upload file
      const fileBuffer = fs.readFileSync(filePath);
      const boundary = "VKFunnel" + Math.random().toString(36).slice(2);
      const body = Buffer.concat([
        Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="video_file"; filename="clip.mp4"\r\nContent-Type: video/mp4\r\n\r\n`),
        fileBuffer,
        Buffer.from(`\r\n--${boundary}--\r\n`),
      ]);

      const uploadUrl = new URL(saveData.upload_url);
      const uploadRes = await new Promise((res2, rej2) => {
        const req = https.request({
          hostname: uploadUrl.hostname,
          path: uploadUrl.pathname + uploadUrl.search,
          method: "POST",
          headers: {
            "Content-Type": `multipart/form-data; boundary=${boundary}`,
            "Content-Length": body.length,
          },
          rejectUnauthorized: false,
        }, (resp) => {
          let raw = "";
          resp.on("data", c => raw += c);
          resp.on("end", () => {
            try { res2(JSON.parse(raw)); } catch (e) { rej2(e); }
          });
        });
        req.on("error", rej2);
        req.write(body);
        req.end();
      });

      if (uploadRes.error) throw new Error(`VK upload error: ${JSON.stringify(uploadRes)}`);

      resolve(`https://vk.com/video${saveData.owner_id}_${saveData.video_id}`);
    } catch (e) { reject(e); }
  });
}

function vkApi(method, params, token) {
  return new Promise((resolve, reject) => {
    const qs = new URLSearchParams({ access_token: token, v: "5.131", ...params });
    const body = qs.toString();
    const req = https.request({
      hostname: "api.vk.com",
      path: `/method/${method}`,
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", "Content-Length": Buffer.byteLength(body) },
      rejectUnauthorized: false,
    }, (res) => {
      let raw = "";
      res.on("data", c => raw += c);
      res.on("end", () => {
        try {
          const d = JSON.parse(raw);
          if (d.error) return reject(new Error(`VK ${method}: ${d.error.error_msg} (${d.error.error_code})`));
          resolve(d.response);
        } catch (e) { reject(e); }
      });
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

// ─── Main ────────────────────────────────────────────────────────────────────
banner("OmniMindFlow Diagnostic Funnel");
console.log(`  Клипов: ${FUNNEL.length} | Режим: ${doPost ? "ПУБЛИКАЦИЯ" : "только генерация"}`);
if (doPost) {
  console.log(`  TG main : ${TG_MAIN}`);
  console.log(`  TG VIP  : ${TG_VIP}`);
  console.log(`  VK      : группа ${VK_GID} (черновик, только тебе)`);
  console.log(`  VIP ссылка: ${vipLink}`);
}

if (!fs.existsSync(TMP)) fs.mkdirSync(TMP, { recursive: true });

const clipPaths = [];

// ── Phase 1: generate all clips ──────────────────────────────────────────────
for (const clip of FUNNEL) {
  const outPath = path.join(ROOT, `${clip.id}.mp4`);
  clipPaths.push(outPath);

  banner(`Генерирую: ${clip.id}`);
  step(`Заголовок: "${clip.preset.title}"`);
  step(`Слайды: ${clip.preset.slides.length}`);

  generateClip(clip.preset, outPath);

  const sizeMb = (fs.statSync(outPath).size / 1024 / 1024).toFixed(1);
  ok(`Готов: ${outPath} (${sizeMb} MB)`);
}

// ── Phase 2: publish ──────────────────────────────────────────────────────────
if (!doPost) {
  banner("Клипы сгенерированы. Добавь --post для публикации.");
  fs.rmSync(TMP, { recursive: true });
  process.exit(0);
}

for (let i = 0; i < FUNNEL.length; i++) {
  const clip = FUNNEL[i];
  const mp4 = clipPaths[i];
  banner(`Публикую: ${clip.id}`);

  // Telegram channels
  if (!dryTg) {
    for (const channelId of clip.tgChannels) {
      const chanName = channelId === TG_VIP ? "VIP" : "main";
      process.stdout.write(`  ▶ Telegram [${chanName}]... `);
      try {
        const url = await uploadToTelegram(mp4, clip.preset.title, channelId);
        ok(`${url}`);
      } catch (e) {
        warn(`Telegram [${chanName}] ошибка: ${e.message}`);
      }
    }
  }

  // VK draft
  if (!dryVk && clip.vkDraft && VK_TOKEN_U && VK_GID) {
    process.stdout.write(`  ▶ ВКонтакте (черновик)... `);
    try {
      const url = await uploadToVkDraft(mp4, clip.preset.title);
      ok(`${url} (только тебе)`);
    } catch (e) {
      warn(`ВКонтакте ошибка: ${e.message}`);
    }
  }
}

// ── VIP channel: text announcement after clip 3 ───────────────────────────────
if (!dryTg && TG_TOKEN && TG_VIP) {
  banner("Отправляю анонс в VIP-канал");
  const vipText = `🎯 <b>Бесплатная диагностика workflow — запись открыта</b>

За 30 минут разберём:
• Где именно твоя команда теряет время
• Какие задачи можно автоматизировать прямо сейчас
• Конкретный план под твой стек и процессы

<b>Мест: 5</b> — только для подписчиков этого канала.

Записаться: ${vipLink}`;
  try {
    await sendTelegramText(TG_VIP, vipText);
    ok("Анонс отправлен в VIP-канал");
  } catch (e) {
    warn(`Анонс VIP: ${e.message}`);
  }
}

fs.rmSync(TMP, { recursive: true });
banner("Воронка запущена!");
console.log("  Clips:");
clipPaths.forEach((p, i) => console.log(`    ${i + 1}. ${path.basename(p)}`));
