export const dynamic = "force-static"
export async function generateStaticParams() { return []; }
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requirePro } from "@/lib/plan-guard";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { res } = await requirePro(); if (res) return res;
  const { id } = await params;
  return NextResponse.json(prisma.competitor.findMany({ where: { projectId: id } }));
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { res } = await requirePro(); if (res) return res;
  const { id } = await params;
  const body = await req.json();
  return NextResponse.json(prisma.competitor.create({ data: { ...body, projectId: id } }));
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { res } = await requirePro(); if (res) return res;
  const { id } = await params;
  const body = await req.json();
  return NextResponse.json(prisma.competitor.update({ where: { id }, data: body }));
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { res } = await requirePro(); if (res) return res;
  const { id } = await params;
  prisma.competitor.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

// PUT /api/competitors/[projectId] — YandexGPT competitive analysis
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { res } = await requirePro(); if (res) return res;
  const { id } = await params;

  if (!process.env.YANDEX_API_KEY || !process.env.YANDEX_FOLDER_ID) {
    return NextResponse.json({ error: "YANDEX_API_KEY и YANDEX_FOLDER_ID не заданы" }, { status: 503 });
  }

  const competitors = await prisma.competitor.findMany({ where: { projectId: id } });
  if (!competitors.length) {
    return NextResponse.json({ error: "Добавь хотя бы одного конкурента" }, { status: 400 });
  }

  const list = competitors
    .map((c: any) => `- ${c.name}: ${c.description ?? "без описания"}`)
    .join("\n");

  const gptRes = await fetch(
    "https://llm.api.cloud.yandex.net/foundationModels/v1/completion",
    {
      method: "POST",
      headers: {
        "Authorization": `Api-Key ${process.env.YANDEX_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        modelUri: `gpt://${process.env.YANDEX_FOLDER_ID}/yandexgpt`,
        completionOptions: { stream: false, temperature: 0.5, maxTokens: "2000" },
        messages: [
          { role: "system", text: "Ты аналитик SaaS-рынка. Отвечай кратко и по делу." },
          {
            role: "user",
            text: `Конкуренты проекта:\n${list}\n\nВыдай анализ в JSON:\n{"gaps": ["незакрытые ниши"], "positioning": "рекомендация по позиционированию", "competitors": [{"name": "...", "weakness": "..."}]}`,
          },
        ],
      }),
    }
  );

  if (!gptRes.ok) {
    return NextResponse.json({ error: `YandexGPT error: ${gptRes.status}` }, { status: 502 });
  }

  const gptData = await gptRes.json();
  const rawText = gptData.result?.alternatives?.[0]?.message?.text ?? "";

  let analysis: unknown = rawText;
  try {
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (jsonMatch) analysis = JSON.parse(jsonMatch[0]);
  } catch {}

  return NextResponse.json({ analysis });
}
