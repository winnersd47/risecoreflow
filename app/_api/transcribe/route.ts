export const dynamic = "force-static"
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(req: NextRequest): Promise<NextResponse> {
  const user = await getCurrentUser(req)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const contentType = req.headers.get('content-type') || ''
  if (!contentType.includes('multipart/form-data')) {
    return NextResponse.json(
      { error: 'Expected multipart/form-data with an "audio" file field' },
      { status: 400 },
    )
  }

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Failed to parse form data' }, { status: 400 })
  }

  const audioFile = formData.get('audio') as File | null
  const language = (formData.get('language') as string | null) || undefined

  if (!audioFile) {
    return NextResponse.json({ error: 'Missing "audio" field' }, { status: 400 })
  }

  const ALLOWED = ['audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/ogg', 'audio/webm', 'video/mp4', 'video/webm']
  if (!ALLOWED.includes(audioFile.type)) {
    return NextResponse.json({ error: 'Unsupported file type. Accepted: mp3, mp4, wav, ogg, webm' }, { status: 415 })
  }

  const MAX_MB = 25
  if (audioFile.size > MAX_MB * 1024 * 1024) {
    return NextResponse.json({ error: `File too large. Max ${MAX_MB}MB` }, { status: 413 })
  }

  const apiKey      = process.env.OPENAI_API_KEY
  const yandexKey   = process.env.YANDEX_API_KEY
  const yandexFolder = process.env.YANDEX_FOLDER_ID
  const isRussian   = !language || language === "ru"

  // SpeechKit STT — free fallback for Russian when Whisper key is absent
  if (!apiKey && yandexKey && yandexFolder && isRussian) {
    try {
      const audioBuffer = Buffer.from(await audioFile.arrayBuffer())
      const ext = audioFile.name?.split(".").pop()?.toLowerCase() ?? "ogg"
      const fmt = ext === "mp3" ? "mp3" : ext === "wav" ? "lpcm" : "oggopus"
      const sttRes = await fetch(
        `https://stt.api.cloud.yandex.net/speech/v1/stt:recognize?lang=ru-RU&format=${fmt}&folderId=${yandexFolder}`,
        {
          method: "POST",
          headers: {
            "Authorization": `Api-Key ${yandexKey}`,
            "Content-Type": "application/octet-stream",
          },
          body: audioBuffer,
        }
      )
      if (!sttRes.ok) throw new Error(`SpeechKit ${sttRes.status}`)
      const sttData = await sttRes.json()
      return NextResponse.json({
        text: sttData.result ?? "",
        language: "ru",
        duration: null,
        segments: [],
        provider: "yandex-speechkit",
      })
    } catch (err) {
      console.error("SpeechKit STT error:", err)
    }
  }

  if (!apiKey) {
    // Stub mode when no API key — useful for local dev
    return NextResponse.json({
      text: '[STUB] This is a simulated transcription. Configure OPENAI_API_KEY or YANDEX_API_KEY to enable transcription.',
      language: language || 'ru',
      duration: 0,
      provider: 'stub',
    })
  }

  try {
    const body = new FormData()
    body.append('file', audioFile, audioFile.name)
    body.append('model', 'whisper-1')
    body.append('response_format', 'verbose_json')
    if (language) body.append('language', language)

    const whisperResp = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body,
    })

    if (!whisperResp.ok) {
      const err = await whisperResp.text()
      console.error('Whisper API error:', err)
      return NextResponse.json({ error: 'Transcription service error' }, { status: 502 })
    }

    const data = await whisperResp.json()

    return NextResponse.json({
      text: data.text ?? '',
      language: data.language ?? language ?? 'unknown',
      duration: data.duration ?? null,
      segments: data.segments?.map((s: { start: number; end: number; text: string }) => ({
        start: s.start,
        end: s.end,
        text: s.text,
      })) ?? [],
      provider: 'whisper-1',
    })
  } catch (err) {
    console.error('Transcription error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
