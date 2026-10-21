"use client"
import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ day: "", title: "", profile: "all", type: "education", status: "draft", cta: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, day: +form.day, projectId: id }),
      });
      const data = await res.json();
      router.push(`/projects/${id}/content/${data.id}`);
    } catch (err) { console.error(err); setLoading(false); }
  };

  const sel = { width: "100%", background: "#13112a", border: "1px solid #1e1c38", borderRadius: "0.5rem", padding: "0.625rem 1rem", fontSize: "0.875rem", color: "#ede8ff", outline: "none" };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar projectId={id} />
      <main className="flex-1 overflow-y-auto" style={{ background: "#07060d" }}>
        <div className="max-w-2xl mx-auto px-8 py-8">
          <div className="flex items-center gap-3 mb-8">
            <Link href={`/projects/${id}/content`}><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button></Link>
            <h1 className="text-xl font-semibold" style={{ color: "#ede8ff" }}>Новый пост</h1>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Field label="День *">
                <input required type="number" min="1" max="100" value={form.day}
                  onChange={e => setForm({ ...form, day: e.target.value })} placeholder="1" className="input-field"
                  onFocus={e => (e.target.style.borderColor = "rgba(245,158,11,0.5)")}
                  onBlur={e => (e.target.style.borderColor = "#1e1c38")} />
              </Field>
              <Field label="Профиль">
                <select value={form.profile} onChange={e => setForm({ ...form, profile: e.target.value })} style={sel}>
                  <option value="all">Все профили</option>
                  <option value="developer">Developer</option>
                  <option value="founder">Founder</option>
                  <option value="pm">Product Manager</option>
                  <option value="crypto">Крипто-трейдер</option>
                  <option value="investor">Инвестор MOEX</option>
                  <option value="trader">Трейдер</option>
                  <option value="beginner">Начинающий</option>
                </select>
              </Field>
            </div>
            <Field label="Тема поста *">
              <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="Developer — AI code review за 30 секунд" className="input-field"
                onFocus={e => (e.target.style.borderColor = "rgba(245,158,11,0.5)")}
                onBlur={e => (e.target.style.borderColor = "#1e1c38")} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Тип">
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={sel}>
                  <option value="education">Образование</option>
                  <option value="proof">Доказательство</option>
                  <option value="community">Комьюнити</option>
                  <option value="pain">Боль</option>
                  <option value="conversion">Конверсия</option>
                  <option value="data">Данные</option>
                </select>
              </Field>
              <Field label="Статус">
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={sel}>
                  <option value="draft">Черновик</option>
                  <option value="ready">Готов</option>
                  <option value="published">Опубликован</option>
                </select>
              </Field>
            </div>
            <Field label="CTA-ссылка">
              <input value={form.cta} onChange={e => setForm({ ...form, cta: e.target.value })}
                placeholder="yoursite.com" className="input-field"
                onFocus={e => (e.target.style.borderColor = "rgba(245,158,11,0.5)")}
                onBlur={e => (e.target.style.borderColor = "#1e1c38")} />
            </Field>
            <div className="pt-2 flex gap-3">
              <Button type="submit" disabled={loading} size="lg">{loading ? "Создаю..." : "Создать пост"}</Button>
              <Link href={`/projects/${id}/content`}><Button variant="secondary" size="lg">Отмена</Button></Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: "#6b6885" }}>{label}</label>
      {children}
    </div>
  );
}

