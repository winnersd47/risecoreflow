"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", description: "", channel: "", chatUrl: "", botUrl: "", siteUrl: "", wave: "Wave 1",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      router.push(`/projects/${data.id}`);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    background: "#0d0b18",
    border: "1px solid #1e1c38",
    borderRadius: "0.5rem",
    padding: "0.625rem 1rem",
    fontSize: "0.875rem",
    color: "#ede8ff",
    outline: "none",
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto" style={{ background: "#07060d" }}>
        <div className="max-w-2xl mx-auto px-8 py-8">
          <div className="flex items-center gap-3 mb-8">
            <Link href="/projects">
              <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button>
            </Link>
            <h1 className="text-xl font-semibold" style={{ color: "#ede8ff" }}>Новый проект</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Field label="Название проекта *">
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="OmniMindFlow" style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = "rgba(245,158,11,0.5)"; }}
                onBlur={(e) => { e.target.style.borderColor = "#1e1c38"; }} />
            </Field>

            <Field label="Описание">
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="AI-операционная система для профессионалов..." rows={3}
                style={{ ...inputStyle, resize: "none" }}
                onFocus={(e) => { e.target.style.borderColor = "rgba(245,158,11,0.5)"; }}
                onBlur={(e) => { e.target.style.borderColor = "#1e1c38"; }} />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Telegram-канал">
                <input value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })}
                  placeholder="@OmniMindFlow" style={inputStyle}
                  onFocus={(e) => { e.target.style.borderColor = "rgba(245,158,11,0.5)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "#1e1c38"; }} />
              </Field>
              <Field label="Волна">
                <select value={form.wave} onChange={(e) => setForm({ ...form, wave: e.target.value })}
                  style={inputStyle}
                  onFocus={(e) => { e.target.style.borderColor = "rgba(245,158,11,0.5)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "#1e1c38"; }}>
                  <option>Wave 1</option>
                  <option>Wave 2</option>
                  <option>Wave 3</option>
                </select>
              </Field>
            </div>

            <Field label="Сайт">
              <input value={form.siteUrl} onChange={(e) => setForm({ ...form, siteUrl: e.target.value })}
                placeholder="omnimindflow.com" style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = "rgba(245,158,11,0.5)"; }}
                onBlur={(e) => { e.target.style.borderColor = "#1e1c38"; }} />
            </Field>

            <div className="pt-4 flex gap-3">
              <Button type="submit" disabled={loading} size="lg">
                {loading ? "Создаю..." : "Создать проект"}
              </Button>
              <Link href="/projects"><Button variant="secondary" size="lg">Отмена</Button></Link>
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
      <label className="block text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: "#6b6885" }}>
        {label}
      </label>
      {children}
    </div>
  );
}
