/**
 * Universal AI Engine
 * Priority: Gemini (free) → Claude (paid) → Mock (no key)
 *
 * To activate:
 *   Gemini FREE: https://aistudio.google.com → Get API key → paste in .env
 *   Claude paid:  https://console.anthropic.com → paste in .env
 */

import https from "https";

const SYSTEM_PROMPT = `Ты — маркетинговый AI-агент для AI/SaaS проектов.

Правила написания и адаптации контента:
- Первые 2 строки = hook (цепляющий, без "Привет!" и вводных фраз)
- Конкретные цифры вместо абстракций
- Tone of voice: прямой, как умный коллега — без корпоративного языка
- Без восклицательных знаков в заголовках
- Отвечай только текстом, без пояснений и обёрток`;

// ─── Gemini (FREE) ────────────────────────────────────────────────────────────
// Uses https.request with rejectUnauthorized:false to bypass corporate SSL inspection
function runGemini(prompt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 1500 },
    });

    const req = https.request(
      {
        hostname: "generativelanguage.googleapis.com",
        path: `/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
        },
        rejectUnauthorized: false,
      },
      (res) => {
        let raw = "";
        res.on("data", (chunk) => { raw += chunk; });
        res.on("end", () => {
          try {
            if (res.statusCode && res.statusCode >= 400) {
              reject(new Error(`Gemini ${res.statusCode}: ${raw}`));
              return;
            }
            const data = JSON.parse(raw);
            resolve(data.candidates[0].content.parts[0].text);
          } catch (e) { reject(e); }
        });
      }
    );

    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

// ─── YandexGPT Lite (FREE, no VPN needed) ─────────────────────────────────────
// Uses https.request with rejectUnauthorized:false to bypass corporate SSL inspection
function runYandexGPT(prompt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      modelUri: `gpt://${process.env.YANDEX_FOLDER_ID}/yandexgpt-lite`,
      completionOptions: { stream: false, temperature: 0.7, maxTokens: "1500" },
      messages: [
        { role: "system", text: SYSTEM_PROMPT },
        { role: "user", text: prompt },
      ],
    });

    const req = https.request(
      {
        hostname: "llm.api.cloud.yandex.net",
        path: "/foundationModels/v1/completion",
        method: "POST",
        headers: {
          "Authorization": `Api-Key ${process.env.YANDEX_API_KEY}`,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
        },
        rejectUnauthorized: false,
      },
      (res) => {
        let raw = "";
        res.on("data", (chunk) => { raw += chunk; });
        res.on("end", () => {
          try {
            if (res.statusCode && res.statusCode >= 400) {
              reject(new Error(`YandexGPT ${res.statusCode}: ${raw}`));
              return;
            }
            const data = JSON.parse(raw);
            resolve(data.result.alternatives[0].message.text);
          } catch (e) {
            reject(e);
          }
        });
      }
    );

    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

// ─── Claude (PAID fallback) ────────────────────────────────────────────────────
async function runClaude(prompt: string): Promise<string> {
  const Anthropic = (await import("@anthropic-ai/sdk")).default;
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const msg = await client.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 1500,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: prompt }],
  });
  const block = msg.content[0];
  return block.type === "text" ? block.text : "";
}

// ─── Mock (no key — for UI preview) ───────────────────────────────────────────
function runMock(prompt: string): string {
  return `[AI недоступен — добавь ключ в .env]\n\nGemini (бесплатно): aistudio.google.com\nClaude (платный): console.anthropic.com\n\nПодсказка: ${prompt.slice(0, 100)}...`;
}

// ─── Auto-select engine ────────────────────────────────────────────────────────
export async function generate(prompt: string): Promise<string> {
  const hasGemini  = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "your-gemini-key-here";
  const hasYandex  = !!process.env.YANDEX_API_KEY && !!process.env.YANDEX_FOLDER_ID;
  const hasClaude  = !!process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== "your-anthropic-key-here";

  if (hasGemini) try { return await runGemini(prompt);    } catch (e) { console.error("[AI] Gemini failed:", e) }
  if (hasYandex) try { return await runYandexGPT(prompt); } catch (e) { console.error("[AI] YandexGPT failed:", e) }
  if (hasClaude) try { return await runClaude(prompt);    } catch (e) { console.error("[AI] Claude failed:", e) }
  return runMock(prompt);
}

export function getActiveEngine(): "gemini" | "yandex" | "claude" | "none" {
  if (!!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "your-gemini-key-here") return "gemini";
  if (!!process.env.YANDEX_API_KEY && !!process.env.YANDEX_FOLDER_ID) return "yandex";
  if (!!process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== "your-anthropic-key-here") return "claude";
  return "none";
}

// ─── High-level helpers ────────────────────────────────────────────────────────
export async function generatePost(params: {
  projectContext: string;
  day: number;
  profile: string;
  type: string;
  title: string;
}) {
  const profileNames: Record<string, string> = {
    developer: "Developer (разработчик)",
    founder: "Founder (основатель)",
    pm: "Product Manager",
    crypto: "Крипто-трейдер",
    investor: "Инвестор MOEX",
    trader: "Трейдер",
    beginner: "Начинающий",
    all: "все профили",
  };
  const typeNames: Record<string, string> = {
    education: "образовательный (конкретная польза)",
    proof: "доказательство (кейс, данные, демо)",
    community: "комьюнити (опрос, вопрос, итоги)",
    pain: "боль аудитории + решение",
    conversion: "конверсионный (оффер + CTA)",
    data: "данные + интерпретация",
  };

  const prompt = `Напиши пост для Telegram.

КОНТЕКСТ ПРОЕКТА:
${params.projectContext}

ПАРАМЕТРЫ:
- День контент-плана: ${params.day}
- Профиль аудитории: ${profileNames[params.profile] || params.profile}
- Тип поста: ${typeNames[params.type] || params.type}
- Тема/заголовок: ${params.title}

Напиши готовый текст поста. Без пояснений.`;

  return generate(prompt);
}

export async function improvePost(content: string, instruction: string): Promise<string> {
  const prompt = `Улучши этот пост по инструкции. Верни только улучшенный текст.

ОРИГИНАЛ:
${content}

ИНСТРУКЦИЯ:
${instruction}`;

  return generate(prompt);
}

export async function adaptPost(content: string, platform: "twitter" | "linkedin" | "email"): Promise<string> {
  const prompts: Record<string, string> = {
    twitter: `Адаптируй этот Telegram пост в Twitter/X тред.
Формат:
1/ [хук — макс 280 символов]
2/ [развитие]
...
N/ [CTA с ссылкой]
Нумеруй каждый твит. 7-9 твитов итого.

ПОСТ:
${content}`,

    linkedin: `Адаптируй этот Telegram пост для LinkedIn.
Правила:
- Первая строка = сильный хук (одна фраза)
- Пустая строка после каждых 2-3 строк
- Профессиональный но человечный тон
- 3-5 релевантных хэштегов в конце
- Длина: 150-300 слов

ПОСТ:
${content}`,

    email: `Адаптируй этот Telegram пост как email-рассылку.
Структура:
Subject: [тема письма]
Preheader: [прехедер 50-90 символов]

[Тело письма — с подзаголовками, коротким введением и конкретным CTA]

ПОСТ:
${content}`,
  };

  return generate(prompts[platform]);
}
