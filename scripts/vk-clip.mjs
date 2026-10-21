/**
 * vk-clip.mjs — TTS + FFmpeg → VK Clips
 *
 * Usage:
 *   node scripts/vk-clip.mjs "Текст который озвучит аватар" --title "Заголовок"
 *
 * Flags:
 *   --title "..."       заголовок поста в ВК (default: первые 50 символов текста)
 *   --voice id          голос (default: ru-RU-DmitryNeural)
 *   --brand "..."       название проекта на видео (default: AIGrowth)
 *   --no-post           сгенерировать видео без публикации
 *   --out path.mp4      сохранить в указанный файл
 */

import fs from "fs";
import path from "path";
import { execSync, spawn, spawnSync } from "child_process";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── Load .env ────────────────────────────────────────────────────────────────
const envPath = path.resolve(__dirname, "../tg-bot/.env");
const env = Object.fromEntries(
  fs.readFileSync(envPath, "utf-8")
    .split("\n")
    .filter(l => l.includes("=") && !l.startsWith("#"))
    .map(l => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);

const VK_TOKEN    = env.VK_ACCESS_TOKEN;
const VK_GROUP_ID = env.VK_GROUP_ID;

// FFmpeg path (WinGet install location)
const FFMPEG = (() => {
  try { execSync("ffmpeg -version", { stdio: "ignore" }); return "ffmpeg"; } catch {}
  const winget = `${process.env.LOCALAPPDATA}\\Microsoft\\WinGet\\Packages`;
  const dirs = fs.existsSync(winget) ? fs.readdirSync(winget).filter(d => d.startsWith("Gyan.FFmpeg")) : [];
  for (const d of dirs) {
    const p = path.join(winget, d, "ffmpeg-8.1.2-full_build", "bin", "ffmpeg.exe");
    if (fs.existsSync(p)) return p;
    // scan subdirs
    const sub = path.join(winget, d);
    const found = fs.readdirSync(sub, { withFileTypes: true })
      .filter(e => e.isDirectory())
      .map(e => path.join(sub, e.name, "bin", "ffmpeg.exe"))
      .find(p => fs.existsSync(p));
    if (found) return found;
  }
  throw new Error("FFmpeg не найден. Перезапусти терминал после winget install.");
})();

// ─── Parse args ───────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
if (!args.length || args[0].startsWith("--")) {
  console.error('Usage: node scripts/vk-clip.mjs "Текст" [--title "..."] [--brand "..."] [--voice id] [--no-post] [--out file.mp4]');
  process.exit(1);
}

const scriptText = args[0];
const get = (flag, def) => { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : def; };
const has = flag => args.includes(flag);

const voice    = get("--voice", "ru-RU-DmitryNeural");
const brand    = get("--brand", "AIGrowth");
const noPost   = has("--no-post");
const outPath  = get("--out", null);
const rawTitle = get("--title", scriptText.slice(0, 50));
const postTitle = rawTitle.length > 100 ? rawTitle.slice(0, 97) + "…" : rawTitle;

const TMP_DIR  = path.resolve(__dirname, "..");
const TMP_MP3  = path.join(TMP_DIR, ".tmp-clip.mp3");
const TMP_MP4  = outPath || path.join(TMP_DIR, ".tmp-clip.mp4");

// ─── Step 1: TTS ──────────────────────────────────────────────────────────────
async function generateAudio(text, voiceId, outFile) {
  return new Promise((resolve, reject) => {
    const proc = spawn("python", ["-m", "edge_tts",
      "--voice", voiceId,
      "--text", text,
      "--write-media", outFile,
    ]);
    let err = "";
    proc.stderr.on("data", d => err += d);
    proc.on("close", code => code === 0 ? resolve() : reject(new Error(`edge-tts failed: ${err}`)));
  });
}

// ─── Step 2: FFmpeg video ─────────────────────────────────────────────────────
function wrapText(text, maxChars = 30) {
  const words = text.split(" ");
  const lines = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > maxChars) { lines.push(cur.trim()); cur = w; }
    else cur = (cur + " " + w).trim();
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 6); // max 6 lines on screen
}

function escapeFFmpeg(s) {
  return s.replace(/[\\':]/g, c => "\\" + c).replace(/,/g, "\\,");
}

// Find a Windows font file for FFmpeg drawtext
function findFont() {
  const fonts = [
    "C:/Windows/Fonts/arial.ttf",
    "C:/Windows/Fonts/calibri.ttf",
    "C:/Windows/Fonts/segoeui.ttf",
    "C:/Windows/Fonts/verdana.ttf",
  ];
  for (const f of fonts) if (fs.existsSync(f)) return f.replace(/\\/g, "/");
  return "";
}

// For spawnSync, font path goes directly into filter string without extra shell escaping
const FONT = findFont();

function buildFilterComplex(brand, textLines) {
  // In filter_complex passed as array arg, colon in path needs escaping: C\:/path
  const fontPath = FONT ? FONT.replace(/^([A-Za-z]):/, "$1\\:") : "";
  const ff = fontPath ? `:fontfile='${fontPath}'` : "";
  const filters = [];

  // Solid dark background
  filters.push("color=c=#0f0c29:size=1080x1920:rate=25[bg]");

  // Purple accent bar
  filters.push("[bg]drawbox=x=0:y=0:w=1080:h=12:color=#8b5cf6:t=fill[bar]");

  // Brand name (top)
  const brandEsc = escapeFFmpeg(brand);
  filters.push(`[bar]drawtext=text='${brandEsc}'${ff}:fontsize=80:fontcolor=#ffffff:x=(w-text_w)/2:y=200[t0]`);

  // Divider line
  filters.push("[t0]drawbox=x=140:y=340:w=800:h=3:color=#8b5cf6:t=fill[d0]");

  // Text lines
  let prev = "d0";
  textLines.forEach((line, i) => {
    const escaped = escapeFFmpeg(line);
    const y = 440 + i * 140;
    const tag = `tx${i}`;
    filters.push(`[${prev}]drawtext=text='${escaped}'${ff}:fontsize=60:fontcolor=#f0f0f0:x=(w-text_w)/2:y=${y}[${tag}]`);
    prev = tag;
  });

  // Bottom label
  filters.push(`[${prev}]drawtext=text='AI-генерация'${ff}:fontsize=44:fontcolor=#8b5cf6:x=(w-text_w)/2:y=1780[out]`);

  return filters.join(";");
}

function makeVideo(audioFile, videoFile, brand, text) {
  const lines = wrapText(text);
  const filterComplex = buildFilterComplex(brand, lines);

  // Use spawnSync with args array — avoids ALL shell/path escaping issues on Windows
  const result = spawnSync(FFMPEG, [
    "-f", "lavfi", "-i", "anullsrc",
    "-i", audioFile,
    "-filter_complex", filterComplex,
    "-map", "[out]",
    "-map", "1:a",
    "-c:v", "libx264", "-preset", "fast", "-crf", "23",
    "-c:a", "aac", "-b:a", "128k",
    "-pix_fmt", "yuv420p",
    "-shortest",
    "-y", videoFile,
  ], { stdio: ["ignore", "pipe", "pipe"] });

  if (result.status !== 0) {
    const errMsg = result.stderr?.toString() || result.error?.message || "unknown error";
    // Extract last meaningful FFmpeg error line
    const lines2 = errMsg.split("\n").filter(l => l.includes("Error") || l.includes("Invalid") || l.includes("No such"));
    throw new Error(`FFmpeg failed:\n${lines2.slice(-3).join("\n") || errMsg.slice(-300)}`);
  }
}

// ─── VK upload ────────────────────────────────────────────────────────────────
const VK_V = "5.131";

async function vkApi(method, params) {
  const url = new URL(`https://api.vk.com/method/${method}`);
  url.searchParams.set("access_token", VK_TOKEN);
  url.searchParams.set("v", VK_V);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url.toString(), { method: "POST" });
  const data = await res.json();
  if (data.error) throw new Error(`VK ${method}: ${data.error.error_msg} (code ${data.error.error_code})`);
  return data.response;
}

async function uploadAndPost(filePath, title) {
  const groupId = Math.abs(parseInt(VK_GROUP_ID));

  // 1. Get upload URL
  const saveRes = await vkApi("video.save", {
    name: title,
    group_id: groupId,
    wallpost: 0,
    description: "Сгенерировано AI | AIGrowth",
  });

  // 2. Upload
  const fileBuffer = fs.readFileSync(filePath);
  const boundary = "----Boundary" + Date.now();
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

  // 3. Post on wall
  const attachment = `video${saveRes.owner_id}_${saveRes.video_id}`;
  await vkApi("wall.post", {
    owner_id: `-${groupId}`,
    from_group: 1,
    message: title,
    attachments: attachment,
  });

  return `https://vk.com/video${saveRes.owner_id}_${saveRes.video_id}`;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
console.log(`\n🎬 Генерирую VK клип...`);
console.log(`   Текст: "${scriptText.slice(0, 60)}${scriptText.length > 60 ? "…" : ""}"`);
console.log(`   Голос: ${voice} | Бренд: ${brand}\n`);

process.stdout.write("1. Генерирую аудио (Edge TTS)... ");
await generateAudio(scriptText, voice, TMP_MP3);
const durSec = (fs.statSync(TMP_MP3).size / 16000).toFixed(1);
console.log(`✓ (~${durSec}s)`);

process.stdout.write("2. Создаю видео (FFmpeg)... ");
makeVideo(TMP_MP3, TMP_MP4, brand, scriptText);
const sizeMb = (fs.statSync(TMP_MP4).size / 1024 / 1024).toFixed(1);
console.log(`✓ ${sizeMb} MB`);

fs.unlinkSync(TMP_MP3);

if (noPost) {
  console.log(`\n✓ Видео сохранено: ${TMP_MP4}`);
  console.log("(--no-post: публикация пропущена)");
  process.exit(0);
}

if (!VK_TOKEN || !VK_GROUP_ID) {
  console.error("❌ VK_ACCESS_TOKEN или VK_GROUP_ID не заданы в .env");
  process.exit(1);
}

process.stdout.write("3. Загружаю в ВКонтакте... ");
const vkUrl = await uploadAndPost(TMP_MP4, postTitle);
console.log("✓");

if (!outPath) fs.unlinkSync(TMP_MP4);

console.log(`\n✅ Опубликовано: ${vkUrl}`);
console.log(`   https://vk.com/club${Math.abs(parseInt(VK_GROUP_ID))}\n`);
