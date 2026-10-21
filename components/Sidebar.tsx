"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, CalendarDays, CheckSquare, Bot, BarChart3,
  FolderOpen, TrendingUp, FlaskConical, Megaphone, Swords, Target,
  Rocket, Users, Zap, Settings, LogOut, User, CreditCard, Send, Sparkles,
} from "lucide-react";
import { NotificationBell } from "./NotificationBell";
import { MarketingGlossary } from "./MarketingGlossary";
import { HelpTooltip } from "./HelpTooltip";

interface SidebarProps { projectId?: string; }

export function Sidebar({ projectId }: SidebarProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.ok ? r.json() : null).then(u => { if (u) setUser(u); });
  }, []);

  const IS_PRO = user?.plan === "pro" || user?.plan === "agency";

  const globalNav = [{ href: "/projects", icon: FolderOpen, label: "Проекты" }];

  const baseNav = projectId ? [
    { href: `/projects/${projectId}`,           icon: LayoutDashboard, label: "Дашборд" },
    { href: `/projects/${projectId}/content`,   icon: CalendarDays,    label: "Контент-план" },
    { href: `/projects/${projectId}/tasks`,     icon: CheckSquare,     label: "Задачи" },
    { href: `/projects/${projectId}/bot`,       icon: Bot,             label: "Бот-воронка" },
    { href: `/projects/${projectId}/analytics`, icon: BarChart3,       label: "Аналитика" },
    { href: `/projects/${projectId}/settings`,  icon: Settings,        label: "Настройки" },
  ] : [];

  const telegramNav = projectId ? [
    { href: `/projects/${projectId}/telegram`, icon: Send,     label: "Telegram-воронка" },
    { href: `/projects/${projectId}/promo`,    icon: Sparkles, label: "Промо-материалы"  },
  ] : [];

  const launchNav = projectId ? [
    { href: `/projects/${projectId}/launch`,   icon: Rocket, label: "Launch Playbook" },
    { href: `/projects/${projectId}/outreach`, icon: Users,  label: "Outreach CRM" },
  ] : [];

  const growthNav = projectId ? [
    { href: `/projects/${projectId}/growth`,      icon: TrendingUp,   label: "Growth Engine", pro: true },
    { href: `/projects/${projectId}/experiments`, icon: FlaskConical, label: "Эксперименты",  pro: true },
    { href: `/projects/${projectId}/campaigns`,   icon: Megaphone,    label: "Кампании",      pro: true },
    { href: `/projects/${projectId}/competitors`, icon: Swords,       label: "Конкуренты",    pro: true },
    { href: `/projects/${projectId}/icps`,        icon: Target,       label: "ICP",           pro: true },
  ] : [];

  return (
    <aside className="w-56 flex-shrink-0 flex flex-col h-full"
      style={{ background: "#09071a", borderRight: "1px solid #1e1c38" }}>

      {/* Logo + Bell */}
      <div className="px-4 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #1e1c38" }}>
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #f59e0b22, #6366f122)", border: "1px solid #f59e0b44" }}>
            <TrendingUp className="w-3.5 h-3.5" style={{ color: "#f59e0b" }} />
          </div>
          <span className="font-bold text-sm tracking-tight"
            style={{ background: "linear-gradient(90deg, #f59e0b, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            RiseCoreFlow
          </span>
        </Link>
        <NotificationBell />
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 space-y-0.5 px-3 overflow-y-auto">
        {globalNav.map(item => <NavLink key={item.href} item={item} pathname={pathname} />)}

        {projectId && (
          <>
            <SectionLabel label="Проект" />
            {baseNav.map(item => <NavLink key={item.href} item={item} pathname={pathname} />)}

            <SectionLabel label="Telegram"
              help={{ title: "Telegram-маркетинг", text: "Инструменты для роста в Telegram: конструктор прогрева аудитории, трекер источников трафика, калькулятор ROMI и шаблоны промо-материалов." }} />
            {telegramNav.map(item => <NavLink key={item.href} item={item} pathname={pathname} />)}

            <SectionLabel label="Запуск"
              help={{ title: "Запуск продукта", text: "Пошаговый план вывода продукта на рынок: Launch Playbook с чеклистом, Outreach CRM для отслеживания контактов с потенциальными партнёрами и СМИ." }} />
            {launchNav.map(item => <NavLink key={item.href} item={item} pathname={pathname} />)}

            <SectionLabel label="Growth Suite" badge={!IS_PRO ? "PRO" : undefined}
              help={{ title: "Growth Suite", text: "Продвинутые инструменты роста: A/B эксперименты, управление рекламными кампаниями, анализ конкурентов и профили идеального клиента (ICP)." }} />
            {growthNav.map(item => (
              <NavLink key={item.href} item={item} pathname={pathname}
                locked={(item as any).pro && !IS_PRO} projectId={projectId} />
            ))}
          </>
        )}
      </nav>

      {/* Upgrade banner */}
      {!IS_PRO && projectId && (
        <div className="px-3 pb-2">
          <Link href={`/projects/${projectId}/upgrade`}>
            <div className="rounded-xl p-3 cursor-pointer hover-quicklink"
              style={{ background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.2)" }}>
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-3.5 h-3.5" style={{ color: "#f59e0b" }} />
                <span className="text-xs font-semibold" style={{ color: "#f59e0b" }}>Перейти на Pro</span>
              </div>
              <p className="text-[10px] leading-relaxed" style={{ color: "#6b6885" }}>
                Growth Suite, A/B тесты, CAC/ROAS
              </p>
              <div className="mt-1 text-[10px] font-semibold" style={{ color: "#f59e0b" }}>
                2 990 ₽/мес · 14 дней бесплатно →
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* User card */}
      {user && (
        <div className="px-3 pb-2">
          <div className="flex items-center justify-between px-3 py-2 rounded-xl"
            style={{ background: "#13112a", border: "1px solid #1e1c38" }}>
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)" }}>
                <User className="w-3 h-3" style={{ color: "#f59e0b" }} />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-medium truncate" style={{ color: "#ede8ff" }}>{user.username}</div>
                <div className="text-[9px]" style={{ color: IS_PRO ? "#86efac" : "#6b6885" }}>
                  {IS_PRO ? user.plan.toUpperCase() : "FREE"}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <a href="/profile/billing" className="flex-shrink-0 opacity-40 hover:opacity-100 transition-opacity" title="Подписка">
                <CreditCard className="w-3.5 h-3.5" style={{ color: "#f59e0b" }} />
              </a>
              <button onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); window.location.href = "/login"; }}
                className="flex-shrink-0 opacity-40 hover:opacity-100 transition-opacity">
                <LogOut className="w-3.5 h-3.5" style={{ color: "#6b6885" }} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Glossary */}
      <div className="px-3 pb-1">
        <MarketingGlossary />
      </div>

      {/* Footer */}
      <div className="px-4 py-3" style={{ borderTop: "1px solid #1e1c38" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#f59e0b" }} />
            <span className="text-[10px] font-mono" style={{ color: "#3d3a5c" }}>v0.2</span>
          </div>
          <span className="text-[9px] px-1.5 py-0.5 rounded font-semibold"
            style={{ background: IS_PRO ? "rgba(134,239,172,0.1)" : "rgba(107,104,133,0.1)", color: IS_PRO ? "#86efac" : "#6b6885", border: `1px solid ${IS_PRO ? "rgba(134,239,172,0.2)" : "rgba(107,104,133,0.2)"}` }}>
            {IS_PRO ? "PRO" : "FREE"}
          </span>
        </div>
      </div>
    </aside>
  );
}

function SectionLabel({ label, badge, help }: { label: string; badge?: string; help?: { title: string; text: string } }) {
  return (
    <div className="pt-3 pb-1 px-2 flex items-center justify-between">
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "#3d3a5c" }}>{label}</span>
        {help && <HelpTooltip title={help.title} text={help.text} size={11} />}
      </div>
      {badge && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: "rgba(245,158,11,0.12)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.25)" }}>{badge}</span>}
    </div>
  );
}

function NavLink({ item, pathname, locked = false, projectId }: {
  item: { href: string; icon: React.ElementType; label: string };
  pathname: string; locked?: boolean; projectId?: string;
}) {
  const isActive = pathname === item.href;
  const Icon = item.icon;

  if (locked && projectId) {
    return (
      <Link href={`/projects/${projectId}/upgrade`}>
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm cursor-pointer transition-all"
          style={{ border: "1px solid transparent", color: "#3d3a5c" }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#6b6885"; (e.currentTarget as HTMLElement).style.background = "#13112a"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#3d3a5c"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
          <Icon className="w-4 h-4 flex-shrink-0 opacity-35" />
          <span className="flex-1 opacity-35">{item.label}</span>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.2)" }}>PRO</span>
        </div>
      </Link>
    );
  }

  return (
    <Link href={item.href}
      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150"
      style={isActive ? { background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", color: "#f59e0b" } : { border: "1px solid transparent", color: "#6b6885" }}
      onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.color = "#ede8ff"; (e.currentTarget as HTMLElement).style.background = "#13112a"; } }}
      onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.color = "#6b6885"; (e.currentTarget as HTMLElement).style.background = "transparent"; } }}>
      <Icon className="w-4 h-4 flex-shrink-0" />
      <span>{item.label}</span>
    </Link>
  );
}
