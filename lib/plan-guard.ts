import { NextResponse } from "next/server";
import { getCurrentUser } from "./auth";

export const LIMITS = {
  free: { projects: 1, postsPerProject: 10, tasksPerProject: 20 },
  pro:  { projects: 5, postsPerProject: Infinity, tasksPerProject: Infinity },
  agency: { projects: Infinity, postsPerProject: Infinity, tasksPerProject: Infinity },
} as const;

type Plan = keyof typeof LIMITS;

function getLimits(plan: string) {
  return LIMITS[(plan as Plan)] ?? LIMITS.free;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) return { user: null, res: NextResponse.json({ error: "Требуется авторизация" }, { status: 401 }) };
  return { user, res: null };
}

export async function requirePro() {
  const { user, res } = await requireAuth();
  if (res) return { user: null, res };
  const isPro = user!.plan === "pro" || user!.plan === "agency";
  if (!isPro) return { user: null, res: NextResponse.json({ error: "Требуется Pro план", upgrade: true }, { status: 403 }) };
  return { user, res: null };
}

export async function canCreateProject(userId: string): Promise<{ ok: boolean; message?: string }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Не авторизован" };
  const limits = getLimits(user.plan);
  if (limits.projects === Infinity) return { ok: true };
  return { ok: true };
}

export async function canCreatePost(projectId: string): Promise<{ ok: boolean; message?: string }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Не авторизован" };
  const limits = getLimits(user.plan);
  if (limits.postsPerProject === Infinity) return { ok: true };
  return { ok: true };
}
