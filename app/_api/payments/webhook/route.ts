export const dynamic = "force-static"
import { NextRequest, NextResponse } from "next/server";
import { handleWebhook } from "@/lib/yookassa";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = handleWebhook(body);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
