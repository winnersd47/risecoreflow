// ─── Pricing & Feature Access Configuration ──────────────────────────────────
// Single source of truth for what's Free vs Pro vs Agency

export type Plan = "free" | "pro" | "agency";

export const PLAN_FEATURES = {
  // ── Free ──────────────────────────────────────────────────────────────────
  free: {
    label: "Free",
    price: { monthly: 0, annual: 0 },
    currency: "RUB",
    limits: {
      projects: 1,
      postsPerProject: 10,
      tasksPerProject: 20,
      competitors: 0,
      icps: 0,
      campaigns: 0,
      experiments: 0,
    },
    features: [
      "1 проект",
      "Контент-план (до 10 постов)",
      "Трекер задач (до 20)",
      "Базовая аналитика канала",
      "Бот-воронка (шаблон)",
      "Просмотр Growth Suite (read-only)",
    ],
    locked: [
      "growth", "experiments", "campaigns", "competitors", "icps",
    ],
  },

  // ── Pro ───────────────────────────────────────────────────────────────────
  pro: {
    label: "Pro",
    price: { monthly: 2990, annual: 1990 },
    currency: "RUB",
    badge: "Самый популярный",
    limits: {
      projects: 5,
      postsPerProject: Infinity,
      tasksPerProject: Infinity,
      competitors: Infinity,
      icps: Infinity,
      campaigns: Infinity,
      experiments: Infinity,
    },
    features: [
      "До 5 проектов",
      "Безлимитный контент-план + AI-генерация постов",
      "Growth Engine — AARRR, North Star, k-factor",
      "A/B Эксперименты — байесовская значимость",
      "Кампании — UTM Builder, CAC, ROAS, Attribution",
      "Конкуренты — Battle Cards, Positioning Matrix",
      "ICP Manager — Jobs-to-be-Done, Messaging Matrix",
      "Приоритетный экспорт отчётов (PDF)",
      "Email-поддержка 24/48ч",
    ],
    locked: [],
  },

  // ── Agency ────────────────────────────────────────────────────────────────
  agency: {
    label: "Agency",
    price: { monthly: 9990, annual: 7990 },
    currency: "RUB",
    badge: "Для команд",
    limits: {
      projects: Infinity,
      postsPerProject: Infinity,
      tasksPerProject: Infinity,
      competitors: Infinity,
      icps: Infinity,
      campaigns: Infinity,
      experiments: Infinity,
    },
    features: [
      "Безлимитные проекты",
      "До 5 членов команды (в разработке)",
      "Всё из Pro плана",
      "Клиентский портал — white-label (в разработке)",
      "White-label отчёты с логотипом (в разработке)",
      "Шаблоны проектов — быстрый онбординг",
      "Приоритетная поддержка",
      "Дедицированный аккаунт-менеджер",
    ],
    locked: [],
  },
} as const;

// Premium routes that require Pro+
export const PRO_ROUTES = ["growth", "experiments", "campaigns", "competitors", "icps"];

// ROI arguments — why upgrade
export const ROI_ARGUMENTS = [
  {
    icon: "📊",
    title: "A/B без данных = деньги на ветер",
    problem: "Ты уже проводишь тесты — хук A vs хук B, разные CTA. Но без статистической значимости ты не знаешь, реальная ли разница или просто шум.",
    solution: "Эксперименты в Pro считают Байесовскую значимость автоматически. Ты видишь: «Вариант B выигрывает с 97% уверенностью, lift +23%». Принимаешь решение с данными, не с ощущениями.",
    value: "1 правильный A/B тест = +15-30% к конверсии",
    color: "#6366f1",
  },
  {
    icon: "📈",
    title: "CAC выше LTV — ты теряешь деньги молча",
    problem: "Ты тратишь время на 5 каналов. Но не знаешь, какой приносит платящих пользователей, а какой — только лайки. Без трекинга CAC — ты слепой.",
    solution: "Campaign Manager считает CAC, ROAS и ROI по каждому каналу. Ты видишь: «Telegram = CAC 750 ₽, LinkedIn = CAC 4 500 ₽». Отключаешь дорогой, удваиваешь дешёвый.",
    value: "Экономия 30-50% маркетингового бюджета",
    color: "#f59e0b",
  },
  {
    icon: "🧬",
    title: "Viral Coefficient — или ты растёшь, или платишь за каждого",
    problem: "Без k-factor ты не знаешь: продукт сам себя продаёт или каждый новый пользователь стоит деньги? Компании с k>1 растут без бюджета.",
    solution: "Growth Engine считает k-factor каждую неделю. Когда k<1 — показывает, где в воронке Activation или Referral нужно поднять конверсию.",
    value: "k=1.1 vs k=0.9 = разница в 10x стоимости роста",
    color: "#a78bfa",
  },
  {
    icon: "⚔️",
    title: "Battle Cards = выигранные сделки",
    problem: "Потенциальный клиент спрашивает: «Чем вы лучше [конкурент]?» У тебя 3 секунды. Импровизация здесь стоит сделки.",
    solution: "Competitive Intelligence хранит battle cards по каждому конкуренту: их слабости, твои преимущества, talking points. Ты отвечаешь уверенно и точно.",
    value: "Win rate вырастает на 15-25% при наличии battle cards (Gong Research)",
    color: "#10b981",
  },
  {
    icon: "🎯",
    title: "Без ICP ты пишешь для всех — значит, ни для кого",
    problem: "«Наш продукт для команд и индивидуалов, стартапов и корпораций, разработчиков и менеджеров» — такой месседж не конвертирует никого.",
    solution: "ICP Manager заставляет сфокусироваться: одна персона, одна боль, один messaging angle. Контент написанный под ICP конвертирует в 3-5x лучше.",
    value: "Фокус на 1 ICP = конверсия ×3 (HubSpot benchmark)",
    color: "#06b6d4",
  },
];
