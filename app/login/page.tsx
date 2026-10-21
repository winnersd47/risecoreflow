"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TrendingUp, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

const DEMO_USERS: Record<string, { plan: string; username: string }> = {
  "victorysd.95@gmail.com:Victory123!": { plan: "agency", username: "victorysd" },
  "winnersd@gmail.com:Admin123!":        { plan: "agency", username: "admin" },
};

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");

    const key = `${form.email.toLowerCase().trim()}:${form.password}`;
    const user = DEMO_USERS[key];

    if (!user) {
      setError("Неверный email или пароль");
      setLoading(false);
      return;
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("rcf_auth", JSON.stringify({
        email: form.email.toLowerCase().trim(),
        username: user.username,
        plan: user.plan,
        ts: Date.now(),
      }));
    }

    router.push("/projects");
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
          <h1 className="text-2xl font-bold" style={{ color: "#ede8ff" }}>Добро пожаловать</h1>
          <p className="text-sm mt-1" style={{ color: "#6b6885" }}>Войди в свой аккаунт</p>
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
            <label className="block text-xs uppercase tracking-wider mb-1.5" style={{ color: "#6b6885" }}>Пароль</label>
            <div className="relative">
              <input type={showPwd ? "text" : "password"} required value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••" style={{ ...inp, paddingRight: "2.5rem" }}
                onFocus={e => (e.target.style.borderColor = "rgba(245,158,11,0.5)")}
                onBlur={e => (e.target.style.borderColor = "#1e1c38")} />
              <button type="button" onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2">
                {showPwd ? <EyeOff className="w-4 h-4" style={{ color: "#6b6885" }} /> : <Eye className="w-4 h-4" style={{ color: "#6b6885" }} />}
              </button>
            </div>
          </div>

          {error && <div className="text-xs p-3 rounded-lg" style={{ background: "rgba(239,68,68,0.1)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.2)" }}>{error}</div>}

          <Button type="submit" disabled={loading} className="w-full" size="lg">
            {loading ? "Входим..." : "Войти"}
          </Button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: "#6b6885" }}>
          Нет аккаунта?{" "}
          <Link href="/register" className="font-medium" style={{ color: "#f59e0b" }}>
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  );
}
