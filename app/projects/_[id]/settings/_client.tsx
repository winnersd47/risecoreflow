"use client"
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Save, Trash2, ExternalLink, AlertTriangle } from "lucide-react";

export default function SettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [project, setProject] = useState<any>(null);
  const [form, setForm] = useState({ name: "", description: "", channel: "", botUrl: "", siteUrl: "", wave: "Wave 1" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  useEffect(() => {
    fetch(`/api/projects/${id}`).then(r => r.json()).then(p => {
      setProject(p);
      setForm({ name: p.name || "", description: p.description || "", channel: p.channel || "", botUrl: p.botUrl || "", siteUrl: p.siteUrl || "", wave: p.wave || "Wave 1" });
    });
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    await fetch(`/api/projects/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setSaved(true); setSaving(false);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDelete = async () => {
    if (deleteConfirm !== project?.name) return;
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    router.push("/projects");
  };

  const inp = { width: "100%", background: "#0d0b18", border: "1px solid #1e1c38", borderRadius: "0.5rem", padding: "0.625rem 1rem", fontSize: "0.875rem", color: "#ede8ff", outline: "none" };

  if (!project) return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar projectId={id} />
      <main className="flex-1 flex items-center justify-center" style={{ background: "#07060d" }}>
        <div className="text-sm" style={{ color: "#6b6885" }}>Загрузка...</div>
      </main>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar projectId={id} />
      <main className="flex-1 overflow-y-auto" style={{ background: "#07060d" }}>
        <div className="max-w-2xl mx-auto px-8 py-8">

          <div className="mb-8">
            <h1 className="text-xl font-semibold" style={{ color: "#ede8ff" }}>Настройки проекта</h1>
            <p className="text-sm mt-1" style={{ color: "#6b6885" }}>{project.name}</p>
          </div>

          {/* Main settings */}
          <div className="rounded-xl p-6 mb-6" style={{ background: "#0d0b18", border: "1px solid #1e1c38" }}>
            <h2 className="text-sm font-semibold mb-5" style={{ color: "#ede8ff" }}>Основные данные</h2>
            <div className="space-y-4">
              <Field label="Название проекта *">
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inp}
                  onFocus={e => (e.target.style.borderColor = "rgba(245,158,11,0.5)")}
                  onBlur={e => (e.target.style.borderColor = "#1e1c38")} />
              </Field>
              <Field label="Описание">
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  rows={3} style={{ ...inp, resize: "none" }}
                  onFocus={e => (e.target.style.borderColor = "rgba(245,158,11,0.5)")}
                  onBlur={e => (e.target.style.borderColor = "#1e1c38")} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Telegram-канал">
                  <input value={form.channel} onChange={e => setForm({ ...form, channel: e.target.value })}
                    placeholder="@YourChannel" style={inp}
                    onFocus={e => (e.target.style.borderColor = "rgba(245,158,11,0.5)")}
                    onBlur={e => (e.target.style.borderColor = "#1e1c38")} />
                </Field>
                <Field label="Telegram-бот">
                  <input value={form.botUrl} onChange={e => setForm({ ...form, botUrl: e.target.value })}
                    placeholder="@YourBot" style={inp}
                    onFocus={e => (e.target.style.borderColor = "rgba(245,158,11,0.5)")}
                    onBlur={e => (e.target.style.borderColor = "#1e1c38")} />
                </Field>
                <Field label="Сайт">
                  <input value={form.siteUrl} onChange={e => setForm({ ...form, siteUrl: e.target.value })}
                    placeholder="yoursite.com" style={inp}
                    onFocus={e => (e.target.style.borderColor = "rgba(245,158,11,0.5)")}
                    onBlur={e => (e.target.style.borderColor = "#1e1c38")} />
                </Field>
                <Field label="Волна">
                  <select value={form.wave} onChange={e => setForm({ ...form, wave: e.target.value })}
                    style={{ ...inp, cursor: "pointer" }}>
                    {["Wave 1","Wave 2","Wave 3","Wave 4","Wave 5"].map(w => <option key={w}>{w}</option>)}
                  </select>
                </Field>
              </div>
              <Button onClick={handleSave} disabled={saving || !form.name}>
                <Save className="w-4 h-4" />
                {saving ? "Сохраняю..." : saved ? "✓ Сохранено" : "Сохранить изменения"}
              </Button>
            </div>
          </div>

          {/* AI Settings link */}
          <div className="rounded-xl p-5 mb-6" style={{ background: "#0d0b18", border: "1px solid #1e1c38" }}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold mb-1" style={{ color: "#ede8ff" }}>Настройки AI</h2>
                <p className="text-xs" style={{ color: "#6b6885" }}>Gemini API ключ, Claude API ключ, активный движок</p>
              </div>
              <a href="/settings/ai" className="text-xs flex items-center gap-1.5 px-3 py-2 rounded-lg"
                style={{ background: "#13112a", border: "1px solid #1e1c38", color: "#f59e0b" }}>
                Настроить <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Danger zone */}
          <div className="rounded-xl p-5" style={{ background: "#0d0b18", border: "1px solid rgba(239,68,68,0.2)" }}>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4" style={{ color: "#fca5a5" }} />
              <h2 className="text-sm font-semibold" style={{ color: "#fca5a5" }}>Опасная зона</h2>
            </div>
            {!showDelete ? (
              <div className="flex items-center justify-between">
                <p className="text-xs" style={{ color: "#6b6885" }}>Удалить проект и все его данные (посты, задачи, метрики). Необратимо.</p>
                <Button variant="danger" size="sm" onClick={() => setShowDelete(true)}>
                  <Trash2 className="w-3.5 h-3.5" /> Удалить
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs" style={{ color: "#fca5a5" }}>
                  Введи название проекта <strong>{project.name}</strong> для подтверждения:
                </p>
                <input value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)}
                  placeholder={project.name} style={{ ...inp, borderColor: "rgba(239,68,68,0.3)" }} />
                <div className="flex gap-2">
                  <Button variant="danger" onClick={handleDelete} disabled={deleteConfirm !== project.name}>
                    Удалить навсегда
                  </Button>
                  <Button variant="secondary" onClick={() => { setShowDelete(false); setDeleteConfirm(""); }}>
                    Отмена
                  </Button>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5 uppercase tracking-wider" style={{ color: "#6b6885" }}>{label}</label>
      {children}
    </div>
  );
}

