export const dynamic = "force-static"
import { NextResponse } from "next/server";
import { PLAN_CONFIG } from "@/lib/yookassa";

export async function GET() {
  const plans = Object.entries(PLAN_CONFIG).map(([key, c]) => ({
    key,
    plan: c.plan,
    period: c.period,
    amount: c.amount,
    currency: "RUB",
    days: c.days,
    label: c.label,
  }));
  return NextResponse.json({ plans, demo: !(process.env.YOOKASSA_SHOP_ID && process.env.YOOKASSA_SECRET_KEY) });
}
