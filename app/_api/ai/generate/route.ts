export const dynamic = "force-static"
import { NextRequest, NextResponse } from "next/server";
import { generatePost, getActiveEngine } from "@/lib/ai-engine";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { projectId, postId, day, profile, type, title } = await req.json();

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    const projectContext = `
Проект: ${project.name}
${project.description ? `Описание: ${project.description}` : ""}
${project.channel ? `Telegram-канал: ${project.channel}` : ""}
${project.siteUrl ? `Сайт: ${project.siteUrl}` : ""}
Волна: ${project.wave}
    `.trim();

    const content = await generatePost({ projectContext, day, profile, type, title });

    if (postId) {
      await prisma.post.update({ where: { id: postId }, data: { content } });
    }

    return NextResponse.json({ content, engine: getActiveEngine() });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
