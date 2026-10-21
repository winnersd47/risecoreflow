export const dynamic = "force-static"
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/plan-guard";
import { completeDemo } from "@/lib/yookassa";

export async function POST(req: NextRequest) {
  const { res } = await requireAuth();
  if (res) return res;

  try {
    const { paymentId } = await req.json();
    if (!paymentId)
      return NextResponse.json({ error: "paymentId обязателен" }, { status: 400 });

    const result = completeDemo(paymentId);
    if (!result.ok)
      return NextResponse.json({ error: result.error }, { status: 404 });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
