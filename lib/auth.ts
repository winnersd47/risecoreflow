import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import crypto from "crypto";
import authUsers from "../data/auth-users.json";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "risecoreflow-dev-secret-32chars!!"
);

// ─── Token ────────────────────────────────────────────────────────────────────
export async function signToken(payload: { userId: string; plan: string }) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { userId: string; plan: string };
  } catch {
    return null;
  }
}

// ─── Cookie helpers ────────────────────────────────────────────────────────────
export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set("rcf_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}

export async function getAuthCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("rcf_token")?.value ?? null;
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete("rcf_token");
}

// ─── Current user ─────────────────────────────────────────────────────────────
export async function getCurrentUser() {
  const token = await getAuthCookie();
  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload) return null;

  const user = (authUsers as any[]).find(u => u.id === payload.userId);
  if (!user) return null;

  const isPro = user.plan !== "free";

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    plan: user.plan,
    planExpiresAt: null,
    referralCode: null,
    createdAt: new Date().toISOString(),
    isPro,
    isAgency: user.plan === "agency" && isPro,
  };
}

// ─── Referral code generator ──────────────────────────────────────────────────
export function generateReferralCode(): string {
  return crypto.randomBytes(3).toString("hex").toUpperCase(); // 6 chars: A3F9B2
}

// ─── Plan check ──────────────────────────────────────────────────────────────
export function checkPlanAccess(userPlan: string, requiredPlan: "free" | "pro" | "agency"): boolean {
  const levels = { free: 0, pro: 1, agency: 2 };
  return (levels[userPlan as keyof typeof levels] ?? 0) >= levels[requiredPlan];
}
