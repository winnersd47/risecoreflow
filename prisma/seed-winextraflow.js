const Database = require("better-sqlite3");
const path = require("path");
const crypto = require("crypto");

const DB_PATH = path.join(__dirname, "..", "dev.db");
const db = new Database(DB_PATH);

function cuid() {
  return "c" + crypto.randomBytes(16).toString("hex").slice(0, 23);
}

const now = new Date().toISOString();

// --- PROJECT ---
const projectId = cuid();
db.prepare(`
  INSERT INTO Project (id, name, description, channel, botUrl, siteUrl, wave, createdAt, updatedAt)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`).run(
  projectId,
  "WinExtraFlow",
  "AI-платформа для торговых сигналов. WEF Score — единая оценка качества сигнала из 153 AI-компонентов. MOEX + крипто + форекс в одном месте.",
  "@WinExtraFlow",
  "@WinExtraFlowBot",
  "winextraflow.com",
  "Wave 1",
  now,
  now
);

console.log("✓ Project created:", projectId);

// --- POSTS (8 готовых) ---
const posts = [
  {
    day: 1,
    title: "Манифест — зачем мы создали WinExtraFlow",
    profile: "all",
    type: "education",
    status: "published",
    content: `Мы посчитали.

Средний трейдер проверяет 5-7 Telegram каналов,
3 сайта с аналитикой и 2 биржи каждое утро.

Это 40+ минут — до того как он откроет первую сделку.

А потом — ещё час на анализ:
"Этот сигнал хороший? А провайдер надёжный?
Стоит ли входить при текущем рынке?"

Мы создали WinExtraFlow — AI-платформу
для торговых сигналов, которая делает это за тебя.

Не очередной канал с сигналами.
Не ещё один скринер.

Единая система с AI-оценкой каждого сигнала.
153 компонента анализируют 9 факторов
и выдают один WEF Score: от 0 до 100.

Покупать или нет — решаешь ты.
Но теперь у тебя есть данные, а не интуиция.

Здесь будем делиться:
— реальные сигналы с AI-оценкой
— аналитика MOEX и крипто
— кейсы и обзоры стратегий
— обновления платформы

Подпишись. Первый сигнал — уже послезавтра.

Напиши в комментарии: чем торгуешь?
MOEX, крипто или forex?

→ winextraflow.com`,
  },
  {
    day: 3,
    title: "Крипто-трейдер: как работает WEF Score",
    profile: "crypto",
    type: "education",
    status: "published",
    content: `Ты получил сигнал: BUY BTCUSDT.

Что обычно делаешь?
Смотришь график. Проверяешь RSI. Читаешь чат.
Спрашиваешь "ну как, входим?"
И через 15 минут входишь на эмоции.

Вот что делает WinExtraFlow за 2 секунды:

✓ Проверяет провайдера: win rate 72%, Sharpe 1.8
✓ Считает Risk/Reward: 1:2.3
✓ Определяет режим рынка: восходящий тренд
✓ Проверяет частоту сигналов (спам-фильтр)
✓ Выдаёт TP1/TP2/TP3 + SL + размер позиции

Результат: WEF Score 87%
Значит: сильный сигнал. Входить можно.

Если WEF Score 34% — ты бы не увидел этот сигнал
в топе ленты. Слабые отсеиваются автоматически.

На платформе 1 284 сигнала
от 20 провайдеров прошли через этот фильтр.

Попробовать бесплатно →
winextraflow.com

Промокод AIGROWTH14 — 14 дней Premium.`,
  },
  {
    day: 5,
    title: "Опрос: как ты оцениваешь сигналы?",
    profile: "all",
    type: "community",
    status: "published",
    content: `Быстрый вопрос:

Как ты сейчас оцениваешь сигналы
перед входом в сделку?

Голосуй 👇

📊 Смотрю график и RSI/MACD
💬 Доверяю каналу/провайдеру
🤖 Использую AI/бота
🎲 На ощущениях (и молитве)

Результаты — через 2 дня.
И покажем как 153 AI-компонента делают это за тебя.`,
  },
  {
    day: 7,
    title: "MOEX-инвестор: типичное утро",
    profile: "investor",
    type: "pain",
    status: "published",
    content: `Типичное утро инвестора MOEX:

09:00 — открываешь терминал, смотришь IMOEX
09:15 — проверяешь Сбер, Газпром, Лукойл
09:30 — открываешь 3 Telegram канала с сигналами
10:00 — читаешь РБК и Ведомости
10:20 — пытаешься понять: рынок растёт или падает?
10:40 — решаешь "подожду до обеда"
14:00 — обед. Рынок уже ушёл.

Знакомо?

Проблема не в тебе. Проблема — информация
разбросана по 7 местам, и ни одно из них
не говорит: "вот это — хороший сигнал, вот это — нет".

В WinExtraFlow ты видишь одну страницу:

— Режим рынка MOEX: тренд вверх (уверенность 78%)
— 27 тикеров live: SBER, GAZP, LKOH и ещё 24
— 7 индексов: IMOEX, RTSI, MOEXBC...
— AI-оценка каждого сигнала: WEF Score
— Рекомендации TP/SL с учётом волатильности

Открыл → увидел → решил. 5 минут вместо 2 часов.

Завтра покажем как это выглядит изнутри.

А пока — сколько каналов с сигналами
ты сейчас читаешь? Напиши число.`,
  },
  {
    day: 9,
    title: "Копитрейдинг: торговля без опыта",
    profile: "beginner",
    type: "education",
    status: "published",
    content: `"Я не умею торговать.
Но хочу зарабатывать на рынке."

Знакомо? Тогда копитрейдинг — для тебя.

Как это работает:

1. На WinExtraFlow есть провайдеры —
   опытные трейдеры с проверенной историей.

2. Ты выбираешь лучшего по WEF Score:
   win rate, Sharpe Ratio, средняя прибыль.

3. Подключаешь свою биржу (Binance, Bybit, OKX,
   MT5, Tinkoff — всего 9 бирж).

4. Когда провайдер делает сделку —
   система автоматически копирует её на твой счёт.

5. Ты контролируешь размер позиции,
   максимальный убыток и минимальный WEF Score.

Не веришь? Включи Demo-режим.
Торгуй виртуальными деньгами. Проверь результат.
Потом подключай реальный счёт.

77 стратегий на маркетплейсе.
50 MT5 советников. 16 стратегий TradingView.

Начать бесплатно → winextraflow.com`,
  },
  {
    day: 12,
    title: "Итоги опроса + 9 факторов WEF Score",
    profile: "all",
    type: "data",
    status: "published",
    content: `Результаты опроса: как вы оцениваете сигналы

📊 Смотрю график/RSI — [X]%
💬 Доверяю каналу — [X]%
🤖 AI/бот — [X]%
🎲 На ощущениях — [X]%

[X]% из вас принимают решения
на основе одного-двух факторов.

Вот сколько факторов проверяет WEF Score:

1. Risk Management — есть ли TP/SL?
2. Risk/Reward Ratio — стоит ли игра свеч?
3. Provider History — win rate провайдера
4. Signal Frequency — не спам ли это?
5. Sharpe Ratio — доход с поправкой на риск
6. Profit Factor — прибыль / убытки
7. Max Drawdown — максимальная просадка
8. Time Decay — свежесть данных провайдера
9. Signal Completeness — полнота информации

9 факторов. 153 AI-компонента. Каждый сигнал.
Автоматически. За 2 секунды.

Проверить на своих сигналах →
winextraflow.com

Промокод AIGROWTH14 — 14 дней бесплатно.

⚠️ Не является инвестиционной рекомендацией.`,
  },
  {
    day: 14,
    title: "Демо: утро трейдера с WinExtraFlow",
    profile: "trader",
    type: "proof",
    status: "published",
    content: `Утро трейдера с WinExtraFlow:

07:00. Открываешь приложение (PWA на телефоне).
Вместо 7 каналов — один экран.

// ЛЕНТА СИГНАЛОВ
🟢 BUY SBER 312.50 | WEF 87% | TP 340 SL 298
🟢 BUY BTCUSDT 67,200 | WEF 74% | TP 71,000 SL 65,500
🔴 SELL EURUSD 1.0892 | WEF 62% | TP 1.0810 SL 1.0935

// РЕЖИМ РЫНКА
MOEX: Восходящий тренд (78%)
Crypto: Боковик (64%)

// AI АССИСТЕНТ
"Стоит ли покупать SBER?"
→ "14 сигналов за 30 дней. 10 BUY, 4 SELL.
   WEF Score средний: 81%. Win Rate: 72%.
   Последний сигнал: BUY по 312.50, TP 340, SL 298.
   Уклон: сильный бычий."

// СКРИНЕР
27 тикеров отсортированы по WEF Score.
Фильтр: MOEX / Crypto / Forex / US Stocks.

Три решения приняты до первого кофе.
Ни одного канала не открывал.

---

WEF Score — метрика качества сигнала (0–100).
80+ = сильный. 60–79 = средний. Ниже 60 = слабый.

Попробовать бесплатно →
winextraflow.com

⚠️ Не является инвестиционной рекомендацией.`,
  },
  {
    day: 28,
    title: "Финальный оффер — последний день промокода",
    profile: "all",
    type: "conversion",
    status: "ready",
    content: `Месяц назад мы открыли канал.

За это время:
— 1 284 сигнала прошли AI-оценку
— 77 стратегий на маркетплейсе
— 153 AI-компонента из 60 источников
— 27 тикеров MOEX в реальном времени
— 9 бирж подключено

Если ты читаешь канал, но ещё не попробовал —

Сегодня последний день промокода AIGROWTH14.
14 дней Premium бесплатно. Без ограничений.

Все сигналы. AI-ассистент. Скринер.
Копитрейдинг. Торговый журнал. Портфель.

После — от 2 490 ₽/мес ($29).
Сейчас — бесплатно.

→ winextraflow.com

Оплата: карты РФ (СБП 0.7%) / Visa-MC в USD/EUR / крипто (USDT 0.4%)

P.S. Если уже пробуешь — напиши что зашло.
Читаем каждый ответ.

⚠️ Не является инвестиционной рекомендацией.`,
  },
];

const insertPost = db.prepare(`
  INSERT INTO Post (id, projectId, day, title, profile, type, status, content, cta, createdAt, updatedAt)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

for (const p of posts) {
  const id = cuid();
  insertPost.run(id, projectId, p.day, p.title, p.profile, p.type, p.status, p.content, "", now, now);
  console.log(`  ✓ Post Day ${p.day}: ${p.title}`);
}

// --- TASKS (20 задач для WinExtraFlow Wave 1) ---
const tasks = [
  // Content (6)
  { subject: "Написать пост День 10 — Скринер: топ тикеры по WEF Score", category: "content", priority: 1 },
  { subject: "Написать пост День 16 — Провайдер месяца: разбор топ-сигналов", category: "content", priority: 2 },
  { subject: "Написать пост День 18 — Торговый журнал: зачем фиксировать эмоции", category: "content", priority: 3 },
  { subject: "Написать пост День 21 — Кейс: копитрейдинг +18% за месяц", category: "content", priority: 4 },
  { subject: "Написать пост День 23 — Сравнение: WinExtraFlow vs TradingView Pro", category: "content", priority: 5 },
  { subject: "Написать пост День 25 — Форекс-трейдер: EURUSD с AI-оценкой", category: "content", priority: 6 },
  // Bot (2)
  { subject: "Написать онбординг-цепочку бота (3 сообщения × 3 профиля)", category: "bot", priority: 7 },
  { subject: "Составить тех. спецификацию бота для разработчика", category: "bot", priority: 8 },
  // Growth (5)
  { subject: "Разработать стратегию запуска на ProductHunt", category: "growth", priority: 9 },
  { subject: "Написать скрипты аутрича для крипто-комьюнити (Reddit, Discord)", category: "growth", priority: 10 },
  { subject: "Написать скрипты аутрича для трейдинговых Telegram каналов", category: "growth", priority: 11 },
  { subject: "Составить список ВП-каналов: трейдинг/инвестиции + питчи", category: "growth", priority: 12 },
  { subject: "Написать Show HN пост для Hacker News (AI + trading signals)", category: "growth", priority: 13 },
  // Multiplatform (3)
  { subject: "Адаптировать контент для Twitter/X (треды про WEF Score)", category: "multiplatform", priority: 14 },
  { subject: "Написать LinkedIn посты для финансовых специалистов (EN)", category: "multiplatform", priority: 15 },
  { subject: "Создать A/B варианты хуков для постов День 1 и День 3", category: "multiplatform", priority: 16 },
  // Analytics (2)
  { subject: "Создать шаблон weekly review метрик канала", category: "analytics", priority: 17 },
  { subject: "Настроить UTM-метки для всех каналов трафика", category: "analytics", priority: 18 },
  // Conversion (2)
  { subject: "Написать landing page copy для крипто / MOEX / форекс аудитории", category: "conversion", priority: 19 },
  { subject: "Написать email-цепочку после регистрации (3 письма × 3 профиля)", category: "conversion", priority: 20 },
];

const insertTask = db.prepare(`
  INSERT INTO Task (id, projectId, subject, description, category, status, priority, createdAt, updatedAt)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

for (const t of tasks) {
  const id = cuid();
  insertTask.run(id, projectId, t.subject, "", t.category, "pending", t.priority, now, now);
}
console.log(`✓ 20 tasks created`);

db.close();
console.log("\n✅ WinExtraFlow seeded successfully!");
console.log("Project ID:", projectId);
