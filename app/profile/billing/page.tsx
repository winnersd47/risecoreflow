"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type PlanInfo = { key: string; plan: string; period: string; amount: number; days: number; label: string };
type Payment = { id: string; plan: string; period: string; amount: number; status: string; createdAt: string; txId: string };

const PERIOD_LABELS: Record<string, string> = { monthly: "месяц", annual: "год" };
const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending:  { label: "Ожидает", color: "#f59e0b" },
  paid:     { label: "Оплачен", color: "#10b981" },
  failed:   { label: "Ошибка",  color: "#ef4444" },
  refunded: { label: "Возврат", color: "#6366f1" },
};

export default function BillingPage() {
  const router = useRouter();
  const [user, setUser]       = useState<any>(null);
  const [plans, setPlans]     = useState<PlanInfo[]>([]);
  const [history, setHistory] = useState<Payment[]>([]);
  const [demo, setDemo]       = useState(true);
  const [promoCode, setPromoCode] = useState("");
  const [promoMsg, setPromoMsg]   = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [msg, setMsg]         = useState("");

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => { if (d.id) setUser(d); else router.push("/login"); });
    fetch("/api/payments/plans").then(r => r.json()).then(d => { setPlans(d.plans ?? []); setDemo(d.demo); });
    fetch("/api/payments/history").then(r => r.json()).then(d => setHistory(d.items ?? []));
  }, []);

  async function handlePay(planKey: string) {
    setLoading(planKey);
    setMsg("");
    try {
      const res = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planKey, returnUrl: window.location.href + "?success=1" }),
      });
      const data = await res.json();
      if (!res.ok) { setMsg(data.error ?? "Ошибка"); setLoading(null); return; }

      if (data.demo) {
        // Demo: complete immediately
        const cr = await fetch("/api/payments/complete-demo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentId: data.paymentId }),
        });
        const cd = await cr.json();
        if (cd.ok) {
          setMsg(`✅ Demo: ${cd.plan} активирован на ${cd.days} дней!`);
          setTimeout(() => window.location.reload(), 1500);
        } else {
          setMsg(cd.error ?? "Ошибка");
        }
      } else {
        window.location.href = data.paymentUrl;
      }
    } finally {
      setLoading(null);
    }
  }

  async function handlePromo() {
    setPromoMsg("");
    const res = await fetch("/api/payments/activate-promo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: promoCode }),
    });
    const d = await res.json();
    if (d.ok) { setPromoMsg(`✅ +${d.days} дней Pro!`); setTimeout(() => window.location.reload(), 1500); }
    else setPromoMsg(`❌ ${d.error}`);
  }

  const proPlan    = plans.filter(p => p.plan === "pro");
  const agencyPlan = plans.filter(p => p.plan === "agency");
  const isPro      = user?.plan === "pro" || user?.plan === "agency";

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "40px 24px", color: "#ede8ff" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Подписка и оплата</h1>
      <p style={{ color: "#9ca3af", marginBottom: 32 }}>
        Текущий план: <strong style={{ color: "#f59e0b" }}>{user?.plan ?? "..."}</strong>
        {user?.planExpiresAt && (
          <span style={{ marginLeft: 12, color: "#6b7280" }}>
            до {new Date(user.planExpiresAt).toLocaleDateString("ru-RU")}
          </span>
        )}
        {demo && <span style={{ marginLeft: 16, fontSize: 12, background: "#1e1b4b", color: "#818cf8", padding: "2px 8px", borderRadius: 4 }}>DEMO-режим</span>}
      </p>

      {msg && <div style={{ background: "#1c1917", border: "1px solid #f59e0b", borderRadius: 8, padding: "12px 16px", marginBottom: 24, color: "#f59e0b" }}>{msg}</div>}

      {/* Plans */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 40 }}>
        {[proPlan, agencyPlan].map(group => (
          group.map(p => (
            <div key={p.key} style={{ background: "#0f0e1a", border: `1px solid ${p.plan === "pro" ? "#6366f1" : "#f59e0b"}`, borderRadius: 12, padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 18, color: p.plan === "pro" ? "#818cf8" : "#f59e0b" }}>
                  {p.plan === "pro" ? "Pro" : "Agency"} — {PERIOD_LABELS[p.period]}
                </span>
                {p.period === "annual" && (
                  <span style={{ fontSize: 11, background: "#14532d", color: "#4ade80", padding: "2px 8px", borderRadius: 4 }}>-33%</span>
                )}
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
                {p.amount.toLocaleString("ru-RU")} ₽
              </div>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 20 }}>
                {p.period === "annual"
                  ? `${(p.amount / 12).toLocaleString("ru-RU")} ₽/мес при годовой оплате`
                  : "в месяц"}
              </div>
              <button
                onClick={() => handlePay(p.key)}
                disabled={loading === p.key || (isPro && user?.plan === p.plan)}
                style={{
                  width: "100%", padding: "10px 0", borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: "pointer",
                  background: loading === p.key ? "#374151" : (isPro && user?.plan === p.plan ? "#1f2937" : p.plan === "pro" ? "#6366f1" : "#d97706"),
                  color: "#fff", border: "none",
                }}
              >
                {loading === p.key ? "Обработка..." : isPro && user?.plan === p.plan ? "Активен" : demo ? "Тест-оплата" : "Оплатить"}
              </button>
            </div>
          ))
        ))}
      </div>

      {/* Promo code */}
      <div style={{ background: "#0f0e1a", border: "1px solid #1f2937", borderRadius: 12, padding: 24, marginBottom: 40 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Промокод</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={promoCode}
            onChange={e => setPromoCode(e.target.value)}
            placeholder="WELCOME7"
            style={{ flex: 1, background: "#07060d", border: "1px solid #374151", borderRadius: 8, padding: "8px 12px", color: "#ede8ff", fontSize: 14 }}
          />
          <button
            onClick={handlePromo}
            style={{ background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, padding: "8px 20px", fontWeight: 600, cursor: "pointer" }}
          >
            Применить
          </button>
        </div>
        {promoMsg && <p style={{ marginTop: 8, fontSize: 13, color: promoMsg.startsWith("✅") ? "#4ade80" : "#ef4444" }}>{promoMsg}</p>}
        <p style={{ marginTop: 8, fontSize: 12, color: "#4b5563" }}>Попробуй: WELCOME7 · TRIAL3 · RISECOREFLOW</p>
      </div>

      {/* Payment history */}
      <div>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>История платежей</h2>
        {history.length === 0 ? (
          <p style={{ color: "#4b5563", fontSize: 14 }}>Платежей пока нет</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {history.map(p => {
              const s = STATUS_LABELS[p.status] ?? { label: p.status, color: "#9ca3af" };
              return (
                <div key={p.id} style={{ background: "#0f0e1a", border: "1px solid #1f2937", borderRadius: 8, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontWeight: 600, textTransform: "capitalize" }}>{p.plan}</span>
                    <span style={{ color: "#6b7280", fontSize: 13, marginLeft: 8 }}>{PERIOD_LABELS[p.period] ?? p.period}</span>
                  </div>
                  <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                    <span style={{ fontSize: 15, fontWeight: 600 }}>{p.amount.toLocaleString("ru-RU")} ₽</span>
                    <span style={{ fontSize: 12, color: s.color, background: s.color + "20", padding: "2px 8px", borderRadius: 4 }}>{s.label}</span>
                    <span style={{ fontSize: 12, color: "#4b5563" }}>{new Date(p.createdAt).toLocaleDateString("ru-RU")}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {demo && (
        <div style={{ marginTop: 32, padding: 16, background: "#1c1917", borderRadius: 8, fontSize: 13, color: "#9ca3af" }}>
          <strong style={{ color: "#f59e0b" }}>Demo-режим:</strong> реальные платежи отключены. Добавь{" "}
          <code style={{ color: "#818cf8" }}>YOOKASSA_SHOP_ID</code> и{" "}
          <code style={{ color: "#818cf8" }}>YOOKASSA_SECRET_KEY</code> в .env для включения ЮKassa.
          <br />Webhook URL для production: <code style={{ color: "#6ee7b7" }}>{process.env.NEXT_PUBLIC_APP_URL}/api/payments/webhook</code>
        </div>
      )}
    </div>
  );
}
