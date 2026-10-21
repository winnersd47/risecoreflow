import { NextResponse } from "next/server";
export async function POST() { return NextResponse.json({ error: "Оплата недоступна в демо-режиме" }, { status: 403 }); }
