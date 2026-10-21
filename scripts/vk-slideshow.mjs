/**
 * vk-slideshow.mjs — Slideshow clips: photos + voice per slide
 *
 * Usage:
 *   node scripts/vk-slideshow.mjs --preset omf|wef|aef [--out file.mp4]
 *   node scripts/vk-slideshow.mjs --slides slides.json [--out file.mp4]
 *   node scripts/vk-slideshow.mjs --scenario продающий:1 --brand "OmniMindFlow" --product "AI-агент" --niche "SaaS"
 *   node scripts/vk-slideshow.mjs --list-scenarios
 *
 * Scenario types: продающий (с) | вовлекающий (в) | личный (л) | тематический (т) | репутационный (р)
 *
 * Slide fields (imageUrl OR imageQuery, not both):
 *   imageUrl   — direct URL to image (Special:FilePath or upload.wikimedia.org)
 *   imageQuery — search Wikimedia Commons automatically by keyword
 *   imagePath  — local file path
 */

import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";
import { SCENARIOS, listScenarios, findScenario, parseScenarioSlides } from "./content-scenarios.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const TMP = path.join(ROOT, ".tmp-slides");

// ─── Load .env ────────────────────────────────────────────────────────────────
const env = Object.fromEntries(
  fs.readFileSync(path.join(ROOT, "tg-bot/.env"), "utf-8")
    .split("\n").filter(l => l.includes("=") && !l.startsWith("#"))
    .map(l => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);

// ─── FFmpeg path ──────────────────────────────────────────────────────────────
const FFMPEG = (() => {
  const r = spawnSync("ffmpeg", ["-version"], { stdio: "ignore" });
  if (!r.error) return "ffmpeg";
  const winget = `${process.env.LOCALAPPDATA}\\Microsoft\\WinGet\\Packages`;
  if (!fs.existsSync(winget)) throw new Error("FFmpeg not found");
  for (const d of fs.readdirSync(winget).filter(d => d.startsWith("Gyan.FFmpeg"))) {
    const base = path.join(winget, d);
    const entries = fs.readdirSync(base, { withFileTypes: true }).filter(e => e.isDirectory());
    for (const e of entries) {
      const p = path.join(base, e.name, "bin", "ffmpeg.exe");
      if (fs.existsSync(p)) return p;
    }
  }
  throw new Error("FFmpeg not found. Restart terminal after winget install.");
})();

const FFPROBE = fs.existsSync(FFMPEG.replace("ffmpeg.exe", "ffprobe.exe"))
  ? FFMPEG.replace("ffmpeg.exe", "ffprobe.exe")
  : FFMPEG.replace(/[/\\]ffmpeg(\.exe)?$/, (_, ext) => `/ffprobe${ext || ""}`);

function getAudioDurationFallback(mp3Path) {
  const bytes = fs.statSync(mp3Path).size;
  return Math.max(2, bytes / 16000);
}

// ─── Font ─────────────────────────────────────────────────────────────────────
const FONT = (() => {
  for (const f of ["arial.ttf", "calibri.ttf", "segoeui.ttf", "verdana.ttf"]) {
    const p = `C:/Windows/Fonts/${f}`;
    if (fs.existsSync(p)) return p.replace(/^([A-Za-z]):/, "$1\\:");
  }
  return "";
})();

// ─── Presets ──────────────────────────────────────────────────────────────────
const WP = "https://commons.wikimedia.org/wiki/Special:FilePath";

const PRESETS = {
  omf: {
    title: "OmniMindFlow: 98 минут → 12 минут",
    brand: "OmniMindFlow",
    voice: "ru-RU-DmitryNeural",
    slides: [
      {
        text: "Разработчик тратит 98 минут в день на рутину. Статусы, переключение, ручной сбор данных.",
        imageUrl: `${WP}/Laptop_2.jpg`,
        label: "Проблема",
      },
      {
        text: "OmniMindFlow делает это за 30 секунд. Утренний брифинг, ревью кода, метрики — всё в одном месте.",
        imageUrl: `${WP}/JavaScript_code.png`,
        label: "Решение",
      },
      {
        text: "Команда из 4 человек сократила стендап с 45 до 8 минут. Попробуй 30 дней бесплатно.",
        imageUrl: `${WP}/Scrum_task_board.jpg`,
        label: "Результат",
      },
    ],
  },

  wef: {
    title: "WinExtraFlow: сигнал дня",
    brand: "WinExtraFlow",
    voice: "ru-RU-DmitryNeural",
    slides: [
      {
        text: "Трейдер открывает 5 каналов сигналов каждое утро. Никто не показывает убыточные сделки.",
        imageUrl: `${WP}/Soporte-resistencia_reverseroles.jpg`,
        label: "Проблема",
      },
      {
        text: "WEF Score проверяет 9 факторов: Sharpe Ratio, просадка, риск-доходность. 200 AI-компонентов за 2 секунды.",
        imageUrl: `${WP}/Algorithmic_Trading._Percentage_of_Market_Volume.png`,
        label: "WEF Score",
      },
      {
        text: "Инвестор MOEX улучшил результат с минус 6 до плюс 10 процентов за квартал. Попробуй 14 дней Premium бесплатно.",
        imageUrl: `${WP}/Moscow_Exhacnge_main_building.jpg`,
        label: "Кейс",
      },
    ],
  },

  aef: {
    title: "AutoEvoFlow: ДНК автомобильного дизайна",
    brand: "AutoEvoFlow",
    voice: "ru-RU-DmitryNeural",
    slides: [
      {
        text: "BMW E46 и Lexus IS 2001 года. Совпадение ДНК дизайна — 84.7 процента. Случайность или влияние?",
        imageUrl: `${WP}/BMW_E46_front_20080328.jpg`,
        label: "ДНК Матч",
      },
      {
        text: "AutoEvoFlow анализирует форму кузова, пропорции, детали. Находит скрытые связи за 3 клика.",
        imageUrl: `${WP}/Bloomberg_Terminal.jpg`,
        label: "Как это работает",
      },
      {
        text: "500+ моделей, 60 лет истории. Tesla сломала всех — посмотри как. Бета-доступ открыт.",
        imageUrl: `${WP}/Porsche_911_Turbo.jpg`,
        label: "Масштаб",
      },
    ],
  },
};

// ─── Args ─────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const get = (f, d) => { const i = args.indexOf(f); return i !== -1 ? args[i + 1] : d; };

const presetKey    = get("--preset", null);
const slidesFile   = get("--slides", null);
const scenarioArg  = get("--scenario", null);  // e.g. "продающий:1" or "selling:3"
const brandArg     = get("--brand", "Бренд");
const productArg   = get("--product", "продукт");
const nicheArg     = get("--niche", "ниша");
const outPath      = get("--out", null);
const doPost       = args.includes("--post");       // post to VK
const doPostTg     = args.includes("--post-tg");    // post to Telegram
const tgChannelArg = get("--tg-channel", null);     // Telegram channel ID override
const doList       = args.includes("--list-scenarios");

if (doList) {
  console.log("\n=== Доступные сценарии ===");
  console.log(listScenarios());
  console.log("\nПример: node vk-slideshow.mjs --scenario продающий:1 --brand \"OmniMindFlow\" --product \"AI-агент\" --niche \"SaaS\"\n");
  process.exit(0);
}

if (!presetKey && !slidesFile && !scenarioArg) {
  console.error("Usage:");
  console.error("  node vk-slideshow.mjs --preset omf|wef|aef [--out file.mp4]");
  console.error("  node vk-slideshow.mjs --slides slides.json [--out file.mp4]");
  console.error("  node vk-slideshow.mjs --scenario тип:номер --brand X --product Y --niche Z");
  console.error("  node vk-slideshow.mjs --list-scenarios");
  console.error("  Flags: --post (VK), --post-tg (Telegram), --tg-channel ID");
  process.exit(1);
}

let preset;

if (scenarioArg) {
  // Parse "--scenario продающий:1"
  const colonIdx = scenarioArg.lastIndexOf(":");
  if (colonIdx === -1) { console.error("Формат: --scenario тип:номер (например продающий:1)"); process.exit(1); }
  const typeStr = scenarioArg.slice(0, colonIdx);
  const numStr  = scenarioArg.slice(colonIdx + 1);
  const found = findScenario(typeStr, numStr);
  if (!found) {
    console.error(`Сценарий не найден: "${scenarioArg}"`);
    console.error("Запусти --list-scenarios чтобы увидеть все доступные.");
    process.exit(1);
  }
  const { cat, item } = found;
  const params = { brand: brandArg, product: productArg, niche: nicheArg };
  const parsedSlides = parseScenarioSlides(item.text, params);
  preset = {
    title: `${brandArg}: ${item.name}`,
    brand: brandArg,
    voice: "ru-RU-DmitryNeural",
    slides: parsedSlides.map(s => ({ ...s, imageQuery: cat.imageQuery })),
  };
  console.log(`\nСценарий: [${cat.label}] ${item.name}`);
} else if (presetKey) {
  preset = PRESETS[presetKey];
  if (!preset) { console.error("Unknown preset:", presetKey); process.exit(1); }
} else {
  preset = JSON.parse(fs.readFileSync(slidesFile, "utf-8"));
}

const { title, brand, voice = "ru-RU-DmitryNeural", slides } = preset;
const finalOut = outPath || path.join(ROOT, `clip-${scenarioArg ? scenarioArg.replace(":", "-") : presetKey || "custom"}.mp4`);

// ─── Wikimedia Commons image search ──────────────────────────────────────────
async function searchWikimediaImage(query) {
  // Try progressively simpler queries if needed
  const attempts = [
    query,
    query.split(" ").slice(0, 3).join(" "),
    query.split(" ")[0],
  ];

  // Keywords that indicate adult/explicit content in filenames
  const NSFW_RE = /\b(nude|naked|sex|erotic|porn|nsfw|adult|topless|genitali|vagina|penis|breast|nipple|boob|buttock|anus|vulva|fetish|lingerie|underwear|bikini_nude)\b/i;

  let results = [];
  for (const q of attempts) {
    const searchUrl = "https://commons.wikimedia.org/w/api.php?" + new URLSearchParams({
      action: "query", list: "search",
      srsearch: q,
      srnamespace: "6", srlimit: "50",
      format: "json", origin: "*",
    });
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();
    results = (searchData?.query?.search || []).filter(r =>
      /\.(jpg|jpeg|png|webp)$/i.test(r.title) && !NSFW_RE.test(r.title)
    );
    if (results.length) break;
  }
  if (!results.length) throw new Error(`Wikimedia: нет изображений для "${query}"`);

  // Get image dimensions for top results
  const titles = results.slice(0, 12).map(r => r.title).join("|");
  const infoUrl = "https://commons.wikimedia.org/w/api.php?" + new URLSearchParams({
    action: "query", prop: "imageinfo",
    titles, iiprop: "size", format: "json", origin: "*",
  });
  const infoRes = await fetch(infoUrl);
  const infoData = await infoRes.json();

  const pages = Object.values(infoData?.query?.pages || {})
    .filter(p => p.imageinfo?.[0]?.width > 300 && p.imageinfo?.[0]?.height > 300);

  if (!pages.length) {
    const filename = results[0].title.replace(/^File:/, "");
    return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(filename)}`;
  }

  // Score: larger min-dimension wins, square/portrait ratio gets a boost
  const scored = pages.map(p => {
    const { width, height } = p.imageinfo[0];
    const ratio = height / width;
    const score = Math.min(width, height) * (ratio >= 0.7 ? 1.4 : 1.0);
    return { title: p.title, score, width, height };
  }).sort((a, b) => b.score - a.score);

  const best = scored[0];
  const filename = best.title.replace(/^File:/, "");
  process.stdout.write(`\n    → ${filename} (${best.width}x${best.height}) `);
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(filename)}`;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function run(cmd, args2, opts = {}) {
  const r = spawnSync(cmd, args2, { stdio: ["ignore", "pipe", "pipe"], ...opts });
  if (r.status !== 0) {
    const err = r.stderr?.toString() || r.error?.message || "";
    const lines = err.split("\n").filter(l => /error|invalid|failed/i.test(l));
    throw new Error(`${path.basename(cmd)} failed:\n${lines.slice(-3).join("\n") || err.slice(-200)}`);
  }
  return r.stdout?.toString() || "";
}

import https from "https";
import http from "http";

function downloadImageHttps(url, dest, redirects = 5) {
  return new Promise((resolve, reject) => {
    if (redirects <= 0) return reject(new Error("Too many redirects: " + url));
    const mod = url.startsWith("https") ? https : http;
    const parsedUrl = new URL(url);
    const opts = {
      hostname: parsedUrl.hostname, path: parsedUrl.pathname + parsedUrl.search,
      headers: { "User-Agent": "VK-Slideshow/1.0 (RiseCoreFlow; contact@example.com)" },
      rejectUnauthorized: false, timeout: 30000,
    };
    const req = mod.request(opts, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume();
        return downloadImageHttps(res.headers.location, dest, redirects - 1).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error(`Image download failed: ${res.statusCode} ${url}`));
      }
      const chunks = [];
      res.on("data", c => chunks.push(c));
      res.on("end", () => { fs.writeFileSync(dest, Buffer.concat(chunks)); resolve(); });
      res.on("error", reject);
    });
    req.on("error", reject);
    req.on("timeout", () => { req.destroy(); reject(new Error("Download timeout: " + url)); });
    req.end();
  });
}

async function downloadImage(url, dest) {
  await downloadImageHttps(url, dest);
}

function getAudioDuration(mp3Path) {
  try {
    const out = run(FFPROBE, ["-v", "quiet", "-print_format", "json", "-show_streams", mp3Path]);
    const data = JSON.parse(out);
    return parseFloat(data.streams[0]?.duration || "3");
  } catch {
    return getAudioDurationFallback(mp3Path);
  }
}

function generateAudio(text, voice2, outFile) {
  run("python", ["-m", "edge_tts", "--voice", voice2, "--text", text, "--write-media", outFile]);
}

function escFF(s) {
  return s.replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/:/g, "\\:").replace(/,/g, "\\,");
}

function wordWrap(text, maxChars) {
  const words = text.split(" ");
  const lines = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? line + " " + word : word;
    if (candidate.length <= maxChars) { line = candidate; }
    else { if (line) lines.push(line); line = word; }
  }
  if (line) lines.push(line);
  return lines;
}

// Renders a poll/quiz slide: colour bg + question + options + "vote in comments" CTA
function makePollSlideVideo(pollData, mp3Path, duration, brandText, outFile) {
  const ff = FONT ? `:fontfile='${FONT}'` : "";
  const { question, options = [], type } = pollData;
  const typeLabel = type === "quiz" ? "ВИКТОРИНА" : "ГОЛОСОВАНИЕ";
  const qLines = wordWrap(question, 26).slice(0, 3);

  const steps = [];
  let idx = 0;
  const cur = () => `t${idx}`;
  const nxt = () => `t${++idx}`;

  steps.push(`color=c=#0d1b2a:size=1080x1920:rate=1[t0]`);
  steps.push(`[${cur()}]drawbox=x=0:y=155:w=1080:h=5:color=#f0c040:t=fill[${nxt()}]`);
  steps.push(`[${cur()}]drawtext=text='${escFF(brandText)}'${ff}:fontsize=54:fontcolor=white:x=(w-text_w)/2:y=68:shadowcolor=black:shadowx=2:shadowy=2[${nxt()}]`);
  steps.push(`[${cur()}]drawtext=text='${typeLabel}'${ff}:fontsize=72:fontcolor=#f0c040:x=(w-text_w)/2:y=220:shadowcolor=black:shadowx=3:shadowy=3[${nxt()}]`);

  qLines.forEach((line, i) => {
    const y = 420 + i * 115;
    steps.push(`[${cur()}]drawtext=text='${escFF(line)}'${ff}:fontsize=56:fontcolor=white:x=(w-text_w)/2:y=${y}:shadowcolor=black:shadowx=2:shadowy=2[${nxt()}]`);
  });

  const optStart = 420 + qLines.length * 115 + 80;
  options.slice(0, 4).forEach((opt, i) => {
    const y = optStart + i * 130;
    steps.push(`[${cur()}]drawtext=text='o  ${escFF(opt)}'${ff}:fontsize=52:fontcolor=#cce8f4:x=100:y=${y}:shadowcolor=black:shadowx=2:shadowy=2[${nxt()}]`);
  });

  steps.push(`[${cur()}]drawtext=text='Ответь в комментариях'${ff}:fontsize=46:fontcolor=#6a8fa8:x=(w-text_w)/2:y=h-140:shadowcolor=black:shadowx=2:shadowy=2[out]`);

  const fc = steps.join(";");

  run(FFMPEG, [
    "-f", "lavfi", "-i", `color=c=#0d1b2a:size=1080x1920:rate=1`,
    "-t", String(duration + 0.5),
    "-i", mp3Path,
    "-filter_complex", fc,
    "-map", "[out]",
    "-map", "1:a",
    "-c:v", "libx264", "-preset", "fast", "-crf", "23",
    "-c:a", "aac", "-b:a", "128k",
    "-pix_fmt", "yuv420p",
    "-shortest",
    "-y", outFile,
  ]);
}

// Blur-background technique:
//   bg  = same image, scaled to fill 1080x1920, heavily blurred
//   fg  = image scaled to FIT within 1080x1920 (no crop), centered over bg
// Works correctly for any image orientation (landscape, portrait, square)
function makeSlideVideo(imgPath, mp3Path, duration, labelText, brandText, outFile) {
  const ff = FONT ? `:fontfile='${FONT}'` : "";
  const labelEsc = escFF(labelText);
  const brandEsc = escFF(brandText);

  const fc = [
    // Split image into two streams
    "[0:v]split=2[raw1][raw2]",
    // Background: fill frame, blur strongly
    "[raw1]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=20[bg]",
    // Foreground: fit entirely within frame, no crop
    "[raw2]scale=1080:1920:force_original_aspect_ratio=decrease[fg]",
    // Overlay fg centered on blurred bg
    "[bg][fg]overlay=x=(W-w)/2:y=(H-h)/2[comp]",
    // Dark vignette for text readability
    "[comp]drawbox=x=0:y=0:w=1080:h=1920:color=black@0.35:t=fill[dark]",
    // Brand at top
    `[dark]drawtext=text='${brandEsc}'${ff}:fontsize=60:fontcolor=white:x=(w-text_w)/2:y=80:shadowcolor=black:shadowx=3:shadowy=3[t0]`,
    // Label at bottom
    `[t0]drawtext=text='${labelEsc}'${ff}:fontsize=54:fontcolor=#f0c040:x=(w-text_w)/2:y=h-120:shadowcolor=black:shadowx=3:shadowy=3[out]`,
  ].join(";");

  run(FFMPEG, [
    "-loop", "1", "-t", String(duration + 0.5), "-i", imgPath,
    "-i", mp3Path,
    "-filter_complex", fc,
    "-map", "[out]",
    "-map", "1:a",
    "-c:v", "libx264", "-preset", "fast", "-crf", "23",
    "-c:a", "aac", "-b:a", "128k",
    "-pix_fmt", "yuv420p",
    "-shortest",
    "-y", outFile,
  ]);
}

// ─── VK Upload ────────────────────────────────────────────────────────────────
const VK_V = "5.131";
const VK_USER_TOKEN = env.VK_USER_TOKEN;
const VK_GROUP_TOKEN = env.VK_ACCESS_TOKEN;
const VK_GROUP_ID = Math.abs(parseInt(env.VK_GROUP_ID || "0"));

async function vkApi(method, params, token) {
  const url = new URL(`https://api.vk.com/method/${method}`);
  url.searchParams.set("access_token", token);
  url.searchParams.set("v", VK_V);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));
  const res = await fetch(url.toString(), { method: "POST" });
  const data = await res.json();
  if (data.error) throw new Error(`VK ${method}: ${data.error.error_msg} (code ${data.error.error_code})`);
  return data.response;
}

async function uploadToVK(filePath, postTitle) {
  // video.save requires user token; save to user's videos (no group_id)
  const saveRes = await vkApi("video.save", {
    name: postTitle,
    wallpost: 0,
    description: "AI-клип | AIGrowth",
    privacy_view: "only_me",
    privacy_comment: "only_me",
  }, VK_USER_TOKEN);

  // Upload file to the returned URL
  const fileBuffer = fs.readFileSync(filePath);
  const boundary = "----Boundary" + Math.floor(Math.random() * 1e9);
  const body = Buffer.concat([
    Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="video_file"; filename="clip.mp4"\r\nContent-Type: video/mp4\r\n\r\n`),
    fileBuffer,
    Buffer.from(`\r\n--${boundary}--\r\n`),
  ]);
  const uploadRes = await fetch(saveRes.upload_url, {
    method: "POST",
    headers: { "Content-Type": `multipart/form-data; boundary=${boundary}` },
    body,
  });
  const uploadData = await uploadRes.json();
  if (uploadData.error) throw new Error(`VK upload: ${JSON.stringify(uploadData)}`);

  // Post on group wall using community token
  const attachment = `video${saveRes.owner_id}_${saveRes.video_id}`;
  await vkApi("wall.post", {
    owner_id: `-${VK_GROUP_ID}`,
    from_group: 1,
    message: postTitle,
    attachments: attachment,
  }, VK_GROUP_TOKEN);

  return `https://vk.com/video${saveRes.owner_id}_${saveRes.video_id}`;
}

// ─── Telegram Upload ─────────────────────────────────────────────────────────
const TG_TOKEN = env.BOT_TOKEN;

async function uploadToTelegram(filePath, caption, channelId) {
  if (!TG_TOKEN) throw new Error("BOT_TOKEN not found in .env");

  const fileBuffer = fs.readFileSync(filePath);
  const boundary = "TGBound" + Math.floor(Math.random() * 1e9);

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

  return new Promise((resolve, reject) => {
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
          if (!data.ok) reject(new Error(`Telegram sendVideo: ${JSON.stringify(data.description || data)}`));
          else resolve(`https://t.me/c/${String(channelId).replace(/^-100/, "")}/${data.result.message_id}`);
        } catch (e) { reject(e); }
      });
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

async function sendTelegramPoll(question, options, channelId) {
  if (!TG_TOKEN || !options.length) return;
  const body = JSON.stringify({
    chat_id: channelId,
    question: question.slice(0, 300),
    options: options.slice(0, 10).map(o => o.slice(0, 100)),
    is_anonymous: true,
  });
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: "api.telegram.org",
      path: `/bot${TG_TOKEN}/sendPoll`,
      method: "POST",
      headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) },
      rejectUnauthorized: false,
    }, (res) => {
      let raw = "";
      res.on("data", c => raw += c);
      res.on("end", () => {
        try {
          const data = JSON.parse(raw);
          if (!data.ok) console.warn(`  [TG poll warning] ${JSON.stringify(data.description || data)}`);
          else console.log(`  Telegram poll sent!`);
          resolve();
        } catch (e) { reject(e); }
      });
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

function concatVideos(videoPaths, outFile) {
  const listFile = path.join(TMP, "concat.txt");
  fs.writeFileSync(listFile, videoPaths.map(p => `file '${p.replace(/\\/g, "/")}'`).join("\n"));

  run(FFMPEG, [
    "-f", "concat", "-safe", "0",
    "-i", listFile,
    "-c:v", "libx264", "-preset", "fast", "-crf", "23",
    "-c:a", "aac", "-b:a", "128k",
    "-pix_fmt", "yuv420p",
    "-y", outFile,
  ]);
}

// ─── Main ─────────────────────────────────────────────────────────────────────
console.log(`\nСоздаю slideshow клип: "${title}"`);
console.log(`   Слайдов: ${slides.length} | Голос: ${voice}\n`);

if (fs.existsSync(TMP)) fs.rmSync(TMP, { recursive: true });
fs.mkdirSync(TMP, { recursive: true });

const slideVideos = [];

for (let i = 0; i < slides.length; i++) {
  const slide = slides[i];
  const label = slide.label || `Слайд ${i + 1}`;
  process.stdout.write(`  Слайд ${i + 1}/${slides.length} [${label}]...`);

  const mp3 = path.join(TMP, `slide${i}.mp3`);
  const img = path.join(TMP, `slide${i}.jpg`);
  const mp4 = path.join(TMP, `slide${i}.mp4`);

  // 1. TTS audio
  generateAudio(slide.text, voice, mp3);

  // 2. Duration
  const dur = getAudioDuration(mp3);

  // 3. Resolve image: query → search, url → download, path → copy, fallback → color bg
  let imageResolved = false;
  if (slide.imagePath) {
    fs.copyFileSync(slide.imagePath, img);
    imageResolved = true;
  } else if (slide.imageUrl || slide.imageQuery) {
    try {
      if (slide.imageQuery) {
        const imgUrl = await searchWikimediaImage(slide.imageQuery);
        await downloadImage(imgUrl, img);
      } else {
        await downloadImage(slide.imageUrl, img);
      }
      imageResolved = true;
    } catch (err) {
      process.stdout.write(`\n    ⚠ Изображение недоступно (${err.message.slice(0, 60)}), генерирую фон... `);
    }
  }
  if (!imageResolved) {
    // Fallback: gradient background via FFmpeg
    const colors = ["#0f2027", "#1a1a2e", "#16213e", "#0d1b2a", "#1b1b2f"];
    const color = colors[i % colors.length];
    run(FFMPEG, [
      "-f", "lavfi", "-i", `color=c=${color}:size=1080x1920:rate=1`,
      "-frames:v", "1", "-y", img,
    ]);
  }

  // 4. Encode slide video (poll/quiz slides get a special text-only layout)
  if (slide.type === "poll" || slide.type === "quiz") {
    console.log(` [${slide.type.toUpperCase()}]`);
    makePollSlideVideo(slide.pollData, mp3, dur, brand, mp4);
  } else {
    makeSlideVideo(img, mp3, dur, label, brand, mp4);
    console.log(` ${dur.toFixed(1)}s`);
  }

  slideVideos.push(mp4);
}

// 5. Concatenate slides
process.stdout.write(`\nСклеиваю ${slides.length} слайда... `);
concatVideos(slideVideos, finalOut);
const sizeMb = (fs.statSync(finalOut).size / 1024 / 1024).toFixed(1);
console.log(`${sizeMb} MB`);

fs.rmSync(TMP, { recursive: true });
console.log(`\nГотово: ${finalOut}\n`);

if (doPost) {
  if (!VK_USER_TOKEN || !VK_GROUP_ID) {
    console.error("Ошибка: VK_USER_TOKEN или VK_GROUP_ID не заданы в .env");
    process.exit(1);
  }
  process.stdout.write("Публикую в ВКонтакте... ");
  const vkUrl = await uploadToVK(finalOut, title);
  console.log(`\nОпубликовано ВКонтакте: ${vkUrl}\n`);
}

if (doPostTg) {
  const channelId = tgChannelArg || env.GROUP_AIGC_ID || env.OMF_CHANNEL_PROFILES_ID;
  if (!TG_TOKEN || !channelId) {
    console.error("Ошибка: BOT_TOKEN или channel ID не заданы. Используй --tg-channel ID или задай GROUP_AIGC_ID в .env");
    process.exit(1);
  }
  process.stdout.write(`Публикую в Telegram (${channelId})... `);
  const tgUrl = await uploadToTelegram(finalOut, title, channelId);
  console.log(`\nОпубликовано Telegram: ${tgUrl}\n`);

  // If any slide was a poll and has options, also send a Telegram poll
  const pollSlide = slides.find(s => (s.type === "poll" || s.type === "quiz") && s.pollData?.options?.length >= 2);
  if (pollSlide) {
    process.stdout.write("Отправляю голосование в Telegram... ");
    await sendTelegramPoll(pollSlide.pollData.question, pollSlide.pollData.options, channelId);
  }
}
