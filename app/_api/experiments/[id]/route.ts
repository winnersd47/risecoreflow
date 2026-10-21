export const dynamic = "force-static"
export async function generateStaticParams() { return []; }
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requirePro } from "@/lib/plan-guard";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, res } = await requirePro();
  if (res) return res;
  const { id } = await params;
  return NextResponse.json(prisma.experiment.findMany({ where: { projectId: id } }));
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, res } = await requirePro();
  if (res) return res;
  const { id } = await params;
  const body = await req.json();
  return NextResponse.json(prisma.experiment.create({ data: { ...body, projectId: id } }));
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, res } = await requirePro();
  if (res) return res;
  const { id } = await params;
  const body = await req.json();
  return NextResponse.json(prisma.experiment.update({ where: { id }, data: body }));
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, res } = await requirePro();
  if (res) return res;
  const { id } = await params;
  prisma.experiment.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
