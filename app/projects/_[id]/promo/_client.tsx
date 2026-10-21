"use client"
import { useState } from "react";
import { useParams } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { HelpTooltip } from "@/components/HelpTooltip";
import {
  Sparkles, Copy, Check, ChevronDown, ChevronUp,
  FileText, Zap, Megaphone, MousePointerClick, RefreshCw,
} from "lucide-react";

// ─── Copy hook ────────────────────────────────────────────────────────────────
function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  function copy(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }
  return { copied, copy };
}

function CopyBtn({ text, id, copied, copy }: { text: string; id: string; copied: string | null; copy: (t: string, id: string) => void }) {
  const done = copied === id;
  return (
    <button onClick={() => copy(text, id)}
      style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 6, border: "1px solid", cursor: "pointer", fontSize: 12, fontWeight: 500, transition: "all 0.15s",
        background: done ? "#052e16" : "#13112a", borderColor: done ? "#166534" : "#374151", color: done ? "#4ade80" : "#9ca3af" }}>
      {done ? <Check style={{ width: 12, height: 12 }} /> : <Copy style={{ width: 12, height: 12 }} />}
      {done ? "Скопировано" : "Копировать"}
    </button>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const POST_TEMPLATES = [
  {
    key: "hook_value",
    label: "Польза-пост",
    color: "#6366f1",
    description: "Конкретный совет без воды. Работает на охват.",
    template: `[ЦИФРА] [ЧТО], которые [РЕЗУЛЬТАТ]:

1. [Конкретный совет]
2. [Конкретный совет]
3. [Конкретный совет]
4. [Конкретный совет]
5. [Конкретный совет]

Сохрани, чтобы не потерять 👇

P.S. Если хочешь [РЕЗУЛЬТАТ] быстрее — [CTA]`,
    example: `5 инструментов, которые сэкономят тебе 2 часа в день:

1. Notion AI — черновики статей за 3 минуты
2. Zapier — автоматизируй повторяющиеся задачи
3. Otter.ai — расшифровка встреч автоматически
4. Loom — объясни задачу видео вместо текста
5. Cal.com — забудь про «когда ты свободен?»

Сохрани, чтобы не потерять 👇

P.S. Если хочешь выстроить систему за 1 месяц — напиши «СИСТЕМА»`,
  },
  {
    key: "story_pain",
    label: "История + Боль",
    color: "#ef4444",
    description: "Личная история, в которой читатель узнаёт себя.",
    template: `[ВРЕМЯ НАЗАД] я [СИТУАЦИЯ С ПРОБЛЕМОЙ].

Я [ЧТО ДЕЛАЛ / КАК СТРАДАЛ].

Пока не понял одну вещь: [ИНСАЙТ].

[Короткое объяснение инсайта — 2-3 предложения]

Результат: [КОНКРЕТНАЯ ЦИФРА ИЛИ ИЗМЕНЕНИЕ].

Если ты сейчас [ОПИСАНИЕ АУДИТОРИИ] — [CTA]`,
    example: `Год назад я работал по 12 часов и зарабатывал 80к в месяц.

Брал всех подряд клиентов. Боялся отказывать. Думал — больше работы = больше денег.

Пока не понял: проблема не в количестве часов, а в цене часа.

Поднял ценник в 2 раза. Потерял 60% клиентов. Доход вырос на 40%.

Если ты сейчас застрял на одной сумме уже несколько месяцев — напиши «ВЫХОД», расскажу как.`,
  },
  {
    key: "case_study",
    label: "Кейс клиента",
    color: "#f59e0b",
    description: "Конкретный результат, снимает возражение «а мне поможет?»",
    template: `[ИМЯ/ПРОФЕССИЯ] пришёл ко мне [КОГДА] с проблемой:

→ [Что было: ситуация до]

Что сделали:
✓ [Шаг 1]
✓ [Шаг 2]
✓ [Шаг 3]

Результат через [СРОК]:
📈 [Цифра 1]
📈 [Цифра 2]

[ИМЯ] сейчас [ЧТО ДЕЛАЕТ / КАК ЖИВЁТ].

Хочешь так же? [CTA]`,
    example: `Ольга, маркетолог-фрилансер, пришла ко мне в феврале с проблемой:

→ Работала на 7 клиентов, зарабатывала 120к, сил уже не было

Что сделали:
✓ Сократили до 3 ключевых клиентов
✓ Упаковали её как эксперта в одной нише
✓ Подняли ценник + добавили пакеты

Результат через 6 недель:
📈 Доход вырос до 180к
📈 Рабочий день сократился до 6 часов

Ольга сейчас планирует первый отпуск за 2 года.

Хочешь так же? Напиши «КЕЙС» — расскажу как попасть на разбор.`,
  },
  {
    key: "poll_engage",
    label: "Вовлекающий опрос",
    color: "#10b981",
    description: "Повышает ERR, собирает аудиторию для оффера.",
    template: `Быстрый вопрос для тебя 👇

[ВОПРОС, СВЯЗАННЫЙ С БОЛЬЮ АУДИТОРИИ]

🔴 [Вариант А]
🟡 [Вариант Б]
🟢 [Вариант В]

Голосуй ниже — разберу самый популярный ответ отдельным постом.`,
    example: `Быстрый вопрос для тебя 👇

Что сейчас мешает тебе зарабатывать больше?

🔴 Не знаю как привлекать клиентов
🟡 Есть клиенты, но не могу поднять цену
🟢 Всё есть, но нет времени на масштаб

Голосуй ниже — разберу самый популярный ответ отдельным постом.`,
  },
  {
    key: "offer_post",
    label: "Продающий пост",
    color: "#a78bfa",
    description: "Прямой оффер с дедлайном. Для закрытия.",
    template: `[КОНКРЕТНЫЙ РЕЗУЛЬТАТ] за [СРОК] — это [ПРОДУКТ].

Для кого: [ОПИСАНИЕ ЦА]

Что внутри:
→ [Блок/Модуль 1]
→ [Блок/Модуль 2]
→ [Блок/Модуль 3]

Результаты участников: [ПРИМЕР КЕЙСа ОДНОЙ СТРОКОЙ]

Стоимость: [ЦЕНА]
[Было: СТАРАЯ ЦЕНА — зачёркнута, если есть]

⚡ Осталось [N] мест / Цена растёт [ДАТА]

Чтобы попасть → [CTA/ССЫЛКА]`,
    example: `Выстроить очередь из клиентов за 30 дней — это «Поток клиентов».

Для кого: эксперты и фрилансеры, которые хотят уйти от сарафана

Что внутри:
→ Упаковка: позиционирование и оффер, на который откликаются
→ Трафик: контент + 2 бесплатных канала привлечения
→ Продажи: скрипт диалога без давления

Пример: Артём — +4 клиента за 3 недели, доход ×1.8

Стоимость: 19 900 ₽
~~29 900 ₽~~

⚡ Осталось 4 места по этой цене — поднимаю в воскресенье

Чтобы попасть → напиши «ПОТОК» в личку`,
  },
  {
    key: "announcement",
    label: "Анонс / Тизер",
    color: "#3b82f6",
    description: "Создаёт ожидание перед запуском или постом.",
    template: `Кое-что готовлю для вас 👀

[НАМЁК НА КОНТЕНТ/ПРОДУКТ — интригующий, но не раскрывающий]

Расскажу [КОГДА: завтра / в пятницу / на этой неделе].

Пока: [ВОПРОС К АУДИТОРИИ ИЛИ ДЕЙСТВИЕ — например «напишите Y если хотите первыми»]`,
    example: `Кое-что готовлю для вас 👀

Разобрал 47 каналов экспертов с 1000+ подписчиками и нашёл паттерн, который повторяется у 80% из них.

Расскажу в четверг.

Пока: напишите «ДА» в комментарии, если хотите получить разбор первыми.`,
  },
];

const HOOK_FORMULAS = [
  {
    key: "number",
    label: "Цифра + обещание",
    color: "#6366f1",
    formula: "[ЧИСЛО] [ЧТО], которые [КОНКРЕТНЫЙ РЕЗУЛЬТАТ]",
    examples: [
      "7 фраз, которые убивают продажи в переписке",
      "3 ошибки, из-за которых ты работаешь больше, а зарабатываешь меньше",
      "5 инструментов, которые сэкономят тебе 10 часов в неделю",
    ],
  },
  {
    key: "contrast",
    label: "Контраст до/после",
    color: "#f59e0b",
    formula: "[БЫЛО ПЛОХО] → [СТАЛО ХОРОШО]. Вот как.",
    examples: [
      "Год назад у меня был 1 клиент. Сейчас — очередь на 2 месяца вперёд.",
      "Работал 60 часов в неделю за 80к. Сейчас — 30 часов за 250к.",
      "Канал рос на 5 подписчиков в неделю. Потом я изменил одну вещь.",
    ],
  },
  {
    key: "question_pain",
    label: "Вопрос-боль",
    color: "#ef4444",
    formula: "Почему [НЕЖЕЛАТЕЛЬНОЕ СОСТОЯНИЕ АУДИТОРИИ], даже если [ОНИ ДЕЛАЮТ ПРАВИЛЬНОЕ]?",
    examples: [
      "Почему ты работаешь больше, но зарабатываешь столько же?",
      "Почему клиенты читают твои посты, но не покупают?",
      "Почему ты знаешь всё о продажах, но до сих пор боишься называть цену?",
    ],
  },
  {
    key: "secret",
    label: "Секрет / Инсайдер",
    color: "#10b981",
    formula: "То, что [АВТОРИТЕТЫ] не говорят о [ТЕМА]:",
    examples: [
      "То, что успешные эксперты не говорят о своих первых клиентах:",
      "Что скрывают топовые Telegram-каналы о своём росте:",
      "Правда о «пассивном доходе», которую никто не озвучивает:",
    ],
  },
  {
    key: "urgency",
    label: "Срочность / Таймер",
    color: "#a78bfa",
    formula: "Если ты [ЦА] и до сих пор не [ДЕЙСТВИЕ] — ты теряешь [ЧТО].",
    examples: [
      "Если ты эксперт и до сих пор нет системы контента — ты теряешь клиентов каждый день.",
      "Если ты продаёшь через личку и не используешь этот шаблон — ты оставляешь деньги на столе.",
    ],
  },
  {
    key: "story_hook",
    label: "Хук-история",
    color: "#3b82f6",
    formula: "[МЕСТО / МОМЕНТ]. Тогда я понял кое-что, что изменило всё.",
    examples: [
      "Был обычный вторник. Клиент прислал сообщение, которое я не ожидал.",
      "Год назад я сидел и смотрел на 0 продаж за месяц. Именно тогда я понял.",
      "На созвоне с клиентом я случайно сказал не то. И это сработало лучше всего.",
    ],
  },
];

const AD_TEMPLATES = [
  {
    key: "channel_native",
    label: "Нативная интеграция",
    color: "#6366f1",
    description: "Пишешь автору канала — он публикует как своё мнение",
    template: `[Автор пишет от себя — естественно]

Последние [N] [недель/месяцев] я [КОНТЕКСТ, СВЯЗЫВАЮЩИЙ С ТЕМОЙ КАНАЛА].

Нашёл канал [НАЗВАНИЕ], который реально помог с [КОНКРЕТНОЕ].

[Автор рассказывает что ему понравилось — 2-3 предложения]

Подписался сам, советую и вам: [ССЫЛКА]`,
    tip: "Дай автору свободу адаптировать под свой голос. Предложи 2-3 тезиса, из которых он выберет.",
  },
  {
    key: "direct_promo",
    label: "Прямой рекламный пост",
    color: "#f59e0b",
    description: "Честная реклама с пометкой. Работает если оффер сильный.",
    template: `Реклама | [ТВОЁ ИМЯ / КАНАЛ]

[СИЛЬНЫЙ ХУК — одна строка]

[2-3 предложения: кто ты и что делаешь]

Подписчики канала уже [РЕЗУЛЬТАТ АУДИТОРИИ]:
→ [Кейс 1 — коротко]
→ [Кейс 2 — коротко]

Для подписчиков @[КАНАЛ_ГДЕ_ВЫХОДИТ] — [БОНУС или СПЕЦИАЛЬНОЕ ПРЕДЛОЖЕНИЕ]

[ССЫЛКА / @КАНАЛ]`,
    tip: "Предложи эксклюзивный бонус для аудитории конкретного канала — повышает CTR на 30-50%.",
  },
  {
    key: "giveaway",
    label: "Совместный конкурс / ВП",
    color: "#10b981",
    description: "Взаимный пиар — оба канала выигрывают",
    template: `🎁 Совместный розыгрыш с @[ПАРТНЁР]

Разыгрываем: [ЧТО: ценность для аудитории]

Условия:
1. Подпишись на @[ВАШ_КАНАЛ]
2. Подпишись на @[КАНАЛ_ПАРТНЁРА]
3. Нажми кнопку «Участвую» ниже

Итоги: [ДАТА] в прямом эфире.

[Краткое описание каждого канала — 1 строка]`,
    tip: "Приз должен быть релевантен обеим аудиториям. Цифровой продукт или консультация — лучше физических подарков.",
  },
  {
    key: "teaser_lead",
    label: "Тизер + лид-магнит",
    color: "#a78bfa",
    description: "Трафик на бесплатный материал. Низкий порог входа.",
    template: `[ХУК — проблема аудитории одной строкой]

@[АВТОР] сделал бесплатный [ФОРМАТ: гайд/чек-лист/шаблон]:
«[НАЗВАНИЕ МАТЕРИАЛА]»

Внутри: [3 буллета с конкретикой]
→ [Что получит]
→ [Что получит]
→ [Что получит]

Забрать бесплатно: [ССЫЛКА]`,
    tip: "Название материала должно содержать конкретный результат, а не тему. «Как привлечь 100 подписчиков» > «Гайд по контенту».",
  },
];

const CTA_LIBRARY = [
  {
    category: "Подписка на канал",
    color: "#6366f1",
    items: [
      "Подписывайся — здесь каждый день [ТЕМА]",
      "Жми подписку, чтобы не пропустить следующий пост",
      "Сохрани канал → здесь больше таких материалов",
      "Подпишись и получи [ЛИДМАГНЕТ] в приветственном сообщении",
    ],
  },
  {
    category: "Заявка / личка",
    color: "#f59e0b",
    items: [
      "Напиши «[СЛОВО]» в личку — расскажу подробнее",
      "Если узнал себя — пиши в @[USERNAME], разберём твою ситуацию",
      "Хочешь так же? Жми /start в боте → @[BOT]",
      "Напиши «[СЛОВО]» в комментарии — пришлю материал в личку",
    ],
  },
  {
    category: "Переход на сайт / лендинг",
    color: "#10b981",
    items: [
      "Подробности и запись → [ССЫЛКА]",
      "Полный разбор с примерами — читай по ссылке в шапке профиля",
      "Осталось [N] мест — забронируй: [ССЫЛКА]",
      "Бесплатный аудит → заполни анкету: [ССЫЛКА]",
    ],
  },
  {
    category: "Сохранить / поделиться",
    color: "#a78bfa",
    items: [
      "Сохрани пост — пригодится",
      "Перешли другу, которому это нужно",
      "Сохрани и внедри хотя бы один пункт сегодня",
      "Поставь ⭐ чтобы не потерять в архиве",
    ],
  },
  {
    category: "Вовлечение (комменты)",
    color: "#ef4444",
    items: [
      "Согласен? Пиши в комментарии",
      "А ты с этим сталкивался? Расскажи ниже",
      "Какой пункт самый важный для тебя? 👇",
      "Угадай продолжение истории в комментах",
    ],
  },
];

// ─── Main page ────────────────────────────────────────────────────────────────
export default function PromoPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { copied, copy } = useCopy();
  const [tab, setTab] = useState<"templates" | "hooks" | "ads" | "cta">("templates");

  // Ad builder state
  const [adKey, setAdKey] = useState("channel_native");
  const [adVars, setAdVars] = useState<Record<string, string>>({});

  const selectedAd = AD_TEMPLATES.find(a => a.key === adKey)!;

  function fillAdTemplate(template: string, vars: Record<string, string>) {
    let result = template;
    Object.entries(vars).forEach(([k, v]) => {
      if (v) result = result.split(`[${k}]`).join(v);
    });
    return result;
  }

  function extractVars(template: string): string[] {
    const matches = template.match(/\[([A-ZА-ЯЁ\s/0-9_]+)\]/g) ?? [];
    return [...new Set(matches.map(m => m.slice(1, -1)))];
  }

  const adVarKeys = extractVars(selectedAd.template);
  const filledAd = fillAdTemplate(selectedAd.template, adVars);

  const dim: React.CSSProperties = { color: "#6b7280", fontSize: 12 };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar projectId={projectId} />
      <main className="flex-1 overflow-y-auto" style={{ background: "#07060d" }}>
        <div style={{ maxWidth: 920, margin: "0 auto", padding: "32px 24px" }}>

          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <Sparkles style={{ color: "#f59e0b", width: 20, height: 20 }} />
              <h1 style={{ fontSize: 24, fontWeight: 700, color: "#ede8ff" }}>Промо-материалы</h1>
            </div>
            <p style={dim}>Шаблоны постов · Формулы хуков · Рекламные посты · Библиотека CTA</p>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, marginBottom: 28, borderBottom: "1px solid #1e1c38" }}>
            {([
              { key: "templates", label: "Шаблоны постов",  icon: FileText,         help: { title: "Шаблоны постов", text: "Готовые структуры для разных типов постов. Скопируй шаблон, подставь свои данные в [скобках] — пост готов. Есть польза, история, кейс, оффер и опрос." } },
              { key: "hooks",     label: "Формулы хуков",   icon: Zap,              help: { title: "Формулы хуков", text: "Хук — первые 1–2 строки поста. Определяют 80% открываемости. Здесь 6 проверенных формул с примерами под каждую нишу." } },
              { key: "ads",       label: "Рекламные посты", icon: Megaphone,        help: { title: "Рекламные посты", text: "Конструктор текста для размещения рекламы в чужих каналах. Выбери тип (нативная, прямая, ВП, лид-магнит), заполни поля — получи готовый текст." } },
              { key: "cta",       label: "Библиотека CTA",  icon: MousePointerClick, help: { title: "Библиотека CTA", text: "CTA (Call To Action) — призыв к действию в конце поста. Без него читатель просто закроет пост. Здесь 20 готовых вариантов по 5 целям." } },
            ] as const).map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", paddingBottom: 10,
                  background: "none", border: "none",
                  borderBottom: tab === t.key ? "2px solid #f59e0b" : "2px solid transparent",
                  color: tab === t.key ? "#fbbf24" : "#6b7280",
                  cursor: "pointer", fontSize: 14, fontWeight: tab === t.key ? 600 : 400,
                }}>
                <t.icon style={{ width: 14, height: 14 }} /> {t.label}
                <HelpTooltip title={t.help.title} text={t.help.text} size={12} />
              </button>
            ))}
          </div>

          {/* ── TEMPLATES ─────────────────────────────────────────────── */}
          {tab === "templates" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {POST_TEMPLATES.map(tpl => (
                <ExpandableCard key={tpl.key} tpl={tpl} copied={copied} copy={copy} />
              ))}
            </div>
          )}

          {/* ── HOOKS ─────────────────────────────────────────────────── */}
          {tab === "hooks" && (
            <div>
              <div style={{ background: "#0d0b18", border: "1px solid #1e1c38", borderRadius: 12, padding: 18, marginBottom: 20 }}>
                <p style={{ fontSize: 13, color: "#9ca3af", lineHeight: 1.6 }}>
                  <strong style={{ color: "#ede8ff" }}>Хук</strong> — первые 1-2 строки поста. Определяют 80% открываемости. Используй эти формулы как основу, адаптируй под свою нишу.
                </p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {HOOK_FORMULAS.map(h => (
                  <div key={h.key} style={{ background: "#0d0b18", border: `1px solid ${h.color}22`, borderRadius: 12, padding: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: h.color }}>{h.label}</span>
                    </div>
                    <div style={{ background: "#07060d", borderRadius: 8, padding: "10px 14px", marginBottom: 14, border: `1px solid ${h.color}22` }}>
                      <code style={{ fontSize: 12, color: "#9ca3af", lineHeight: 1.6 }}>{h.formula}</code>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {h.examples.map((ex, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, padding: "8px 12px", background: "#13112a", borderRadius: 8 }}>
                          <span style={{ fontSize: 13, color: "#ede8ff", lineHeight: 1.5, flex: 1 }}>{ex}</span>
                          <CopyBtn text={ex} id={`hook-${h.key}-${i}`} copied={copied} copy={copy} />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── ADS ───────────────────────────────────────────────────── */}
          {tab === "ads" && (
            <div>
              <div style={{ background: "#0d0b18", border: "1px solid #1e1c38", borderRadius: 12, padding: 18, marginBottom: 20 }}>
                <p style={{ fontSize: 13, color: "#9ca3af", lineHeight: 1.6 }}>
                  Выбери тип рекламного поста, заполни поля — получи готовый текст для отправки владельцу канала или публикации.
                </p>
              </div>

              {/* Type selector */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
                {AD_TEMPLATES.map(a => (
                  <button key={a.key} onClick={() => { setAdKey(a.key); setAdVars({}); }}
                    style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid", cursor: "pointer", fontSize: 13, fontWeight: adKey === a.key ? 600 : 400, transition: "all 0.15s",
                      background: adKey === a.key ? a.color + "20" : "none",
                      borderColor: adKey === a.key ? a.color + "60" : "#374151",
                      color: adKey === a.key ? a.color : "#6b7280" }}>
                    {a.label}
                  </button>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                {/* Form */}
                <div style={{ background: "#0d0b18", border: "1px solid #1e1c38", borderRadius: 12, padding: 20 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: "#ede8ff", marginBottom: 4 }}>{selectedAd.label}</h3>
                  <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 16 }}>{selectedAd.description}</p>

                  <div style={{ background: "#07060d", borderRadius: 8, padding: "10px 14px", marginBottom: 16, border: "1px solid #1e1c38" }}>
                    <p style={{ fontSize: 11, color: "#f59e0b", marginBottom: 4, fontWeight: 600 }}>💡 Совет</p>
                    <p style={{ fontSize: 12, color: "#9ca3af", lineHeight: 1.5 }}>{selectedAd.tip}</p>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {adVarKeys.map(varKey => (
                      <div key={varKey}>
                        <label style={{ fontSize: 11, color: "#6b7280", display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.05em" }}>{varKey}</label>
                        <input value={adVars[varKey] ?? ""} onChange={e => setAdVars(v => ({ ...v, [varKey]: e.target.value }))}
                          placeholder={`Введи ${varKey.toLowerCase()}`}
                          style={{ width: "100%", background: "#07060d", border: "1px solid #374151", borderRadius: 8, padding: "7px 10px", color: "#ede8ff", fontSize: 13, boxSizing: "border-box" }} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Preview */}
                <div style={{ background: "#0d0b18", border: "1px solid #1e1c38", borderRadius: 12, padding: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 600, color: "#ede8ff" }}>Предпросмотр</h3>
                    <CopyBtn text={filledAd} id="ad-preview" copied={copied} copy={copy} />
                  </div>
                  <div style={{ background: "#07060d", borderRadius: 10, padding: 16, minHeight: 200, border: "1px solid #1e1c38" }}>
                    <pre style={{ fontSize: 13, color: "#ede8ff", lineHeight: 1.7, whiteSpace: "pre-wrap", margin: 0, fontFamily: "inherit" }}>
                      {filledAd}
                    </pre>
                  </div>
                  <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                    <span style={{ fontSize: 11, color: "#4b5563" }}>Символов: {filledAd.length}</span>
                    <span style={{ fontSize: 11, color: filledAd.length > 1024 ? "#ef4444" : "#4b5563" }}>
                      {filledAd.length > 1024 ? "⚠ Превышает лимит Telegram" : "✓ Укладывается в лимит"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Raw template */}
              <div style={{ marginTop: 20, background: "#0d0b18", border: "1px solid #1e1c38", borderRadius: 12, padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <h3 style={{ fontSize: 13, fontWeight: 600, color: "#6b7280" }}>Чистый шаблон</h3>
                  <CopyBtn text={selectedAd.template} id="ad-raw" copied={copied} copy={copy} />
                </div>
                <pre style={{ fontSize: 12, color: "#4b5563", lineHeight: 1.7, whiteSpace: "pre-wrap", margin: 0 }}>{selectedAd.template}</pre>
              </div>
            </div>
          )}

          {/* ── CTA ───────────────────────────────────────────────────── */}
          {tab === "cta" && (
            <div>
              <div style={{ background: "#0d0b18", border: "1px solid #1e1c38", borderRadius: 12, padding: 18, marginBottom: 20 }}>
                <p style={{ fontSize: 13, color: "#9ca3af", lineHeight: 1.6 }}>
                  Готовые призывы к действию. Скопируй нужный и вставь в конец поста. Текст в <code style={{ color: "#f59e0b" }}>[скобках]</code> замени на свои данные.
                </p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {CTA_LIBRARY.map(cat => (
                  <div key={cat.category}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: cat.color }} />
                      <h3 style={{ fontSize: 13, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" }}>{cat.category}</h3>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      {cat.items.map((item, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, padding: "10px 14px", background: "#0d0b18", border: "1px solid #1e1c38", borderRadius: 8 }}>
                          <span style={{ fontSize: 13, color: "#ede8ff", lineHeight: 1.5, flex: 1 }}>{item}</span>
                          <CopyBtn text={item} id={`cta-${cat.category}-${i}`} copied={copied} copy={copy} />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

// ─── ExpandableCard ───────────────────────────────────────────────────────────
function ExpandableCard({ tpl, copied, copy }: {
  tpl: typeof POST_TEMPLATES[0];
  copied: string | null;
  copy: (t: string, id: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ background: "#0d0b18", border: `1px solid ${tpl.color}22`, borderRadius: 12, overflow: "hidden" }}>
      <button onClick={() => setOpen(!open)}
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", background: "none", border: "none", cursor: "pointer" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 12, padding: "3px 10px", borderRadius: 6, background: tpl.color + "15", color: tpl.color, fontWeight: 600 }}>{tpl.label}</span>
          <span style={{ fontSize: 13, color: "#9ca3af" }}>{tpl.description}</span>
        </div>
        {open ? <ChevronUp style={{ width: 16, height: 16, color: "#4b5563" }} /> : <ChevronDown style={{ width: 16, height: 16, color: "#4b5563" }} />}
      </button>

      {open && (
        <div style={{ borderTop: "1px solid #1e1c38" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
            {/* Template */}
            <div style={{ padding: 20, borderRight: "1px solid #1e1c38" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 12, color: "#4b5563", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>Шаблон</span>
                <CopyBtn text={tpl.template} id={`tpl-${tpl.key}-template`} copied={copied} copy={copy} />
              </div>
              <pre style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.7, whiteSpace: "pre-wrap", margin: 0, fontFamily: "inherit" }}>{tpl.template}</pre>
            </div>
            {/* Example */}
            <div style={{ padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 12, color: "#4b5563", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>Пример</span>
                <CopyBtn text={tpl.example} id={`tpl-${tpl.key}-example`} copied={copied} copy={copy} />
              </div>
              <pre style={{ fontSize: 12, color: "#ede8ff", lineHeight: 1.7, whiteSpace: "pre-wrap", margin: 0, fontFamily: "inherit" }}>{tpl.example}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

