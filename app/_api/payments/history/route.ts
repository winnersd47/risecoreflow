export const dynamic = "force-static"
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/plan-guard";
import { getPaymentHistory } from "@/lib/yookassa";

export async function GET(req: NextRequest) {
  const { user, res } = await requireAuth();
  if (res) return res;

  const { searchParams } = new URL(req.url);
  const skip = parseInt(searchParams.get("skip") ?? "0", 10);
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20", 10), 100);

  const data = getPaymentHistory(user!.id, skip, limit);
  return NextResponse.json(data);
}
