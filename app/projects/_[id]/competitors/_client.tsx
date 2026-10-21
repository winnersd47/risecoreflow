"use client"
import { useState, useEffect, use } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Plus, X, Shield, AlertTriangle, AlertCircle } from "lucide-react";

const THREAT_CONFIG: Record<string, any> = {
  low:    { label: "Низкий", color: "#86efac", icon: Shield },
  medium: { label: "Средний", color: "#fcd34d", icon: AlertTriangle },
  high:   { label: "Высокий", color: "#fca5a5", icon: AlertCircle },
};

export default function CompetitorsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [competitors, setCompetitors] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<any | null>(null);
  const [form, setForm] = useState({ name: "", url: "", positioning: "", pricing: "", strengths: "", weaknesses: "", ourAdvantages: "", targetAudience: "", threatLevel: "medium", notes: "" });

  const load = () => fetch(`/api/competitors/${id}`).then(r => r.json()).then(setCompetitors);
  useEffect(() => { load(); }, [id]);

  const handleCreate = async () => {
    await fetch(`/api/competitors/${id}`, { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({...form, projectId: id}) });
    setShowForm(false);
    setForm({ name: "", url: "", positioning: "", pricing: "", strengths: "", weaknesses: "", ourAdvantages: "", targetAudience: "", threatLevel: "medium", notes: "" });
    load();
  };

  const high = competitors.filter(c => c.threatLevel === "high").length;
  const medium = competitors.filter(c => c.threatLevel === "medium").length;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar projectId={id} />
      <main className="flex-1 overflow-y-auto" style={{ background: "#07060d" }}>
        <div className="max-w-5xl mx-auto px-8 py-8">

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-semibold" style={{ color: "#ede8ff" }}>Конкуренты</h1>
              <p className="text-sm mt-1" style={{ color: "#6b6885" }}>Battle Cards · Positioning Matrix · Win/Loss Analysis</p>
            </div>
            <Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4" />Добавить</Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: "Всего конкурентов", value: competitors.length, color: "#6366f1" },
              { label: "Высокая угроза", value: high, color: "#fca5a5" },
              { label: "Средняя угроза", value: medium, color: "#fcd34d" },
            ].map(s => (
              <div key={s.label} className="rounded-xl p-4" style={{ background: "#0d0b18", border: "1px solid #1e1c38" }}>
                <div className="text-2xl font-bold font-mono" style={{ color: s.color }}>{s.value}</div>
                <div className="text-xs mt-1" style={{ color: "#6b6885" }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Add form */}
          {showForm && (
            <div className="rounded-xl p-5 mb-6" style={{ background: "#0d0b18", border: "1px solid rgba(245,158,11,0.3)" }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium" style={{ color: "#ede8ff" }}>Новая Battle Card</h3>
                <button onClick={() => setShowForm(false)}><X className="w-4 h-4" style={{ color: "#6b6885" }} /></button>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <Field label="Название"><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Notion, Figma..." className="input-field" /></Field>
                <Field label="URL"><input value={form.url} onChange={e => setForm({...form, url: e.target.value})} placeholder="notion.so" className="input-field" /></Field>
                <Field label="Уровень угрозы">
                  <select value={form.threatLevel} onChange={e => setForm({...form, threatLevel: e.target.value})} className="input-field">
                    <option value="low">Низкий</option>
                    <option value="medium">Средний</option>
                    <option value="high">Высокий</option>
                  </select>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <Field label="Их позиционирование"><textarea value={form.positioning} onChange={e => setForm({...form, positioning: e.target.value})} rows={2} placeholder="Как они себя позиционируют..." className="input-field resize-none" /></Field>
                <Field label="Ценообразование"><textarea value={form.pricing} onChange={e => setForm({...form, pricing: e.target.value})} rows={2} placeholder="$X/мес, Freemium, Enterprise..." className="input-field resize-none" /></Field>
                <Field label="Их сильные стороны"><textarea value={form.strengths} onChange={e => setForm({...form, strengths: e.target.value})} rows={2} placeholder="Что они делают лучше нас..." className="input-field resize-none" /></Field>
                <Field label="Их слабые стороны"><textarea value={form.weaknesses} onChange={e => setForm({...form, weaknesses: e.target.value})} rows={2} placeholder="Где они уязвимы..." className="input-field resize-none" /></Field>
                <Field label="Наши преимущества vs них"><textarea value={form.ourAdvantages} onChange={e => setForm({...form, ourAdvantages: e.target.value})} rows={2} placeholder="Почему нас выбрать вместо них..." className="input-field resize-none" /></Field>
                <Field label="Их целевая аудитория"><textarea value={form.targetAudience} onChange={e => setForm({...form, targetAudience: e.target.value})} rows={2} placeholder="Кому они продают..." className="input-field resize-none" /></Field>
              </div>
              <div className="flex gap-3">
                <Button onClick={handleCreate} disabled={!form.name}>Создать Battle Card</Button>
                <Button variant="secondary" onClick={() => setShowForm(false)}>Отмена</Button>
              </div>
            </div>
          )}

          {/* Competitors grid */}
          <div className="grid grid-cols-1 gap-4">
            {competitors.length === 0 && <p className="text-sm" style={{ color: "#6b6885" }}>Нет конкурентов. Добавь первый.</p>}
            {competitors.map(comp => {
              const threat = THREAT_CONFIG[comp.threatLevel] ?? THREAT_CONFIG.medium;
              const ThreatIcon = threat.icon;
              const isOpen = selected?.id === comp.id;
              return (
                <div key={comp.id} className="rounded-xl overflow-hidden" style={{ border: `1px solid ${isOpen ? threat.color + "44" : "#1e1c38"}`, background: "#0d0b18" }}>
                  {/* Header */}
                  <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => setSelected(isOpen ? null : comp)}>
                    <div className="flex items-center gap-3">
                      <ThreatIcon className="w-4 h-4" style={{ color: threat.color }} />
                      <div>
                        <div className="text-sm font-semibold" style={{ color: "#ede8ff" }}>{comp.name}</div>
                        {comp.url && <div className="text-xs" style={{ color: "#6b6885" }}>{comp.url}</div>}
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-md ml-2" style={{ color: threat.color, background: threat.color + "18", border: `1px solid ${threat.color}44` }}>
                        {threat.label} угроза
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs" style={{ color: "#6b6885" }}>
                      {comp.pricing && <span className="font-mono" style={{ color: "#f59e0b" }}>{comp.pricing.slice(0, 20)}</span>}
                      <span>{isOpen ? "▲" : "▼"}</span>
                    </div>
                  </div>

                  {/* Battle Card expanded */}
                  {isOpen && (
                    <div className="px-4 pb-4 border-t" style={{ borderColor: "#1e1c38" }}>
                      <div className="grid grid-cols-3 gap-4 mt-4">
                        {/* Their position */}
                        {comp.positioning && (
                          <div>
                            <div className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: "#6b6885" }}>Их позиционирование</div>
                            <p className="text-xs" style={{ color: "#ede8ff" }}>{comp.positioning}</p>
                          </div>
                        )}
                        {/* Strengths */}
                        {comp.strengths && (
                          <div>
                            <div className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: "#fca5a5" }}>Их сильные стороны</div>
                            <p className="text-xs" style={{ color: "#ede8ff" }}>{comp.strengths}</p>
                          </div>
                        )}
                        {/* Weaknesses */}
                        {comp.weaknesses && (
                          <div>
                            <div className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: "#86efac" }}>Их слабые стороны</div>
                            <p className="text-xs" style={{ color: "#ede8ff" }}>{comp.weaknesses}</p>
                          </div>
                        )}
                        {/* Our advantages */}
                        {comp.ourAdvantages && (
                          <div className="col-span-2" style={{ borderLeft: "2px solid #f59e0b", paddingLeft: "12px" }}>
                            <div className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: "#f59e0b" }}>Почему нас — key talking points</div>
                            <p className="text-xs" style={{ color: "#ede8ff" }}>{comp.ourAdvantages}</p>
                          </div>
                        )}
                        {comp.targetAudience && (
                          <div>
                            <div className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: "#6b6885" }}>Их аудитория</div>
                            <p className="text-xs" style={{ color: "#ede8ff" }}>{comp.targetAudience}</p>
                          </div>
                        )}
                      </div>
                      {comp.notes && <p className="text-xs mt-3 italic" style={{ color: "#6b6885" }}>{comp.notes}</p>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Positioning matrix guide */}
          <div className="mt-6 rounded-xl p-5" style={{ background: "#0d0b18", border: "1px solid #1e1c38" }}>
            <h3 className="text-sm font-medium mb-3" style={{ color: "#ede8ff" }}>Как топ-компании строят позиционирование</h3>
            <div className="grid grid-cols-3 gap-4 text-xs">
              {[
                { title: "Category Creation (Salesforce)", desc: "Создай новую категорию — «CRM в облаке» вместо «лучший CRM». Первые в категории получают >60% market share.", action: "Назови свою категорию" },
                { title: "Narrow ICP First (Stripe)", desc: "Начни с одного узкого сегмента. Stripe = developers. Не «платёжная система», а «API для разработчиков».", action: "Сузь фокус до отказа" },
                { title: "Jobs-to-be-Done (Linear)", desc: "Фокус не на фичах, а на работе которую делает пользователь. Linear = «Я хочу думать о продукте, а не об инструменте».", action: "Опиши job, не фичи" },
              ].map(g => (
                <div key={g.title} className="p-3 rounded-lg" style={{ background: "#13112a" }}>
                  <div className="font-semibold mb-1" style={{ color: "#f59e0b" }}>{g.title}</div>
                  <div className="mb-2" style={{ color: "#ede8ff" }}>{g.desc}</div>
                  <div className="text-[10px]" style={{ color: "#6366f1" }}>→ {g.action}</div>
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

