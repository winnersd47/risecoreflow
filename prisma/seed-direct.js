const Database = require("better-sqlite3");
const path = require("path");
const { randomBytes } = require("crypto");

function cuid() {
  return "c" + randomBytes(16).toString("hex").slice(0, 23);
}

// dev.db lives at project root (created by prisma migrate from ./dev.db)
const db = new Database(path.join(__dirname, "..", "dev.db"));

// Check if already seeded
const existing = db.prepare("SELECT COUNT(*) as count FROM Project").get();
if (existing.count > 0) {
  console.log("Already seeded. Skipping.");
  process.exit(0);
}

const now = new Date().toISOString();
const projectId = cuid();

// Insert project
db.prepare(`
  INSERT INTO Project (id, name, description, channel, chatUrl, botUrl, siteUrl, wave, createdAt, updatedAt)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`).run(
  projectId,
  "OmniMindFlow",
  "AI-операционная система для профессионалов. 20 профилей, tier-система Free → Professional → Enterprise.",
  "@OmniMindFlow",
  "https://t.me/OmniMindFlow_chat",
  "@OmniMindFlowBot",
  "omnimindflow.com",
  "Wave 1",
  now,
  now
);

// Posts
const posts = [
  [1, "Манифест — зачем создали OmniMindFlow", "all", "education", "ready", "omnimindflow.com"],
  [3, "Developer — AI code review за 30 сек", "developer", "education", "ready", "omnimindflow.com/profile/developer"],
  [5, "Опрос — сколько времени тратишь на рутину", "all", "community", "ready", ""],
  [7, "Founder — почему основатели горят в операционке", "founder", "education", "ready", "omnimindflow.com/profile/founder"],
  [9, "PM — почему roadmap всегда врёт", "pm", "education", "ready", "omnimindflow.com/profile/product-manager"],
  [11, "Developer — sprint velocity до/после", "developer", "proof", "draft", "omnimindflow.com/profile/developer"],
  [12, "Итог опроса — данные + решение", "all", "proof", "ready", ""],
  [14, "Founder — Founder OS демо", "founder", "proof", "ready", "omnimindflow.com/profile/founder"],
  [16, "PM — голосование что убивает продуктивность", "pm", "community", "draft", ""],
  [18, "Developer — 5 автоматизаций за 10 минут", "developer", "education", "draft", "omnimindflow.com/profile/developer"],
  [21, "Комьюнити — первые пользователи", "all", "community", "draft", ""],
  [23, "Founder — квест Series A Ready", "founder", "education", "draft", "omnimindflow.com/profile/founder"],
  [25, "PM — discovery sprint без хаоса", "pm", "education", "draft", "omnimindflow.com/profile/product-manager"],
  [28, "Финальный оффер — 7 дней бесплатно", "all", "proof", "ready", "omnimindflow.com"],
];

const insertPost = db.prepare(`
  INSERT INTO Post (id, projectId, day, title, profile, type, status, cta, createdAt, updatedAt)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

for (const [day, title, profile, type, status, cta] of posts) {
  insertPost.run(cuid(), projectId, day, title, profile, type, status, cta, now, now);
}

// Tasks
const tasks = [
  ["Написать пост День 11 — Developer: sprint velocity до/после", "Образовательный пост. Тип: Доказательство. Конкретные цифры velocity до и после.", "content", "pending", 1],
  ["Написать пост День 16 — PM: голосование что убивает продуктивность", "Комьюнити-пост. Telegram-опрос с вариантами.", "content", "pending", 2],
  ["Написать пост День 18 — Developer: 5 автоматизаций за 10 минут", "Образовательный пост. Список 5 автоматизаций с временем экономии.", "content", "pending", 3],
  ["Написать пост День 21 — Комьюнити: первые пользователи", "Пост с результатами первых пользователей.", "content", "pending", 4],
  ["Написать пост День 23 — Founder: квест Series A Ready", "Раскрыть квест Series A Ready: шаги, что получает Founder.", "content", "pending", 5],
  ["Написать пост День 25 — PM: discovery sprint без хаоса", "Структурировать discovery sprint через платформу.", "content", "pending", 6],
  ["Написать онбординг-цепочку после регистрации (3 сообщения × 3 профиля)", "Бот-сообщения после регистрации для Developer, Founder, PM.", "bot", "pending", 1],
  ["Составить тех. спецификацию бота для разработчика", "Хендлеры, структура БД, логика таймеров, метрики конверсий.", "bot", "completed", 2],
  ["Разработать стратегию запуска на ProductHunt", "День запуска, Hunter pitch, tagline, первый комментарий. Цель: Top 5.", "growth", "pending", 1],
  ["Написать скрипты аутрича для dev-комьюнити", "GitHub, Habr, dev-чаты Telegram. 5–7 вариантов.", "growth", "pending", 2],
  ["Написать скрипты аутрича для стартап- и VC-комьюнити", "Стартап-чаты, Indie Hackers, ProductHunt discussions.", "growth", "pending", 3],
  ["Написать скрипты аутрича для PM-комьюнити", "ProductSense, PM-чаты, r/productmanagement.", "growth", "pending", 4],
  ["Составить список каналов для ВП + написать питчи", "15–20 Telegram-каналов. 3 варианта питча.", "growth", "pending", 5],
  ["Адаптировать контент для LinkedIn (3 поста, EN)", "Адаптация 3 постов под LinkedIn-формат.", "multiplatform", "pending", 1],
  ["Написать Twitter/X тред для каждого профиля", "3 треда на EN. 8–10 твитов.", "multiplatform", "pending", 2],
  ["Написать Show HN пост для Hacker News", "Технический, честный пост для HN.", "multiplatform", "pending", 3],
  ["Создать A/B варианты хуков для постов День 1 и День 3", "По 2 варианта первых строк. Метрика: просмотры и клики.", "analytics", "pending", 1],
  ["Создать шаблон weekly review метрик канала", "Таблица: подписчики, ERR, топ-постов, CTA, бот-конверсии.", "analytics", "pending", 2],
  ["Написать landing page copy для Developer / PM / Founder", "H1, буллеты, секция «Что получаешь», цена, CTA. RU + EN.", "conversion", "pending", 1],
  ["Написать email-цепочку после регистрации (3 письма × 3 профиля)", "Письмо 1 сразу, Письмо 2 Day 3, Письмо 3 Day 6.", "conversion", "pending", 2],
];

const insertTask = db.prepare(`
  INSERT INTO Task (id, projectId, subject, description, category, status, priority, createdAt, updatedAt)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

for (const [subject, description, category, status, priority] of tasks) {
  insertTask.run(cuid(), projectId, subject, description, category, status, priority, now, now);
}

console.log(`✓ Project created: OmniMindFlow (${projectId})`);
console.log(`✓ ${posts.length} posts created`);
console.log(`✓ ${tasks.length} tasks created`);

db.close();
