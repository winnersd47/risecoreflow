"use client"
import { useState, useEffect, use } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardHeader, CardTitle, CardValue } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Save } from "lucide-react";

const TARGETS = { subscribers: 500, err: 20, ctaClicks: 3, botRegistrations: 50 };

export default function AnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [metrics, setMetrics] = useState<any[]>([]);
  const [form, setForm] = useState({ week: 1, subscribers: "", err: "", ctaClicks: "", botRegistrations: "", notes: "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(`/api/metrics/${id}`).then((r) => r.json()).then(setMetrics);
  }, [id]);

  const latest = metrics[0] ?? null;

  const handleSave = async () => {
    setSaving(true);
    await fetch(`/api/metrics/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, projectId: id }),
    });
    const updated = await fetch(`/api/metrics/${id}`).then((r) => r.json());
    setMetrics(updated);
    setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar projectId={id} />
      <main className="flex-1 overflow-y-auto" style={{ background: "#07060d" }}>
        <div className="max-w-5xl mx-auto px-8 py-8">
          <div className="mb-6">
            <h1 className="text-xl font-semibold" style={{ color: "#ede8ff" }}>Аналитика</h1>
            <p className="text-sm mt-1" style={{ color: "#6b6885" }}>Цели Wave 1 — 28 дней</p>
          </div>

          {/* Goals */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            {[
              { key: "subscribers", label: "Подписчики", target: "500+", unit: "", value: latest?.subscribers },
              { key: "err", label: "ERR", target: ">20%", unit: "%", value: latest?.err },
              { key: "ctaClicks", label: "Кликабельность CTA", target: ">3%", unit: "%", value: latest?.ctaClicks },
              { key: "botRegistrations", label: "Регистрации через бот", target: "50+", unit: "", value: latest?.botRegistrations },
            ].map((m) => {
              const pct = m.value ? Math.min(100, (m.value / TARGETS[m.key as keyof typeof TARGETS]) * 100) : 0;
              const progressColor = pct >= 100 ? "#86efac" : pct >= 60 ? "#fcd34d" : "#f59e0b";
              return (
                <Card key={m.key}>
                  <CardTitle>{m.label}</CardTitle>
                  <CardValue className="mt-2">{m.value != null ? `${m.value}${m.unit}` : "—"}</CardValue>
                  <p className="text-xs mt-1" style={{ color: "#6b6885" }}>цель {m.target}</p>
                  <Progress value={pct} className="mt-3" color={progressColor} />
                </Card>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Input form */}
            <div className="rounded-xl p-5" style={{ background: "#0d0b18", border: "1px solid #1e1c38" }}>
              <h3 className="text-sm font-medium mb-4" style={{ color: "#ede8ff" }}>Внести данные — неделя {form.week}</h3>
              <div className="space-y-4">
                <Field label="Неделя">
                  <select
                    value={form.week}
                    onChange={(e) => setForm({ ...form, week: +e.target.value })}
                    className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
                    style={{ background: "#13112a", border: "1px solid #1e1c38", color: "#ede8ff" }}
                  >
                    {[1, 2, 3, 4].map((w) => <option key={w} value={w}>Неделя {w}</option>)}
                  </select>
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Подписчики">
                    <input type="number" value={form.subscribers} onChange={(e) => setForm({ ...form, subscribers: e.target.value })} placeholder="0" className="input-field" />
                  </Field>
                  <Field label="ERR (%)">
                    <input type="number" step="0.1" value={form.err} onChange={(e) => setForm({ ...form, err: e.target.value })} placeholder="0.0" className="input-field" />
                  </Field>
                  <Field label="Клики CTA (%)">
                    <input type="number" step="0.1" value={form.ctaClicks} onChange={(e) => setForm({ ...form, ctaClicks: e.target.value })} placeholder="0.0" className="input-field" />
                  </Field>
                  <Field label="Регистрации бот">
                    <input type="number" value={form.botRegistrations} onChange={(e) => setForm({ ...form, botRegistrations: e.target.value })} placeholder="0" className="input-field" />
                  </Field>
                </div>
                <Field label="Заметки">
                  <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} placeholder="Что работало / что нет..." className="input-field resize-none" />
                </Field>
                <Button onClick={handleSave} disabled={saving} className="w-full">
                  <Save className="w-4 h-4" />
                  {saving ? "Сохраняю..." : saved ? "Сохранено ✓" : "Сохранить данные"}
                </Button>
              </div>
            </div>

            {/* History */}
            <div className="rounded-xl p-5" style={{ background: "#0d0b18", border: "1px solid #1e1c38" }}>
              <h3 className="text-sm font-medium mb-4" style={{ color: "#ede8ff" }}>История по неделям</h3>
              {metrics.length === 0 ? (
                <p className="text-xs" style={{ color: "#6b6885" }}>Данных пока нет. Внеси первые метрики.</p>
              ) : (
                <div className="space-y-3">
                  {[...metrics].sort((a, b) => b.week - a.week).map((m) => (
                    <div key={m.id} className="rounded-lg p-3" style={{ border: "1px solid #1e1c38" }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium" style={{ color: "#ede8ff" }}>Неделя {m.week}</span>
                        <span className="text-[10px]" style={{ color: "#6b6885" }}>{new Date(m.createdAt).toLocaleDateString("ru")}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 text-xs" style={{ color: "#6b6885" }}>
                        {m.subscribers != null && <span>Подписчики: <span style={{ color: "#ede8ff" }}>{m.subscribers}</span></span>}
                        {m.err != null && <span>ERR: <span style={{ color: "#ede8ff" }}>{m.err}%</span></span>}
                        {m.ctaClicks != null && <span>CTA: <span style={{ color: "#ede8ff" }}>{m.ctaClicks}%</span></span>}
                        {m.botRegistrations != null && <span>Бот: <span style={{ color: "#ede8ff" }}>{m.botRegistrations}</span></span>}
                      </div>
                      {m.notes && <p className="text-[10px] mt-1.5 italic" style={{ color: "#6b6885" }}>{m.notes}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Weekly review */}
          <div className="mt-6 rounded-xl p-5" style={{ background: "#0d0b18", border: "1px solid #1e1c38" }}>
            <h3 className="text-sm font-medium mb-3" style={{ color: "#ede8ff" }}>Weekly Review — шаблон</h3>
            <div className="grid grid-cols-3 gap-4 text-xs">
              {[
                { title: "Что смотреть", items: ["Прирост подписчиков за неделю", "ERR топ-3 постов", "Кликабельность CTA", "Конверсия бота /start → регистрация"] },
                { title: "Как интерпретировать", items: ["ERR <15% → менять темы или время публикации", "CTA <2% → слабый hook или нерелевантный оффер", "Бот-конверсия <25% → проверить Сообщение 2", "Рост <10/нед → нужен ВП или аутрич"] },
                { title: "Следующий шаг", items: ["Выбрать 1 гипотезу для улучшения", "Запустить A/B на следующем посте", "Активировать один новый канал роста", "Обновить прогноз на 28-й день"] },
              ].map((col) => (
                <div key={col.title}>
                  <div className="font-medium mb-2" style={{ color: "#f59e0b" }}>{col.title}</div>
                  <ul className="space-y-1">
                    {col.items.map((item) => (
                      <li key={item} className="flex items-start gap-1.5" style={{ color: "#6b6885" }}>
                        <span className="flex-shrink-0 mt-0.5" style={{ color: "#f59e0b" }}>·</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs mb-1.5 uppercase tracking-wider" style={{ color: "#6b6885" }}>{label}</label>
      {children}
    </div>
  );
}

