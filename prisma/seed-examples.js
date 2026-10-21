const Database = require("better-sqlite3");
const path = require("path");
const crypto = require("crypto");
const db = new Database(path.join(__dirname, "..", "dev.db"));
const now = new Date().toISOString();
function cuid() { return "c" + crypto.randomBytes(16).toString("hex").slice(0, 23); }

const omniId = "cf1b70179ca6988ee74a86e4";
const wefId = "c72714de25a46517b596e9cb";

// ── Experiments ──────────────────────────────────────────────────────────────
const exps = [
  { projectId: omniId, name: "Хук поста День 1 — вопрос vs статистика", hypothesis: "Если заменить первую строку на вопрос — CTR вырастет на 15%, потому что вопрос создаёт паттерн-прерыватель и вовлекает читателя", primaryMetric: "CTR (клики / показы)", controlName: "Статистика (мы посчитали...)", variantName: "Вопрос (Сколько часов ты...)", controlConversions: 12, controlVisitors: 340, variantConversions: 21, variantVisitors: 310, status: "completed" },
  { projectId: omniId, name: "CTA — ссылка vs кнопка-описание", hypothesis: "Конкретный оффер в CTA ('7 дней бесплатно') конвертирует лучше чем просто ссылка", primaryMetric: "Conversion Rate", controlName: "→ omnimindflow.com", variantName: "→ Попробовать 7 дней бесплатно", controlConversions: 8, controlVisitors: 280, variantConversions: 19, variantVisitors: 295, status: "completed" },
  { projectId: wefId, name: "Хук поста — боль vs цифра", hypothesis: "Пост начинающийся с конкретной боли трейдера получит выше ERR чем пост с цифрой", primaryMetric: "Engagement Rate", controlName: "Цифровой хук", variantName: "Болевой хук", controlConversions: 0, controlVisitors: 0, variantConversions: 0, variantVisitors: 0, status: "running" },
];

for (const e of exps) {
  const id = cuid();
  db.prepare(`INSERT INTO Experiment (id,projectId,name,hypothesis,type,status,primaryMetric,controlName,controlConversions,controlVisitors,variantName,variantConversions,variantVisitors,confidence,winner,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
    .run(id, e.projectId, e.name, e.hypothesis, "ab_test", e.status, e.primaryMetric, e.controlName, e.controlConversions, e.controlVisitors, e.variantName, e.variantConversions, e.variantVisitors, e.status === "completed" ? 96.4 : 0, e.status === "completed" ? "variant" : "running", now, now);
}
console.log("✓ 3 experiments seeded");

// ── Campaigns ─────────────────────────────────────────────────────────────────
const camps = [
  { projectId: omniId, name: "Wave 1 — запуск Telegram-канала", channel: "telegram", status: "completed", budget: 0, spent: 0, impressions: 1240, clicks: 187, conversions: 43, revenue: 0, utmSource: "telegram", utmMedium: "organic", utmCampaign: "wave1-launch" },
  { projectId: omniId, name: "Show HN — Hacker News", channel: "hacker_news", status: "completed", budget: 0, spent: 0, impressions: 3400, clicks: 412, conversions: 67, revenue: 0, utmSource: "hackernews", utmMedium: "social", utmCampaign: "show-hn-launch" },
  { projectId: omniId, name: "LinkedIn — Developer profile posts", channel: "linkedin", status: "active", budget: 0, spent: 0, impressions: 890, clicks: 76, conversions: 12, revenue: 0, utmSource: "linkedin", utmMedium: "social", utmCampaign: "developer-posts" },
  { projectId: wefId, name: "WEF Wave 1 — Telegram запуск", channel: "telegram", status: "active", budget: 0, spent: 0, impressions: 560, clicks: 89, conversions: 18, revenue: 0, utmSource: "telegram", utmMedium: "organic", utmCampaign: "wef-wave1" },
];

for (const c of camps) {
  const id = cuid();
  db.prepare(`INSERT INTO Campaign (id,projectId,name,channel,status,budget,spent,impressions,clicks,conversions,revenue,utmSource,utmMedium,utmCampaign,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
    .run(id, c.projectId, c.name, c.channel, c.status, c.budget, c.spent, c.impressions, c.clicks, c.conversions, c.revenue, c.utmSource, c.utmMedium, c.utmCampaign, now, now);
}
console.log("✓ 4 campaigns seeded");

// ── Competitors ───────────────────────────────────────────────────────────────
const comps = [
  { projectId: omniId, name: "Notion", url: "notion.so", positioning: "All-in-one workspace для команд", pricing: "$8-16/мес", strengths: "Огромная экосистема шаблонов, горизонтальный продукт, сильный бренд", weaknesses: "Нет AI специализированного под профессии, нет автоматизации задач, медленный", ourAdvantages: "OmniMindFlow знает профессию пользователя и адаптируется — Notion этого не делает. Мы вертикальный продукт, они горизонтальный.", targetAudience: "Команды любого размера, knowledge workers", threatLevel: "medium" },
  { projectId: omniId, name: "Linear", url: "linear.app", positioning: "Issue tracker для software teams", pricing: "$8/мес", strengths: "Лучший UX в категории, быстрый, любимый разработчиками", weaknesses: "Только для разработчиков, нет AI-ассистента с контекстом, нет Founder/PM модулей", ourAdvantages: "Мы объединяем задачи + AI + аналитику в одном месте. Linear = только задачи.", targetAudience: "Software engineering teams", threatLevel: "low" },
  { projectId: wefId, name: "Token Metrics", url: "tokenmetrics.com", positioning: "AI crypto analytics platform", pricing: "$29-99/мес", strengths: "Сильный AI-скоринг крипто, известный бренд в крипто-комьюнити", weaknesses: "Только крипто (нет MOEX), нет копитрейдинга, нет рублёвой оплаты", ourAdvantages: "WinExtraFlow = крипто + MOEX + форекс в одном. Единственная платформа с рублёвой оплатой.", targetAudience: "Crypto investors, primarily English-speaking", threatLevel: "high" },
  { projectId: wefId, name: "TradingView Pro", url: "tradingview.com", positioning: "Charting and social trading platform", pricing: "$13-200/мес", strengths: "Лучшие графики, огромная аудитория, Pine Script", weaknesses: "Нет AI-оценки сигналов, нет агрегации от провайдеров, нет WEF Score", ourAdvantages: "TradingView показывает данные, WinExtraFlow говорит что с ними делать. AI-интерпретация — наша ниша.", targetAudience: "All traders, technical analysts", threatLevel: "medium" },
];

for (const c of comps) {
  const id = cuid();
  db.prepare(`INSERT INTO Competitor (id,projectId,name,url,positioning,pricing,strengths,weaknesses,ourAdvantages,targetAudience,threatLevel,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`)
    .run(id, c.projectId, c.name, c.url, c.positioning, c.pricing, c.strengths, c.weaknesses, c.ourAdvantages, c.targetAudience, c.threatLevel, now, now);
}
console.log("✓ 4 competitors seeded");

// ── ICPs ──────────────────────────────────────────────────────────────────────
const icps = [
  { projectId: omniId, name: "Алексей — Senior Dev в стартапе", role: "Senior Software Engineer", companySize: "10-50", industry: "SaaS / FinTech", painPoints: "Тратит 2+ часа утром на разбор задач, PR и стендапы. Context switching убивает продуктивность. Jira + Slack + ChatGPT — три инструмента без общего контекста.", goals: "Закрывать спринты вовремя. Тратить меньше времени на рутину. Быть в потоке а не в переключении.", objections: "«Ещё один инструмент в стеке — это больше, не меньше». «ChatGPT уже делает это».", messagingAngle: "OmniMindFlow — это не новый инструмент. Это один вместо трёх. Знает твои задачи, PR и velocity — и отвечает с этим контекстом.", channels: "Twitter/X, Hacker News, LinkedIn, dev Telegram", score: 92 },
  { projectId: omniId, name: "Мария — Founder B2B SaaS", role: "CEO / Co-Founder", companySize: "1-10", industry: "B2B SaaS", painPoints: "8+ инструментов открыты одновременно. Нет единой картины компании. Investor update занимает 3 часа. Не знает что горит прямо сейчас.", goals: "Принимать решения быстрее. Держать команду в фокусе. Готовиться к следующему раунду.", objections: "«У меня нет времени настраивать новые инструменты». «Нам пока рано».", messagingAngle: "Flow Score покажет реальное состояние компании одной цифрой. Каждое утро — одна страница вместо 8 инструментов.", channels: "LinkedIn, стартап-чаты Telegram, конференции", score: 88 },
  { projectId: wefId, name: "Дмитрий — активный крипто-трейдер", role: "Частный трейдер / инвестор", companySize: "1", industry: "Cryptocurrency", painPoints: "Проверяет 5-7 Telegram каналов каждое утро. Не знает насколько надёжен провайдер сигналов. Входит в сделки на эмоциях. Нет объективной метрики качества сигнала.", goals: "Снизить время на анализ. Иметь объективную оценку каждого сигнала. Стабильный результат.", objections: "«Уже пробовал AI-сигналы — не работает». «Сам разберусь».", messagingAngle: "WEF Score — не ещё один сигнал. Это оценка качества уже существующих сигналов от 153 AI-компонентов. Ты принимаешь решение сам, но теперь с данными.", channels: "Крипто Telegram, Twitter/X, YouTube", score: 95 },
];

for (const i of icps) {
  const id = cuid();
  db.prepare(`INSERT INTO ICP (id,projectId,name,role,companySize,industry,painPoints,goals,objections,messagingAngle,channels,score,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
    .run(id, i.projectId, i.name, i.role, i.companySize, i.industry, i.painPoints, i.goals, i.objections, i.messagingAngle, i.channels, i.score, now, now);
}
console.log("✓ 3 ICPs seeded");

// ── Outreach Contacts ─────────────────────────────────────────────────────────
const outreachData = [
  { projectId: omniId, name: "vc.ru — стартапы", type: "journalist", platform: "telegram", handle: "@vcru", audience: "850 000", niche: "технологии, стартапы", status: "identified", nextAction: "Написать питч с конкретным кейсом" },
  { projectId: omniId, name: "Стартап года", type: "vp_channel", platform: "telegram", handle: "@startupy", audience: "45 000", niche: "стартапы, фаундеры", status: "identified", nextAction: "Предложить разбор продукта" },
  { projectId: omniId, name: "Dev Community RU", type: "community", platform: "telegram", handle: "@devcommunityru", audience: "12 000", niche: "разработчики", status: "outreached", nextAction: "Follow-up через 5 дней" },
  { projectId: wefId, name: "Трейдинг с нуля", type: "vp_channel", platform: "telegram", handle: "@trading_nu", audience: "78 000", niche: "трейдинг, инвестиции", status: "identified", nextAction: "Написать питч с промокодом" },
  { projectId: wefId, name: "MOEX Board", type: "community", platform: "telegram", handle: "@moexboard", audience: "23 000", niche: "MOEX, акции РФ", status: "outreached", nextAction: "Ждать ответа" },
];

for (const o of outreachData) {
  const id = cuid();
  db.prepare(`INSERT INTO OutreachContact (id,projectId,name,type,platform,handle,status,audience,niche,nextAction,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`)
    .run(id, o.projectId, o.name, o.type, o.platform, o.handle, o.status, o.audience, o.niche, o.nextAction, now, now);
}
console.log("✓ 5 outreach contacts seeded");

db.close();
console.log("\n✅ All example data seeded successfully!");
