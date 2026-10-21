export const dynamic = "force-static"
import { NextResponse } from "next/server";
import { getActiveEngine } from "@/lib/ai-engine";

const ENGINE_META: Record<string, { label: string; color: string; free: boolean; setupUrl: string | null }> = {
  gemini: { label: "Gemini 1.5 Flash (бесплатно)",   color: "#10b981", free: true,  setupUrl: null },
  yandex: { label: "YandexGPT Lite (бесплатно)",      color: "#5282FF", free: true,  setupUrl: null },
  claude: { label: "Claude Opus (платно)",             color: "#a78bfa", free: false, setupUrl: null },
  none:   { label: "Не настроен",                      color: "#fca5a5", free: false, setupUrl: "https://aistudio.google.com" },
};

export async function GET() {
  const engine = getActiveEngine();
  return NextResponse.json({ engine, ...ENGINE_META[engine] });
}
