"use client"
import { useState, useEffect, use } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Rocket, CheckSquare, Square } from "lucide-react";

const PHASE_CONFIG = {
  pre_launch: { label: "До запуска", subtitle: "2 недели подготовки", color: "#6366f1", icon: "🔧" },
  launch_day: { label: "День запуска", subtitle: "Час за часом", color: "#f59e0b", icon: "🚀" },
  post_launch: { label: "После запуска", subtitle: "Первые 72 часа", color: "#10b981", icon: "📈" },
};

export default function LaunchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const data = await fetch(`/api/launch/${id}`).then(r => r.json());
    setItems(data);
    setLoading(false);
  };
  useEffect(() => { load(); }, [id]);

  const toggle = async (item: any) => {
    const optimistic = items.map(i => i.id === item.id ? { ...i, completed: i.completed ? 0 : 1 } : i);
    setItems(optimistic);
    await fetch(`/api/launch/${item.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ completed: !item.completed }) });
  };

  const phases = ["pre_launch", "launch_day", "post_launch"] as const;

  const phaseProgress = (phase: string) => {
    const phaseItems = items.filter(i => i.phase === phase);
    const done = phaseItems.filter(i => i.completed).length;
    return { done, total: phaseItems.length, pct: phaseItems.length ? Math.round(done / phaseItems.length * 100) : 0 };
  };

  const totalDone = items.filter(i => i.completed).length;
  const totalItems = items.length;
  const overallPct = totalItems ? Math.round(totalDone / totalItems * 100) : 0;

  if (loading) return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar projectId={id} />
      <main className="flex-1 flex items-center justify-center" style={{ background: "#07060d" }}>
        <div className="text-sm" style={{ color: "#6b6885" }}>Загрузка чеклиста...</div>
      </main>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar projectId={id} />
      <main className="flex-1 overflow-y-auto" style={{ background: "#07060d" }}>
        <div className="max-w-5xl mx-auto px-8 py-8">

          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-xl font-semibold" style={{ color: "#ede8ff" }}>Launch Playbook</h1>
              <p className="text-sm mt-1" style={{ color: "#6b6885" }}>
                Пошаговый план запуска — от подготовки до первых результатов
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold font-mono" style={{ color: overallPct === 100 ? "#86efac" : "#f59e0b" }}>{overallPct}%</div>
              <div className="text-xs" style={{ color: "#6b6885" }}>{totalDone}/{totalItems} задач</div>
            </div>
          </div>

          {/* Overall progress bar */}
          <div className="h-2 rounded-full overflow-hidden mb-8" style={{ background: "#1e1c38" }}>
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${overallPct}%`, background: "linear-gradient(90deg, #6366f1, #f59e0b, #10b981)" }} />
          </div>

          {/* Phase summaries */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {phases.map(phase => {
              const cfg = PHASE_CONFIG[phase];
              const { done, total, pct } = phaseProgress(phase);
              return (
                <div key={phase} className="rounded-xl p-4" style={{ background: "#0d0b18", border: `1px solid ${cfg.color}33` }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{cfg.icon}</span>
                    <div>
                      <div className="text-sm font-semibold" style={{ color: cfg.color }}>{cfg.label}</div>
                      <div className="text-xs" style={{ color: "#6b6885" }}>{cfg.subtitle}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "#1e1c38" }}>
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: cfg.color }} />
                    </div>
                    <span className="text-xs font-mono" style={{ color: cfg.color }}>{done}/{total}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Checklist by phase */}
          <div className="space-y-10">
            {phases.map(phase => {
              const cfg = PHASE_CONFIG[phase];
              const phaseItems = items.filter(i => i.phase === phase);
              const categories = [...new Set(phaseItems.map(i => i.category))];

              return (
                <div key={phase}>
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-2xl">{cfg.icon}</span>
                    <div>
                      <h2 className="text-base font-bold" style={{ color: cfg.color }}>{cfg.label}</h2>
                      <p className="text-xs" style={{ color: "#6b6885" }}>{cfg.subtitle}</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {categories.map(cat => {
                      const catItems = phaseItems.filter(i => i.category === cat);
                      const catDone = catItems.filter(i => i.completed).length;
                      return (
                        <div key={cat}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#3d3a5c" }}>{cat}</div>
                            <div className="text-xs font-mono" style={{ color: catDone === catItems.length ? "#86efac" : "#6b6885" }}>
                              {catDone}/{catItems.length}
                            </div>
                          </div>
                          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #1e1c38" }}>
                            {catItems.map((item, idx) => (
                              <div
                                key={item.id}
                                onClick={() => toggle(item)}
                                className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-all hover-task ${idx < catItems.length - 1 ? "border-b" : ""}`}
                                style={{ background: "#0d0b18", borderColor: "#1e1c38" }}
                              >
                                <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded flex items-center justify-center"
                                  style={{ background: item.completed ? cfg.color + "22" : "transparent", border: `1.5px solid ${item.completed ? cfg.color : "#3d3a5c"}` }}>
                                  {item.completed && <div className="w-2.5 h-2.5 rounded-sm" style={{ background: cfg.color }} />}
                                </div>
                                <div className="flex-1">
                                  <span className={`text-sm transition-all ${item.completed ? "line-through opacity-40" : ""}`} style={{ color: "#ede8ff" }}>
                                    {item.title}
                                  </span>
                                  {item.description && (
                                    <p className="text-xs mt-0.5" style={{ color: "#6b6885" }}>{item.description}</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Launch wisdom */}
          <div className="mt-10 rounded-xl p-5" style={{ background: "#0d0b18", border: "1px solid #1e1c38" }}>
            <h3 className="text-sm font-medium mb-3" style={{ color: "#ede8ff" }}>Главные ошибки при запуске — реальные кейсы</h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              {[
                { mistake: "Запуск без waitlist", impact: "Figma набрала 50K waitlist до запуска → Day 1 = 50K пользователей. Без списка — ты запускаешься в пустоту.", fix: "Начни собирать email за 4 недели до запуска" },
                { mistake: "Один пост = весь запуск", impact: "Linear делал посты каждые 2 часа в день запуска + founder доступен для ответов. Один пост умирает за 30 минут.", fix: "Подготовь 8+ постов/твитов для launch day" },
                { mistake: "ProductHunt без подготовки", impact: "Средний старт в 12:01 AM PST с поддержкой 200+ upvotes в первый час = Top 5. Без подготовки = страница 3.", fix: "Активируй нетворк за неделю" },
                { mistake: "Игнорировать комьюнити", impact: "Notion в 2018 пришёл в каждый Discord/Slack дизайнеров лично. Это дало первые 10K пользователей.", fix: "Вступи в 10+ комьюнити и стань своим перед запуском" },
              ].map(m => (
                <div key={m.mistake} className="p-3 rounded-lg" style={{ background: "#13112a" }}>
                  <div className="font-semibold mb-1" style={{ color: "#fca5a5" }}>✗ {m.mistake}</div>
                  <div className="mb-2" style={{ color: "#ede8ff" }}>{m.impact}</div>
                  <div className="font-medium" style={{ color: "#86efac" }}>→ {m.fix}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

