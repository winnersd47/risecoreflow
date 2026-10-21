export const dynamic = "force-static"
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/plan-guard";
import { createPayment, PLAN_CONFIG } from "@/lib/yookassa";

export async function POST(req: NextRequest) {
  const { user, res } = await requireAuth();
  if (res) return res;

  try {
    const { planKey, returnUrl } = await req.json();

    if (!planKey || !(planKey in PLAN_CONFIG))
      return NextResponse.json({ error: "Укажи корректный тарифный план" }, { status: 400 });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3050";
    const redirect = returnUrl ?? `${appUrl}/projects`;

    const result = await createPayment(user!.id, planKey, redirect);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("[checkout]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
