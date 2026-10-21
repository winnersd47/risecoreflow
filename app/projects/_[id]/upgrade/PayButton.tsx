"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function PayButton({
  planKey,
  label,
  style,
  className,
}: {
  planKey: string;
  label: string;
  style?: React.CSSProperties;
  className?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const router = useRouter();

  async function handlePay() {
    setLoading(true);
    setMsg("");
    try {
      const res = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planKey, returnUrl: window.location.href }),
      });
      const data = await res.json();
      if (!res.ok) { setMsg(data.error ?? "Ошибка"); return; }

      if (data.demo) {
        const cr = await fetch("/api/payments/complete-demo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentId: data.paymentId }),
        });
        const cd = await cr.json();
        if (cd.ok) {
          setMsg(`✅ Pro активирован на ${cd.days} дней!`);
          setTimeout(() => router.refresh(), 1500);
        } else {
          setMsg(cd.error ?? "Ошибка");
        }
      } else {
        window.location.href = data.paymentUrl;
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button onClick={handlePay} disabled={loading} className={className} style={style}>
        {loading ? "Обработка..." : label}
      </button>
      {msg && (
        <p style={{ marginTop: 6, fontSize: 12, textAlign: "center", color: msg.startsWith("✅") ? "#4ade80" : "#ef4444" }}>
          {msg}
        </p>
      )}
    </div>
  );
}
