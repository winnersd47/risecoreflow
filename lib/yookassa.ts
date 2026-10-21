import crypto from "crypto";

export type PaymentPlan = "pro" | "agency";
export type PaymentPeriod = "monthly" | "annual";

export const PLAN_CONFIG: Record<`${PaymentPlan}_${PaymentPeriod}`, {
  plan: PaymentPlan; period: PaymentPeriod; amount: number; days: number; label: string;
}> = {
  pro_monthly:     { plan: "pro",    period: "monthly", amount: 2990,  days: 30,  label: "Pro — Месяц" },
  pro_annual:      { plan: "pro",    period: "annual",  amount: 23880, days: 365, label: "Pro — Год (1 990 ₽/мес)" },
  agency_monthly:  { plan: "agency", period: "monthly", amount: 9990,  days: 30,  label: "Agency — Месяц" },
  agency_annual:   { plan: "agency", period: "annual",  amount: 95880, days: 365, label: "Agency — Год (7 990 ₽/мес)" },
};

export async function createPayment(
  userId: string,
  planKey: keyof typeof PLAN_CONFIG,
  returnUrl: string
): Promise<{ paymentUrl: string; paymentId: string; demo: boolean; amount: number }> {
  const config = PLAN_CONFIG[planKey];
  if (!config) throw new Error("Неверный тарифный план");
  const demoTxId = `demo_${userId.slice(0, 8)}_${crypto.randomUUID().slice(0, 8)}`;
  return {
    paymentUrl: `${returnUrl}?payment_id=${demoTxId}&demo=1`,
    paymentId: demoTxId,
    demo: true,
    amount: config.amount,
  };
}

export function completeDemo(txId: string): { ok: boolean; plan?: string; days?: number; error?: string } {
  return { ok: false, error: "Оплата недоступна в демо-режиме" };
}

export function handleWebhook(body: any): { ok: boolean } {
  return { ok: true };
}

export function getPaymentHistory(userId: string, skip = 0, limit = 20) {
  return { total: 0, items: [] };
}
