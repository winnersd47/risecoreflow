export const dynamic = "force-static"
export async function generateStaticParams() { return []; }
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ taskId: string }> }) {
  const { taskId } = await params;
  const body = await req.json();
  const task = await prisma.task.update({ where: { id: taskId }, data: body });
  return NextResponse.json(task);
}
