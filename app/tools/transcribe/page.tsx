'use client'

import { useState, useRef } from 'react'

interface TranscribeResult {
  text: string
  language: string
  duration: number | null
  segments?: { start: number; end: number; text: string }[]
  provider: string
}

const SUPPORTED = '.mp3,.mp4,.m4a,.wav,.ogg,.webm'
const MAX_MB = 25

export default function TranscribePage() {
  const [file, setFile] = useState<File | null>(null)
  const [language, setLanguage] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<TranscribeResult | null>(null)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(f: File | null) {
    if (!f) return
    if (f.size > MAX_MB * 1024 * 1024) {
      setError(`Файл слишком большой. Максимум ${MAX_MB}MB`)
      return
    }
    setError('')
    setResult(null)
    setFile(f)
  }

  async function handleSubmit() {
    if (!file) return
    setLoading(true)
    setError('')
    setResult(null)

    const body = new FormData()
    body.append('audio', file)
    if (language) body.append('language', language)

    try {
      const resp = await fetch('/api/transcribe', { method: 'POST', body })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data.error || 'Ошибка транскрипции')
      setResult(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Неизвестная ошибка')
    } finally {
      setLoading(false)
    }
  }

  function copyText() {
    if (result?.text) navigator.clipboard.writeText(result.text)
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 16px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Транскрипция аудио/видео</h1>
      <p style={{ color: '#888', marginBottom: 32 }}>
        Конвертируй аудио и видео в текст с помощью OpenAI Whisper — 99% точность, 100+ языков.
      </p>

      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]) }}
        style={{
          border: '2px dashed #333',
          borderRadius: 12,
          padding: '48px 24px',
          textAlign: 'center',
          cursor: 'pointer',
          background: file ? '#0d1117' : 'transparent',
          transition: 'border-color 0.2s',
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={SUPPORTED}
          style={{ display: 'none' }}
          onChange={e => handleFile(e.target.files?.[0] ?? null)}
        />
        {file ? (
          <>
            <div style={{ fontSize: 40, marginBottom: 8 }}>🎵</div>
            <div style={{ fontWeight: 600 }}>{file.name}</div>
            <div style={{ color: '#666', fontSize: 13, marginTop: 4 }}>
              {(file.size / 1024 / 1024).toFixed(1)} MB
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 40, marginBottom: 8 }}>📂</div>
            <div style={{ fontWeight: 500 }}>Перетащи файл или кликни для выбора</div>
            <div style={{ color: '#666', fontSize: 13, marginTop: 4 }}>MP3, MP4, WAV, OGG, WebM — до {MAX_MB}MB</div>
          </>
        )}
      </div>

      {/* Options */}
      <div style={{ marginTop: 20, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <select
          value={language}
          onChange={e => setLanguage(e.target.value)}
          style={{ background: '#111', color: '#fff', border: '1px solid #333', borderRadius: 8, padding: '8px 12px', fontSize: 14 }}
        >
          <option value="">Язык автоматически</option>
          <option value="ru">Русский</option>
          <option value="en">English</option>
          <option value="kk">Қазақ тілі</option>
          <option value="uk">Українська</option>
          <option value="de">Deutsch</option>
          <option value="fr">Français</option>
          <option value="es">Español</option>
          <option value="zh">中文</option>
        </select>

        <button
          onClick={handleSubmit}
          disabled={!file || loading}
          style={{
            background: file && !loading ? '#6366f1' : '#333',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '10px 28px',
            fontSize: 14,
            fontWeight: 600,
            cursor: file && !loading ? 'pointer' : 'not-allowed',
          }}
        >
          {loading ? 'Транскрибируется...' : 'Транскрибировать'}
        </button>
      </div>

      {error && (
        <div style={{ marginTop: 16, padding: '12px 16px', background: '#2d1515', borderRadius: 8, color: '#f87171', fontSize: 14 }}>
          {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div style={{ marginTop: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 13, color: '#666' }}>
              Язык: <b>{result.language}</b>
              {result.duration && <> · Длина: <b>{Math.round(result.duration)}с</b></>}
              · Модель: <b>{result.provider}</b>
            </div>
            <button
              onClick={copyText}
              style={{ background: '#1f2937', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 12, cursor: 'pointer' }}
            >
              Скопировать
            </button>
          </div>
          <textarea
            readOnly
            value={result.text}
            style={{
              width: '100%',
              minHeight: 200,
              background: '#0d1117',
              color: '#e5e7eb',
              border: '1px solid #333',
              borderRadius: 10,
              padding: '16px',
              fontSize: 14,
              lineHeight: 1.6,
              resize: 'vertical',
              fontFamily: 'inherit',
              boxSizing: 'border-box',
            }}
          />

          {result.segments && result.segments.length > 0 && (
            <details style={{ marginTop: 16 }}>
              <summary style={{ cursor: 'pointer', color: '#6366f1', fontSize: 13 }}>
                Показать тайм-коды ({result.segments.length} сегментов)
              </summary>
              <div style={{ marginTop: 8, maxHeight: 300, overflowY: 'auto' }}>
                {result.segments.map((seg, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, padding: '6px 0', borderBottom: '1px solid #1f2937', fontSize: 13 }}>
                    <span style={{ color: '#6366f1', minWidth: 90 }}>
                      {formatTime(seg.start)} → {formatTime(seg.end)}
                    </span>
                    <span>{seg.text}</span>
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      )}
    </div>
  )
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}
