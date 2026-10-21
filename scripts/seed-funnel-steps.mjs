import Database from "better-sqlite3";
import crypto from "crypto";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.resolve(__dirname, "../dev.db"));
const cuid = () => "c" + crypto.randomBytes(16).toString("hex").slice(0, 23);
const now = new Date().toISOString();

// 10:00 МСК = 07:00 UTC
const at = (d) => d + "T07:00:00.000Z";

const OMF_ID = "cf1b70179ca6988ee74a86e4";
const WEF_ID = "c72714de25a46517b596e9cb";

const omfSteps = [
  {
    sortOrder: 0, type: "story", scheduledAt: at("2026-06-19"),
    title: "Почему мы создали OmniMindFlow",
    content: `Я работал в трёх компаниях подряд и в каждой видел одно и то же.

Разработчики теряли 2+ часа в день на рутину: стендапы, ручные отчёты, поиск контекста по 5 инструментам.
Founder-ы принимали решения без данных — интуитивно.
PM-ы жили в Excel и Notion, которые не разговаривали между собой.

Проблема не в людях. Проблема в отсутствии операционной системы.

OmniMindFlow — это ОС для вашей работы. Один экран вместо десяти вкладок.

Завтра расскажу, что именно это меняет.

#repost #aigc #omnimindflow`,
  },
  {
    sortOrder: 1, type: "pain", scheduledAt: at("2026-06-22"),
    title: "98 минут в день — на что?",
    content: `Мы провели опрос среди 200+ разработчиков и основателей.

Вот куда уходит рабочее время каждый день:
• 35 мин — сбор статусов из Slack, Jira, GitHub
• 25 мин — написание апдейтов вручную
• 20 мин — переключение между инструментами
• 18 мин — поиск информации, которую «точно видел на прошлой неделе»

Итого: 98 минут. Каждый день. На то, что не создаёт ценности.

98 минут × 250 рабочих дней = 408 часов в год.

Всё это автоматизируется. Полностью.

#repost #aigc #omnimindflow`,
  },
  {
    sortOrder: 2, type: "tip", scheduledAt: at("2026-06-25"),
    title: "5 вещей, которые OmniMindFlow делает за 30 секунд",
    content: `Конкретика без воды:

1. Утренний бриф — AI собирает все апдейты команды, выделяет блокеры, расставляет приоритеты на день
2. Code review — читает diff, находит риски, предлагает PR-комментарии
3. Контент-план — генерирует 30 постов под твою аудиторию и профиль
4. Метрики — одна страница со всеми ключевыми числами проекта
5. Воронка прогрева — автоматическая рассылка цепочки постов в Telegram

Это не магия. Это просто один инструмент вместо пяти.

Попробуй бесплатно → omnimindflow.com

#repost #aigc #omnimindflow`,
  },
  {
    sortOrder: 3, type: "case", scheduledAt: at("2026-06-28"),
    title: "Кейс: +3 часа в день для команды из 4 человек",
    content: `Команда разработки, 4 человека, B2B SaaS продукт.

До OmniMindFlow:
→ Стендапы занимали 45 минут (поиск что кто делал)
→ PM вёл 3 таблицы параллельно
→ Founder тратил воскресенье на метрики

Через 2 недели после подключения:
→ Стендап — 8 минут (AI собрал контекст заранее)
→ Одна страница дашборда вместо трёх таблиц
→ Метрики обновляются автоматически

Результат: команда вернула 3+ часа в день на реальную работу.

Это не уникальный случай — это базовый результат.

#repost #aigc #omnimindflow`,
  },
  {
    sortOrder: 4, type: "offer", scheduledAt: at("2026-07-01"),
    title: "30 дней Pro — без карты",
    content: `Если ты читаешь это, ты уже понимаешь проблему.

Теперь самое простое действие:

→ omnimindflow.com
→ Регистрация за 30 секунд
→ Промокод RISECOREFLOW — 30 дней Pro бесплатно

Что включено:
✓ Developer / PM / Founder профиль
✓ AI-генерация контента
✓ Growth Engine
✓ Telegram-воронка
✓ Все 5 PRO-модулей

Осталось 3 дня по этому промокоду.

#repost #aigc #omnimindflow`,
  },
];

const wefSteps = [
  {
    sortOrder: 0, type: "story", scheduledAt: at("2026-06-19"),
    title: "Почему мы создали WinExtraFlow",
    content: `Каждое утро трейдер открывает 5-7 Telegram-каналов, 3 сайта аналитики и 2 биржи.

40 минут до первой сделки.

А потом — угадывает. Потому что сигналов много, а понять какому доверять — нет инструмента.

Мы создали WinExtraFlow — AI-платформу, которая оценивает каждый сигнал по 9 факторам и выдаёт один WEF Score от 0 до 100.

Купить или нет — решаешь ты.
Но теперь у тебя есть данные, а не интуиция.

Завтра покажу как это работает изнутри.

#repost #aigc #winextraflow`,
  },
  {
    sortOrder: 1, type: "pain", scheduledAt: at("2026-06-22"),
    title: "Главная ловушка трейдера",
    content: `Ты подписан на 10 сигнальных каналов.

Автор у каждого — «профессионал с 15-летним опытом».
Вин-рейт у каждого — «85%+».
Результаты за прошлый месяц — впечатляющие.

Но:
• Никто не показывает убыточные сделки
• Статистика выбирается за лучший период
• Риск-менеджмент не указывается
• TP/SL часто нет вообще

Результат: ты торгуешь на вере, а не на данных.

WEF Score считает иначе. Sharpe Ratio, Max Drawdown, Win Rate за 90 дней — всё в одном числе.

#repost #aigc #winextraflow`,
  },
  {
    sortOrder: 2, type: "tip", scheduledAt: at("2026-06-25"),
    title: "Как читать WEF Score правильно",
    content: `WEF Score от 0 до 100. Вот что за ним стоит:

80-100 — сильный сигнал. Все 9 факторов в норме.
60-79 — умеренный. Войти можно, но уменьши позицию.
40-59 — слабый. Слишком много рисков.
0-39 — не входить. Высокая вероятность убытка.

9 факторов анализа:
1. Риск-менеджмент
2. Risk/Reward Ratio
3. История провайдера
4. Частота сигналов
5. Sharpe Ratio
6. Profit Factor
7. Max Drawdown
8. Time Decay
9. Полнота сигнала (TP/SL/размер)

→ winextraflow.com

#repost #aigc #winextraflow`,
  },
  {
    sortOrder: 3, type: "case", scheduledAt: at("2026-06-28"),
    title: "Кейс: трейдер MOEX сократил убытки на 34%",
    content: `Инвестор, MOEX, 2 года опыта.

До WinExtraFlow:
→ Подписан на 8 каналов, входил в 60-70% сигналов
→ За квартал: +12% прибыли, −18% убытков → итого −6%

Через месяц с WEF Score:
→ Фильтр: только сигналы 70+
→ Входил в 25-30% сигналов
→ За квартал: +14% прибыли, −4% убытков → итого +10%

Главный инсайт: меньше сделок = лучше результат.
WEF Score помогает не торговать, когда не нужно.

#repost #aigc #winextraflow`,
  },
  {
    sortOrder: 4, type: "offer", scheduledAt: at("2026-07-01"),
    title: "Промокод: 14 дней Premium бесплатно",
    content: `Если ты торгуешь на MOEX, крипте или форексе — попробуй WEF Score на реальных сигналах.

→ winextraflow.com
→ При регистрации промокод: AIGROWTH14
→ 14 дней Premium без ограничений

Что включено в Premium:
✓ WEF Score для всех сигналов в реальном времени
✓ 77 стратегий для копитрейдинга
✓ Сигналы с 9 бирж
✓ Портфельный анализ
✓ Алерты по WEF Score

Промокод действует 3 дня.

Не инвестиционный совет.

#repost #aigc #winextraflow`,
  },
];

const insert = db.prepare(
  "INSERT INTO TelegramFunnelStep (id,projectId,type,title,content,status,scheduledAt,sortOrder,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?)"
);

let count = 0;
for (const s of omfSteps) {
  insert.run(cuid(), OMF_ID, s.type, s.title, s.content, "scheduled", s.scheduledAt, s.sortOrder, now, now);
  count++;
}
for (const s of wefSteps) {
  insert.run(cuid(), WEF_ID, s.type, s.title, s.content, "scheduled", s.scheduledAt, s.sortOrder, now, now);
  count++;
}

console.log(`Created ${count} funnel steps.\n`);

const rows = db.prepare(
  "SELECT p.name, s.sortOrder, s.type, s.title, s.scheduledAt FROM TelegramFunnelStep s JOIN Project p ON s.projectId = p.id ORDER BY p.name, s.sortOrder"
).all();

rows.forEach(r =>
  console.log(
    r.name.padEnd(15),
    r.scheduledAt.slice(0, 10),
    r.type.padEnd(7),
    r.title.slice(0, 50)
  )
);

db.close();
