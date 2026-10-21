# RiseCoreFlow — Architecture & Change Log

> **Источник правды.** Все изменения фиксируются здесь.
> Последнее обновление: 2025-06-03

---

## CHANGELOG

| Дата | Изменение |
|------|-----------|
| 2025-06-03 | Plan enforcement: middleware + API guards (requirePro, canCreateProject, canCreatePost) |
| 2025-06-03 | Ценообразование переведено на рубли: Pro 2 990 ₽, Agency 9 990 ₽ |
| 2025-06-03 | Auth system: register/login/logout/me, JWT HTTP-only cookie, bcryptjs |
| 2025-06-03 | Landing page (16 секций), Login, Register, Terms, Privacy, Refund, Cookies |
| 2025-06-03 | PWA: manifest.json, sw.js, meta tags в layout.tsx |
| 2025-06-03 | Notifications API + NotificationBell компонент в Sidebar |
| 2025-06-03 | Referral system: автокредитование +7 дней Pro при регистрации через реферал |
| 2025-06-03 | Промокод в register route: PROMO_CODES из .env → автоматически даёт Pro |
| 2025-06-03 | User card + Logout в Sidebar |
| 2025-06-03 | Upgrade page переоформлен: Free vs Pro split + модульные карточки |
| 2025-06-03 | Bot funnel динамический: lib/bot-configs.ts, getBotConfig(projectName) |
| 2025-06-03 | AI Engine: Gemini (free) → Claude (fallback) → Mock; /api/ai/status |
| 2025-06-03 | Content Editor v2: AI improve (6 пресетов + custom) + 3-platform adapter |
| 2025-06-03 | Growth Suite: 5 модулей (growth/experiments/campaigns/competitors/icps) |
| 2025-06-03 | Launch Playbook: 39 пунктов по 3 фазам + auto-seed при первом GET |
| 2025-06-03 | Outreach CRM: pipeline 6 статусов, шаблоны питчей, 4 типа контактов |
| 2025-06-03 | Design system: Volcanic Indigo (#07060d bg, #f59e0b amber, #6366f1 indigo) |
| 2025-06-03 | WinExtraFlow проект добавлен с 8 готовыми постами и 20 задачами |
| 2025-06-03 | Email-цепочки написаны: OmniMindFlow + WinExtraFlow (3 письма × 3 профиля) |

---

## 1. СТЕК ТЕХНОЛОГИЙ

```
Framework:   Next.js 16.2.6 (App Router, TypeScript, Turbopack)
Database:    SQLite (better-sqlite3) — dev.db в корне проекта
Auth:        JWT (HTTP-only cookie "rcf_token") + bcryptjs + jose
AI:          Google Gemini 1.5 Flash (free) / Claude Opus (fallback)
Styling:     Tailwind CSS v4 + inline styles (Volcanic Indigo palette)
PWA:         /public/manifest.json + /public/sw.js
Port:        3050 (npm run dev → next dev --port 3050)
Node:        v24+
```

---

## 2. ФАЙЛОВАЯ СТРУКТУРА

```
marketing-platform/
├── app/
│   ├── page.tsx                          ← Landing (16 секций) ✅
│   ├── layout.tsx                        ← Root layout + PWA meta ✅
│   ├── globals.css                       ← CSS vars (Volcanic Indigo) ✅
│   ├── login/page.tsx                    ← Форма входа ✅
│   ├── register/page.tsx                 ← Регистрация + промокод + реферал ✅
│   ├── terms/page.tsx                    ← Terms of Service ✅
│   ├── privacy/page.tsx                  ← Privacy Policy ✅
│   ├── refund/page.tsx                   ← Refund Policy ✅
│   ├── cookies/page.tsx                  ← Cookie Policy ✅
│   ├── settings/ai/page.tsx              ← Настройка AI ключей ✅
│   ├── projects/
│   │   ├── page.tsx                      ← Список проектов ✅
│   │   ├── new/page.tsx                  ← Новый проект ✅
│   │   └── [id]/
│   │       ├── page.tsx                  ← Дашборд (с апгрейд-баннером) ✅
│   │       ├── content/
│   │       │   ├── page.tsx              ← Контент-план таблица ✅
│   │       │   ├── new/page.tsx          ← Новый пост ✅
│   │       │   ├── PostActions.tsx       ← Кнопка редактирования ✅
│   │       │   └── [postId]/page.tsx     ← AI редактор поста v2 ✅
│   │       ├── tasks/
│   │       │   ├── page.tsx              ← Список задач по категориям ✅
│   │       │   └── TaskStatusToggle.tsx  ← Клик-переключатель статуса ✅
│   │       ├── bot/page.tsx              ← Бот-воронка (динамическая) ✅
│   │       ├── analytics/page.tsx        ← Аналитика канала ✅
│   │       ├── settings/page.tsx         ← Настройки проекта + удаление ✅
│   │       ├── launch/page.tsx           ← Launch Playbook (39 пунктов) ✅
│   │       ├── outreach/page.tsx         ← Outreach CRM ✅
│   │       ├── upgrade/page.tsx          ← Тарифы (Free/Pro/Agency) ✅
│   │       ├── growth/page.tsx           ← Growth Engine — PRO ✅🔒
│   │       ├── experiments/page.tsx      ← A/B тесты — PRO ✅🔒
│   │       ├── campaigns/page.tsx        ← Кампании + UTM — PRO ✅🔒
│   │       ├── competitors/page.tsx      ← Battle Cards — PRO ✅🔒
│   │       └── icps/page.tsx             ← ICP Manager — PRO ✅🔒
│   └── api/
│       ├── auth/
│       │   ├── register/route.ts         ← Регистрация + промокод ✅
│       │   ├── login/route.ts            ← Вход ✅
│       │   ├── me/route.ts               ← Текущий пользователь ✅
│       │   └── logout/route.ts           ← Выход ✅
│       ├── projects/
│       │   ├── route.ts                  ← GET list + POST (с лимитом Free) ✅
│       │   └── [id]/route.ts             ← GET/PATCH/DELETE ✅
│       ├── posts/
│       │   ├── route.ts                  ← POST (с лимитом Free) ✅
│       │   └── [postId]/route.ts         ← GET/PATCH ✅
│       ├── tasks/[taskId]/route.ts        ← PATCH status ✅
│       ├── metrics/[id]/route.ts          ← GET/POST аналитика ✅
│       ├── ai/
│       │   ├── generate/route.ts          ← POST генерация поста ✅
│       │   ├── improve/route.ts           ← POST улучшение/адаптация ✅
│       │   └── status/route.ts            ← GET активный движок ✅
│       ├── experiments/[id]/route.ts      ← GET/POST/PATCH/DELETE — PRO ✅🔒
│       ├── campaigns/[id]/route.ts        ← GET/POST/PATCH/DELETE — PRO ✅🔒
│       ├── competitors/[id]/route.ts      ← GET/POST/PATCH/DELETE — PRO ✅🔒
│       ├── growth/[id]/route.ts           ← GET/POST — PRO ✅🔒
│       ├── icps/[id]/route.ts             ← GET/POST/PATCH/DELETE — PRO ✅🔒
│       ├── outreach/[id]/route.ts         ← GET/POST/PATCH/DELETE ✅
│       ├── launch/[id]/route.ts           ← GET (auto-seed) / PATCH ✅
│       ├── notifications/
│       │   ├── route.ts                   ← GET/POST ✅
│       │   ├── read/route.ts              ← POST mark all read ✅
│       │   └── count/route.ts             ← GET unread count ✅
│       ├── referrals/route.ts             ← GET stats ✅
│       └── public/stats/route.ts          ← GET live stats (без auth) ✅
├── components/
│   ├── Sidebar.tsx                        ← Nav + User card + Bell + PRO locks ✅
│   ├── NotificationBell.tsx               ← Dropdown с уведомлениями ✅
│   └── ui/
│       ├── button.tsx                     ← Amber gradient + variants ✅
│       ├── card.tsx                       ← Indigo surface ✅
│       ├── progress.tsx                   ← Amber→violet gradient bar ✅
│       └── badge.tsx                      ← Цветовые варианты ✅
├── lib/
│   ├── auth.ts                            ← JWT sign/verify, getCurrentUser ✅
│   ├── db.ts                              ← better-sqlite3 Prisma-like wrapper ✅
│   ├── ai-engine.ts                       ← Gemini→Claude→Mock с auto-select ✅
│   ├── bot-configs.ts                     ← getBotConfig(projectName) ✅
│   ├── plan-guard.ts                      ← requireAuth, requirePro, limits ✅
│   ├── plans.ts                           ← PLAN_FEATURES, ROI_ARGUMENTS ✅
│   └── utils.ts                           ← PROFILES, POST_TYPES, cn() ✅
├── middleware.ts                           ← Auth + Pro route protection ✅
├── public/
│   ├── manifest.json                      ← PWA manifest ✅
│   └── sw.js                              ← Service Worker ✅
├── prisma/
│   ├── seed-direct.js                     ← OmniMindFlow seed ✅
│   ├── seed-winextraflow.js               ← WinExtraFlow seed ✅
│   ├── seed-emails.js                     ← Email sequences seed ✅
│   ├── seed-examples.js                   ← Experiments/Campaigns/ICPs examples ✅
│   ├── migrate-v2.js                      ← Growth Suite tables ✅
│   └── migrate-v3.js (нужно создать)      ← User/Notification/Payment/Referral tables
├── ARCHITECTURE.md                        ← Этот файл ✅
└── .env                                   ← Конфигурация (см. секцию 8) ✅
```

---

## 3. БАЗА ДАННЫХ — ВСЕ ТАБЛИЦЫ

### DDL для создания с нуля

```sql
-- Проекты и контент
CREATE TABLE Project (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  channel TEXT,
  chatUrl TEXT,
  botUrl TEXT,
  siteUrl TEXT,
  wave TEXT DEFAULT 'Wave 1',
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE Post (
  id TEXT PRIMARY KEY,
  projectId TEXT NOT NULL,
  day INTEGER,
  title TEXT NOT NULL,
  content TEXT,
  profile TEXT DEFAULT 'all',
  type TEXT DEFAULT 'education',
  status TEXT DEFAULT 'draft',
  cta TEXT,
  publishedAt TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE Task (
  id TEXT PRIMARY KEY,
  projectId TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT,
  category TEXT,
  status TEXT DEFAULT 'pending',
  priority INTEGER DEFAULT 0,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE Metric (
  id TEXT PRIMARY KEY,
  projectId TEXT NOT NULL,
  week INTEGER NOT NULL,
  subscribers INTEGER,
  err REAL,
  ctaClicks REAL,
  botRegistrations INTEGER,
  notes TEXT,
  createdAt TEXT NOT NULL
);

-- Growth Suite
CREATE TABLE Experiment (
  id TEXT PRIMARY KEY,
  projectId TEXT NOT NULL,
  name TEXT NOT NULL,
  hypothesis TEXT,
  type TEXT DEFAULT 'ab_test',
  status TEXT DEFAULT 'draft',
  primaryMetric TEXT,
  controlName TEXT DEFAULT 'Control',
  controlConversions INTEGER DEFAULT 0,
  controlVisitors INTEGER DEFAULT 0,
  variantName TEXT DEFAULT 'Variant A',
  variantConversions INTEGER DEFAULT 0,
  variantVisitors INTEGER DEFAULT 0,
  confidence REAL DEFAULT 0,
  winner TEXT DEFAULT 'running',
  startDate TEXT,
  endDate TEXT,
  notes TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE Campaign (
  id TEXT PRIMARY KEY,
  projectId TEXT NOT NULL,
  name TEXT NOT NULL,
  channel TEXT NOT NULL,
  status TEXT DEFAULT 'planned',
  budget REAL DEFAULT 0,
  spent REAL DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  revenue REAL DEFAULT 0,
  utmSource TEXT,
  utmMedium TEXT,
  utmCampaign TEXT,
  startDate TEXT,
  endDate TEXT,
  notes TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE Competitor (
  id TEXT PRIMARY KEY,
  projectId TEXT NOT NULL,
  name TEXT NOT NULL,
  url TEXT,
  positioning TEXT,
  pricing TEXT,
  strengths TEXT,
  weaknesses TEXT,
  ourAdvantages TEXT,
  targetAudience TEXT,
  threatLevel TEXT DEFAULT 'medium',
  notes TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE GrowthEntry (
  id TEXT PRIMARY KEY,
  projectId TEXT NOT NULL,
  week INTEGER NOT NULL,
  newVisitors INTEGER,
  newSignups INTEGER,
  activatedUsers INTEGER,
  wau INTEGER,
  retentionRate REAL,
  mrr REAL,
  churnRate REAL,
  referrals INTEGER,
  viralCoefficient REAL,
  northStarValue REAL,
  northStarLabel TEXT,
  notes TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE ICP (
  id TEXT PRIMARY KEY,
  projectId TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  role TEXT,
  companySize TEXT,
  industry TEXT,
  painPoints TEXT,
  goals TEXT,
  objections TEXT,
  messagingAngle TEXT,
  channels TEXT,
  score INTEGER DEFAULT 0,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE OutreachContact (
  id TEXT PRIMARY KEY,
  projectId TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'journalist',
  platform TEXT,
  handle TEXT,
  status TEXT DEFAULT 'identified',
  audience TEXT,
  niche TEXT,
  lastContact TEXT,
  nextAction TEXT,
  notes TEXT,
  result TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE LaunchChecklistItem (
  id TEXT PRIMARY KEY,
  projectId TEXT NOT NULL,
  phase TEXT NOT NULL,
  category TEXT,
  title TEXT NOT NULL,
  description TEXT,
  completed INTEGER DEFAULT 0,
  dueDate TEXT,
  sortOrder INTEGER DEFAULT 0,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

-- Auth & Users
CREATE TABLE User (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  passwordHash TEXT NOT NULL,
  plan TEXT DEFAULT 'free',       -- free | pro | agency
  planExpiresAt TEXT,             -- NULL = бессрочный free
  referralCode TEXT UNIQUE,       -- 6-символьный hex код (авто)
  referredBy TEXT,                -- id пригласившего
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE Notification (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  type TEXT DEFAULT 'info',       -- info | success | warning | upgrade
  title TEXT NOT NULL,
  message TEXT,
  isRead INTEGER DEFAULT 0,
  actionUrl TEXT,
  createdAt TEXT NOT NULL
);

CREATE TABLE UserAchievement (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  achievementKey TEXT NOT NULL,
  unlockedAt TEXT NOT NULL,
  UNIQUE(userId, achievementKey)
);

CREATE TABLE Payment (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  gateway TEXT NOT NULL,          -- yookassa | cryptocloud | prodamus
  plan TEXT NOT NULL,             -- pro | agency
  amount REAL NOT NULL,
  currency TEXT DEFAULT 'RUB',
  status TEXT DEFAULT 'pending',  -- pending | paid | failed | refunded
  txId TEXT,
  createdAt TEXT NOT NULL
);

CREATE TABLE Referral (
  id TEXT PRIMARY KEY,
  referrerId TEXT NOT NULL,
  referredId TEXT NOT NULL,
  level INTEGER DEFAULT 1,        -- 1 или 2
  rewardDays INTEGER DEFAULT 7,
  status TEXT DEFAULT 'pending',  -- pending | credited
  createdAt TEXT NOT NULL
);
```

---

## 4. ПЛАН — ЛИМИТЫ И ДОСТУПЫ

```typescript
// lib/plan-guard.ts
export const LIMITS = {
  free:   { projects: 1,        postsPerProject: 10,       tasksPerProject: 20 },
  pro:    { projects: 5,        postsPerProject: Infinity, tasksPerProject: Infinity },
  agency: { projects: Infinity, postsPerProject: Infinity, tasksPerProject: Infinity },
};

// PRO-only routes (middleware.ts)
// /projects/[id]/(growth|experiments|campaigns|competitors|icps)
// → Free user → redirect to /projects/[id]/upgrade
// → No token → redirect to /login

// PRO-only API routes (requirePro() в каждом route.ts)
// /api/experiments/[id]
// /api/campaigns/[id]
// /api/competitors/[id]
// /api/growth/[id]
// /api/icps/[id]
// → 401 без токена, 403 { upgrade: true } для Free
```

### Цены (RUB)

| План | Месяц | Год | Скидка |
|------|-------|-----|--------|
| Free | 0 ₽ | — | — |
| Pro | 2 990 ₽ | 1 990 ₽/мес | −33% = 12 000 ₽ |
| Agency | 9 990 ₽ | 7 990 ₽/мес | −20% |

---

## 5. AUTH СИСТЕМА

```typescript
// lib/auth.ts — ключевые функции
signToken({ userId, plan })       → JWT строка (7 дней)
verifyToken(token)                → payload | null
setAuthCookie(token)              → HTTP-only cookie "rcf_token"
getAuthCookie()                   → string | null
clearAuthCookie()                 → удалить cookie
getCurrentUser()                  → User объект | null
generateReferralCode()            → "A3F9B2" (6-символьный hex)

// middleware.ts — три проверки
1. Нет токена + защищённый путь   → redirect /login
2. Есть токен + guest-only путь   → redirect /projects
3. Есть токен + Pro route + Free  → redirect /projects/[id]/upgrade
```

---

## 6. AI ENGINE

```typescript
// lib/ai-engine.ts
// Приоритет: Gemini (free) → Claude (paid) → Mock (no key)

getActiveEngine()  → "gemini" | "claude" | "none"
generate(prompt)   → string

generatePost({ projectContext, day, profile, type, title })
improvePost(content, instruction)
adaptPost(content, platform: "twitter" | "linkedin" | "email")

// Проверка активного движка: GET /api/ai/status
// Ключи в .env:
// GEMINI_API_KEY="AIza..."      ← получить: aistudio.google.com (бесплатно)
// ANTHROPIC_API_KEY="sk-ant-..." ← платный fallback
```

---

## 7. BOT FUNNEL

```typescript
// lib/bot-configs.ts
getBotConfig(projectName: string): BotConfig

// Реестр конфигов:
BOT_CONFIGS = {
  "OmniMindFlow": omniMindFlow,   // Developer / Founder / PM
  "WinExtraFlow": winExtraFlow,   // Крипто / MOEX / Начинающий
  // Добавить новый: MyProject: myConfig
}

// Структура BotConfig:
{
  start: { label, message, buttons[] }
  profiles: [{ key, label, color, messages: [{ num, label, trigger, message, button?, buttons? }] }]
  metrics: [{ label, target, color }]
  triggers: string[]
}
```

---

## 8. .env ПОЛНЫЙ ШАБЛОН

```env
# ── Database ──────────────────────────────────
DATABASE_URL="file:./dev.db"

# ── Auth ──────────────────────────────────────
JWT_SECRET="risecoreflow-jwt-secret-change-in-production-32chars!!"
JWT_EXPIRES_IN="7d"

# ── AI Engine (Gemini бесплатный = приоритет) ─
# Получить ключ: https://aistudio.google.com → Get API key
GEMINI_API_KEY="your-gemini-key-here"
# Fallback (платный): https://console.anthropic.com
ANTHROPIC_API_KEY="your-anthropic-key-here"

# ── Payments (работают в demo без ключей) ─────
YOOKASSA_SHOP_ID=""
YOOKASSA_SECRET_KEY=""
CRYPTOCLOUD_API_KEY=""
CRYPTOCLOUD_SHOP_ID=""
PRODAMUS_SECRET_KEY=""
PRODAMUS_PAYFORM_URL=""

# ── Telegram Bot ──────────────────────────────
TELEGRAM_BOT_TOKEN=""

# ── Promo Codes (CODE:DAYS, через запятую) ────
# При регистрации: код → автоматически выдаётся Pro на N дней
PROMO_CODES="WELCOME7:7,TRIAL3:3,LAUNCH30:30,PARTNER14:14,RISECOREFLOW:30"

# ── App ───────────────────────────────────────
NEXT_PUBLIC_APP_URL="http://localhost:3050"
```

---

## 9. ЦВЕТОВАЯ СИСТЕМА (Volcanic Indigo)

```css
/* app/globals.css — CSS Variables */
--background:        #07060d;   /* страница */
--surface:           #0d0b18;   /* карточки */
--surface-2:         #13112a;   /* hover / elevated */
--border:            #1e1c38;   /* все бордеры */
--border-subtle:     #16142e;
--foreground:        #ede8ff;   /* основной текст */
--foreground-muted:  #6b6885;   /* второстепенный */
--accent:            #f59e0b;   /* янтарь — Rise */
--accent-dim:        #92400e;
--accent-2:          #6366f1;   /* индиго — Core */
--accent-2-dim:      #3730a3;

/* Градиент логотипа: linear-gradient(90deg, #f59e0b, #a78bfa) */
/* Прогресс-бар: linear-gradient(90deg, #f59e0b, #a78bfa) */
/* Кнопка Primary: linear-gradient(135deg, #f59e0b, #d97706) */
/* Sidebar bg: #09071a */
```

---

## 10. LANDING PAGE — СЕКЦИИ

```
1.  Nav          sticky, backdrop-blur, Login + "Начать бесплатно →"
2.  Hero         gradient h1, live stats (4 цифры из /api/public/stats), 2 CTA
3.  Trust bar    Google Gemini, Anthropic, Telegram, LinkedIn, ProductHunt, HN
4.  Features     6 карточек: Контент+AI, Growth Engine, A/B, Campaign, Intel, Launch
5.  How works    3 шага: Добавь → Веди → Расти (цвета: indigo/amber/emerald)
6.  Promo        RISECOREFLOW = 30 дней Pro, янтарный блок
7.  Pricing      Free 0₽ / Pro 2990₽ / Agency 9990₽ (популярный badge)
8.  Comparison   RiseCoreFlow vs Notion vs HubSpot vs Excel (9 строк)
9.  FAQ          6 вопросов (details/summary collapsible)
10. Final CTA    gradient блок + ссылка на /register
11. Footer       Terms / Privacy / Refund / Cookies + © 2025
12. Sticky CTA   sm:hidden — кнопка на мобильных
```

---

## 11. LAUNCH PLAYBOOK — 39 ПУНКТОВ

Auto-seed при первом GET `/api/launch/[id]`:

```
Pre-launch (15): Контент(3) + PR/Аутрич(3) + ProductHunt(3) + HN(1) + Email(2) + Technical(3)
Launch day (12): Утро(2) + ProductHunt(2) + Communities(3) + Social(2) + Аутрич(2) + Мониторинг(1)
Post-launch (12): Первые24ч(3) + Аналитика(3) + Оптимизация(2) + Ретеншн(2) + Контент(2)
```

---

## 12. REFERRAL СИСТЕМА

```
Регистрация с referralCode:
  1. Находим реферера по User.referralCode
  2. Записываем Referral { referrerId, referredId, level:1, rewardDays:7, status:'pending' }
  3. Продлеваем реферера: planExpiresAt += 7 дней + устанавливаем plan='pro'
  4. status → 'credited'
  5. Уведомление рефереру: "username зарегистрировался, +7 дней Pro"

Регистрация с promoCode:
  1. Ищем в PROMO_CODES из .env
  2. Если найден: plan='pro', planExpiresAt = now + N дней
  3. Уведомление: "Промокод CODE активирован — N дней Pro"

Реферальный URL: /register?ref=XXXXXX
Промокод URL:   /register?promo=RISECOREFLOW
```

---

## 13. PROFILES & POST TYPES

```typescript
// lib/utils.ts — PROFILES
developer: { label: "Developer",        color: "#3b82f6" }
founder:   { label: "Founder",          color: "#f59e0b" }
pm:        { label: "Product Manager",  color: "#8b5cf6" }
all:       { label: "Все профили",      color: "#2dd4bf" }
// WinExtraFlow profiles:
crypto:    { label: "Крипто-трейдер",   color: "#f97316" }
investor:  { label: "Инвестор MOEX",    color: "#10b981" }
trader:    { label: "Трейдер",          color: "#06b6d4" }
beginner:  { label: "Начинающий",       color: "#a78bfa" }

// POST_TYPES
education | proof | community | pain | conversion | data

// TASK_CATEGORIES
content | bot | growth | multiplatform | analytics | conversion

// TASK_STATUSES
pending | in_progress | completed
```

---

## 14. PWA

```json
// public/manifest.json
{
  "name": "RiseCoreFlow",
  "short_name": "RiseCoreFlow",
  "start_url": "/projects",
  "display": "standalone",
  "background_color": "#07060d",
  "theme_color": "#f59e0b",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192" },
    { "src": "/icon-512.png", "sizes": "512x512" }
  ]
}
```
```javascript
// public/sw.js — стратегии
// API routes: network-first
// Static: cache-first
// Cache name: "risecoreflow-v1"
```

---

## 15. СТАТУС РЕАЛИЗАЦИИ

### ✅ Полностью реализовано

| Модуль | Файлы |
|--------|-------|
| Auth (JWT + cookie) | `lib/auth.ts`, `api/auth/*`, `middleware.ts` |
| Plan enforcement | `lib/plan-guard.ts`, middleware, все PRO API routes |
| Landing page | `app/page.tsx` |
| Login / Register (+ промокод) | `app/login/`, `app/register/` |
| Legal pages | `app/terms/`, `app/privacy/`, `app/refund/`, `app/cookies/` |
| PWA | `public/manifest.json`, `public/sw.js`, `app/layout.tsx` |
| Notifications | `api/notifications/*`, `components/NotificationBell.tsx` |
| Referral system | `api/referrals/`, `api/auth/register/` |
| Sidebar (user card + logout + locks) | `components/Sidebar.tsx` |
| AI Engine (Gemini/Claude/Mock) | `lib/ai-engine.ts`, `api/ai/*` |
| Content Editor v2 | `app/projects/[id]/content/[postId]/page.tsx` |
| Growth Suite (5 модулей) | `app/projects/[id]/growth|experiments|campaigns|competitors|icps` |
| Bot Funnel (dynamic) | `lib/bot-configs.ts`, `app/projects/[id]/bot/page.tsx` |
| Launch Playbook (39 пунктов) | `app/projects/[id]/launch/`, `api/launch/[id]/` |
| Outreach CRM | `app/projects/[id]/outreach/`, `api/outreach/[id]/` |
| Settings (проект + AI) | `app/projects/[id]/settings/`, `app/settings/ai/` |
| Upgrade page | `app/projects/[id]/upgrade/page.tsx` |
| OmniMindFlow данные | `prisma/seed-direct.js` |
| WinExtraFlow данные | `prisma/seed-winextraflow.js` |
| Email-цепочки | `prisma/seed-emails.js` (в Task.description) |
| Design System | `app/globals.css`, `components/ui/*` |

### 🔲 Не реализовано (следующие итерации)

| Модуль | Приоритет |
|--------|-----------|
| Платёжный шлюз ЮKassa | 🔴 Высокий |
| Платёжный шлюз CryptoCloud | 🔴 Высокий |
| Платёжный шлюз Prodamus | 🟡 Средний |
| Страница профиля (`/profile`) | 🟡 Средний |
| Страница рефералов (`/profile/referrals`) | 🟡 Средний |
| Страница биллинга (`/profile/billing`) | 🟡 Средний |
| Admin панель (`/admin`) | 🟡 Средний |
| i18n (RU/EN переключатель) | 🟢 Низкий |
| Achievements/Gamification | 🟢 Низкий |
| Agency: командная работа | 🟢 Низкий (MVP) |
| Telegram bot интеграция | 🟢 Низкий |
| PDF экспорт отчётов | 🟢 Низкий |

---

## 16. ЗАПУСК

```bash
# Первый запуск
cd C:\Users\v.serdyuk\Desktop\AI-OS\marketing-platform
npm install
node prisma/migrate-v2.js      # Growth Suite таблицы
node prisma/migrate-v3.js      # User/Auth таблицы (нужно создать)
node prisma/seed-direct.js     # OmniMindFlow проект
node prisma/seed-winextraflow.js # WinExtraFlow проект
node prisma/seed-emails.js     # Email sequences
node prisma/seed-examples.js   # Примеры данных
npm run dev

# Или двойной клик:
start-dev.bat

# URL: http://localhost:3050
# Landing: http://localhost:3050/
# Регистрация: http://localhost:3050/register
# Промокод: RISECOREFLOW (30 дней Pro)
```

---

*Файл обновляется при каждом значимом изменении. Версия платформы: v0.2*
