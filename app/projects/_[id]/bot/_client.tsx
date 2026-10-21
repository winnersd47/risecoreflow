"use client"
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { HelpTooltip } from "@/components/HelpTooltip";
import {
  Bot, CheckCircle2, XCircle, RefreshCw, Users, Hash,
  ArrowRight, Settings, Send, Plus, Trash2, Save,
  ExternalLink, Megaphone, ListOrdered, Activity,
  Copy, Eye, EyeOff, AlertCircle,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type ChannelEntry = { id: string; label: string; title?: string; memberCount?: number | null };
type BotData = {
  alive: boolean;
  botInfo: { id: number; username: string; first_name: string; can_join_groups?: boolean } | null;
  settings: {
    token: string;
    sourceChannels: ChannelEntry[];
    targetGroupId: string;
    targetGroupLabel: string;
    forwardTags: string[];
    _targetGroupTitle?: string;
    _targetGroupCount?: number | null;
  };
  channelDetails: ChannelEntry[];
};
type FunnelStep = { id: string; type: string; title: string; content: string; status: string };
type SendResult = { ok: boolean; messageId?: number; error?: string };

const STEP_COLORS: Record<string, string> = {
  story: "#6366f1", pain: "#ef4444", tip: "#10b981", case: "#f59e0b", offer: "#a78bfa",
};
const STEP_LABELS: Record<string, string> = {
  story: "История", pain: "Боль", tip: "Польза", case: "Кейс", offer: "Оффер",
};

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function BotPage() {
  const params    = useParams();
  const projectId = params.id as string;

  const [tab, setTab]     = useState<"status" | "send" | "funnel" | "settings">("status");
  const [data, setData]   = useState<BotData | null>(null);
  const [loading, setLoading] = useState(true);
  const [steps, setSteps] = useState<FunnelStep[]>([]);
  const [tags, setTags]   = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);

  async function loadBot() {
    setLoading(true);
    const r = await fetch(`/api/bot/${projectId}`);
    if (r.ok) {
      const d: BotData = await r.json();
      setData(d);
      setTags(d.settings?.forwardTags ?? []);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadBot();
    fetch(`/api/telegram-funnel/${projectId}`).then(r => r.json()).then(d => setSteps(d.steps ?? []));
  }, [projectId]);

  // All targets (channels + group)
  const allTargets: ChannelEntry[] = data ? [
    ...(data.channelDetails.length > 0 ? data.channelDetails : data.settings.sourceChannels),
    { id: data.settings.targetGroupId, label: data.settings._targetGroupTitle || data.settings.targetGroupLabel },
  ] : [];

  async function saveTags() {
    setSaving(true);
    await fetch(`/api/bot/${projectId}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ forwardTags: tags }),
    });
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const dim: React.CSSProperties = { color: "#6b7280", fontSize: 12 };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar projectId={projectId} />
      <main className="flex-1 overflow-y-auto" style={{ background: "#07060d" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "32px 24px" }}>

          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <Bot style={{ color: "#6366f1", width: 20, height: 20 }} />
                <h1 style={{ fontSize: 24, fontWeight: 700, color: "#ede8ff" }}>Telegram-бот</h1>
                {data && (
                  <span style={{ fontSize: 12, padding: "2px 10px", borderRadius: 20, fontWeight: 600,
                    background: data.alive ? "#052e16" : "#7f1d1d", color: data.alive ? "#4ade80" : "#f87171",
                    border: `1px solid ${data.alive ? "#166534" : "#991b1b"}` }}>
                    {data.alive ? "● Активен" : "● Недоступен"}
                  </span>
                )}
              </div>
              <p style={dim}>Авто-репостер + прямая отправка постов в каналы</p>
            </div>
            <button onClick={loadBot} disabled={loading}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: "#13112a", border: "1px solid #374151", borderRadius: 8, color: "#9ca3af", cursor: "pointer", fontSize: 13 }}>
              <RefreshCw style={{ width: 13, height: 13 }} /> Обновить
            </button>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, marginBottom: 24, borderBottom: "1px solid #1e1c38" }}>
            {([
              { key: "status",   label: "Статус",           icon: Activity },
              { key: "send",     label: "Отправить пост",   icon: Megaphone },
              { key: "funnel",   label: "Воронка прогрева", icon: ListOrdered },
              { key: "settings", label: "Настройки",        icon: Settings },
            ] as const).map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", paddingBottom: 10, background: "none", border: "none",
                  borderBottom: tab === t.key ? "2px solid #6366f1" : "2px solid transparent",
                  color: tab === t.key ? "#818cf8" : "#6b7280", cursor: "pointer", fontSize: 14, fontWeight: tab === t.key ? 600 : 400 }}>
                <t.icon style={{ width: 14, height: 14 }} /> {t.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "80px 0", color: "#374151" }}>
              <RefreshCw style={{ width: 28, height: 28, margin: "0 auto 12px", opacity: 0.4 }} />
              <p style={{ fontSize: 14 }}>Подключаемся к Telegram API…</p>
            </div>
          ) : (
            <>
              {/* ── TAB: STATUS ───────────────────────────────────────── */}
              {tab === "status" && data && (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {/* Bot identity */}
                  <div style={{ background: "#0d0b18", border: `1px solid ${data.alive ? "#166534" : "#7f1d1d"}`, borderRadius: 14, padding: 24 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#6366f120", border: "2px solid #6366f140", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Bot style={{ width: 24, height: 24, color: "#818cf8" }} />
                      </div>
                      <div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: "#ede8ff", marginBottom: 2 }}>
                          {data.botInfo?.first_name ?? "OmniMindFlow Bot"}
                        </div>
                        {data.botInfo?.username && (
                          <a href={`https://t.me/${data.botInfo.username}`} target="_blank" rel="noopener noreferrer"
                            style={{ fontSize: 13, color: "#6366f1", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
                            @{data.botInfo.username} <ExternalLink style={{ width: 11, height: 11 }} />
                          </a>
                        )}
                      </div>
                    </div>
                    {data.botInfo && (
                      <div style={{ display: "flex", gap: 24, marginTop: 16, paddingTop: 16, borderTop: "1px solid #1e1c38" }}>
                        {[
                          { label: "ID бота",            value: String(data.botInfo.id) },
                          { label: "Токен",               value: data.settings.token },
                          { label: "Вступает в группы",  value: data.botInfo.can_join_groups ? "Да ✓" : "Нет" },
                        ].map(f => (
                          <div key={f.label}>
                            <div style={{ fontSize: 11, color: "#4b5563", marginBottom: 2 }}>{f.label}</div>
                            <div style={{ fontSize: 13, fontFamily: "monospace", color: "#6b7280" }}>{f.value}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Flow diagram */}
                  <div style={{ background: "#0d0b18", border: "1px solid #1e1c38", borderRadius: 14, padding: 24 }}>
                    <h2 style={{ fontSize: 15, fontWeight: 700, color: "#ede8ff", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                      <Settings style={{ width: 16, height: 16, color: "#6366f1" }} /> Схема авто-репоста
                    </h2>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {(data.channelDetails.length > 0 ? data.channelDetails : data.settings.sourceChannels).map((ch, i) => (
                          <ChannelCard key={i} ch={ch} color="#6366f1" />
                        ))}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                        <ArrowRight style={{ width: 20, height: 20, color: "#374151" }} />
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, justifyContent: "center" }}>
                          {tags.map(tag => (
                            <span key={tag} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: "#f59e0b20", color: "#f59e0b", border: "1px solid #f59e0b30" }}>{tag}</span>
                          ))}
                        </div>
                        <span style={{ fontSize: 10, color: "#4b5563" }}>фильтр тегов</span>
                      </div>
                      <ChannelCard ch={{ id: data.settings.targetGroupId, label: data.settings._targetGroupTitle || data.settings.targetGroupLabel, memberCount: data.settings._targetGroupCount }} color="#10b981" />
                    </div>
                  </div>

                  {/* Run instructions */}
                  <div style={{ background: "#0d0b18", border: "1px solid #1e1c38", borderRadius: 14, padding: 24 }}>
                    <h2 style={{ fontSize: 15, fontWeight: 700, color: "#ede8ff", marginBottom: 12 }}>Запуск Python-бота</h2>
                    {[
                      { n: "1", label: "Папка бота", code: "C:\\Users\\v.serdyuk\\Documents\\AIGrowth\\OmniMindFlow\\tg-bot" },
                      { n: "2", label: "Активировать окружение", code: ".venv\\Scripts\\activate" },
                      { n: "3", label: "Запустить", code: "python bot.py" },
                    ].map(s => (
                      <div key={s.n} style={{ display: "flex", gap: 14, marginBottom: 12, alignItems: "flex-start" }}>
                        <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#10b98120", border: "1px solid #10b98140", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: "#34d399" }}>{s.n}</span>
                        </div>
                        <div>
                          <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 3 }}>{s.label}</div>
                          <code style={{ fontSize: 12, color: "#f59e0b", background: "#07060d", padding: "3px 10px", borderRadius: 6, border: "1px solid #f59e0b20" }}>{s.code}</code>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── TAB: SEND ─────────────────────────────────────────── */}
              {tab === "send" && (
                <SendPostPanel projectId={projectId} targets={allTargets} botAlive={data?.alive ?? false} />
              )}

              {/* ── TAB: FUNNEL ───────────────────────────────────────── */}
              {tab === "funnel" && (
                <FunnelPanel projectId={projectId} steps={steps} targets={allTargets} botAlive={data?.alive ?? false} />
              )}

              {/* ── TAB: SETTINGS ─────────────────────────────────────── */}
              {tab === "settings" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{ background: "#0d0b18", border: "1px solid #1e1c38", borderRadius: 14, padding: 24 }}>
                    <h2 style={{ fontSize: 15, fontWeight: 700, color: "#ede8ff", marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
                      <Hash style={{ width: 16, height: 16, color: "#f59e0b" }} /> Теги для авто-репоста
                      <HelpTooltip title="Теги-триггеры" text="Если в тексте поста есть хотя бы один из этих тегов, бот автоматически пересылает пост в AI Growth Club." example="Пост с «#repost» → бот пересылает в группу" />
                    </h2>
                    <p style={{ ...dim, marginBottom: 16 }}>Пост будет переслан, если содержит хотя бы один из тегов</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                      {tags.map(tag => (
                        <div key={tag} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", background: "#f59e0b15", border: "1px solid #f59e0b30", borderRadius: 8 }}>
                          <span style={{ fontSize: 13, color: "#f59e0b", fontWeight: 500 }}>{tag}</span>
                          <button onClick={() => setTags(prev => prev.filter(t => t !== tag))}
                            style={{ background: "none", border: "none", cursor: "pointer", padding: 0, opacity: 0.5 }}>
                            <Trash2 style={{ width: 11, height: 11, color: "#ef4444" }} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input value={newTag} onChange={e => setNewTag(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") { const t = newTag.trim().startsWith("#") ? newTag.trim() : `#${newTag.trim()}`; if (t !== "#" && !tags.includes(t)) setTags(p => [...p, t]); setNewTag(""); } }}
                        placeholder="#newtag"
                        style={{ background: "#07060d", border: "1px solid #374151", borderRadius: 8, padding: "7px 12px", color: "#ede8ff", fontSize: 13, width: 150 }} />
                      <button onClick={() => { const t = newTag.trim().startsWith("#") ? newTag.trim() : `#${newTag.trim()}`; if (t !== "#" && !tags.includes(t)) setTags(p => [...p, t]); setNewTag(""); }}
                        style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: "#13112a", border: "1px solid #374151", borderRadius: 8, color: "#9ca3af", cursor: "pointer", fontSize: 13 }}>
                        <Plus style={{ width: 13, height: 13 }} /> Добавить
                      </button>
                      <button onClick={saveTags} disabled={saving}
                        style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 16px", background: saved ? "#052e16" : "#6366f1", border: "none", borderRadius: 8, color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600, marginLeft: "auto" }}>
                        <Save style={{ width: 13, height: 13 }} /> {saving ? "Сохраняю…" : saved ? "✓ Сохранено" : "Сохранить"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

// ─── ChannelCard ──────────────────────────────────────────────────────────────
function ChannelCard({ ch, color }: { ch: ChannelEntry; color: string }) {
  return (
    <div style={{ padding: "10px 16px", background: "#13112a", border: `1px solid ${color}30`, borderRadius: 10, minWidth: 170 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color, marginBottom: 2 }}>{ch.title ?? ch.label}</div>
      <div style={{ fontSize: 11, color: "#4b5563", fontFamily: "monospace" }}>{ch.id}</div>
      {ch.memberCount != null && (
        <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
          <Users style={{ width: 10, height: 10 }} /> {ch.memberCount.toLocaleString("ru-RU")} участников
        </div>
      )}
    </div>
  );
}

// ─── SendPostPanel ────────────────────────────────────────────────────────────
function SendPostPanel({ projectId, targets, botAlive }: { projectId: string; targets: ChannelEntry[]; botAlive: boolean }) {
  const [chatId, setChatId]         = useState(targets[0]?.id ?? "");
  const [customId, setCustomId]     = useState("");
  const [useCustom, setUseCustom]   = useState(false);
  const [text, setText]             = useState("");
  const [silent, setSilent]         = useState(false);
  const [noPreview, setNoPreview]   = useState(true);
  const [sending, setSending]       = useState(false);
  const [result, setResult]         = useState<SendResult | null>(null);
  const textRef                     = useRef<HTMLTextAreaElement>(null);

  const targetId = useCustom ? customId : chatId;
  const charCount = text.length;

  function insertFormat(tag: string) {
    const el = textRef.current;
    if (!el) return;
    const s = el.selectionStart, e = el.selectionEnd;
    const sel = text.slice(s, e) || "текст";
    const newText = text.slice(0, s) + `<${tag}>${sel}</${tag}>` + text.slice(e);
    setText(newText);
    setTimeout(() => { el.focus(); el.selectionStart = s + tag.length + 2; el.selectionEnd = s + tag.length + 2 + sel.length; }, 0);
  }

  async function send() {
    if (!text.trim() || !targetId) return;
    setSending(true); setResult(null);
    const r = await fetch(`/api/bot/${projectId}/send`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatId: targetId, text, disableNotification: silent, disableWebPreview: noPreview }),
    });
    const d = await r.json();
    setResult(d);
    if (d.ok) setText("");
    setSending(false);
  }

  if (!botAlive) return <BotOfflineBanner />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Target */}
      <div style={{ background: "#0d0b18", border: "1px solid #1e1c38", borderRadius: 14, padding: 20 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: "#9ca3af", display: "block", marginBottom: 10 }}>
          Куда отправить
        </label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: useCustom ? 12 : 0 }}>
          {targets.map(t => (
            <button key={t.id} onClick={() => { setChatId(t.id); setUseCustom(false); }}
              disabled={useCustom}
              style={{ padding: "6px 14px", borderRadius: 8, fontSize: 13, cursor: "pointer", fontWeight: !useCustom && chatId === t.id ? 600 : 400, border: "1px solid", transition: "all 0.15s",
                background: !useCustom && chatId === t.id ? "#6366f120" : "none",
                borderColor: !useCustom && chatId === t.id ? "#6366f150" : "#374151",
                color: !useCustom && chatId === t.id ? "#818cf8" : "#6b7280", opacity: useCustom ? 0.4 : 1 }}>
              {t.title ?? t.label}
            </button>
          ))}
          <button onClick={() => setUseCustom(!useCustom)}
            style={{ padding: "6px 14px", borderRadius: 8, fontSize: 13, cursor: "pointer", border: "1px solid", fontWeight: useCustom ? 600 : 400,
              background: useCustom ? "#f59e0b15" : "none", borderColor: useCustom ? "#f59e0b40" : "#374151", color: useCustom ? "#f59e0b" : "#4b5563" }}>
            + Свой ID
          </button>
        </div>
        {useCustom && (
          <input value={customId} onChange={e => setCustomId(e.target.value)} placeholder="-1001234567890 или @username"
            style={{ width: "100%", background: "#07060d", border: "1px solid #374151", borderRadius: 8, padding: "8px 12px", color: "#ede8ff", fontSize: 13, boxSizing: "border-box", marginTop: 8 }} />
        )}
      </div>

      {/* Compose */}
      <div style={{ background: "#0d0b18", border: "1px solid #1e1c38", borderRadius: 14, padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: "#9ca3af" }}>Текст поста</label>
          <div style={{ display: "flex", gap: 4 }}>
            {[["b", "B"], ["i", "I"], ["u", "U"], ["s", "S"], ["code", "<>"]].map(([tag, sym]) => (
              <button key={tag} onClick={() => insertFormat(tag)}
                style={{ width: 26, height: 26, borderRadius: 6, border: "1px solid #374151", background: "#13112a", color: "#9ca3af", cursor: "pointer", fontSize: tag === "code" ? 10 : 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {sym}
              </button>
            ))}
            <span style={{ fontSize: 11, color: "#374151", alignSelf: "center", marginLeft: 4 }}>HTML</span>
          </div>
        </div>
        <textarea ref={textRef} value={text} onChange={e => setText(e.target.value)}
          rows={8} placeholder={"Текст поста...\n\nПоддерживается HTML-разметка Telegram:\n<b>жирный</b>, <i>курсив</i>, <code>код</code>"}
          style={{ width: "100%", background: "#07060d", border: "1px solid #374151", borderRadius: 10, padding: "12px 14px", color: "#ede8ff", fontSize: 13, lineHeight: 1.7, resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
          <span style={{ fontSize: 11, color: charCount > 4096 ? "#ef4444" : "#374151" }}>
            {charCount} / 4096 {charCount > 4096 ? "⚠ превышен лимит" : ""}
          </span>
          <div style={{ display: "flex", gap: 12 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#6b7280", cursor: "pointer" }}>
              <input type="checkbox" checked={silent} onChange={e => setSilent(e.target.checked)} />
              Тихая отправка
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#6b7280", cursor: "pointer" }}>
              <input type="checkbox" checked={noPreview} onChange={e => setNoPreview(e.target.checked)} />
              Без превью ссылок
            </label>
          </div>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div style={{ padding: "12px 16px", borderRadius: 10, border: "1px solid", display: "flex", alignItems: "center", gap: 10,
          background: result.ok ? "#052e16" : "#7f1d1d", borderColor: result.ok ? "#166534" : "#991b1b" }}>
          {result.ok
            ? <CheckCircle2 style={{ width: 16, height: 16, color: "#4ade80", flexShrink: 0 }} />
            : <AlertCircle style={{ width: 16, height: 16, color: "#f87171", flexShrink: 0 }} />}
          <span style={{ fontSize: 13, color: result.ok ? "#4ade80" : "#f87171" }}>
            {result.ok ? `Пост отправлен (ID сообщения: ${result.messageId})` : `Ошибка: ${result.error}`}
          </span>
        </div>
      )}

      <button onClick={send} disabled={sending || !text.trim() || !targetId}
        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 0", background: sending ? "#374151" : "#6366f1", border: "none", borderRadius: 10, color: "#fff", cursor: sending ? "not-allowed" : "pointer", fontSize: 15, fontWeight: 700, opacity: (!text.trim() || !targetId) ? 0.5 : 1 }}>
        <Send style={{ width: 16, height: 16 }} />
        {sending ? "Отправляю…" : "Отправить в Telegram"}
      </button>
    </div>
  );
}

// ─── FunnelPanel ──────────────────────────────────────────────────────────────
function FunnelPanel({ projectId, steps, targets, botAlive }: { projectId: string; steps: FunnelStep[]; targets: ChannelEntry[]; botAlive: boolean }) {
  const [targetId, setTargetId] = useState(targets[0]?.id ?? "");
  const [sending, setSending]   = useState<string | null>(null);
  const [results, setResults]   = useState<Record<string, SendResult>>({});
  const [previewing, setPrev]   = useState<string | null>(null);

  if (!botAlive) return <BotOfflineBanner />;

  if (steps.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0", color: "#374151" }}>
        <ListOrdered style={{ width: 36, height: 36, margin: "0 auto 12px", opacity: 0.3 }} />
        <p style={{ fontSize: 14 }}>Нет шагов воронки</p>
        <p style={{ fontSize: 12, color: "#374151", marginTop: 4 }}>Создай их на вкладке «Telegram-воронка»</p>
      </div>
    );
  }

  async function sendStep(step: FunnelStep) {
    setSending(step.id);
    const r = await fetch(`/api/bot/${projectId}/send`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatId: targetId, text: `<b>${step.title}</b>\n\n${step.content}` }),
    });
    const d = await r.json();
    setResults(prev => ({ ...prev, [step.id]: d }));
    setSending(null);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Target selector */}
      <div style={{ background: "#0d0b18", border: "1px solid #1e1c38", borderRadius: 12, padding: 16 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: "#9ca3af", display: "block", marginBottom: 10 }}>
          Отправить воронку в канал / группу
        </label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {targets.map(t => (
            <button key={t.id} onClick={() => setTargetId(t.id)}
              style={{ padding: "6px 14px", borderRadius: 8, fontSize: 13, cursor: "pointer", fontWeight: targetId === t.id ? 600 : 400, border: "1px solid", transition: "all 0.15s",
                background: targetId === t.id ? "#6366f120" : "none", borderColor: targetId === t.id ? "#6366f150" : "#374151", color: targetId === t.id ? "#818cf8" : "#6b7280" }}>
              {t.title ?? t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Steps */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {steps.map((step, idx) => {
          const color = STEP_COLORS[step.type] ?? "#6b7280";
          const res = results[step.id];
          const isOpen = previewing === step.id;
          return (
            <div key={step.id} style={{ background: "#0d0b18", border: `1px solid ${res?.ok ? "#166534" : color + "22"}`, borderRadius: 12, overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", padding: "12px 16px", gap: 12 }}>
                <div style={{ width: 26, height: 26, borderRadius: "50%", background: color + "20", border: `1px solid ${color}40`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color }}>{idx + 1}</span>
                </div>
                <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: color + "15", color, fontWeight: 600 }}>
                  {STEP_LABELS[step.type] ?? step.type}
                </span>
                <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: "#ede8ff" }}>{step.title}</span>

                {res && (
                  <span style={{ fontSize: 12, color: res.ok ? "#4ade80" : "#f87171", display: "flex", alignItems: "center", gap: 4 }}>
                    {res.ok ? <CheckCircle2 style={{ width: 13, height: 13 }} /> : <AlertCircle style={{ width: 13, height: 13 }} />}
                    {res.ok ? `Отправлен #${res.messageId}` : res.error}
                  </span>
                )}

                <button onClick={() => setPrev(isOpen ? null : step.id)}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 4, opacity: 0.5 }}
                  title={isOpen ? "Скрыть" : "Превью"}>
                  {isOpen ? <EyeOff style={{ width: 14, height: 14, color: "#9ca3af" }} /> : <Eye style={{ width: 14, height: 14, color: "#9ca3af" }} />}
                </button>

                <button onClick={() => sendStep(step)} disabled={sending === step.id || !targetId}
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", background: res?.ok ? "#052e16" : "#6366f1", border: "none", borderRadius: 8, color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600, flexShrink: 0 }}>
                  <Send style={{ width: 12, height: 12 }} />
                  {sending === step.id ? "…" : res?.ok ? "Переслать" : "Отправить"}
                </button>
              </div>

              {isOpen && (
                <div style={{ padding: "0 16px 14px", borderTop: "1px solid #1e1c38" }}>
                  <div style={{ background: "#07060d", borderRadius: 8, padding: "12px 14px", marginTop: 10 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color, marginBottom: 6 }}>{step.title}</div>
                    <div style={{ fontSize: 13, color: "#9ca3af", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{step.content}</div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ padding: "12px 16px", background: "#0d0b18", borderRadius: 10, border: "1px solid #1e1c38" }}>
        <p style={{ fontSize: 12, color: "#4b5563", margin: 0, lineHeight: 1.6 }}>
          💡 Шаги отправляются по одному — ты контролируешь интервал между ними. Редактировать тексты можно на вкладке «Telegram-воронка».
        </p>
      </div>
    </div>
  );
}

// ─── BotOfflineBanner ─────────────────────────────────────────────────────────
function BotOfflineBanner() {
  return (
    <div style={{ textAlign: "center", padding: "60px 0" }}>
      <XCircle style={{ width: 36, height: 36, margin: "0 auto 12px", color: "#ef4444", opacity: 0.5 }} />
      <p style={{ fontSize: 15, color: "#ede8ff", marginBottom: 6 }}>Бот недоступен</p>
      <p style={{ fontSize: 13, color: "#6b7280" }}>Проверь токен на вкладке «Статус» и убедись что бот запущен</p>
    </div>
  );
}

