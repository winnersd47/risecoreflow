export const dynamic = "force-static"
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, canCreateProject } from "@/lib/plan-guard";

export async function GET() {
  const projects = await prisma.project.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  const { user, res } = await requireAuth();
  if (res) return res;

  const check = await canCreateProject(user!.id);
  if (!check.ok) {
    return NextResponse.json({ error: check.message, upgrade: true }, { status: 403 });
  }

  const body = await req.json();
  const project = await prisma.project.create({ data: body });
  return NextResponse.json(project);
}
