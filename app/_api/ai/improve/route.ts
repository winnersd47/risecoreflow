export const dynamic = "force-static"
import { NextRequest, NextResponse } from "next/server";
import { improvePost, adaptPost, getActiveEngine } from "@/lib/ai-engine";

export async function POST(req: NextRequest) {
  try {
    const { content, instruction, platform } = await req.json();
    if (!content) return NextResponse.json({ error: "Missing content" }, { status: 400 });

    let result: string;

    if (platform && ["twitter", "linkedin", "email"].includes(platform)) {
      result = await adaptPost(content, platform as "twitter" | "linkedin" | "email");
    } else if (instruction) {
      result = await improvePost(content, instruction);
    } else {
      return NextResponse.json({ error: "Provide instruction or platform" }, { status: 400 });
    }

    return NextResponse.json({ content: result, engine: getActiveEngine() });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
