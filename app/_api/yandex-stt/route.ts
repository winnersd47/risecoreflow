export const dynamic = "force-static"
/**
 * Yandex SpeechKit STT — транскрипция аудио (до 1 минуты).
 * POST /api/yandex-stt
 * Body: multipart/form-data с полем "audio" (файл)
 * Query: lang (по умолчанию "ru-RU"), format (по умолчанию "oggopus")
 */
import { NextRequest, NextResponse } from "next/server";

const YANDEX_API_KEY = process.env.YANDEX_API_KEY ?? "";
const YANDEX_FOLDER_ID = process.env.YANDEX_FOLDER_ID ?? "";

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!YANDEX_API_KEY || !YANDEX_FOLDER_ID) {
    return NextResponse.json(
      { error: "Yandex API key not configured", provider: "yandex-stt" },
      { status: 503 }
    );
  }

  const formData = await req.formData();
  const audioFile = formData.get("audio") as File | null;
  if (!audioFile) {
    return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
  }

  const lang = req.nextUrl.searchParams.get("lang") ?? "ru-RU";
  const format = req.nextUrl.searchParams.get("format") ?? "oggopus";

  const audioBytes = await audioFile.arrayBuffer();

  const sttUrl = new URL("https://stt.api.cloud.yandex.net/speech/v1/stt:recognize");
  sttUrl.searchParams.set("folderId", YANDEX_FOLDER_ID);
  sttUrl.searchParams.set("lang", lang);
  sttUrl.searchParams.set("format", format);

  const sttRes = await fetch(sttUrl.toString(), {
    method: "POST",
    headers: {
      Authorization: `Api-Key ${YANDEX_API_KEY}`,
      "Content-Type": "audio/ogg",
    },
    body: audioBytes,
  });

  if (!sttRes.ok) {
    const err = await sttRes.text();
    return NextResponse.json(
      { error: "SpeechKit STT failed", details: err },
      { status: 502 }
    );
  }

  const data = await sttRes.json();
  return NextResponse.json({
    text: data.result ?? "",
    lang,
    provider: "yandex-speechkit-stt",
  });
}
