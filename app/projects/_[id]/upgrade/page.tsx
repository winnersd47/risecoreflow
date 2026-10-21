import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Sidebar } from "@/components/Sidebar";
import { PayButton } from "./PayButton";
import {
  TrendingUp, FlaskConical, Megaphone, Swords, Target,
  Zap, Building2, Gift, Check, X, Lock, Unlock,
} from "lucide-react";

const GROWTH_MODULES = [
  {
    icon: TrendingUp,
    color: "#f59e0b",
    name: "Growth Engine",
    tagline: "AARRR · North Star · k-factor",
    free: "Нет доступа",
    pro: "Видишь каждую неделю: сколько привлекли, активировали, удержали. k-factor покажет — продукт растёт сам или каждый юзер стоит денег.",
    stat: "k=1.1 vs k=0.9 = разница в 10× стоимости роста",
  },
  {
    icon: FlaskConical,
    color: "#a78bfa",
    name: "A/B Эксперименты",
    tagline: "Байесовская статзначимость",
    free: "Нет доступа",
    pro: "Запускаешь тест хука А vs Б. Платформа считает статзначимость и говорит: «Вариант Б выигрывает с 97% уверенностью, lift +23%». Решаешь с данными.",
    stat: "1 правильный тест = +15–30% к конверсии",
  },
  {
    icon: Megaphone,
    color: "#10b981",
    name: "Campaign Manager",
    tagline: "CAC · ROAS · UTM Builder",
    free: "Нет доступа",
    pro: "Трекаешь каждый канал: Telegram = CAC 750 ₽, LinkedIn = CAC 4 500 ₽. Видишь что окупается — удваиваешь. Видишь что нет — отключаешь.",
    stat: "Экономия 30–50% маркетингового бюджета",
  },
  {
    icon: Swords,
    color: "#06b6d4",
    name: "Competitive Intel",
    tagline: "Battle Cards · Positioning",
    free: "Нет доступа",
    pro: "Клиент спрашивает «чем вы лучше X?» — открываешь battle card: их слабости, твои преимущества, готовые talking points. Отвечаешь уверенно.",
    stat: "Win rate +15–25% при наличии battle cards",
  },
  {
    icon: Target,
    color: "#f97316",
    name: "ICP Manager",
    tagline: "Jobs-to-be-Done · Messaging",
    free: "Нет доступа",
    pro: "Описываешь конкретного клиента: его боль, цели, возражения, канал. Весь контент пишется под него — не «для всех». Конверсия растёт в 3–5×.",
    stat: "Фокус на 1 ICP = конверсия ×3–5",
  },
];

export default async function UpgradePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) notFound();

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar projectId={id} />
      <main className="flex-1 overflow-y-auto" style={{ background: "#07060d" }}>
        <div className="max-w-4xl mx-auto px-8 py-10">

          {/* ── Header ───────────────────────────────────────── */}
          <div className="mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium mb-4"
              style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", color: "#f59e0b" }}>
              <Lock className="w-3 h-3" /> Growth Suite · Pro план
            </div>
            <h1 className="text-3xl font-bold mb-3 leading-tight" style={{ color: "#ede8ff" }}>
              За что платишь 2 990 ₽/мес
            </h1>
            <p className="text-base" style={{ color: "#6b6885" }}>
              5 инструментов, которые превращают маркетинг из «постим и надеемся» в измеримую систему роста.
            </p>
          </div>

          {/* ── Free vs Pro split ────────────────────────────── */}
          <div className="grid grid-cols-2 gap-3 mb-10">
            <div className="rounded-xl p-5" style={{ background: "#0d0b18", border: "1px solid #1e1c38" }}>
              <div className="flex items-center gap-2 mb-4">
                <Gift className="w-4 h-4" style={{ color: "#6b6885" }} />
                <span className="text-sm font-semibold" style={{ color: "#6b6885" }}>Free — что есть сейчас</span>
              </div>
              <ul className="space-y-2 text-xs" style={{ color: "#6b6885" }}>
                {["1 проект", "Контент-план до 10 постов", "Задачи до 20", "Бот-воронка (шаблон)", "Launch Playbook", "Outreach CRM", "Базовая аналитика"].map(f => (
                  <li key={f} className="flex items-center gap-2">
                    <Check className="w-3 h-3 flex-shrink-0" style={{ color: "#3d3a5c" }} />
                    {f}
                  </li>
                ))}
                <li className="flex items-center gap-2 pt-2" style={{ borderTop: "1px solid #1e1c38", color: "#3d3a5c" }}>
                  <X className="w-3 h-3 flex-shrink-0" />
                  Growth Suite (5 модулей заблокированы)
                </li>
              </ul>
            </div>

            <div className="rounded-xl p-5" style={{ background: "linear-gradient(135deg, #0f0d20, #130f24)", border: "2px solid rgba(245,158,11,0.3)" }}>
              <div className="flex items-center gap-2 mb-4">
                <Unlock className="w-4 h-4" style={{ color: "#f59e0b" }} />
                <span className="text-sm font-semibold" style={{ color: "#f59e0b" }}>Pro — что разблокируется</span>
              </div>
              <ul className="space-y-2 text-xs" style={{ color: "#ede8ff" }}>
                {["До 5 проектов", "Безлимитный контент + AI генерация", "Growth Engine (AARRR + k-factor)", "A/B Эксперименты (байесовская значимость)", "Campaign Manager (CAC, ROAS, UTM)", "Competitive Intel (battle cards)", "ICP Manager (Jobs-to-be-Done)"].map(f => (
                  <li key={f} className="flex items-center gap-2">
                    <Check className="w-3 h-3 flex-shrink-0" style={{ color: "#f59e0b" }} />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ── 5 Growth Suite modules ───────────────────────── */}
          <div className="mb-10">
            <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: "#3d3a5c" }}>
              Что именно даёт каждый модуль
            </h2>
            <div className="space-y-3">
              {GROWTH_MODULES.map((m) => {
                const Icon = m.icon;
                return (
                  <div key={m.name} className="rounded-xl overflow-hidden" style={{ border: `1px solid ${m.color}1a` }}>
                    <div className="flex items-stretch">
                      {/* Left accent */}
                      <div className="w-1 flex-shrink-0" style={{ background: m.color }} />
                      <div className="flex-1 p-4 flex items-start gap-4" style={{ background: "#0d0b18" }}>
                        {/* Icon */}
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ background: m.color + "15", border: `1px solid ${m.color}33` }}>
                          <Icon className="w-4 h-4" style={{ color: m.color }} />
                        </div>
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-sm font-semibold" style={{ color: "#ede8ff" }}>{m.name}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: m.color + "15", color: m.color }}>{m.tagline}</span>
                          </div>
                          <p className="text-xs leading-relaxed" style={{ color: "#6b6885" }}>{m.pro}</p>
                        </div>
                        {/* Stat */}
                        <div className="flex-shrink-0 text-right" style={{ minWidth: "160px" }}>
                          <div className="text-[10px] font-semibold px-3 py-2 rounded-lg leading-relaxed"
                            style={{ background: m.color + "10", color: m.color, border: `1px solid ${m.color}22` }}>
                            {m.stat}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Pricing ──────────────────────────────────────── */}
          <div className="grid grid-cols-3 gap-4 mb-10">

            {/* Free */}
            <div className="rounded-xl p-5 flex flex-col" style={{ background: "#0d0b18", border: "1px solid #1e1c38" }}>
              <div className="flex items-center gap-2 mb-3">
                <Gift className="w-4 h-4" style={{ color: "#6b6885" }} />
                <span className="text-sm font-semibold" style={{ color: "#6b6885" }}>Free</span>
              </div>
              <div className="text-2xl font-bold font-mono mb-0.5" style={{ color: "#ede8ff" }}>0 ₽</div>
              <div className="text-xs mb-4" style={{ color: "#6b6885" }}>навсегда</div>
              <div className="mt-auto w-full py-2 rounded-lg text-sm font-medium text-center"
                style={{ background: "#13112a", border: "1px solid #1e1c38", color: "#6b6885" }}>
                Текущий план
              </div>
            </div>

            {/* Pro */}
            <div className="rounded-xl p-5 flex flex-col relative"
              style={{ background: "linear-gradient(135deg, #100e22, #140f28)", border: "2px solid rgba(245,158,11,0.4)", boxShadow: "0 0 30px rgba(245,158,11,0.06)" }}>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold"
                style={{ background: "linear-gradient(90deg, #f59e0b, #d97706)", color: "#07060d" }}>
                Рекомендуем
              </div>
              <div className="flex items-center gap-2 mb-3 mt-1">
                <Zap className="w-4 h-4" style={{ color: "#f59e0b" }} />
                <span className="text-sm font-semibold" style={{ color: "#ede8ff" }}>Pro</span>
              </div>
              <div className="text-2xl font-bold font-mono mb-0.5" style={{ color: "#ede8ff" }}>2 990 ₽</div>
              <div className="text-xs mb-1" style={{ color: "#6b6885" }}>/мес · или 1 990 ₽ при оплате годом</div>
              <div className="text-[10px] mb-4" style={{ color: "#f59e0b" }}>Экономия 12 000 ₽/год</div>
              <PayButton
                planKey="pro_monthly"
                label="Оплатить Pro →"
                className="mt-auto block w-full py-2.5 rounded-lg text-sm font-semibold text-center"
                style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#07060d", boxShadow: "0 0 16px rgba(245,158,11,0.25)", border: "none", cursor: "pointer" }}
              />
            </div>

            {/* Agency */}
            <div className="rounded-xl p-5 flex flex-col" style={{ background: "#0d0b18", border: "1px solid rgba(99,102,241,0.25)" }}>
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="w-4 h-4" style={{ color: "#6366f1" }} />
                <span className="text-sm font-semibold" style={{ color: "#ede8ff" }}>Agency</span>
              </div>
              <div className="text-2xl font-bold font-mono mb-0.5" style={{ color: "#ede8ff" }}>9 990 ₽</div>
              <div className="text-xs mb-1" style={{ color: "#6b6885" }}>/мес · или 7 990 ₽ при оплате годом</div>
              <div className="text-[10px] mb-4" style={{ color: "#6366f1" }}>∞ проектов · 5 человек в команде</div>
              <PayButton
                planKey="agency_monthly"
                label="Оплатить Agency →"
                className="mt-auto block w-full py-2.5 rounded-lg text-sm font-semibold text-center"
                style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.35)", color: "#a5b4fc", cursor: "pointer" }}
              />
            </div>
          </div>

          {/* ── Bottom guarantee ─────────────────────────────── */}
          <div className="flex items-center justify-between px-6 py-4 rounded-xl text-xs"
            style={{ background: "#0d0b18", border: "1px solid #1e1c38", color: "#6b6885" }}>
            <span>💳 ЮKassa · Карты · СБП · ЮMoney</span>
            <span>14 дней — возврат без вопросов</span>
            <span>Без скрытых платежей</span>
            <span>hello@risecoreflow.com</span>
          </div>

        </div>
      </main>
    </div>
  );
}


export async function generateStaticParams() { return []; }