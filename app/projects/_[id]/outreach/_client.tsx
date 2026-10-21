"use client"
import { useState, useEffect, use } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Plus, X, Mail, ExternalLink, Trash2 } from "lucide-react";

const TYPES = ["journalist", "influencer", "vp_channel", "community", "partner", "investor", "user"];
const TYPE_LABELS: Record<string, string> = {
  journalist: "Журналист", influencer: "Инфлюенсер", vp_channel: "ВП Канал",
  community: "Комьюнити", partner: "Партнёр", investor: "Инвестор", user: "Потенциальный юзер",
};
const TYPE_COLORS: Record<string, string> = {
  journalist: "#06b6d4", influencer: "#a78bfa", vp_channel: "#f59e0b",
  community: "#10b981", partner: "#6366f1", investor: "#fcd34d", user: "#86efac",
};

const STATUSES = ["identified", "outreached", "replied", "published", "converted", "declined"];
const STATUS_LABELS: Record<string, string> = {
  identified: "Найден", outreached: "Написали", replied: "Ответил",
  published: "Опубликовал", converted: "Конвертировал", declined: "Отказ",
};
const STATUS_COLORS: Record<string, string> = {
  identified: "#6b6885", outreached: "#6366f1", replied: "#f59e0b",
  published: "#10b981", converted: "#86efac", declined: "#fca5a5",
};

const PLATFORMS = ["telegram", "twitter", "linkedin", "email", "instagram", "youtube", "other"];

const TEMPLATES: Record<string, string> = {
  vp_channel: `Привет!

Меня зовут [Имя], я создатель [Продукт].

[1 конкретный факт о продукте который релевантен аудитории канала].

Предлагаю: [конкретный оффер — пост/интеграция/тест].

Аудитории это будет полезно, потому что [конкретная причина].

Статистика: [ваши метрики если есть].

Интересно обсудить?`,

  journalist: `Привет [Имя],

Коротко: мы создали [Продукт] — [одна строка что делает].

Почему это интересно вашей аудитории:
— [конкретный факт/цифра]
— [конкретный тренд который это решает]
— [уникальный угол для статьи]

У нас есть [демо/данные/кейс] который можно использовать.

Готов к короткому звонку или ответить на вопросы письменно.`,

  influencer: `Привет!

Читаю [канал/аккаунт] — нравится как вы [конкретное что нравится].

Мы создали [Продукт] и думаю вашей аудитории будет полезно, потому что [конкретная причина].

Предложение: [бесплатный доступ / партнёрство / коллаборация].

Если интересно — могу рассказать подробнее за 15 минут.`,

  community: `Привет всем!

Строю [Продукт] для [целевая аудитория этого комьюнити].

Ищу [early adopters / обратную связь / первых пользователей].

Что делает продукт: [1-2 конкретных пункта].

Дам бесплатный доступ первым [N] кто попробует и оставит фидбек.

Ссылка: [ссылка]`,
};

export default function OutreachPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [contacts, setContacts] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showTemplate, setShowTemplate] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [form, setForm] = useState({ name: "", type: "vp_channel", platform: "telegram", handle: "", audience: "", niche: "", nextAction: "", notes: "" });

  const load = () => fetch(`/api/outreach/${id}`).then(r => r.json()).then(setContacts);
  useEffect(() => { load(); }, [id]);

  const create = async () => {
    await fetch(`/api/outreach/${id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setShowForm(false);
    setForm({ name: "", type: "vp_channel", platform: "telegram", handle: "", audience: "", niche: "", nextAction: "", notes: "" });
    load();
  };

  const updateStatus = async (contactId: string, status: string) => {
    await fetch(`/api/outreach/${contactId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status, lastContact: new Date().toISOString().split("T")[0] }) });
    load();
  };

  const deleteContact = async (contactId: string) => {
    await fetch(`/api/outreach/${contactId}`, { method: "DELETE" });
    load();
  };

  const filtered = contacts.filter(c =>
    (filterStatus === "all" || c.status === filterStatus) &&
    (filterType === "all" || c.type === filterType)
  );

  // Pipeline stats
  const pipelineStats = STATUSES.map(s => ({ status: s, count: contacts.filter(c => c.status === s).length }));
  const conversionRate = contacts.length ? Math.round(contacts.filter(c => c.status === "converted").length / contacts.length * 100) : 0;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar projectId={id} />
      <main className="flex-1 overflow-y-auto" style={{ background: "#07060d" }}>
        <div className="max-w-5xl mx-auto px-8 py-8">

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-semibold" style={{ color: "#ede8ff" }}>Outreach CRM</h1>
              <p className="text-sm mt-1" style={{ color: "#6b6885" }}>Журналисты · Инфлюенсеры · ВП Каналы · Комьюнити · Партнёры</p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setShowTemplate(showTemplate ? null : "vp_channel")}>
                <Mail className="w-4 h-4" />Шаблоны
              </Button>
              <Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4" />Добавить контакт</Button>
            </div>
          </div>

          {/* Pipeline Kanban */}
          <div className="grid grid-cols-6 gap-2 mb-6">
            {pipelineStats.map(({ status, count }) => (
              <div key={status} className="rounded-xl p-3 text-center" style={{ background: "#0d0b18", border: `1px solid ${STATUS_COLORS[status]}33` }}>
                <div className="text-xl font-bold font-mono" style={{ color: STATUS_COLORS[status] }}>{count}</div>
                <div className="text-[10px] mt-0.5" style={{ color: "#6b6885" }}>{STATUS_LABELS[status]}</div>
              </div>
            ))}
          </div>

          {/* Template Panel */}
          {showTemplate && (
            <div className="rounded-xl p-5 mb-6" style={{ background: "#0d0b18", border: "1px solid rgba(245,158,11,0.3)" }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium" style={{ color: "#ede8ff" }}>Шаблоны питчей</h3>
                <button onClick={() => setShowTemplate(null)}><X className="w-4 h-4" style={{ color: "#6b6885" }} /></button>
              </div>
              <div className="flex gap-2 mb-4">
                {Object.keys(TEMPLATES).map(t => (
                  <button key={t} onClick={() => setShowTemplate(t)}
                    className="text-xs px-3 py-1.5 rounded-lg transition-all"
                    style={{ background: showTemplate === t ? "rgba(245,158,11,0.15)" : "#13112a", border: `1px solid ${showTemplate === t ? "rgba(245,158,11,0.4)" : "#1e1c38"}`, color: showTemplate === t ? "#f59e0b" : "#6b6885" }}>
                    {TYPE_LABELS[t]}
                  </button>
                ))}
              </div>
              <pre className="text-xs leading-relaxed rounded-lg p-4 whitespace-pre-wrap font-mono" style={{ background: "#13112a", color: "#ede8ff" }}>
                {TEMPLATES[showTemplate]}
              </pre>
              <Button size="sm" variant="secondary" className="mt-3" onClick={() => navigator.clipboard.writeText(TEMPLATES[showTemplate])}>Скопировать</Button>
            </div>
          )}

          {/* Add contact form */}
          {showForm && (
            <div className="rounded-xl p-5 mb-6" style={{ background: "#0d0b18", border: "1px solid rgba(245,158,11,0.3)" }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium" style={{ color: "#ede8ff" }}>Новый контакт</h3>
                <button onClick={() => setShowForm(false)}><X className="w-4 h-4" style={{ color: "#6b6885" }} /></button>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <Field label="Имя / Название">
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="@techblogger" className="input-field" />
                </Field>
                <Field label="Тип">
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="input-field">
                    {TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
                  </select>
                </Field>
                <Field label="Платформа">
                  <select value={form.platform} onChange={e => setForm({ ...form, platform: e.target.value })} className="input-field">
                    {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </Field>
                <Field label="Handle / Email">
                  <input value={form.handle} onChange={e => setForm({ ...form, handle: e.target.value })} placeholder="@username или email" className="input-field" />
                </Field>
                <Field label="Аудитория">
                  <input value={form.audience} onChange={e => setForm({ ...form, audience: e.target.value })} placeholder="5000 подписчиков" className="input-field" />
                </Field>
                <Field label="Ниша">
                  <input value={form.niche} onChange={e => setForm({ ...form, niche: e.target.value })} placeholder="SaaS, стартапы, dev..." className="input-field" />
                </Field>
              </div>
              <Field label="Следующий шаг">
                <input value={form.nextAction} onChange={e => setForm({ ...form, nextAction: e.target.value })} placeholder="Написать питч до пятницы" className="input-field mb-3" />
              </Field>
              <Field label="Заметки">
                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} className="input-field resize-none" placeholder="Любые детали о контакте..." />
              </Field>
              <div className="flex gap-3 mt-4">
                <Button onClick={create} disabled={!form.name}>Добавить</Button>
                <Button variant="secondary" onClick={() => setShowForm(false)}>Отмена</Button>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="flex gap-2 mb-4 flex-wrap">
            <button onClick={() => setFilterStatus("all")} className="text-xs px-3 py-1.5 rounded-lg" style={{ background: filterStatus === "all" ? "rgba(245,158,11,0.15)" : "#13112a", border: `1px solid ${filterStatus === "all" ? "rgba(245,158,11,0.4)" : "#1e1c38"}`, color: filterStatus === "all" ? "#f59e0b" : "#6b6885" }}>Все</button>
            {STATUSES.map(s => (
              <button key={s} onClick={() => setFilterStatus(s)} className="text-xs px-3 py-1.5 rounded-lg" style={{ background: filterStatus === s ? STATUS_COLORS[s] + "22" : "#13112a", border: `1px solid ${filterStatus === s ? STATUS_COLORS[s] + "66" : "#1e1c38"}`, color: filterStatus === s ? STATUS_COLORS[s] : "#6b6885" }}>
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>

          {/* Contacts Table */}
          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #1e1c38" }}>
            <table className="w-full">
              <thead>
                <tr style={{ background: "#0d0b18", borderBottom: "1px solid #1e1c38" }}>
                  {["Контакт", "Тип", "Платформа", "Аудитория", "Статус", "Следующий шаг", ""].map(h => (
                    <th key={h} className="text-left text-xs font-medium px-4 py-3" style={{ color: "#3d3a5c" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-10 text-center text-sm" style={{ color: "#6b6885" }}>
                    {contacts.length === 0 ? "Добавь первый контакт для аутрича" : "Нет контактов в этом фильтре"}
                  </td></tr>
                )}
                {filtered.map((c, i) => {
                  const tc = TYPE_COLORS[c.type] ?? "#6b6885";
                  const sc = STATUS_COLORS[c.status] ?? "#6b6885";
                  return (
                    <tr key={c.id} className="hover-row border-b" style={{ borderColor: "#1e1c38", background: "#07060d" }}>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium" style={{ color: "#ede8ff" }}>{c.name}</div>
                        {c.handle && <div className="text-xs" style={{ color: "#6b6885" }}>{c.handle}</div>}
                        {c.niche && <div className="text-[10px]" style={{ color: "#3d3a5c" }}>{c.niche}</div>}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-0.5 rounded-md" style={{ color: tc, background: tc + "18", border: `1px solid ${tc}44` }}>{TYPE_LABELS[c.type]}</span>
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: "#6b6885" }}>{c.platform}</td>
                      <td className="px-4 py-3 text-xs font-mono" style={{ color: "#ede8ff" }}>{c.audience || "—"}</td>
                      <td className="px-4 py-3">
                        <select value={c.status} onChange={e => updateStatus(c.id, e.target.value)}
                          className="text-xs rounded px-2 py-1" style={{ background: sc + "18", border: `1px solid ${sc}44`, color: sc }}>
                          {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: "#6b6885" }}>{c.nextAction || "—"}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => deleteContact(c.id)} className="opacity-30 hover:opacity-100 transition-opacity">
                          <Trash2 className="w-3.5 h-3.5" style={{ color: "#fca5a5" }} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Outreach best practices */}
          <div className="mt-6 rounded-xl p-5" style={{ background: "#0d0b18", border: "1px solid #1e1c38" }}>
            <h3 className="text-sm font-medium mb-3" style={{ color: "#ede8ff" }}>Что реально работает в аутриче — от основателей топ-стартапов</h3>
            <div className="grid grid-cols-3 gap-4 text-xs">
              {[
                { rule: "Один факт лучше трёх преимуществ", detail: "«1 284 сигнала проанализированы» лучше чем «мощная AI-платформа с уникальными возможностями»", author: "Superhuman launch" },
                { rule: "Персонализация — 1 деталь о них", detail: "«Читал ваш пост о X» открывает письма в 3x чаще чем шаблонное «мы создали отличный продукт»", author: "Notion growth team" },
                { rule: "Follow-up через 5 дней = +40% ответов", detail: "Большинство не отвечают не потому что отказывают — они просто пропустили первое сообщение", author: "Gong Research 2024" },
              ].map(r => (
                <div key={r.rule} className="p-3 rounded-lg" style={{ background: "#13112a" }}>
                  <div className="font-semibold mb-1" style={{ color: "#f59e0b" }}>{r.rule}</div>
                  <div className="mb-1" style={{ color: "#ede8ff" }}>{r.detail}</div>
                  <div className="text-[10px] italic" style={{ color: "#3d3a5c" }}>{r.author}</div>
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

