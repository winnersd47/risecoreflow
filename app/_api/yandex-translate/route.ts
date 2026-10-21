export const dynamic = "force-static"
/**
 * Yandex Translate — перевод текста через Yandex Cloud API.
 * POST /api/yandex-translate
 * Body: { texts: string[], targetLang: string, sourceLang?: string }
 */
import { NextRequest, NextResponse } from "next/server";

const YANDEX_API_KEY = process.env.YANDEX_API_KEY ?? "";
const YANDEX_FOLDER_ID = process.env.YANDEX_FOLDER_ID ?? "";

interface TranslateBody {
  texts: string[];
  targetLang: string;
  sourceLang?: string;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!YANDEX_API_KEY || !YANDEX_FOLDER_ID) {
    return NextResponse.json(
      { error: "Yandex API key not configured", provider: "yandex-translate" },
      { status: 503 }
    );
  }

  let body: TranslateBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { texts, targetLang, sourceLang } = body;
  if (!Array.isArray(texts) || texts.length === 0) {
    return NextResponse.json({ error: "texts must be a non-empty array" }, { status: 400 });
  }
  if (!targetLang) {
    return NextResponse.json({ error: "targetLang is required" }, { status: 400 });
  }

  const payload: Record<string, unknown> = {
    folderId: YANDEX_FOLDER_ID,
    texts,
    targetLanguageCode: targetLang,
  };
  if (sourceLang) {
    payload.sourceLanguageCode = sourceLang;
  }

  const res = await fetch("https://translate.api.cloud.yandex.net/translate/v2/translate", {
    method: "POST",
    headers: {
      Authorization: `Api-Key ${YANDEX_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json(
      { error: "Yandex Translate failed", details: err },
      { status: 502 }
    );
  }

  const data = await res.json();
  const translations: string[] = (data.translations ?? []).map(
    (t: { text: string }) => t.text
  );

  return NextResponse.json({
    translations,
    targetLang,
    provider: "yandex-translate",
  });
}
