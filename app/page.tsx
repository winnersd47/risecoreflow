export const dynamic = 'force-static';
import Link from "next/link";
import { TrendingUp, Zap, FlaskConical, Megaphone, Swords, Target, Rocket, Users, BarChart3, CalendarDays, ArrowRight, Check, X } from "lucide-react";

async function getPublicStats() {
  try {
    const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3050";
    const res = await fetch(`${base}/api/public/stats`, { cache: "no-store" });
    if (res.ok) return res.json();
  } catch {}
  return { projects: 2, posts: 22, users: 3, experiments: 3 };
}

export default async function LandingPage() {
  const stats = await getPublicStats();

  const features = [
    { icon: CalendarDays, color: "#6366f1", title: "Контент-план + AI", desc: "Генерация постов под профиль аудитории. 1 клик → адаптация под Telegram, Twitter, LinkedIn, Email." },
    { icon: TrendingUp, color: "#f59e0b", title: "Growth Engine", desc: "AARRR метрики, North Star, Viral Coefficient k-factor. Видишь растёт продукт сам или каждый юзер стоит денег." },
    { icon: FlaskConical, color: "#a78bfa", title: "A/B Эксперименты", desc: "Байесовская статзначимость. Знаешь когда данных достаточно для решения — не угадываешь." },
    { icon: Megaphone, color: "#10b981", title: "Campaign Manager", desc: "CAC, ROAS, Attribution по каждому каналу. UTM-builder встроен. Видишь какой канал окупается." },
    { icon: Swords, color: "#06b6d4", title: "Competitive Intel", desc: "Battle Cards по каждому конкуренту. Talking points, слабые стороны, positioning matrix." },
    { icon: Rocket, color: "#f97316", title: "Launch Playbook", desc: "39-пунктовый чеклист запуска: подготовка → день запуска → 72ч после. Best practices от Figma, Notion, Linear." },
  ];

  const comparison = [
    { feature: "Контент-план с AI", rcf: true, notion: "Частично", hubspot: true, excel: false },
    { feature: "Growth Engine (AARRR)", rcf: true, notion: false, hubspot: "Частично", excel: false },
    { feature: "A/B тесты + статзначимость", rcf: true, notion: false, hubspot: true, excel: false },
    { feature: "Campaign Manager + UTM", rcf: true, notion: false, hubspot: true, excel: "Вручную" },
    { feature: "Battle Cards (конкуренты)", rcf: true, notion: "Вручную", hubspot: false, excel: "Вручную" },
    { feature: "Launch Playbook (39 пунктов)", rcf: true, notion: false, hubspot: false, excel: false },
    { feature: "Outreach CRM", rcf: true, notion: "Вручную", hubspot: true, excel: "Вручную" },
    { feature: "ICP Manager", rcf: true, notion: "Вручную", hubspot: "Частично", excel: "Вручную" },
    { feature: "Цена/мес", rcf: "0 – 2 990 ₽", notion: "750 – 1 500 ₽", hubspot: "4 200 – 75 000 ₽", excel: "900 ₽" },
  ];

  const faqs = [
    { q: "Есть ли бесплатный план?", a: "Да. Free план включает 1 проект, до 10 постов, 20 задач и базовую аналитику. Без ограничений по времени." },
    { q: "Нужна ли кредитная карта для регистрации?", a: "Нет. Регистрация бесплатна без карты. Карта нужна только при переходе на Pro план." },
    { q: "Как работает AI генерация контента?", a: "Используем Google Gemini 1.5 Flash (бесплатный API). Нужно вставить ключ из aistudio.google.com — это занимает 2 минуты." },
    { q: "Могу ли я вести несколько проектов?", a: "Free план — 1 проект. Pro план — до 5 проектов. Agency — безлимит." },
    { q: "Есть ли реферальная программа?", a: "Да. Приглашаешь друга — получаешь +7 дней Pro. Ваш приглашённый пригласил кого-то — ещё +3 дня." },
    { q: "Какие платёжные методы будут приняты?", a: "В разработке: карты РФ + СБП (рубли), Visa/Mastercard USD/EUR, USDT/BTC/ETH. Сейчас для оплаты напиши на hello@risecoreflow.com." },
  ];

  return (
    <div style={{ background: "#07060d", color: "#ede8ff", minHeight: "100vh" }}>

      {/* NAV */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-4"
        style={{ background: "rgba(7,6,13,0.9)", backdropFilter: "blur(12px)", borderBottom: "1px solid #1e1c38" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #f59e0b22, #6366f122)", border: "1px solid #f59e0b44" }}>
            <TrendingUp className="w-4 h-4" style={{ color: "#f59e0b" }} />
          </div>
          <span className="font-bold text-sm"
            style={{ background: "linear-gradient(90deg, #f59e0b, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            RiseCoreFlow
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm px-4 py-2 rounded-lg" style={{ color: "#6b6885" }}>Войти</Link>
          <Link href="/register" className="text-sm px-4 py-2 rounded-lg font-semibold"
            style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#07060d" }}>
            Начать бесплатно →
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative px-8 pt-24 pb-20 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-40 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(245,158,11,0.12), transparent), radial-gradient(ellipse 50% 40% at 80% 60%, rgba(99,102,241,0.08), transparent)" }} />
        <div className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6"
            style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)", color: "#f59e0b" }}>
            <Zap className="w-3 h-3" /> Бесплатно · AI через Google Gemini (нужен ключ)
          </div>
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Маркетинг AI/SaaS проекта<br />
            <span style={{ background: "linear-gradient(90deg, #f59e0b, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              от идеи до роста
            </span>
          </h1>
          <p className="text-xl mb-10 max-w-2xl mx-auto" style={{ color: "#6b6885" }}>
            Контент-план с AI, AARRR метрики, A/B тесты, Launch Playbook и Outreach CRM — всё в одном месте для предпринимателей.
          </p>

          <div className="flex items-center justify-center gap-10 mb-10">
            {[
              { label: "Проектов", value: stats.projects },
              { label: "Постов создано", value: stats.posts },
              { label: "Пользователей", value: stats.users },
              { label: "Экспериментов", value: stats.experiments },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-bold font-mono" style={{ color: "#f59e0b" }}>{s.value}+</div>
                <div className="text-xs" style={{ color: "#6b6885" }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-4">
            <Link href="/register" className="px-8 py-3.5 rounded-xl text-base font-semibold transition-all"
              style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#07060d", boxShadow: "0 0 30px rgba(245,158,11,0.25)" }}>
              Начать бесплатно →
            </Link>
            <Link href="/login" className="px-8 py-3.5 rounded-xl text-base font-semibold"
              style={{ background: "#13112a", border: "1px solid #1e1c38", color: "#ede8ff" }}>
              Войти
            </Link>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="px-8 py-5" style={{ borderTop: "1px solid #1e1c38", borderBottom: "1px solid #1e1c38", background: "#0a0914" }}>
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-8 flex-wrap">
          {["Google Gemini AI", "Anthropic Claude", "Telegram Bot API", "LinkedIn", "ProductHunt", "Hacker News"].map(t => (
            <span key={t} className="text-xs font-medium" style={{ color: "#3d3a5c" }}>{t}</span>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="px-8 py-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4" style={{ color: "#ede8ff" }}>Всё для продвижения проекта</h2>
          <p className="text-center mb-12" style={{ color: "#6b6885" }}>6 профессиональных инструментов в одном дашборде</p>
          <div className="grid grid-cols-3 gap-5">
            {features.map(f => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="rounded-2xl p-5 transition-all"
                  style={{ background: "#0d0b18", border: `1px solid ${f.color}1a` }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: f.color + "15", border: `1px solid ${f.color}33` }}>
                    <Icon className="w-4 h-4" style={{ color: f.color }} />
                  </div>
                  <h3 className="text-sm font-semibold mb-2" style={{ color: "#ede8ff" }}>{f.title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: "#6b6885" }}>{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="px-8 py-20" style={{ background: "#0a0914" }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12" style={{ color: "#ede8ff" }}>Как это работает</h2>
          <div className="grid grid-cols-3 gap-8">
            {[
              { step: "01", title: "Добавь проект", desc: "Создай проект, укажи канал и сайт. Платформа подтянет контекст автоматически.", color: "#6366f1" },
              { step: "02", title: "Веди маркетинг", desc: "Генерируй посты AI, запускай A/B тесты, трекай кампании, строй Outreach CRM.", color: "#f59e0b" },
              { step: "03", title: "Расти на данных", desc: "AARRR дашборд покажет что работает. k-factor подскажет куда инвестировать.", color: "#10b981" },
            ].map(s => (
              <div key={s.step}>
                <div className="text-4xl font-bold font-mono mb-3" style={{ color: s.color + "55" }}>{s.step}</div>
                <h3 className="text-sm font-semibold mb-2" style={{ color: "#ede8ff" }}>{s.title}</h3>
                <p className="text-xs" style={{ color: "#6b6885" }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROMO BANNER */}
      <section className="px-8 py-12">
        <div className="max-w-2xl mx-auto rounded-2xl p-8 text-center"
          style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.06), rgba(99,102,241,0.06))", border: "1px solid rgba(245,158,11,0.2)" }}>
          <div className="text-xs mb-2" style={{ color: "#6b6885" }}>Промокод при регистрации</div>
          <div className="text-2xl font-bold font-mono mb-2" style={{ color: "#f59e0b" }}>RISECOREFLOW</div>
          <div className="text-sm mb-5" style={{ color: "#6b6885" }}>30 дней Pro бесплатно · Без карты</div>
          <Link href="/register" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#07060d" }}>
            Активировать →
          </Link>
        </div>
      </section>

      {/* PRICING */}
      <section className="px-8 py-20" style={{ background: "#0a0914" }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12" style={{ color: "#ede8ff" }}>Простые тарифы</h2>
          <div className="grid grid-cols-3 gap-5">
            {[
              { name: "Free", price: "0 ₽", period: "навсегда", color: "#6b6885", features: ["1 проект", "10 постов", "20 задач", "Базовая аналитика", "Бот-воронка (шаблон)"], cta: "Начать бесплатно", href: "/register" },
              { name: "Pro", price: "2 990 ₽", period: "/мес", color: "#f59e0b", popular: true, features: ["5 проектов", "AI генерация ∞", "Growth Engine", "A/B Эксперименты", "Campaigns + UTM", "Battle Cards", "ICP Manager", "Launch Playbook", "Outreach CRM ∞"], cta: "Начать Pro", href: "/register" },
              { name: "Agency", price: "9 990 ₽", period: "/мес", color: "#6366f1", features: ["∞ проектов", "5 членов команды (скоро)", "Всё из Pro", "White-label отчёты (скоро)", "Клиентский портал (скоро)", "Приоритетная поддержка"], cta: "Связаться", href: "mailto:hello@risecoreflow.com?subject=Agency Plan" },
            ].map(p => (
              <div key={p.name} className="rounded-2xl p-5 flex flex-col relative"
                style={{ background: "#0d0b18", border: `2px solid ${(p as any).popular ? "rgba(245,158,11,0.35)" : p.color + "22"}` }}>
                {(p as any).popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold"
                    style={{ background: "linear-gradient(90deg, #f59e0b, #d97706)", color: "#07060d" }}>
                    Популярный
                  </div>
                )}
                <div className="mb-4 mt-1">
                  <div className="text-xs font-semibold mb-1" style={{ color: p.color }}>{p.name}</div>
                  <div className="text-2xl font-bold font-mono" style={{ color: "#ede8ff" }}>{p.price}<span className="text-sm font-normal" style={{ color: "#6b6885" }}>{p.period}</span></div>
                </div>
                <ul className="space-y-1.5 flex-1 mb-5">
                  {p.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-xs">
                      <Check className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: p.color }} />
                      <span style={{ color: "#ede8ff" }}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href={p.href} className="block w-full py-2.5 rounded-xl text-sm font-semibold text-center"
                  style={{ background: (p as any).popular ? "linear-gradient(135deg, #f59e0b, #d97706)" : "#13112a", border: (p as any).popular ? "none" : `1px solid ${p.color}33`, color: (p as any).popular ? "#07060d" : p.color }}>
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPARISON */}
      <section className="px-8 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8" style={{ color: "#ede8ff" }}>RiseCoreFlow vs конкуренты</h2>
          <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #1e1c38" }}>
            <table className="w-full">
              <thead>
                <tr style={{ background: "#0d0b18" }}>
                  <th className="text-left px-5 py-3 text-xs font-medium" style={{ color: "#3d3a5c" }}>Функция</th>
                  <th className="text-center px-3 py-3 text-xs font-bold" style={{ color: "#f59e0b" }}>RiseCoreFlow</th>
                  <th className="text-center px-3 py-3 text-xs" style={{ color: "#6b6885" }}>Notion</th>
                  <th className="text-center px-3 py-3 text-xs" style={{ color: "#6b6885" }}>HubSpot</th>
                  <th className="text-center px-3 py-3 text-xs" style={{ color: "#6b6885" }}>Excel</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row, i) => (
                  <tr key={row.feature} style={{ background: i % 2 === 0 ? "#07060d" : "#0a0914", borderTop: "1px solid #1e1c38" }}>
                    <td className="px-5 py-2.5 text-xs" style={{ color: "#ede8ff" }}>{row.feature}</td>
                    {[row.rcf, row.notion, row.hubspot, row.excel].map((v, j) => (
                      <td key={j} className="px-3 py-2.5 text-center text-xs">
                        {v === true ? <Check className="w-4 h-4 mx-auto" style={{ color: "#86efac" }} />
                          : v === false ? <X className="w-4 h-4 mx-auto" style={{ color: "#3d3a5c" }} />
                          : <span style={{ color: "#fcd34d" }}>{v}</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-8 py-16" style={{ background: "#0a0914" }}>
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8" style={{ color: "#ede8ff" }}>Часто задаваемые вопросы</h2>
          <div className="space-y-2">
            {faqs.map(faq => (
              <details key={faq.q} className="rounded-xl overflow-hidden group" style={{ background: "#0d0b18", border: "1px solid #1e1c38" }}>
                <summary className="px-5 py-4 text-sm font-medium cursor-pointer list-none flex items-center justify-between" style={{ color: "#ede8ff" }}>
                  {faq.q}
                  <span style={{ color: "#f59e0b" }}>+</span>
                </summary>
                <div className="px-5 pb-4 text-sm" style={{ color: "#6b6885" }}>{faq.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="px-8 py-20 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl font-bold mb-4" style={{ color: "#ede8ff" }}>Готов начать расти?</h2>
          <p className="mb-8" style={{ color: "#6b6885" }}>Бесплатно. Без карты. Первый проект за 5 минут.</p>
          <Link href="/register" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-semibold"
            style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#07060d", boxShadow: "0 0 40px rgba(245,158,11,0.25)" }}>
            Создать бесплатный аккаунт <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-8 py-8" style={{ borderTop: "1px solid #1e1c38" }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" style={{ color: "#f59e0b" }} />
            <span className="text-sm font-bold" style={{ background: "linear-gradient(90deg, #f59e0b, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>RiseCoreFlow</span>
          </div>
          <div className="flex gap-5 text-xs" style={{ color: "#3d3a5c" }}>
            {[["Условия", "/terms"], ["Конфиденциальность", "/privacy"], ["Возврат", "/refund"], ["Cookies", "/cookies"]].map(([label, href]) => (
              <Link key={label} href={href} style={{ color: "#3d3a5c" }}>{label}</Link>
            ))}
          </div>
          <div className="text-xs" style={{ color: "#3d3a5c" }}>© 2025 RiseCoreFlow</div>
        </div>
      </footer>

      {/* STICKY CTA mobile */}
      <div className="fixed bottom-4 left-4 right-4 sm:hidden z-50">
        <Link href="/register" className="block w-full py-3.5 rounded-xl text-sm font-semibold text-center"
          style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#07060d", boxShadow: "0 4px 20px rgba(245,158,11,0.4)" }}>
          Начать бесплатно →
        </Link>
      </div>
    </div>
  );
}
