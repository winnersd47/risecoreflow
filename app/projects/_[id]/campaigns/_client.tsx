"use client"
import { useState, useEffect, use } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Plus, X, Copy, Check } from "lucide-react";

const CHANNELS = ["telegram", "twitter", "linkedin", "reddit", "email", "product_hunt", "hacker_news", "paid_ads", "seo", "youtube", "tiktok", "other"];
const CHANNEL_COLORS: Record<string, string> = {
  telegram: "#06b6d4", twitter: "#a78bfa", linkedin: "#6366f1", reddit: "#f97316",
  email: "#f59e0b", product_hunt: "#ef4444", hacker_news: "#f97316", paid_ads: "#10b981",
  seo: "#86efac", youtube: "#ef4444", tiktok: "#ec4899", other: "#6b6885",
};

function calcCAC(spent: number, conversions: number) {
  if (!conversions || !spent) return null;
  return Math.round((spent / conversions) * 100) / 100;
}
function calcROAS(revenue: number, spent: number) {
  if (!spent) return null;
  return Math.round((revenue / spent) * 100) / 100;
}
function calcCTR(clicks: number, impressions: number) {
  if (!impressions) return null;
  return Math.round(clicks / impressions * 1000) / 10;
}

export default function CampaignsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({ name: "", channel: "telegram", status: "planned", budget: "", utmSource: "", utmMedium: "", utmCampaign: "", notes: "" });
  const [utmBase, setUtmBase] = useState("");

  const load = () => fetch(`/api/campaigns/${id}`).then(r => r.json()).then(setCampaigns);
  useEffect(() => { load(); }, [id]);

  const handleCreate = async () => {
    await fetch(`/api/campaigns/${id}`, { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({...form, budget: +form.budget || 0, projectId: id}) });
    setShowForm(false);
    setForm({ name: "", channel: "telegram", status: "planned", budget: "", utmSource: "", utmMedium: "", utmCampaign: "", notes: "" });
    load();
  };

  const updateCampaign = async (campId: string, data: any) => {
    await fetch(`/api/campaigns/${campId}`, { method: "PATCH", headers: {"Content-Type":"application/json"}, body: JSON.stringify(data) });
    load();
  };

  const utmUrl = utmBase && form.utmCampaign
    ? `${utmBase}?utm_source=${form.utmSource || form.channel}&utm_medium=${form.utmMedium || "social"}&utm_campaign=${form.utmCampaign}`
    : "";

  const totalSpent = campaigns.reduce((s, c) => s + (c.spent ?? 0), 0);
  const totalRevenue = campaigns.reduce((s, c) => s + (c.revenue ?? 0), 0);
  const totalConversions = campaigns.reduce((s, c) => s + (c.conversions ?? 0), 0);
  const totalClicks = campaigns.reduce((s, c) => s + (c.clicks ?? 0), 0);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar projectId={id} />
      <main className="flex-1 overflow-y-auto" style={{ background: "#07060d" }}>
        <div className="max-w-5xl mx-auto px-8 py-8">

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-semibold" style={{ color: "#ede8ff" }}>Кампании</h1>
              <p className="text-sm mt-1" style={{ color: "#6b6885" }}>Мультиканальный трекинг · UTM Builder · CAC/LTV · ROAS</p>
            </div>
            <Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4" />Новая кампания</Button>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            {[
              { label: "Потрачено", value: totalSpent ? `$${totalSpent}` : "—", color: "#f59e0b" },
              { label: "Выручка", value: totalRevenue ? `$${totalRevenue}` : "—", color: "#86efac" },
              { label: "ROAS", value: calcROAS(totalRevenue, totalSpent) ? `${calcROAS(totalRevenue, totalSpent)}x` : "—", color: "#a78bfa" },
              { label: "Конверсии", value: totalConversions || "—", color: "#06b6d4" },
            ].map(s => (
              <div key={s.label} className="rounded-xl p-4" style={{ background: "#0d0b18", border: "1px solid #1e1c38" }}>
                <div className="text-2xl font-bold font-mono" style={{ color: s.color }}>{s.value}</div>
                <div className="text-xs mt-1" style={{ color: "#6b6885" }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Create form */}
          {showForm && (
            <div className="rounded-xl p-5 mb-6" style={{ background: "#0d0b18", border: "1px solid rgba(245,158,11,0.3)" }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium" style={{ color: "#ede8ff" }}>Новая кампания + UTM Builder</h3>
                <button onClick={() => setShowForm(false)}><X className="w-4 h-4" style={{ color: "#6b6885" }} /></button>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <Field label="Название"><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Запуск Wave 1 Telegram" className="input-field" /></Field>
                <Field label="Канал">
                  <select value={form.channel} onChange={e => setForm({...form, channel: e.target.value})} className="input-field">
                    {CHANNELS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Бюджет ($)"><input type="number" value={form.budget} onChange={e => setForm({...form, budget: e.target.value})} placeholder="0" className="input-field" /></Field>
              </div>

              {/* UTM Builder */}
              <div className="p-4 rounded-lg mb-4" style={{ background: "#13112a", border: "1px solid #1e1c38" }}>
                <div className="text-xs font-semibold mb-3" style={{ color: "#f59e0b" }}>UTM Builder</div>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  <Field label="Base URL"><input value={utmBase} onChange={e => setUtmBase(e.target.value)} placeholder="https://yoursite.com" className="input-field text-xs" /></Field>
                  <Field label="utm_source"><input value={form.utmSource} onChange={e => setForm({...form, utmSource: e.target.value})} placeholder={form.channel} className="input-field text-xs" /></Field>
                  <Field label="utm_medium"><input value={form.utmMedium} onChange={e => setForm({...form, utmMedium: e.target.value})} placeholder="social" className="input-field text-xs" /></Field>
                  <Field label="utm_campaign"><input value={form.utmCampaign} onChange={e => setForm({...form, utmCampaign: e.target.value})} placeholder="wave1-launch" className="input-field text-xs" /></Field>
                </div>
                {utmUrl && (
                  <div className="flex items-center gap-2 p-2 rounded" style={{ background: "#07060d" }}>
                    <code className="text-xs flex-1 truncate" style={{ color: "#86efac" }}>{utmUrl}</code>
                    <button onClick={() => { navigator.clipboard.writeText(utmUrl); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>
                      {copied ? <Check className="w-3.5 h-3.5" style={{ color: "#86efac" }} /> : <Copy className="w-3.5 h-3.5" style={{ color: "#6b6885" }} />}
                    </button>
                  </div>
                )}
              </div>

              <Field label="Заметки">
                <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={2} className="input-field resize-none" placeholder="Цель кампании, аудитория..." />
              </Field>
              <div className="flex gap-3 mt-4">
                <Button onClick={handleCreate} disabled={!form.name}>Создать кампанию</Button>
                <Button variant="secondary" onClick={() => setShowForm(false)}>Отмена</Button>
              </div>
            </div>
          )}

          {/* Campaigns table */}
          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #1e1c38" }}>
            <table className="w-full">
              <thead>
                <tr style={{ background: "#0d0b18", borderBottom: "1px solid #1e1c38" }}>
                  {["Кампания", "Канал", "Статус", "Потрачено", "Клики", "Конверсии", "CAC", "ROAS"].map(h => (
                    <th key={h} className="text-left text-xs font-medium px-4 py-3" style={{ color: "#3d3a5c" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {campaigns.length === 0 && (
                  <tr><td colSpan={8} className="px-4 py-10 text-center text-sm" style={{ color: "#6b6885" }}>Нет кампаний. Создай первую.</td></tr>
                )}
                {campaigns.map((c, i) => {
                  const cac = calcCAC(c.spent, c.conversions);
                  const roas = calcROAS(c.revenue, c.spent);
                  const channelColor = CHANNEL_COLORS[c.channel] ?? "#6b6885";
                  return (
                    <tr key={c.id} className="hover-row border-b" style={{ borderColor: "#1e1c38", background: "#07060d" }}>
                      <td className="px-4 py-3">
                        <div className="text-sm" style={{ color: "#ede8ff" }}>{c.name}</div>
                        {c.notes && <div className="text-xs" style={{ color: "#6b6885" }}>{c.notes.slice(0, 50)}</div>}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-0.5 rounded-md" style={{ color: channelColor, background: channelColor + "18", border: `1px solid ${channelColor}44` }}>{c.channel}</span>
                      </td>
                      <td className="px-4 py-3">
                        <select value={c.status} onChange={e => updateCampaign(c.id, { status: e.target.value })} className="text-xs rounded px-2 py-1" style={{ background: "#13112a", border: "1px solid #1e1c38", color: "#ede8ff" }}>
                          <option value="planned">Planned</option>
                          <option value="active">Active</option>
                          <option value="paused">Paused</option>
                          <option value="completed">Completed</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <input type="number" defaultValue={c.spent} onBlur={e => updateCampaign(c.id, {spent: +e.target.value})} className="w-20 text-xs rounded px-2 py-1 font-mono" style={{ background: "#13112a", border: "1px solid #1e1c38", color: "#fcd34d" }} />
                      </td>
                      <td className="px-4 py-3">
                        <input type="number" defaultValue={c.clicks} onBlur={e => updateCampaign(c.id, {clicks: +e.target.value})} className="w-20 text-xs rounded px-2 py-1 font-mono" style={{ background: "#13112a", border: "1px solid #1e1c38", color: "#ede8ff" }} />
                      </td>
                      <td className="px-4 py-3">
                        <input type="number" defaultValue={c.conversions} onBlur={e => updateCampaign(c.id, {conversions: +e.target.value})} className="w-20 text-xs rounded px-2 py-1 font-mono" style={{ background: "#13112a", border: "1px solid #1e1c38", color: "#86efac" }} />
                      </td>
                      <td className="px-4 py-3 text-xs font-mono" style={{ color: cac ? "#f59e0b" : "#3d3a5c" }}>{cac ? `$${cac}` : "—"}</td>
                      <td className="px-4 py-3 text-xs font-mono" style={{ color: roas && roas >= 3 ? "#86efac" : roas ? "#fcd34d" : "#3d3a5c" }}>{roas ? `${roas}x` : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Attribution model info */}
          <div className="mt-6 rounded-xl p-5" style={{ background: "#0d0b18", border: "1px solid #1e1c38" }}>
            <h3 className="text-sm font-medium mb-3" style={{ color: "#ede8ff" }}>Модели атрибуции (справка)</h3>
            <div className="grid grid-cols-4 gap-3 text-xs">
              {[
                { name: "First Touch", desc: "Весь кредит первому каналу. Хорошо для Awareness.", used: "HubSpot начальный" },
                { name: "Last Touch", desc: "Весь кредит последнему каналу. Хорошо для конверсий.", used: "Google Ads default" },
                { name: "Linear", desc: "Равный вес всем касаниям. Справедливо для PLG.", used: "Notion, Figma" },
                { name: "Data-Driven", desc: "ML определяет вес каждого канала по реальным данным.", used: "Google Analytics 4" },
              ].map(m => (
                <div key={m.name} className="p-3 rounded-lg" style={{ background: "#13112a" }}>
                  <div className="font-semibold mb-1" style={{ color: "#f59e0b" }}>{m.name}</div>
                  <div style={{ color: "#ede8ff" }}>{m.desc}</div>
                  <div className="text-[10px] mt-1 italic" style={{ color: "#3d3a5c" }}>Использует: {m.used}</div>
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

