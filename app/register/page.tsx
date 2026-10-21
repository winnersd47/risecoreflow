"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { TrendingUp, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Suspense } from "react";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({ email: "", username: "", password: "", referralCode: searchParams.get("ref") ?? "", promoCode: searchParams.get("promo") ?? "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); setLoading(false); return; }
      router.push("/projects");
    } catch { setError("Ошибка сети"); setLoading(false); }
  };

  const inp = { width: "100%", background: "#0d0b18", border: "1px solid #1e1c38", borderRadius: "0.5rem", padding: "0.75rem 1rem", fontSize: "0.875rem", color: "#ede8ff", outline: "none" };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#07060d" }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/">
            <div className="inline-flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #f59e0b22, #6366f122)", border: "1px solid #f59e0b44" }}>
                <TrendingUp className="w-5 h-5" style={{ color: "#f59e0b" }} />
              </div>
              <span className="font-bold text-lg"
                style={{ background: "linear-gradient(90deg, #f59e0b, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                RiseCoreFlow
              </span>
            </div>
          </Link>
          <h1 className="text-2xl font-bold" style={{ color: "#ede8ff" }}>Создай аккаунт</h1>
          <p className="text-sm mt-1" style={{ color: "#6b6885" }}>Бесплатно · Без карты</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider mb-1.5" style={{ color: "#6b6885" }}>Email</label>
            <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="you@company.com" style={inp}
              onFocus={e => (e.target.style.borderColor = "rgba(245,158,11,0.5)")}
              onBlur={e => (e.target.style.borderColor = "#1e1c38")} />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider mb-1.5" style={{ color: "#6b6885" }}>Имя пользователя</label>
            <input required value={form.username} onChange={e => setForm({ ...form, username: e.target.value })}
              placeholder="yourname" style={inp}
              onFocus={e => (e.target.style.borderColor = "rgba(245,158,11,0.5)")}
              onBlur={e => (e.target.style.borderColor = "#1e1c38")} />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider mb-1.5" style={{ color: "#6b6885" }}>Пароль</label>
            <div className="relative">
              <input type={showPwd ? "text" : "password"} required value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="минимум 6 символов" style={{ ...inp, paddingRight: "2.5rem" }}
                onFocus={e => (e.target.style.borderColor = "rgba(245,158,11,0.5)")}
                onBlur={e => (e.target.style.borderColor = "#1e1c38")} />
              <button type="button" onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2">
                {showPwd ? <EyeOff className="w-4 h-4" style={{ color: "#6b6885" }} /> : <Eye className="w-4 h-4" style={{ color: "#6b6885" }} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider mb-1.5" style={{ color: "#6b6885" }}>
              Промокод <span style={{ color: "#3d3a5c" }}>(необязательно)</span>
            </label>
            <input value={form.promoCode} onChange={e => setForm({ ...form, promoCode: e.target.value.toUpperCase() })}
              placeholder="RISECOREFLOW" style={{ ...inp, borderColor: form.promoCode ? "rgba(245,158,11,0.4)" : "#1e1c38" }}
              onFocus={e => (e.target.style.borderColor = "rgba(245,158,11,0.5)")}
              onBlur={e => (e.target.style.borderColor = form.promoCode ? "rgba(245,158,11,0.4)" : "#1e1c38")} />
            {form.promoCode === "RISECOREFLOW" && (
              <div className="text-[10px] mt-1" style={{ color: "#86efac" }}>✓ 30 дней Pro бесплатно</div>
            )}
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider mb-1.5" style={{ color: "#6b6885" }}>
              Реферальный код <span style={{ color: "#3d3a5c" }}>(необязательно)</span>
            </label>
            <input value={form.referralCode} onChange={e => setForm({ ...form, referralCode: e.target.value.toUpperCase() })}
              placeholder="A3F9B2" style={inp}
              onFocus={e => (e.target.style.borderColor = "rgba(245,158,11,0.5)")}
              onBlur={e => (e.target.style.borderColor = "#1e1c38")} />
          </div>

          {error && <div className="text-xs p-3 rounded-lg" style={{ background: "rgba(239,68,68,0.1)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.2)" }}>{error}</div>}

          <div className="text-xs" style={{ color: "#3d3a5c" }}>
            Регистрируясь, ты соглашаешься с{" "}
            <Link href="/terms" className="underline" style={{ color: "#6b6885" }}>Terms of Service</Link>{" "}и{" "}
            <Link href="/privacy" className="underline" style={{ color: "#6b6885" }}>Privacy Policy</Link>.
          </div>

          <Button type="submit" disabled={loading} className="w-full" size="lg">
            {loading ? "Создаю аккаунт..." : "Создать аккаунт"}
          </Button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: "#6b6885" }}>
          Уже есть аккаунт?{" "}
          <Link href="/login" className="font-medium" style={{ color: "#f59e0b" }}>Войти</Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return <Suspense><RegisterForm /></Suspense>;
}
