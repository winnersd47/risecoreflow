"use client"
import { useState, useEffect, use } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Plus, X, Target } from "lucide-react";

const SCORE_COLORS = (s: number) => s >= 80 ? "#86efac" : s >= 60 ? "#f59e0b" : s >= 40 ? "#fcd34d" : "#fca5a5";

export default function ICPsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [icps, setIcps] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<any | null>(null);
  const [form, setForm] = useState({ name: "", description: "", role: "", companySize: "", industry: "", painPoints: "", goals: "", objections: "", messagingAngle: "", channels: "", score: "70" });

  const load = () => fetch(`/api/icps/${id}`).then(r => r.json()).then(setIcps);
  useEffect(() => { load(); }, [id]);

  const handleCreate = async () => {
    await fetch(`/api/icps/${id}`, { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({...form, score: +form.score, projectId: id}) });
    setShowForm(false);
    setForm({ name: "", description: "", role: "", companySize: "", industry: "", painPoints: "", goals: "", objections: "", messagingAngle: "", channels: "", score: "70" });
    load();
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar projectId={id} />
      <main className="flex-1 overflow-y-auto" style={{ background: "#07060d" }}>
        <div className="max-w-5xl mx-auto px-8 py-8">

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-semibold" style={{ color: "#ede8ff" }}>ICP Manager</h1>
              <p className="text-sm mt-1" style={{ color: "#6b6885" }}>Ideal Customer Profiles · Jobs-to-be-Done · Messaging Matrix</p>
            </div>
            <Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4" />Новый ICP</Button>
          </div>

          {/* Add form */}
          {showForm && (
            <div className="rounded-xl p-5 mb-6" style={{ background: "#0d0b18", border: "1px solid rgba(245,158,11,0.3)" }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium" style={{ color: "#ede8ff" }}>Новый ICP</h3>
                <button onClick={() => setShowForm(false)}><X className="w-4 h-4" style={{ color: "#6b6885" }} /></button>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <Field label="Название (имя персоны)"><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Алексей — СТО стартапа" className="input-field" /></Field>
                <Field label="Роль / должность"><input value={form.role} onChange={e => setForm({...form, role: e.target.value})} placeholder="CTO, Founder, PM..." className="input-field" /></Field>
                <Field label="Размер компании"><input value={form.companySize} onChange={e => setForm({...form, companySize: e.target.value})} placeholder="1-10, 11-50, 51-200..." className="input-field" /></Field>
                <Field label="Индустрия"><input value={form.industry} onChange={e => setForm({...form, industry: e.target.value})} placeholder="SaaS, FinTech, E-com..." className="input-field" /></Field>
                <Field label="Каналы (где найти)"><input value={form.channels} onChange={e => setForm({...form, channels: e.target.value})} placeholder="LinkedIn, Telegram, HN..." className="input-field" /></Field>
                <Field label="Fit Score (0-100)">
                  <input type="range" min={0} max={100} value={form.score} onChange={e => setForm({...form, score: e.target.value})} className="w-full mt-2" />
                  <div className="text-xs font-mono text-right" style={{ color: SCORE_COLORS(+form.score) }}>{form.score}/100</div>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <Field label="Боли (Pain Points)"><textarea value={form.painPoints} onChange={e => setForm({...form, painPoints: e.target.value})} rows={3} placeholder="Что их реально болит каждый день..." className="input-field resize-none" /></Field>
                <Field label="Цели (Jobs-to-be-Done)"><textarea value={form.goals} onChange={e => setForm({...form, goals: e.target.value})} rows={3} placeholder="Что они пытаются достичь..." className="input-field resize-none" /></Field>
                <Field label="Возражения"><textarea value={form.objections} onChange={e => setForm({...form, objections: e.target.value})} rows={3} placeholder="Почему они могут сказать нет..." className="input-field resize-none" /></Field>
                <Field label="Messaging Angle (ключевое сообщение)"><textarea value={form.messagingAngle} onChange={e => setForm({...form, messagingAngle: e.target.value})} rows={3} placeholder="Главный месседж именно для этого ICP..." className="input-field resize-none" /></Field>
              </div>
              <div className="flex gap-3">
                <Button onClick={handleCreate} disabled={!form.name}>Создать ICP</Button>
                <Button variant="secondary" onClick={() => setShowForm(false)}>Отмена</Button>
              </div>
            </div>
          )}

          {/* ICPs grid */}
          <div className="grid grid-cols-1 gap-4">
            {icps.length === 0 && (
              <div className="text-center py-12">
                <p className="text-sm mb-2" style={{ color: "#6b6885" }}>Нет ICP профилей.</p>
                <p className="text-xs" style={{ color: "#3d3a5c" }}>Каждый проект должен иметь 2-3 чётких ICP — это основа всей маркетинговой стратегии.</p>
              </div>
            )}
            {icps.map(icp => {
              const isOpen = selected?.id === icp.id;
              const scoreColor = SCORE_COLORS(icp.score);
              return (
                <div key={icp.id} className="rounded-xl overflow-hidden" style={{ border: `1px solid ${isOpen ? "#f59e0b44" : "#1e1c38"}`, background: "#0d0b18" }}>
                  <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => setSelected(isOpen ? null : icp)}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0" style={{ background: scoreColor + "18", border: `2px solid ${scoreColor}44`, color: scoreColor }}>
                        {icp.score}
                      </div>
                      <div>
                        <div className="text-sm font-semibold" style={{ color: "#ede8ff" }}>{icp.name}</div>
                        <div className="text-xs mt-0.5" style={{ color: "#6b6885" }}>
                          {[icp.role, icp.companySize, icp.industry].filter(Boolean).join(" · ")}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {icp.channels && <span className="text-xs px-2 py-0.5 rounded-md" style={{ color: "#6366f1", background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}>{icp.channels.split(",")[0].trim()}</span>}
                      <span className="text-xs" style={{ color: "#6b6885" }}>{isOpen ? "▲" : "▼"}</span>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="px-4 pb-4 border-t" style={{ borderColor: "#1e1c38" }}>
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        {icp.painPoints && (
                          <div className="p-3 rounded-lg" style={{ background: "#13112a" }}>
                            <div className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: "#fca5a5" }}>😤 Pain Points</div>
                            <p className="text-xs whitespace-pre-line" style={{ color: "#ede8ff" }}>{icp.painPoints}</p>
                          </div>
                        )}
                        {icp.goals && (
                          <div className="p-3 rounded-lg" style={{ background: "#13112a" }}>
                            <div className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: "#86efac" }}>🎯 Jobs-to-be-Done</div>
                            <p className="text-xs whitespace-pre-line" style={{ color: "#ede8ff" }}>{icp.goals}</p>
                          </div>
                        )}
                        {icp.objections && (
                          <div className="p-3 rounded-lg" style={{ background: "#13112a" }}>
                            <div className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: "#fcd34d" }}>🚧 Возражения</div>
                            <p className="text-xs whitespace-pre-line" style={{ color: "#ede8ff" }}>{icp.objections}</p>
                          </div>
                        )}
                        {icp.messagingAngle && (
                          <div className="p-3 rounded-lg" style={{ background: "#13112a", borderLeft: "3px solid #f59e0b" }}>
                            <div className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: "#f59e0b" }}>💬 Messaging Angle</div>
                            <p className="text-xs whitespace-pre-line" style={{ color: "#ede8ff" }}>{icp.messagingAngle}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ICP best practices */}
          <div className="mt-6 rounded-xl p-5" style={{ background: "#0d0b18", border: "1px solid #1e1c38" }}>
            <h3 className="text-sm font-medium mb-3" style={{ color: "#ede8ff" }}>Как топ-компании определяют ICP</h3>
            <div className="grid grid-cols-3 gap-4 text-xs">
              {[
                { company: "Stripe", method: "Regression on best customers", insight: "Отобрали топ-10% клиентов → нашли 5 общих атрибутов → построили scoring model" },
                { company: "HubSpot", method: "Firmographic + behavioral scoring", insight: "Company size + industry + page visits + email opens = lead score. >80 = ICP" },
                { company: "Notion", method: "Bottoms-up PLG ICP", insight: "Первый ICP = один power user который делает invite. Вирусный цикл = ICP масштабируется сам" },
              ].map(c => (
                <div key={c.company} className="p-3 rounded-lg" style={{ background: "#13112a" }}>
                  <div className="font-semibold mb-1" style={{ color: "#f59e0b" }}>{c.company}</div>
                  <div className="font-medium mb-1" style={{ color: "#a78bfa" }}>{c.method}</div>
                  <div style={{ color: "#ede8ff" }}>{c.insight}</div>
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

