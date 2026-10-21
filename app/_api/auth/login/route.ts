import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { signToken, setAuthCookie } from "@/lib/auth";
import authUsers from "@/data/auth-users.json";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) return NextResponse.json({ error: "Укажи email и пароль" }, { status: 400 });

    const user = (authUsers as any[]).find(u => u.email === email.toLowerCase());
    if (!user) return NextResponse.json({ error: "Неверный email или пароль" }, { status: 401 });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return NextResponse.json({ error: "Неверный email или пароль" }, { status: 401 });

    const token = await signToken({ userId: user.id, plan: user.plan });
    await setAuthCookie(token);

    return NextResponse.json({ id: user.id, email: user.email, username: user.username, plan: user.plan });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
