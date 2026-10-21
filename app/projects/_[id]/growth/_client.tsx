"use client"
import { useState, useEffect, use } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Save, TrendingUp, Users, Zap, RefreshCw, DollarSign, Share2, Star } from "lucide-react";

const AARRR = [
  { key: "acquisition", label: "Acquisition", icon: Users, color: "#6366f1", desc: "Новые посетители и регистрации" },
  { key: "activation", label: "Activation", icon: Zap, color: "#f59e0b", desc: "Первый «ага-момент» в продукте" },
  { key: "retention", label: "Retention", icon: RefreshCw, color: "#10b981", desc: "Возврат и активность пользователей" },
  { key: "revenue", label: "Revenue", icon: DollarSign, color: "#06b6d4", desc: "MRR, ARPU, Churn, LTV" },
  { key: "referral", label: "Referral", icon: Share2, color: "#a78bfa", desc: "Вирусный коэффициент (k-factor)" },
];

function calcViralCoef(referrals: number, newSignups: number) {
  if (!newSignups) return 0;
  return Math.round((referrals / newSignups) * 100) / 100;
}

function calcActivationRate(activated: number, signups: number) {
  if (!signups) return 0;
  return Math.round((activated / signups) * 1000) / 10;
}

export default function GrowthPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [entries, setEntries] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    week: 1, northStarLabel: "Активные пользователи",
    newVisitors: "", newSignups: "", activatedUsers: "",
    wau: "", retentionRate: "", mrr: "", churnRate: "",
    referrals: "", northStarValue: "", notes: "",
  });

  useEffect(() => { fetch(`/api/growth/${id}`).then(r => r.json()).then(setEntries); }, [id]);

  const latest = entries[0];
  const prev = entries[1];

  const delta = (curr: number, old: number) => {
    if (!curr || !old) return null;
    const d = Math.round(((curr - old) / old) * 100);
    return d > 0 ? `+${d}%` : `${d}%`;
  };

  const handleSave = async () => {
    setSaving(true);
    await fetch(`/api/growth/${id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, projectId: id }) });
    const updated = await fetch(`/api/growth/${id}`).then(r => r.json());
    setEntries(updated);
    setSaved(true); setSaving(false);
    setTimeout(() => setSaved(false), 2000);
  };

  const viralCoef = calcViralCoef(latest?.referrals ?? 0, latest?.newSignups ?? 0);
  const activationRate = calcActivationRate(latest?.activatedUsers ?? 0, latest?.newSignups ?? 0);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar projectId={id} />
      <main className="flex-1 overflow-y-auto" style={{ background: "#07060d" }}>
        <div className="max-w-5xl mx-auto px-8 py-8">

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-xl font-semibold" style={{ color: "#ede8ff" }}>Growth Engine</h1>
            <p className="text-sm mt-1" style={{ color: "#6b6885" }}>AARRR · North Star · Viral Coefficient · Cohort Analysis</p>
          </div>

          {/* North Star */}
          <div className="rounded-xl p-5 mb-6" style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.08), rgba(99,102,241,0.08))", border: "1px solid rgba(245,158,11,0.2)" }}>
            <div className="flex items-center gap-2 mb-1">
              <Star className="w-4 h-4" style={{ color: "#f59e0b" }} />
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#f59e0b" }}>North Star Metric</span>
            </div>
            <div className="flex items-end gap-4 mt-2">
              <div>
                <div className="text-4xl font-bold font-mono" style={{ color: "#ede8ff" }}>
                  {latest?.northStarValue ?? "—"}
                </div>
                <div className="text-sm mt-1" style={{ color: "#6b6885" }}>{latest?.northStarLabel ?? "Установи метрику"}</div>
              </div>
              {latest && prev && (
                <div className="text-sm font-mono mb-1" style={{ color: delta(latest.northStarValue, prev.northStarValue)?.startsWith("+") ? "#86efac" : "#fca5a5" }}>
                  {delta(latest.northStarValue, prev.northStarValue)} к прошлой неделе
                </div>
              )}
            </div>
          </div>

          {/* AARRR Cards */}
          <div className="grid grid-cols-5 gap-3 mb-8">
            {AARRR.map((stage) => {
              const value = stage.key === "acquisition" ? latest?.newSignups
                : stage.key === "activation" ? (activationRate ? `${activationRate}%` : null)
                : stage.key === "retention" ? (latest?.retentionRate ? `${latest.retentionRate}%` : null)
                : stage.key === "revenue" ? (latest?.mrr ? `$${latest.mrr}` : null)
                : (viralCoef ? `k=${viralCoef}` : null);
              const Icon = stage.icon;
              return (
                <div key={stage.key} className="rounded-xl p-4" style={{ background: "#0d0b18", border: "1px solid #1e1c38" }}>
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className="w-4 h-4" style={{ color: stage.color }} />
                    <span className="text-xs font-semibold" style={{ color: stage.color }}>{stage.label}</span>
                  </div>
                  <div className="text-xl font-bold font-mono" style={{ color: "#ede8ff" }}>{value ?? "—"}</div>
                  <div className="text-[10px] mt-1" style={{ color: "#6b6885" }}>{stage.desc}</div>
                </div>
              );
            })}
          </div>

          {/* Viral Coefficient Explainer */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="rounded-xl p-4" style={{ background: "#0d0b18", border: "1px solid #1e1c38" }}>
              <div className="text-xs font-semibold mb-2" style={{ color: "#a78bfa" }}>Viral Coefficient (k)</div>
              <div className="text-3xl font-bold font-mono mb-1" style={{ color: viralCoef >= 1 ? "#86efac" : "#ede8ff" }}>{viralCoef || "—"}</div>
              <div className="text-xs" style={{ color: "#6b6885" }}>
                {viralCoef >= 1 ? "🔥 Вирусный рост — каждый юзер приводит >1 нового" : viralCoef > 0 ? "⚡ Суб-вирусный — нужно довести до k≥1" : "Формула: рефералы / новые регистрации"}
              </div>
            </div>
            <div className="rounded-xl p-4" style={{ background: "#0d0b18", border: "1px solid #1e1c38" }}>
              <div className="text-xs font-semibold mb-2" style={{ color: "#f59e0b" }}>Activation Rate</div>
              <div className="text-3xl font-bold font-mono mb-1" style={{ color: activationRate >= 40 ? "#86efac" : "#ede8ff" }}>{activationRate ? `${activationRate}%` : "—"}</div>
              <div className="text-xs" style={{ color: "#6b6885" }}>Цель: {'>'}40% (Stripe / Notion benchmark)</div>
            </div>
            <div className="rounded-xl p-4" style={{ background: "#0d0b18", border: "1px solid #1e1c38" }}>
              <div className="text-xs font-semibold mb-2" style={{ color: "#10b981" }}>MRR Churn</div>
              <div className="text-3xl font-bold font-mono mb-1" style={{ color: (latest?.churnRate ?? 100) <= 3 ? "#86efac" : "#fca5a5" }}>{latest?.churnRate ? `${latest.churnRate}%` : "—"}</div>
              <div className="text-xs" style={{ color: "#6b6885" }}>Цель: {"<"}3% (world-class SaaS benchmark)</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Input form */}
            <div className="rounded-xl p-5" style={{ background: "#0d0b18", border: "1px solid #1e1c38" }}>
              <h3 className="text-sm font-medium mb-4" style={{ color: "#ede8ff" }}>Внести данные — неделя {form.week}</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Неделя">
                    <select value={form.week} onChange={e => setForm({...form, week: +e.target.value})} className="input-field">
                      {[1,2,3,4,5,6,7,8].map(w => <option key={w} value={w}>Неделя {w}</option>)}
                    </select>
                  </Field>
                  <Field label="North Star Метрика">
                    <input value={form.northStarLabel} onChange={e => setForm({...form, northStarLabel: e.target.value})} placeholder="Активные юзеры" className="input-field" />
                  </Field>
                </div>
                <div className="text-xs font-semibold uppercase tracking-wider mt-2" style={{ color: "#3d3a5c" }}>Acquisition</div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Новые посетители"><input type="number" value={form.newVisitors} onChange={e => setForm({...form, newVisitors: e.target.value})} placeholder="0" className="input-field" /></Field>
                  <Field label="Новые регистрации"><input type="number" value={form.newSignups} onChange={e => setForm({...form, newSignups: e.target.value})} placeholder="0" className="input-field" /></Field>
                </div>
                <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#3d3a5c" }}>Activation / Retention</div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Активированных"><input type="number" value={form.activatedUsers} onChange={e => setForm({...form, activatedUsers: e.target.value})} placeholder="0" className="input-field" /></Field>
                  <Field label="WAU"><input type="number" value={form.wau} onChange={e => setForm({...form, wau: e.target.value})} placeholder="0" className="input-field" /></Field>
                  <Field label="Retention Rate %"><input type="number" step="0.1" value={form.retentionRate} onChange={e => setForm({...form, retentionRate: e.target.value})} placeholder="0.0" className="input-field" /></Field>
                  <Field label="Churn Rate %"><input type="number" step="0.1" value={form.churnRate} onChange={e => setForm({...form, churnRate: e.target.value})} placeholder="0.0" className="input-field" /></Field>
                </div>
                <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#3d3a5c" }}>Revenue / Referral</div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="MRR ($)"><input type="number" value={form.mrr} onChange={e => setForm({...form, mrr: e.target.value})} placeholder="0" className="input-field" /></Field>
                  <Field label="Рефералы"><input type="number" value={form.referrals} onChange={e => setForm({...form, referrals: e.target.value})} placeholder="0" className="input-field" /></Field>
                  <Field label="North Star значение"><input type="number" value={form.northStarValue} onChange={e => setForm({...form, northStarValue: e.target.value})} placeholder="0" className="input-field" /></Field>
                </div>
                <Field label="Заметки">
                  <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={2} placeholder="Что двигало рост / что тормозило..." className="input-field resize-none" />
                </Field>
                <Button onClick={handleSave} disabled={saving} className="w-full">
                  <Save className="w-4 h-4" />
                  {saving ? "Сохраняю..." : saved ? "Сохранено ✓" : "Сохранить неделю"}
                </Button>
              </div>
            </div>

            {/* Growth history */}
            <div className="rounded-xl p-5" style={{ background: "#0d0b18", border: "1px solid #1e1c38" }}>
              <h3 className="text-sm font-medium mb-4" style={{ color: "#ede8ff" }}>История роста</h3>
              {entries.length === 0 ? (
                <p className="text-xs" style={{ color: "#6b6885" }}>Нет данных. Внеси первую неделю.</p>
              ) : (
                <div className="space-y-3">
                  {entries.map((e, i) => (
                    <div key={e.id} className="rounded-lg p-3" style={{ border: "1px solid #1e1c38" }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium" style={{ color: "#ede8ff" }}>Неделя {e.week}</span>
                        {i < entries.length - 1 && (
                          <span className="text-[10px] font-mono" style={{ color: delta(e.northStarValue, entries[i+1]?.northStarValue)?.startsWith("+") ? "#86efac" : "#fca5a5" }}>
                            NSM {delta(e.northStarValue, entries[i+1]?.northStarValue) ?? "—"}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-1 text-xs" style={{ color: "#6b6885" }}>
                        {e.newSignups != null && <span>Signups: <b style={{color:"#ede8ff"}}>{e.newSignups}</b></span>}
                        {e.wau != null && <span>WAU: <b style={{color:"#ede8ff"}}>{e.wau}</b></span>}
                        {e.mrr != null && <span>MRR: <b style={{color:"#ede8ff"}}>${e.mrr}</b></span>}
                        {e.retentionRate != null && <span>Ret: <b style={{color:"#ede8ff"}}>{e.retentionRate}%</b></span>}
                        {e.referrals != null && <span>Ref: <b style={{color:"#ede8ff"}}>{e.referrals}</b></span>}
                        {e.viralCoefficient != null && <span>k: <b style={{color:"#ede8ff"}}>{e.viralCoefficient}</b></span>}
                      </div>
                      {e.notes && <p className="text-[10px] italic mt-1" style={{color:"#6b6885"}}>{e.notes}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Benchmarks */}
          <div className="mt-6 rounded-xl p-5" style={{ background: "#0d0b18", border: "1px solid #1e1c38" }}>
            <h3 className="text-sm font-medium mb-3" style={{ color: "#ede8ff" }}>Бенчмарки топ-компаний</h3>
            <div className="grid grid-cols-4 gap-4 text-xs">
              {[
                { company: "Notion", metric: "Activation Rate", value: ">50%", note: "Первый shared doc" },
                { company: "Figma", metric: "Viral Coefficient", value: "k ≈ 1.3", note: "Invite to collaborate" },
                { company: "Slack", metric: "Retention (D30)", value: ">60%", note: "Team sends 2000+ messages" },
                { company: "Linear", metric: "Churn Rate", value: "<2%/мес", note: "Dev-focused PLG" },
                { company: "Stripe", metric: "Activation", value: ">40%", note: "First API call < 24h" },
                { company: "Loom", metric: "k-factor", value: "k ≈ 1.1", note: "Watch → Sign up loop" },
                { company: "HubSpot", metric: "Freemium Conv.", value: "2-5%", note: "Free → Paid" },
                { company: "Intercom", metric: "NPS", value: ">50", note: "Promoter loop" },
              ].map(b => (
                <div key={b.company} className="p-3 rounded-lg" style={{ background: "#13112a" }}>
                  <div className="font-semibold mb-0.5" style={{ color: "#f59e0b" }}>{b.company}</div>
                  <div style={{ color: "#ede8ff" }}>{b.value}</div>
                  <div style={{ color: "#6b6885" }}>{b.metric}</div>
                  <div className="text-[10px] italic mt-0.5" style={{ color: "#3d3a5c" }}>{b.note}</div>
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
      <label className="block text-xs mb-1 uppercase tracking-wider" style={{ color: "#6b6885" }}>{label}</label>
      {children}
    </div>
  );
}

