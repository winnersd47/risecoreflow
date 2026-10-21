# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> AI SaaS-платформа для роста проектов. Часть экосистемы AIGrowth.

---

## Команды

```bash
npm run dev          # dev-сервер на :3050 (Turbopack)
npm run build        # production build
npm run lint         # eslint

# Миграции — запускать при первом старте или при добавлении новых таблиц
node scripts/migrate-telegram.mjs    # TelegramFunnelStep, SubscriberSource
node scripts/migrate-bot-config.mjs  # botSettings колонка в Project + seed для OmniMindFlow
node scripts/migrate-payments.mjs    # Payment, User таблицы (если нужны)

# Добавить admin-пользователя
node scripts/add-admin.mjs

# Seed-данные (legacy, в папке prisma/)
node prisma/seed-direct.js           # OmniMindFlow проект
node prisma/seed-winextraflow.js     # WinExtraFlow проект

# Или двойной клик (Windows):
start-dev.bat
```

---

## Стек

| Слой | Технология |
|------|-----------|
| Framework | Next.js 16.2.6 (App Router, TypeScript, Turbopack) |
| БД | SQLite + better-sqlite3 (синхронный, `dev.db` в корне) |
| Auth | JWT + HTTP-only cookie `rcf_token` + bcryptjs + jose |
| AI | Gemini 1.5 Flash → Claude → Mock (fallback chain) |
| Styling | Tailwind CSS 4 + inline styles (Volcanic Indigo палитра) |
| Telegram | Bot API via REST (`https://api.telegram.org/bot{TOKEN}/{method}`) |

---

## Архитектура

### Fullstack: нет отдельного backend

Все API — Next.js Route Handlers в `app/api/`. БД доступна напрямую из route handlers через `better-sqlite3` (синхронный). Нет Prisma runtime, нет ORM — только `lib/db.ts` и прямые SQL-запросы.

### Middleware

Файл `proxy.ts` содержит логику роутинга (redirect на `/login`, проверка Pro-плана), но он **НЕ является** Next.js middleware — экспортирует функцию `proxy`, а не `middleware`. Поэтому он не запускается автоматически Edge-рантаймом. Защита на уровне API реализована через `requireAuth()` / `requirePro()` в каждом route handler.

⚠️ Если появляется файл `middleware.ts` в корне — **удалить** (`Remove-Item middleware.ts`) и очистить кэш (`Remove-Item -Recurse -Force .next`). Иначе возникает конфликт с proxy.ts.

### cuid генератор

Во всех route handlers вместо внешней библиотеки:
```typescript
function cuid() { return "c" + crypto.randomBytes(16).toString("hex").slice(0, 23); }
```

---

## Ключевые lib-файлы

| Файл | Назначение |
|------|-----------|
| `lib/auth.ts` | `signToken`, `verifyToken`, `getCurrentUser()`, `setAuthCookie()` |
| `lib/plan-guard.ts` | `requireAuth()`, `requirePro()`, `canCreateProject()`, `canCreatePost()` |
| `lib/ai-engine.ts` | AI fallback chain: Gemini → Claude → Mock; `generate()`, `generatePost()`, `improvePost()` |
| `lib/plans.ts` | `PLAN_FEATURES`, `ROI_ARGUMENTS`, pricing constants |
| `lib/bot-configs.ts` | `getBotConfig(projectName)` — динамические конфиги для Telegram bot-воронок |
| `lib/utils.ts` | `PROFILES`, `POST_TYPES`, `cn()` |

---

## Структура страниц проекта (`app/projects/[id]/`)

| Страница | Описание |
|----------|---------|
| `page.tsx` | Дашборд проекта |
| `content/` | Контент-план + AI-редактор поста |
| `tasks/` | Задачи по категориям |
| `analytics/` | Метрики канала (Recharts) |
| `launch/` | Launch Playbook (39 пунктов, auto-seed) |
| `outreach/` | Outreach CRM (pipeline 6 статусов) |
| `settings/` | Настройки проекта + удаление |
| `upgrade/` | Тарифы Free/Pro/Agency |
| `bot/` | **Telegram-бот**: статус, отправка постов, воронка, настройки тегов |
| `telegram/` | **Telegram-воронка**: шаги прогрева, трафик, ROMI-калькулятор, инструменты |
| `promo/` | **Промо-материалы**: шаблоны постов, хуки, рекламный конструктор, CTA |
| `growth/` 🔒 | Growth Engine — только Pro |
| `experiments/` 🔒 | A/B тесты — только Pro |
| `campaigns/` 🔒 | Кампании + UTM — только Pro |
| `competitors/` 🔒 | Battle Cards — только Pro |
| `icps/` 🔒 | ICP Manager — только Pro |

---

## Telegram-модуль

### Страницы

**`/bot`** — операционный пульт бота (4 вкладки):
- Статус: live-информация через `GET /api/bot/[id]` (вызывает `getMe`, `getChat`, `getChatMemberCount`)
- Отправить пост: composer с HTML-форматированием → `POST /api/bot/[id]/send`
- Воронка прогрева: шаги из БД с кнопкой «Отправить» → `POST /api/bot/[id]/send`
- Настройки: теги авто-репостера → `PATCH /api/bot/[id]`

**`/telegram`** — планировщик воронки прогрева (4 вкладки):
- Воронка: CRUD шагов (`story | pain | tip | case | offer`) → `api/telegram-funnel/[id]`
- Трафик: источники подписчиков → `api/subscribers/[id]`
- ROMI-калькулятор: adSpend, CPF, конверсия, чек
- Инструменты: Telegra.ph, InstantView, SMMplanner

**`/promo`** — библиотека промо-материалов (4 вкладки):
- Шаблоны постов, формулы хуков, рекламный конструктор с подстановкой переменных, CTA-библиотека

### API routes

| Route | Методы | Описание |
|-------|--------|---------|
| `api/bot/[id]` | GET, PATCH | Статус бота + редактирование настроек; настройки хранятся в `Project.botSettings` (JSON) |
| `api/bot/[id]/send` | POST | Отправить сообщение в канал/группу через Telegram Bot API |
| `api/telegram-funnel/[id]` | GET, POST, PATCH, DELETE | CRUD шагов воронки прогрева |
| `api/subscribers/[id]` | GET, POST, PATCH, DELETE | Источники трафика/подписчиков |

### Конфигурация бота

Хранится в `Project.botSettings` (TEXT/JSON). Добавлена миграцией `scripts/migrate-bot-config.mjs`. Структура:
```json
{
  "token": "...",
  "sourceChannels": [{ "id": "-100...", "label": "..." }],
  "targetGroupId": "-100...",
  "targetGroupLabel": "...",
  "forwardTags": ["#repost", "#aigc"]
}
```

Python-бот (авто-репостер) живёт отдельно: `C:\Users\v.serdyuk\Documents\AIGrowth\OmniMindFlow\tg-bot\bot.py`.

---

## Компоненты

| Компонент | Описание |
|-----------|---------|
| `Sidebar.tsx` | Навигация + user card + NotificationBell + MarketingGlossary + HelpTooltip на секциях |
| `HelpTooltip.tsx` | Portal-based popover (через `createPortal` + `position: fixed`). Открывается по hover/click. Использует `getBoundingClientRect` для позиционирования — избегает обрезки `overflow: hidden`. |
| `MarketingGlossary.tsx` | Модалка с 22 терминами (поиск + фильтр по категориям: Аналитика/Контент/Трафик/Воронка/Продукт) |
| `NotificationBell.tsx` | Dropdown уведомлений с live-счётчиком |
| `components/ui/` | button, card, progress, badge — кастомные Radix-обёртки |

---

## База данных — все таблицы

```
Project         — проекты (+ botSettings TEXT колонка)
Post            — посты контент-плана
Task            — задачи
Metric          — метрики аналитики по неделям
Experiment      — A/B тесты
Campaign        — кампании + UTM
Competitor      — battle cards
GrowthEntry     — growth engine данные
ICP             — ICP manager
OutreachContact — outreach CRM
LaunchChecklistItem — launch playbook
User            — пользователи (plan: free | pro | agency)
Notification    — уведомления
Payment         — платежи
Referral        — реферальная цепочка
TelegramFunnelStep  — шаги воронки прогрева [migrate-telegram.mjs]
SubscriberSource    — источники трафика [migrate-telegram.mjs]
```

Все даты хранятся как `TEXT` (ISO 8601). ID — cuid (24 символа).

---

## Auth flow

1. `POST /api/auth/register` — bcryptjs hash, JWT, promo-code, referral auto-credit
2. JWT (7 дней) → cookie `rcf_token` (HTTP-only)
3. Каждый route handler: `const { user, res } = await requireAuth(); if (res) return res;`
4. Pro-only route handlers: `const { user, res } = await requirePro(); if (res) return res;`

---

## Тарифная система

```typescript
LIMITS = {
  free:   { projects: 1, postsPerProject: 10, tasksPerProject: 20 },
  pro:    { projects: 5, postsPerProject: ∞,  tasksPerProject: ∞  },
  agency: { projects: ∞, postsPerProject: ∞,  tasksPerProject: ∞  },
}
// Pro-only pages: growth, experiments, campaigns, competitors, icps
// Pro-only API: /api/(experiments|campaigns|competitors|growth|icps)/[id]
// 403 response: { error: "Требуется Pro план", upgrade: true }
```

---

## AI Engine

```typescript
// lib/ai-engine.ts — приоритет: Gemini (free) → Claude → Mock
getActiveEngine()  // → "gemini" | "claude" | "none"
generate(prompt)
generatePost({ projectContext, day, profile, type, title })
improvePost(content, instruction)
adaptPost(content, platform: "twitter" | "linkedin" | "email")
// GET /api/ai/status — проверить активный движок
```

---

## Дизайн-система (Volcanic Indigo)

```css
background:  #07060d   /* страница */
surface:     #0d0b18   /* карточки */
surface-2:   #13112a   /* hover / elevated */
border:      #1e1c38
accent:      #f59e0b   /* amber — primary */
accent-2:    #6366f1   /* indigo — secondary */
foreground:  #ede8ff   /* текст */
```

Все страницы используют inline styles с этой палитрой. Tailwind классы — только вспомогательные утилиты.

---

## Правила разработки

1. **БД** — прямые SQL через `better-sqlite3`. В каждом route handler: `function db() { return new Database(path.resolve(process.cwd(), "dev.db")); }` — открывать и закрывать локально.
2. **AI** — только через `lib/ai-engine.ts`, не вызывать Gemini/Anthropic SDK напрямую.
3. **Auth** — `requireAuth()` или `requirePro()` первым в каждом route handler.
4. **Telegram API** — прямые fetch-вызовы `https://api.telegram.org/bot{TOKEN}/{method}`, токен из `Project.botSettings.token` или `process.env.TELEGRAM_BOT_TOKEN`.
5. **Tooltip** — использовать `HelpTooltip` с `createPortal` при любом риске обрезки overflow.
6. **middleware.ts** — не создавать. Вся auth-логика в `proxy.ts` (не-Edge) + `requireAuth()` в API.
