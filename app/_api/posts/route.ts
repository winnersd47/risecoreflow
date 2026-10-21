export const dynamic = "force-static"
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, canCreatePost } from "@/lib/plan-guard";

export async function POST(req: NextRequest) {
  const { user, res } = await requireAuth();
  if (res) return res;

  const body = await req.json();

  if (body.projectId) {
    const check = await canCreatePost(body.projectId);
    if (!check.ok) {
      return NextResponse.json({ error: check.message, upgrade: true }, { status: 403 });
    }
  }

  const post = await prisma.post.create({ data: body });
  return NextResponse.json(post);
}
