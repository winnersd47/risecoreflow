"use client"
import { useState, useEffect, use } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Plus, FlaskConical, TrendingUp, X } from "lucide-react";

// Bayesian A/B test significance (simplified Beta distribution approximation)
function calcSignificance(cA: number, vA: number, cB: number, vB: number): number {
  if (!vA || !vB) return 0;
  const rateA = cA / vA;
  const rateB = cB / vB;
  if (!rateA && !rateB) return 0;
  // Z-test approximation
  const pooled = (cA + cB) / (vA + vB);
  const se = Math.sqrt(pooled * (1 - pooled) * (1 / vA + 1 / vB));
  if (!se) return 0;
  const z = Math.abs(rateA - rateB) / se;
  // Convert z to confidence %
  const conf = Math.min(99.9, (1 - Math.exp(-0.717 * z - 0.416 * z * z)) * 100);
  return Math.round(conf * 10) / 10;
}

function calcLift(cA: number, vA: number, cB: number, vB: number): string {
  if (!vA || !vB || !cA) return "—";
  const rateA = cA / vA;
  const rateB = cB / vB;
  const lift = ((rateB - rateA) / rateA) * 100;
  return `${lift > 0 ? "+" : ""}${Math.round(lift * 10) / 10}%`;
}

const STATUS_STYLE: Record<string, any> = {
  draft:     { color: "#6b6885", bg: "rgba(107,104,133,0.1)", border: "rgba(107,104,133,0.2)" },
  running:   { color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.2)" },
  paused:    { color: "#06b6d4", bg: "rgba(6,182,212,0.1)",  border: "rgba(6,182,212,0.2)" },
  completed: { color: "#86efac", bg: "rgba(134,239,172,0.1)", border: "rgba(134,239,172,0.2)" },
};

const WINNER_STYLE: Record<string, string> = {
  running: "#6b6885", control: "#06b6d4", variant: "#86efac", inconclusive: "#fcd34d",
};

export default function ExperimentsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [experiments, setExperiments] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", hypothesis: "", primaryMetric: "", controlName: "Control", variantName: "Variant A", type: "ab_test" });
  const [results, setResults] = useState<Record<string, any>>({});

  const load = () => fetch(`/api/experiments/${id}`).then(r => r.json()).then(setExperiments);
  useEffect(() => { load(); }, [id]);

  const handleCreate = async () => {
    await fetch(`/api/experiments/${id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setShowForm(false); setForm({ name: "", hypothesis: "", primaryMetric: "", controlName: "Control", variantName: "Variant A", type: "ab_test" });
    load();
  };

  const updateResult = async (expId: string, field: string, value: any) => {
    setResults(prev => ({ ...prev, [expId]: { ...prev[expId], [field]: value } }));
  };

  const saveResult = async (exp: any) => {
    const r = results[exp.id] ?? {};
    const cC = r.controlConversions ?? exp.controlConversions;
    const cV = r.controlVisitors ?? exp.controlVisitors;
    const vC = r.variantConversions ?? exp.variantConversions;
    const vV = r.variantVisitors ?? exp.variantVisitors;
    const confidence = calcSignificance(cC, cV, vC, vV);
    const winner = confidence >= 95 ? ((vC / vV) > (cC / cV) ? "variant" : "control") : confidence < 95 && cC > 0 && vC > 0 ? "running" : "running";
    await fetch(`/api/experiments/${exp.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ controlConversions: cC, controlVisitors: cV, variantConversions: vC, variantVisitors: vV, confidence, winner, status: r.status ?? exp.status }) });
    load();
  };

  const running = experiments.filter(e => e.status === "running").length;
  const won = experiments.filter(e => e.winner === "variant").length;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar projectId={id} />
      <main className="flex-1 overflow-y-auto" style={{ background: "#07060d" }}>
        <div className="max-w-5xl mx-auto px-8 py-8">

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-semibold" style={{ color: "#ede8ff" }}>Эксперименты</h1>
              <p className="text-sm mt-1" style={{ color: "#6b6885" }}>A/B тесты · Байесовская значимость · Hypothesis-driven</p>
            </div>
            <Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4" />Новый тест</Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            {[
              { label: "Всего тестов", value: experiments.length, color: "#6366f1" },
              { label: "Запущено", value: running, color: "#f59e0b" },
              { label: "Вариант победил", value: won, color: "#86efac" },
              { label: "Win Rate", value: experiments.length ? `${Math.round(won/experiments.length*100)}%` : "—", color: "#a78bfa" },
            ].map(s => (
              <div key={s.label} className="rounded-xl p-4" style={{ background: "#0d0b18", border: "1px solid #1e1c38" }}>
                <div className="text-2xl font-bold font-mono" style={{ color: s.color }}>{s.value}</div>
                <div className="text-xs mt-1" style={{ color: "#6b6885" }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* New experiment form */}
          {showForm && (
            <div className="rounded-xl p-5 mb-6" style={{ background: "#0d0b18", border: "1px solid rgba(245,158,11,0.3)" }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium" style={{ color: "#ede8ff" }}>Новый A/B тест</h3>
                <button onClick={() => setShowForm(false)}><X className="w-4 h-4" style={{ color: "#6b6885" }} /></button>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <Field label="Название теста"><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Хук поста — вопрос vs статистика" className="input-field" /></Field>
                <Field label="Метрика">
                  <select value={form.primaryMetric} onChange={e => setForm({...form, primaryMetric: e.target.value})} className="input-field">
                    <option value="">Выбрать...</option>
                    <option>CTR (клики / показы)</option>
                    <option>Conversion Rate</option>
                    <option>Engagement Rate</option>
                    <option>Sign-up Rate</option>
                    <option>Revenue per visitor</option>
                    <option>Open Rate (email)</option>
                  </select>
                </Field>
                <Field label="Контроль (A)"><input value={form.controlName} onChange={e => setForm({...form, controlName: e.target.value})} className="input-field" /></Field>
                <Field label="Вариант (B)"><input value={form.variantName} onChange={e => setForm({...form, variantName: e.target.value})} className="input-field" /></Field>
              </div>
              <Field label="Гипотеза (если X → то Y потому что Z)">
                <textarea value={form.hypothesis} onChange={e => setForm({...form, hypothesis: e.target.value})} rows={2} placeholder="Если заменить хук на вопрос — CTR вырастет на 15%, потому что вопрос создаёт паттерн-прерыватель..." className="input-field resize-none" />
              </Field>
              <div className="flex gap-3 mt-4">
                <Button onClick={handleCreate} disabled={!form.name}>Создать тест</Button>
                <Button variant="secondary" onClick={() => setShowForm(false)}>Отмена</Button>
              </div>
            </div>
          )}

          {/* Experiments list */}
          <div className="space-y-4">
            {experiments.length === 0 && <p className="text-sm" style={{ color: "#6b6885" }}>Нет тестов. Создай первый A/B эксперимент.</p>}
            {experiments.map(exp => {
              const r = results[exp.id] ?? {};
              const cC = r.controlConversions ?? exp.controlConversions;
              const cV = r.controlVisitors ?? exp.controlVisitors;
              const vC = r.variantConversions ?? exp.variantConversions;
              const vV = r.variantVisitors ?? exp.variantVisitors;
              const confidence = calcSignificance(cC, cV, vC, vV);
              const lift = calcLift(cC, cV, vC, vV);
              const st = STATUS_STYLE[exp.status] ?? STATUS_STYLE.draft;
              return (
                <div key={exp.id} className="rounded-xl p-5" style={{ background: "#0d0b18", border: "1px solid #1e1c38" }}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <FlaskConical className="w-4 h-4" style={{ color: "#6366f1" }} />
                        <span className="text-sm font-medium" style={{ color: "#ede8ff" }}>{exp.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md" style={{ color: st.color, background: st.bg, border: `1px solid ${st.border}` }}>{exp.status}</span>
                        {exp.winner !== "running" && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md font-mono" style={{ color: WINNER_STYLE[exp.winner] }}>
                            {exp.winner === "variant" ? `✓ ${exp.variantName} wins` : exp.winner === "control" ? `✓ ${exp.controlName} wins` : "inconclusive"}
                          </span>
                        )}
                      </div>
                      {exp.hypothesis && <p className="text-xs mt-1" style={{ color: "#6b6885" }}>{exp.hypothesis}</p>}
                      {exp.primaryMetric && <p className="text-[10px] mt-0.5" style={{ color: "#3d3a5c" }}>Метрика: {exp.primaryMetric}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <select value={r.status ?? exp.status} onChange={e => updateResult(exp.id, "status", e.target.value)} className="text-xs rounded px-2 py-1" style={{ background: "#13112a", border: "1px solid #1e1c38", color: "#6b6885" }}>
                        <option value="draft">Draft</option>
                        <option value="running">Running</option>
                        <option value="paused">Paused</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </div>

                  {/* Variant inputs */}
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    {[
                      { label: exp.controlName + " (A)", cKey: "controlConversions", vKey: "controlVisitors", conv: cC, vis: cV, color: "#06b6d4" },
                      { label: exp.variantName + " (B)", cKey: "variantConversions", vKey: "variantVisitors", conv: vC, vis: vV, color: "#a78bfa" },
                    ].map(v => (
                      <div key={v.label} className="p-3 rounded-lg" style={{ background: "#13112a", border: `1px solid ${v.color}22` }}>
                        <div className="text-xs font-semibold mb-2" style={{ color: v.color }}>{v.label}</div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <div className="text-[10px] mb-1" style={{ color: "#6b6885" }}>Конверсии</div>
                            <input type="number" defaultValue={v.conv} onChange={e => updateResult(exp.id, v.cKey, +e.target.value)} className="input-field text-xs py-1" />
                          </div>
                          <div>
                            <div className="text-[10px] mb-1" style={{ color: "#6b6885" }}>Посетители</div>
                            <input type="number" defaultValue={v.vis} onChange={e => updateResult(exp.id, v.vKey, +e.target.value)} className="input-field text-xs py-1" />
                          </div>
                        </div>
                        <div className="text-xs mt-2 font-mono" style={{ color: "#ede8ff" }}>
                          CR: {v.vis ? `${Math.round(v.conv / v.vis * 1000) / 10}%` : "—"}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Significance bar */}
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span style={{ color: "#6b6885" }}>Статистическая значимость</span>
                        <span className="font-mono" style={{ color: confidence >= 95 ? "#86efac" : "#f59e0b" }}>{confidence}%</span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: "#1e1c38" }}>
                        <div className="h-full rounded-full transition-all" style={{ width: `${confidence}%`, background: confidence >= 95 ? "#86efac" : confidence >= 80 ? "#f59e0b" : "#6366f1" }} />
                      </div>
                      <div className="text-[10px] mt-1" style={{ color: "#3d3a5c" }}>
                        {confidence >= 95 ? "✓ Достаточно данных для решения (>95%)" : confidence >= 80 ? "⏳ Близко — нужно больше данных" : "⌛ Недостаточно данных (<80%)"}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs" style={{ color: "#6b6885" }}>Lift</div>
                      <div className="text-lg font-bold font-mono" style={{ color: lift.startsWith("+") ? "#86efac" : lift.startsWith("-") ? "#fca5a5" : "#6b6885" }}>{lift}</div>
                    </div>
                  </div>

                  <Button size="sm" variant="secondary" onClick={() => saveResult(exp)}>Сохранить результаты</Button>
                </div>
              );
            })}
          </div>

        </div>
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs mb-1 uppercase tracking-wider" style={{ color: "#6b6885" }}>{label}</label>
      {children}
    </div>
  );
}

