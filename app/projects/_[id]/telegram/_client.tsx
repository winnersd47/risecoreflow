"use client"
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { HelpTooltip } from "@/components/HelpTooltip";
import {
  Send, Plus, Trash2, CheckCircle2, Clock, FileText,
  Users, TrendingUp, Calculator, Wrench, ExternalLink,
  ChevronDown, ChevronUp, Edit3, Save, X, Image, Video, Link,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type FunnelStep = {
  id: string; type: string; title: string; content: string;
  status: string; scheduledAt: string | null; sortOrder: number;
  mediaUrl: string | null; mediaType: string | null;
};
type Source = {
  id: string; type: string; name: string;
  subscribersGained: number; spent: number; startDate: string | null; notes: string | null;
};

// ─── Constants ────────────────────────────────────────────────────────────────
const STEP_TYPES = [
  { key: "story", label: "История",       color: "#6366f1", desc: "Личная история или история клиента — читатель узнаёт себя" },
  { key: "pain",  label: "Боль",          color: "#ef4444", desc: "Яркое описание главной проблемы аудитории" },
  { key: "tip",   label: "Польза",        color: "#10b981", desc: "3-5 конкретных лайфхаков, реальная польза без воды" },
  { key: "case",  label: "Кейс клиента",  color: "#f59e0b", desc: "Результат: что было → что стало. Цифры, сроки" },
  { key: "offer", label: "Оффер",         color: "#a78bfa", desc: "Прямое предложение с дедлайном и CTA" },
];

const SOURCE_TYPES = [
  { key: "commenting", label: "Комментинг",     color: "#6366f1" },
  { key: "vp",         label: "Взаимопиар",     color: "#10b981" },
  { key: "posev",      label: "Посев рекламы",  color: "#f59e0b" },
  { key: "tg_ads",     label: "Telegram Ads",   color: "#3b82f6" },
  { key: "organic",    label: "Органика",       color: "#9ca3af" },
];

const STATUS_COLORS: Record<string, string> = {
  draft:     "#6b7280",
  scheduled: "#f59e0b",
  sent:      "#10b981",
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function TelegramPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [tab, setTab]       = useState<"funnel" | "traffic" | "romi" | "tools">("funnel");
  const [steps, setSteps]   = useState<FunnelStep[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [totals, setTotals] = useState({ subs: 0, spent: 0 });
  const [loading, setLoading] = useState(false);

  // ROMI calculator state
  const [romi, setRomi] = useState({ adSpend: 105000, cps: 137, convRate: 5, avgCheck: 10000 });

  useEffect(() => {
    fetch(`/api/telegram-funnel/${projectId}`).then(r => r.json()).then(d => setSteps(d.steps ?? []));
    fetch(`/api/subscribers/${projectId}`).then(r => r.json()).then(d => {
      setSources(d.sources ?? []);
      setTotals(d.totals ?? { subs: 0, spent: 0 });
    });
  }, [projectId]);

  async function addStep(type: string) {
    setLoading(true);
    const r = await fetch(`/api/telegram-funnel/${projectId}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type }),
    });
    const step = await r.json();
    setSteps(prev => [...prev, step]);
    setLoading(false);
  }

  async function updateStep(stepId: string, data: Partial<FunnelStep>) {
    const step = steps.find(s => s.id === stepId);
    if (!step) return;
    const merged = { ...step, ...data };
    await fetch(`/api/telegram-funnel/${projectId}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stepId, ...merged }),
    });
    setSteps(prev => prev.map(s => s.id === stepId ? { ...s, ...data } : s));
  }

  async function deleteStep(stepId: string) {
    await fetch(`/api/telegram-funnel/${projectId}`, {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stepId }),
    });
    setSteps(prev => prev.filter(s => s.id !== stepId));
  }

  async function addSource(data: Partial<Source>) {
    const r = await fetch(`/api/subscribers/${projectId}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const src = await r.json();
    setSources(prev => [src, ...prev]);
    setTotals(t => ({
      subs: t.subs + (src.subscribersGained ?? 0),
      spent: t.spent + (src.spent ?? 0),
    }));
  }

  async function deleteSource(sourceId: string) {
    const src = sources.find(s => s.id === sourceId);
    await fetch(`/api/subscribers/${projectId}`, {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sourceId }),
    });
    setSources(prev => prev.filter(s => s.id !== sourceId));
    if (src) setTotals(t => ({ subs: t.subs - src.subscribersGained, spent: t.spent - src.spent }));
  }

  // ROMI calculation
  const subscribers   = Math.round(romi.adSpend / Math.max(romi.cps, 1));
  const buyers        = Math.round(subscribers * romi.convRate / 100);
  const revenue       = buyers * romi.avgCheck;
  const profit        = revenue - romi.adSpend;
  const romiMultiple  = romi.adSpend > 0 ? revenue / romi.adSpend : 0;

  const s = { color: "#ede8ff" };
  const dim = { color: "#6b7280", fontSize: 12 };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar projectId={projectId} />
      <main className="flex-1 overflow-y-auto" style={{ background: "#07060d" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }}>

          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <Send style={{ color: "#6366f1", width: 20, height: 20 }} />
              <h1 style={{ fontSize: 24, fontWeight: 700, color: "#ede8ff" }}>Telegram-воронка</h1>
            </div>
            <p style={dim}>Конструктор прогрева · Трекер трафика · ROMI-калькулятор · Инструменты</p>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, marginBottom: 28, borderBottom: "1px solid #1e1c38", paddingBottom: 0 }}>
            {([
              { key: "funnel",  label: "Воронка прогрева", icon: FileText },
              { key: "traffic", label: "Трафик",            icon: Users },
              { key: "romi",    label: "ROMI-калькулятор",  icon: Calculator },
              { key: "tools",   label: "Инструменты",       icon: Wrench },
            ] as const).map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "8px 16px",
                  borderBottom: tab === t.key ? "2px solid #6366f1" : "2px solid transparent",
                  background: "none", border: "none", borderBottom: tab === t.key ? "2px solid #6366f1" : "2px solid transparent",
                  color: tab === t.key ? "#818cf8" : "#6b7280", cursor: "pointer", fontSize: 14, fontWeight: tab === t.key ? 600 : 400,
                  paddingBottom: 10,
                }}>
                <t.icon style={{ width: 14, height: 14 }} />
                {t.label}
              </button>
            ))}
          </div>

          {/* ── TAB: FUNNEL ─────────────────────────────────────────────── */}
          {tab === "funnel" && (
            <div>
              <div style={{ background: "#0d0b18", border: "1px solid #1e1c38", borderRadius: 12, padding: 20, marginBottom: 24 }}>
                <h2 style={{ fontSize: 14, fontWeight: 600, color: "#ede8ff", marginBottom: 4 }}>Цепочка прогрева</h2>
                <p style={dim}>Классическая последовательность по данным 2025: История → Боль → Польза → Кейс → Оффер. Конверсия в покупку: 3–8%.</p>
              </div>

              {/* Add step buttons */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
                {STEP_TYPES.map(t => (
                  <button key={t.key} onClick={() => addStep(t.key)} disabled={loading}
                    style={{
                      display: "flex", alignItems: "center", gap: 6, padding: "6px 14px",
                      background: t.color + "15", border: `1px solid ${t.color}33`,
                      borderRadius: 8, color: t.color, fontSize: 13, cursor: "pointer", fontWeight: 500,
                    }}>
                    <Plus style={{ width: 12, height: 12 }} /> {t.label}
                  </button>
                ))}
              </div>

              {/* Steps */}
              {steps.length === 0 ? (
                <div style={{ textAlign: "center", padding: "48px 0", color: "#374151" }}>
                  <Send style={{ width: 40, height: 40, margin: "0 auto 12px", opacity: 0.3 }} />
                  <p style={{ fontSize: 14 }}>Добавь первый шаг воронки кнопками выше</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {steps.map((step, idx) => (
                    <StepCard key={step.id} step={step} idx={idx}
                      onUpdate={(data) => updateStep(step.id, data)}
                      onDelete={() => deleteStep(step.id)} />
                  ))}
                </div>
              )}

              {/* Guide */}
              <div style={{ marginTop: 28, background: "#0d0b18", border: "1px solid #1e1c38", borderRadius: 12, padding: 20 }}>
                <h3 style={{ fontSize: 13, fontWeight: 600, color: "#9ca3af", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>Референс по типам</h3>
                {STEP_TYPES.map(t => (
                  <div key={t.key} style={{ display: "flex", gap: 12, marginBottom: 10, alignItems: "flex-start" }}>
                    <span style={{ minWidth: 90, fontSize: 13, color: t.color, fontWeight: 600 }}>{t.label}</span>
                    <span style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.5 }}>{t.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── TAB: TRAFFIC ────────────────────────────────────────────── */}
          {tab === "traffic" && (
            <div>
              {/* Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
                {[
                  { label: "Всего подписчиков", value: totals.subs.toLocaleString("ru-RU"), sub: "из всех источников" },
                  { label: "Потрачено на трафик", value: `${totals.spent.toLocaleString("ru-RU")} ₽`, sub: "суммарно" },
                  {
                    label: "Стоимость подписчика",
                    value: totals.subs > 0 ? `${Math.round(totals.spent / totals.subs)} ₽` : "—",
                    sub: "средняя CPF"
                  },
                ].map(card => (
                  <div key={card.label} style={{ background: "#0d0b18", border: "1px solid #1e1c38", borderRadius: 12, padding: 20 }}>
                    <div style={{ fontSize: 24, fontWeight: 700, color: "#ede8ff", marginBottom: 2 }}>{card.value}</div>
                    <div style={{ fontSize: 12, color: "#6b7280" }}>{card.label}</div>
                    <div style={{ fontSize: 11, color: "#374151", marginTop: 2 }}>{card.sub}</div>
                  </div>
                ))}
              </div>

              {/* Benchmark */}
              <div style={{ background: "#0f0d20", border: "1px solid #312e81", borderRadius: 10, padding: 16, marginBottom: 24 }}>
                <p style={{ fontSize: 13, color: "#818cf8" }}>
                  <strong>Бенчмарки 2025:</strong> комментинг — 20–30 подп/нед бесплатно · посевы — 100–150 ₽/подп · массовые посевы в 3–5× дешевле по CPV чем одиночные интеграции
                </p>
              </div>

              {/* Add source form */}
              <AddSourceForm onAdd={addSource} />

              {/* Sources list */}
              {sources.length > 0 && (
                <div style={{ marginTop: 20 }}>
                  <h3 style={{ fontSize: 13, fontWeight: 600, color: "#6b7280", marginBottom: 12, textTransform: "uppercase" }}>Источники</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {sources.map(src => {
                      const t = SOURCE_TYPES.find(t => t.key === src.type);
                      const cpf = src.subscribersGained > 0 ? Math.round(src.spent / src.subscribersGained) : 0;
                      return (
                        <div key={src.id} style={{ background: "#0d0b18", border: "1px solid #1e1c38", borderRadius: 10, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 4, background: (t?.color ?? "#6b7280") + "20", color: t?.color ?? "#6b7280" }}>
                              {t?.label ?? src.type}
                            </span>
                            <span style={{ fontSize: 14, color: "#ede8ff", fontWeight: 500 }}>{src.name}</span>
                            {src.notes && <span style={{ fontSize: 12, color: "#4b5563" }}>{src.notes}</span>}
                          </div>
                          <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
                            <div style={{ textAlign: "right" }}>
                              <div style={{ fontSize: 14, fontWeight: 600, color: "#ede8ff" }}>+{src.subscribersGained.toLocaleString("ru-RU")}</div>
                              <div style={{ fontSize: 11, color: "#4b5563" }}>подписчиков</div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                              <div style={{ fontSize: 14, fontWeight: 600, color: "#f59e0b" }}>{src.spent.toLocaleString("ru-RU")} ₽</div>
                              <div style={{ fontSize: 11, color: "#4b5563" }}>{cpf > 0 ? `${cpf} ₽/подп` : "бесплатно"}</div>
                            </div>
                            <button onClick={() => deleteSource(src.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, opacity: 0.4 }}>
                              <Trash2 style={{ width: 14, height: 14, color: "#ef4444" }} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── TAB: ROMI ───────────────────────────────────────────────── */}
          {tab === "romi" && (
            <div>
              <div style={{ background: "#0d0b18", border: "1px solid #1e1c38", borderRadius: 12, padding: 24, marginBottom: 24 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: "#ede8ff", marginBottom: 4 }}>ROMI-калькулятор кампании</h2>
                <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 20 }}>
                  Кейс-референс: 105 000 ₽ вложено → 2 000 000 ₽ выручки (×18 ROMI), CPF 137 ₽
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  {([
                    { key: "adSpend" as const, label: "Бюджет на рекламу, ₽", min: 0,
                      help: { title: "Бюджет на рекламу", text: "Сумма, которую ты вкладываешь в рекламные размещения: посевы в каналах, Telegram Ads, взаимный пиар (оценочно).", tip: "Начни с 10–30к для теста, масштабируй только прибыльные каналы" } },
                    { key: "cps" as const, label: "Стоимость подписчика (CPF), ₽", min: 1,
                      help: { title: "CPF — Cost Per Follower", text: "Сколько стоит привлечь одного подписчика в твой канал. Зависит от ниши и метода.", tip: "Бенчмарк 2025: посевы 100–150 ₽, комментинг 0 ₽, Telegram Ads 50–200 ₽" } },
                    { key: "convRate" as const, label: "Конверсия подп → клиент, %", min: 0.1,
                      help: { title: "Конверсия в покупку", text: "Процент подписчиков, которые в итоге купят твой продукт после цепочки прогрева.", example: "100 подписчиков → 5 купили = конверсия 5%", tip: "У экспертов с хорошим прогревом: 3–8%. Без прогрева: 0.5–1%" } },
                    { key: "avgCheck" as const, label: "Средний чек, ₽", min: 0,
                      help: { title: "Средний чек", text: "Средняя сумма одной продажи. Чем выше средний чек, тем меньше продаж нужно для окупаемости.", example: "Консультация 5–15к ₽ · Пакет 10–30к ₽ · Наставничество 50–150к ₽" } },
                  ] as const).map(f => (
                    <div key={f.key}>
                      <label style={{ fontSize: 12, color: "#9ca3af", display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
                        {f.label}
                        <HelpTooltip title={f.help.title} text={f.help.text} example={(f.help as any).example} tip={(f.help as any).tip} />
                      </label>
                      <input type="number" min={f.min} value={romi[f.key]}
                        onChange={e => setRomi(r => ({ ...r, [f.key]: parseFloat(e.target.value) || 0 }))}
                        style={{ width: "100%", background: "#07060d", border: "1px solid #374151", borderRadius: 8, padding: "8px 12px", color: "#ede8ff", fontSize: 15, fontWeight: 600 }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Results */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, marginBottom: 24 }}>
                {[
                  { label: "Подписчиков",  value: subscribers.toLocaleString("ru-RU"),           color: "#818cf8" },
                  { label: "Покупателей",  value: buyers.toLocaleString("ru-RU"),                color: "#34d399" },
                  { label: "Выручка",      value: `${revenue.toLocaleString("ru-RU")} ₽`,        color: "#f59e0b" },
                  { label: "Прибыль",      value: `${profit.toLocaleString("ru-RU")} ₽`,         color: profit > 0 ? "#4ade80" : "#ef4444" },
                ].map(card => (
                  <div key={card.label} style={{ background: "#0d0b18", border: `1px solid ${card.color}22`, borderRadius: 12, padding: 20 }}>
                    <div style={{ fontSize: 28, fontWeight: 800, color: card.color }}>{card.value}</div>
                    <div style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>{card.label}</div>
                  </div>
                ))}
              </div>

              <div style={{ background: romiMultiple >= 3 ? "#052e16" : "#1c1917", border: `1px solid ${romiMultiple >= 3 ? "#166534" : "#292524"}`, borderRadius: 12, padding: 20 }}>
                <div style={{ fontSize: 36, fontWeight: 800, color: romiMultiple >= 3 ? "#4ade80" : romiMultiple >= 1 ? "#f59e0b" : "#ef4444" }}>
                  ×{romiMultiple.toFixed(1)} ROMI
                </div>
                <div style={{ fontSize: 14, color: "#9ca3af", marginTop: 4 }}>
                  {romiMultiple >= 10 ? "Отлично — масштабируй!" : romiMultiple >= 3 ? "Хорошо — кампания рентабельна" : romiMultiple >= 1 ? "В нуле — оптимизируй оффер или цену" : "Убыток — пересмотри параметры"}
                </div>
              </div>

              <div style={{ marginTop: 20, padding: 16, background: "#0d0b18", borderRadius: 10, border: "1px solid #1e1c38" }}>
                <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.7 }}>
                  <strong style={{ color: "#9ca3af" }}>Бенчмарки:</strong> конверсия подп→покупка у экспертов 2–8% · средний чек консультации 5 000–15 000 ₽ · пакета 10 000–30 000 ₽ · наставничества 50 000–150 000 ₽
                </p>
              </div>
            </div>
          )}

          {/* ── TAB: TOOLS ──────────────────────────────────────────────── */}
          {tab === "tools" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* TGStat vs Telemetr */}
              <div style={{ background: "#0d0b18", border: "1px solid #1e1c38", borderRadius: 12, padding: 24 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: "#ede8ff", marginBottom: 16 }}>TGStat vs Telemetr — когда что использовать</h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  {[
                    {
                      name: "TGStat", rating: "4.8/5", color: "#6366f1", url: "https://tgstat.ru",
                      strong: "Конкурентная разведка",
                      use: ["Где рекламировались конкуренты", "Проверка канала на накрутки", "История рекламных постов", "ERR по дням/постам", "Экспорт XLS / PDF"],
                      best: "Поиск рекламных площадок конкурентов",
                    },
                    {
                      name: "Telemetr", rating: "4.6/5", color: "#f59e0b", url: "https://telemetr.me",
                      strong: "Подбор площадок",
                      use: ["Фильтр по CPM, ER, подписчикам", "Регион, язык, ниша", "Сравнение каналов", "Динамика роста", "Стоимость рекламы"],
                      best: "Поиск каналов под конкретный таргет",
                    },
                  ].map(t => (
                    <div key={t.name} style={{ border: `1px solid ${t.color}33`, borderRadius: 10, padding: 20 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                        <span style={{ fontSize: 18, fontWeight: 700, color: t.color }}>{t.name}</span>
                        <span style={{ fontSize: 12, color: "#9ca3af" }}>⭐ {t.rating}</span>
                      </div>
                      <div style={{ fontSize: 12, color: t.color, fontWeight: 600, marginBottom: 10 }}>Лучший для: {t.strong}</div>
                      <ul style={{ paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
                        {t.use.map(u => (
                          <li key={u} style={{ fontSize: 13, color: "#9ca3af", display: "flex", gap: 8 }}>
                            <CheckCircle2 style={{ width: 14, height: 14, color: t.color, flexShrink: 0, marginTop: 1 }} />{u}
                          </li>
                        ))}
                      </ul>
                      <a href={t.url} target="_blank" rel="noopener noreferrer"
                        style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: t.color, textDecoration: "none", fontWeight: 600 }}>
                        Открыть {t.name} <ExternalLink style={{ width: 12, height: 12 }} />
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              {/* Рекламный алгоритм */}
              <div style={{ background: "#0d0b18", border: "1px solid #1e1c38", borderRadius: 12, padding: 24 }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: "#ede8ff", marginBottom: 16 }}>Алгоритм закупки рекламы</h2>
                {[
                  { step: "1", title: "Найди каналы", desc: "Telemetr → фильтр по нише + ER > 10% + от 1 000 подписчиков" },
                  { step: "2", title: "Проверь на накрутки", desc: "TGStat → график подписчиков (нет резких скачков) + охват постов > 20% аудитории" },
                  { step: "3", title: "Проверь рекламную историю", desc: "TGStat → посмотри что рекламировалось, кто похожий уже рекламировался" },
                  { step: "4", title: "Тест с малым бюджетом", desc: "Первые 3–5 каналов по 2 000–5 000 ₽, считай CPF и конверсию" },
                  { step: "5", title: "Масштабируй посевы", desc: "Telega.in или ручная закупка 20+ каналов — CPV в 3–5× ниже, чем одиночные" },
                ].map(s => (
                  <div key={s.step} style={{ display: "flex", gap: 14, marginBottom: 14 }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#6366f133", border: "1px solid #6366f155", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#818cf8" }}>{s.step}</span>
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#ede8ff", marginBottom: 2 }}>{s.title}</div>
                      <div style={{ fontSize: 13, color: "#6b7280" }}>{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 4-недельный план */}
              <div style={{ background: "#0d0b18", border: "1px solid #1e1c38", borderRadius: 12, padding: 24 }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: "#ede8ff", marginBottom: 16 }}>4-недельный план к первым 50 000 ₽</h2>
                {[
                  { week: "Неделя 1", color: "#6366f1", items: ["Оформить канал: название, описание, аватар", "Написать пост-знакомство (закреп)", "Написать 3–4 полезных поста"] },
                  { week: "Неделя 2", color: "#10b981", items: ["15–20 экспертных комментариев ежедневно", "Найти 3–5 каналов для ВП", "Цель: 50–100 подписчиков"] },
                  { week: "Неделя 3", color: "#f59e0b", items: ["Запустить цепочку прогрева (5 шагов выше)", "Активно общаться в комментариях", "Добавить источник трафика в трекер"] },
                  { week: "Неделя 4", color: "#a78bfa", items: ["Опубликовать пост с отзывом клиента", "Продающий пост с оффером + дедлайн", "Обработать заявки → первые оплаты"] },
                ].map(w => (
                  <div key={w.week} style={{ display: "flex", gap: 14, marginBottom: 16 }}>
                    <div style={{ minWidth: 90, fontSize: 12, fontWeight: 700, color: w.color, paddingTop: 2 }}>{w.week}</div>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 5 }}>
                      {w.items.map(i => (
                        <li key={i} style={{ fontSize: 13, color: "#9ca3af", display: "flex", gap: 6 }}>
                          <span style={{ color: w.color }}>›</span> {i}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Бенчмарки */}
              <div style={{ background: "#0d0b18", border: "1px solid #1e1c38", borderRadius: 12, padding: 24 }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: "#ede8ff", marginBottom: 16 }}>Бенчмарки рынка 2025</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
                  {[
                    { metric: "CPF (посевы)",          value: "100–150 ₽",    note: "стоимость подписчика" },
                    { metric: "CPF (комментинг)",      value: "0 ₽",          note: "бесплатно, 20–30/нед" },
                    { metric: "Конверсия → покупка",   value: "2–8%",         note: "от подписчика к клиенту" },
                    { metric: "Средний чек (конс.)",   value: "5–15 тыс. ₽",  note: "1 консультация" },
                    { metric: "Средний чек (пакет)",   value: "10–30 тыс. ₽", note: "пакет сессий" },
                    { metric: "Средний чек (настав.)", value: "50–150 тыс. ₽", note: "наставничество" },
                    { metric: "CTR оффера (хороший)",  value: "3–5%",         note: "после A/B оптимизации" },
                    { metric: "ROMI кейс 2025",        value: "×18",          note: "105k → 2M ₽" },
                  ].map(b => (
                    <div key={b.metric} style={{ padding: "10px 14px", background: "#13112a", borderRadius: 8 }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "#f59e0b" }}>{b.value}</div>
                      <div style={{ fontSize: 12, color: "#ede8ff", marginTop: 2 }}>{b.metric}</div>
                      <div style={{ fontSize: 11, color: "#4b5563" }}>{b.note}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

// ─── StepCard ─────────────────────────────────────────────────────────────────
const MEDIA_TYPES = [
  { key: "photo",    label: "Фото",    icon: Image },
  { key: "video",    label: "Видео",   icon: Video },
  { key: "document", label: "Файл",    icon: Link  },
];

function StepCard({ step, idx, onUpdate, onDelete }: {
  step: FunnelStep; idx: number;
  onUpdate: (data: Partial<FunnelStep>) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing]     = useState(false);
  const [title, setTitle]         = useState(step.title);
  const [content, setContent]     = useState(step.content);
  const [mediaUrl, setMediaUrl]   = useState(step.mediaUrl ?? "");
  const [mediaType, setMediaType] = useState(step.mediaType ?? "photo");
  const t = STEP_TYPES.find(t => t.key === step.type);

  function save() {
    onUpdate({ title, content, mediaUrl: mediaUrl || null, mediaType: mediaUrl ? mediaType : null });
    setEditing(false);
  }

  function cancel() {
    setEditing(false);
    setTitle(step.title);
    setContent(step.content);
    setMediaUrl(step.mediaUrl ?? "");
    setMediaType(step.mediaType ?? "photo");
  }

  const hasMedia = !!step.mediaUrl;

  return (
    <div style={{ background: "#0d0b18", border: `1px solid ${t?.color ?? "#374151"}22`, borderRadius: 10, overflow: "hidden" }}>
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", padding: "10px 16px", borderBottom: editing ? "1px solid #1e1c38" : "none" }}>
        <div style={{ width: 24, height: 24, borderRadius: "50%", background: (t?.color ?? "#6b7280") + "20", border: `1px solid ${t?.color ?? "#6b7280"}44`, display: "flex", alignItems: "center", justifyContent: "center", marginRight: 10, flexShrink: 0 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: t?.color ?? "#6b7280" }}>{idx + 1}</span>
        </div>
        <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 4, background: (t?.color ?? "#6b7280") + "15", color: t?.color ?? "#6b7280", marginRight: 10, fontWeight: 600 }}>{t?.label}</span>
        {editing ? (
          <input value={title} onChange={e => setTitle(e.target.value)}
            style={{ flex: 1, background: "#07060d", border: "1px solid #374151", borderRadius: 6, padding: "4px 10px", color: "#ede8ff", fontSize: 14 }} />
        ) : (
          <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: "#ede8ff" }}>{step.title}</span>
        )}
        {hasMedia && !editing && (
          <span title={step.mediaUrl ?? ""} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: "#6366f115", color: "#818cf8", border: "1px solid #6366f130", marginRight: 6, display: "flex", alignItems: "center", gap: 4 }}>
            {step.mediaType === "video" ? <Video style={{ width: 10, height: 10 }} /> : <Image style={{ width: 10, height: 10 }} />}
            Медиа
          </span>
        )}
        <div style={{ display: "flex", gap: 4, marginLeft: 8 }}>
          {(["draft", "scheduled", "sent"] as const).map(s => (
            <button key={s} onClick={() => onUpdate({ status: s })}
              style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, cursor: "pointer", border: "1px solid", fontWeight: 500,
                background: step.status === s ? STATUS_COLORS[s] + "20" : "none",
                borderColor: step.status === s ? STATUS_COLORS[s] + "60" : "#374151",
                color: step.status === s ? STATUS_COLORS[s] : "#4b5563",
              }}>
              {s === "draft" ? "Черновик" : s === "scheduled" ? "Запланирован" : "Отправлен"}
            </button>
          ))}
          <button onClick={() => setEditing(!editing)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, opacity: 0.6 }}>
            <Edit3 style={{ width: 13, height: 13, color: "#9ca3af" }} />
          </button>
          <button onClick={onDelete} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, opacity: 0.4 }}>
            <Trash2 style={{ width: 13, height: 13, color: "#ef4444" }} />
          </button>
        </div>
      </div>

      {/* Edit mode */}
      {editing ? (
        <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
          <textarea value={content} onChange={e => setContent(e.target.value)} rows={4}
            style={{ width: "100%", background: "#07060d", border: "1px solid #374151", borderRadius: 8, padding: "10px 12px", color: "#ede8ff", fontSize: 13, lineHeight: 1.6, resize: "vertical", boxSizing: "border-box" }} />

          {/* Media section */}
          <div style={{ background: "#07060d", border: "1px solid #1e1c38", borderRadius: 8, padding: "12px 14px" }}>
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
              <Image style={{ width: 12, height: 12 }} /> Прикрепить медиа (необязательно)
            </div>
            {/* Type selector */}
            <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
              {MEDIA_TYPES.map(mt => (
                <button key={mt.key} onClick={() => setMediaType(mt.key)}
                  style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 12px", borderRadius: 6, fontSize: 12, cursor: "pointer", border: "1px solid", fontWeight: 500,
                    background: mediaType === mt.key ? "#6366f120" : "none",
                    borderColor: mediaType === mt.key ? "#6366f150" : "#374151",
                    color: mediaType === mt.key ? "#818cf8" : "#4b5563" }}>
                  <mt.icon style={{ width: 11, height: 11 }} /> {mt.label}
                </button>
              ))}
            </div>
            {/* URL input */}
            <input value={mediaUrl} onChange={e => setMediaUrl(e.target.value)}
              placeholder="https://example.com/image.jpg или Telegram file_id"
              style={{ width: "100%", background: "#0d0b18", border: "1px solid #374151", borderRadius: 6, padding: "7px 10px", color: "#ede8ff", fontSize: 13, boxSizing: "border-box" }} />
            {/* Preview thumbnail */}
            {mediaUrl && mediaType === "photo" && (
              <div style={{ marginTop: 10 }}>
                <img src={mediaUrl} alt="preview" onError={e => (e.currentTarget.style.display = "none")}
                  style={{ maxHeight: 120, maxWidth: "100%", borderRadius: 6, objectFit: "cover", border: "1px solid #1e1c38" }} />
              </div>
            )}
            {mediaUrl && mediaType === "video" && (
              <div style={{ marginTop: 8, fontSize: 12, color: "#818cf8", display: "flex", alignItems: "center", gap: 5 }}>
                <Video style={{ width: 12, height: 12 }} /> Видео будет прикреплено при отправке
              </div>
            )}
            {mediaUrl && (
              <button onClick={() => setMediaUrl("")}
                style={{ marginTop: 8, fontSize: 11, color: "#ef4444", background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 4 }}>
                <X style={{ width: 10, height: 10 }} /> Убрать медиа
              </button>
            )}
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={save} style={{ display: "flex", alignItems: "center", gap: 6, background: "#6366f1", color: "#fff", border: "none", borderRadius: 6, padding: "6px 14px", fontSize: 13, cursor: "pointer", fontWeight: 500 }}>
              <Save style={{ width: 12, height: 12 }} /> Сохранить
            </button>
            <button onClick={cancel}
              style={{ background: "none", border: "1px solid #374151", color: "#9ca3af", borderRadius: 6, padding: "6px 14px", fontSize: 13, cursor: "pointer" }}>
              Отмена
            </button>
          </div>
        </div>
      ) : (
        /* View mode */
        <div style={{ display: "flex", gap: 0 }}>
          {step.mediaUrl && step.mediaType === "photo" && (
            <div style={{ flexShrink: 0, width: 80 }}>
              <img src={step.mediaUrl} alt="" onError={e => (e.currentTarget.style.display = "none")}
                style={{ width: 80, height: "100%", minHeight: 60, objectFit: "cover" }} />
            </div>
          )}
          <div style={{ flex: 1, padding: "10px 16px", fontSize: 13, color: "#6b7280", lineHeight: 1.6 }}>{step.content}</div>
        </div>
      )}
    </div>
  );
}

// ─── AddSourceForm ─────────────────────────────────────────────────────────────
function AddSourceForm({ onAdd }: { onAdd: (data: Partial<Source>) => void }) {
  const [open, setOpen]  = useState(false);
  const [type, setType]  = useState("commenting");
  const [name, setName]  = useState("");
  const [subs, setSubs]  = useState(0);
  const [spent, setSpent] = useState(0);
  const [notes, setNotes] = useState("");

  function submit() {
    if (!name.trim()) return;
    onAdd({ type, name, subscribersGained: subs, spent, notes: notes || null } as Partial<Source>);
    setName(""); setSubs(0); setSpent(0); setNotes(""); setOpen(false);
  }

  return (
    <div style={{ background: "#0d0b18", border: "1px solid #1e1c38", borderRadius: 12, overflow: "hidden" }}>
      <button onClick={() => setOpen(!open)}
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 500 }}>
          <Plus style={{ width: 14, height: 14 }} /> Добавить источник трафика
        </span>
        {open ? <ChevronUp style={{ width: 14, height: 14 }} /> : <ChevronDown style={{ width: 14, height: 14 }} />}
      </button>
      {open && (
        <div style={{ padding: "0 16px 16px", borderTop: "1px solid #1e1c38" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 14 }}>
            <div>
              <label style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 6 }}>Тип источника</label>
              <select value={type} onChange={e => setType(e.target.value)}
                style={{ width: "100%", background: "#07060d", border: "1px solid #374151", borderRadius: 8, padding: "8px 10px", color: "#ede8ff", fontSize: 13 }}>
                {SOURCE_TYPES.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 6 }}>Название / канал</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="@channel или описание"
                style={{ width: "100%", background: "#07060d", border: "1px solid #374151", borderRadius: 8, padding: "8px 10px", color: "#ede8ff", fontSize: 13, boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 6 }}>Подписчиков получено</label>
              <input type="number" min={0} value={subs} onChange={e => setSubs(parseInt(e.target.value) || 0)}
                style={{ width: "100%", background: "#07060d", border: "1px solid #374151", borderRadius: 8, padding: "8px 10px", color: "#ede8ff", fontSize: 13, boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 6 }}>Потрачено, ₽</label>
              <input type="number" min={0} value={spent} onChange={e => setSpent(parseFloat(e.target.value) || 0)}
                style={{ width: "100%", background: "#07060d", border: "1px solid #374151", borderRadius: 8, padding: "8px 10px", color: "#ede8ff", fontSize: 13, boxSizing: "border-box" }} />
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <label style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 6 }}>Заметки (опционально)</label>
            <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Например: лучший результат по нише"
              style={{ width: "100%", background: "#07060d", border: "1px solid #374151", borderRadius: 8, padding: "8px 10px", color: "#ede8ff", fontSize: 13, boxSizing: "border-box" }} />
          </div>
          <button onClick={submit} style={{ marginTop: 12, background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, padding: "8px 20px", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
            Добавить
          </button>
        </div>
      )}
    </div>
  );
}

