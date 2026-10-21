import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  return NextResponse.json({ error: "Регистрация недоступна в демо-режиме. Используй victorysd.95@gmail.com / Victory123!" }, { status: 403 });
}
