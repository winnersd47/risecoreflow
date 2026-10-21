"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, ExternalLink, Zap, Brain } from "lucide-react";

export default function AISettingsPage() {
  const [status, setStatus] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => { fetch("/api/ai/status").then(r => r.json()).then(setStatus); }, []);

  const copyEnvPath = () => {
    navigator.clipboard.writeText("C:\\Users\\v.serdyuk\\Desktop\\AI-OS\\marketing-platform\\.env");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen" style={{ background: "#07060d" }}>
      <div className="max-w-2xl mx-auto px-8 py-8">

        <div className="flex items-center gap-3 mb-8">
          <Link href="/projects"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button></Link>
          <div>
            <h1 className="text-xl font-semibold" style={{ color: "#ede8ff" }}>Настройки AI</h1>
            <p className="text-sm mt-0.5" style={{ color: "#6b6885" }}>Выбор движка для генерации и улучшения контента</p>
          </div>
        </div>

        {/* Current status */}
        <div className="rounded-xl p-5 mb-6" style={{ background: "#0d0b18", border: "1px solid #1e1c38" }}>
          <h2 className="text-sm font-semibold mb-3" style={{ color: "#ede8ff" }}>Активный движок</h2>
          {status ? (
            <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: "#13112a" }}>
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: status.color }} />
              <div>
                <div className="text-sm font-medium" style={{ color: status.color }}>{status.label}</div>
                <div className="text-xs" style={{ color: "#6b6885" }}>
                  {status.engine === "none" ? "Добавь ключ в .env чтобы активировать AI" : status.free ? "Бесплатный · 1M токенов/день" : "Платный · безлимит"}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs" style={{ color: "#6b6885" }}>Загрузка...</div>
          )}
        </div>

        {/* Option 1: Gemini FREE */}
        <div className="rounded-xl p-5 mb-4" style={{ background: "#0d0b18", border: "1px solid rgba(16,185,129,0.3)" }}>
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5" style={{ color: "#10b981" }} />
              <div>
                <div className="text-sm font-semibold" style={{ color: "#ede8ff" }}>Google Gemini 1.5 Flash</div>
                <div className="text-xs px-2 py-0.5 rounded-full inline-block mt-0.5" style={{ background: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)" }}>
                  БЕСПЛАТНО · Рекомендуется
                </div>
              </div>
            </div>
            <a href="https://aistudio.google.com" target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="secondary">Получить ключ <ExternalLink className="w-3 h-3" /></Button>
            </a>
          </div>
          <div className="grid grid-cols-3 gap-3 text-xs mb-4">
            {[["1M токенов/день", "≈ 3 000 постов"], ["15 запросов/мин", "достаточно для работы"], ["Gemini 1.5 Flash", "быстрый и точный"]].map(([v, d]) => (
              <div key={v} className="p-2 rounded-lg" style={{ background: "#13112a" }}>
                <div className="font-semibold" style={{ color: "#ede8ff" }}>{v}</div>
                <div style={{ color: "#6b6885" }}>{d}</div>
              </div>
            ))}
          </div>
          <div className="rounded-lg p-4" style={{ background: "#13112a", border: "1px solid #1e1c38" }}>
            <div className="text-xs font-semibold mb-2" style={{ color: "#f59e0b" }}>Как активировать (2 минуты)</div>
            <ol className="text-xs space-y-2" style={{ color: "#ede8ff" }}>
              <li className="flex gap-2"><span style={{ color: "#f59e0b" }}>1.</span> Открой <a href="https://aistudio.google.com" target="_blank" className="underline" style={{ color: "#10b981" }}>aistudio.google.com</a> → Get API key → Create API key</li>
              <li className="flex gap-2"><span style={{ color: "#f59e0b" }}>2.</span> Скопируй ключ (начинается с AIza...)</li>
              <li className="flex gap-2"><span style={{ color: "#f59e0b" }}>3.</span>
                <span>Открой файл <code className="px-1.5 py-0.5 rounded text-[10px]" style={{ background: "#07060d", color: "#86efac" }}>.env</code> в папке проекта</span>
              </li>
              <li className="flex gap-2"><span style={{ color: "#f59e0b" }}>4.</span>
                <span>Замени <code className="px-1 py-0.5 rounded text-[10px]" style={{ background: "#07060d", color: "#fca5a5" }}>your-gemini-key-here</code> на свой ключ</span>
              </li>
              <li className="flex gap-2"><span style={{ color: "#f59e0b" }}>5.</span> Перезапусти сервер (закрой и снова запусти start-dev.bat)</li>
            </ol>
            <div className="mt-3 p-2 rounded font-mono text-[10px]" style={{ background: "#07060d", color: "#86efac" }}>
              GEMINI_API_KEY="AIzaXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
            </div>
          </div>
        </div>

        {/* Option 2: Claude */}
        <div className="rounded-xl p-5 mb-6" style={{ background: "#0d0b18", border: "1px solid rgba(167,139,250,0.2)" }}>
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5" style={{ color: "#a78bfa" }} />
              <div>
                <div className="text-sm font-semibold" style={{ color: "#ede8ff" }}>Anthropic Claude Opus</div>
                <div className="text-xs px-2 py-0.5 rounded-full inline-block mt-0.5" style={{ background: "rgba(167,139,250,0.1)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.2)" }}>
                  ПЛАТНЫЙ · $15/M токенов
                </div>
              </div>
            </div>
            <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="secondary">Console <ExternalLink className="w-3 h-3" /></Button>
            </a>
          </div>
          <p className="text-xs mb-3" style={{ color: "#6b6885" }}>
            Более мощная модель. Используется если Gemini недоступен или GEMINI_API_KEY не задан.
          </p>
          <div className="p-2 rounded font-mono text-[10px]" style={{ background: "#13112a", color: "#a78bfa" }}>
            ANTHROPIC_API_KEY="sk-ant-XXXXXXXXXXXXXXXXXXXXX"
          </div>
        </div>

        {/* .env file path */}
        <div className="rounded-xl p-4" style={{ background: "#0d0b18", border: "1px solid #1e1c38" }}>
          <div className="text-xs font-semibold mb-2" style={{ color: "#6b6885" }}>Путь к файлу .env</div>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-[10px] p-2 rounded" style={{ background: "#13112a", color: "#86efac" }}>
              C:\Users\v.serdyuk\Desktop\AI-OS\marketing-platform\.env
            </code>
            <button onClick={copyEnvPath} className="flex-shrink-0 p-2 rounded" style={{ background: "#13112a", border: "1px solid #1e1c38" }}>
              {copied ? <Check className="w-3.5 h-3.5" style={{ color: "#86efac" }} /> : <span className="text-xs" style={{ color: "#6b6885" }}>Копировать</span>}
            </button>
          </div>
          <p className="text-[10px] mt-2" style={{ color: "#3d3a5c" }}>
            После изменения .env — перезапусти сервер. Ключи не сохраняются в базе данных.
          </p>
        </div>

      </div>
    </div>
  );
}
