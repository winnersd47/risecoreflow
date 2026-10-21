import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardHeader, CardTitle, CardValue } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, CheckSquare, Bot, BarChart3, ArrowRight, ExternalLink, Zap, TrendingUp, FlaskConical, Megaphone } from "lucide-react";

export default async function ProjectDashboard({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: { posts: true, tasks: true, metrics: { orderBy: { week: "desc" }, take: 1 } },
  });

  if (!project) notFound();

  const totalPosts = project.posts.length;
  const publishedPosts = project.posts.filter((p) => p.status === "published").length;
  const readyPosts = project.posts.filter((p) => p.status === "ready").length;
  const totalTasks = project.tasks.length;
  const completedTasks = project.tasks.filter((t) => t.status === "completed").length;
  const inProgressTasks = project.tasks.filter((t) => t.status === "in_progress").length;
  const latestMetric = project.metrics[0];

  const tasksByCategory = project.tasks.reduce((acc, task) => {
    if (!acc[task.category]) acc[task.category] = { total: 0, done: 0 };
    acc[task.category].total++;
    if (task.status === "completed") acc[task.category].done++;
    return acc;
  }, {} as Record<string, { total: number; done: number }>);

  const categoryLabels: Record<string, string> = {
    content: "Контент",
    bot: "Бот",
    growth: "Рост",
    multiplatform: "Мультиплатформа",
    analytics: "Аналитика",
    conversion: "Конверсия",
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar projectId={id} />
      <main className="flex-1 overflow-y-auto" style={{ background: "#07060d" }}>
        <div className="max-w-5xl mx-auto px-8 py-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-xl font-semibold" style={{ color: "#ede8ff" }}>{project.name}</h1>
                <span className="text-xs font-mono rounded px-2 py-0.5"
                  style={{ color: "#f59e0b", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}>
                  {project.wave}
                </span>
              </div>
              {project.description && (
                <p className="text-sm" style={{ color: "#6b6885" }}>{project.description}</p>
              )}
            </div>
            <div className="flex gap-2">
              {project.siteUrl && (
                <a href={`https://${project.siteUrl}`} target="_blank" rel="noopener noreferrer">
                  <Button variant="secondary" size="sm">
                    <ExternalLink className="w-3.5 h-3.5" />
                    Сайт
                  </Button>
                </a>
              )}
              {project.channel && (
                <a href={`https://t.me/${project.channel.replace("@", "")}`} target="_blank" rel="noopener noreferrer">
                  <Button variant="secondary" size="sm">
                    <ExternalLink className="w-3.5 h-3.5" />
                    Telegram
                  </Button>
                </a>
              )}
            </div>
          </div>

          {/* Pro Upgrade Banner */}
          <Link href={`/projects/${id}/upgrade`}>
            <div className="rounded-xl p-4 mb-6 flex items-center justify-between cursor-pointer hover-quicklink"
              style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.06), rgba(99,102,241,0.06))", border: "1px solid rgba(245,158,11,0.2)" }}>
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)" }}>
                  <Zap className="w-4 h-4" style={{ color: "#f59e0b" }} />
                </div>
                <div>
                  <div className="text-sm font-semibold" style={{ color: "#f59e0b" }}>Growth Suite заблокирован — Free план</div>
                  <div className="text-xs mt-0.5" style={{ color: "#6b6885" }}>
                    Разблокируй A/B тесты, трекинг кампаний, конкурентную разведку и ICP Manager
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="flex -space-x-1">
                  {[TrendingUp, FlaskConical, Megaphone].map((Icon, i) => (
                    <div key={i} className="w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ background: "#13112a", border: "1px solid rgba(245,158,11,0.3)" }}>
                      <Icon className="w-3 h-3" style={{ color: "#f59e0b" }} />
                    </div>
                  ))}
                </div>
                <span className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                  style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#07060d" }}>
                  Перейти на Pro →
                </span>
              </div>
            </div>
          </Link>

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <Card>
              <CardTitle>Постов</CardTitle>
              <CardValue className="mt-2">
                {publishedPosts}
                <span className="text-sm font-normal" style={{ color: "#6b6885" }}>/{totalPosts}</span>
              </CardValue>
              <Progress value={publishedPosts} max={totalPosts || 1} className="mt-3" showLabel />
            </Card>
            <Card>
              <CardTitle>Задач</CardTitle>
              <CardValue className="mt-2">
                {completedTasks}
                <span className="text-sm font-normal" style={{ color: "#6b6885" }}>/{totalTasks}</span>
              </CardValue>
              <Progress value={completedTasks} max={totalTasks || 1} className="mt-3" showLabel />
            </Card>
            <Card>
              <CardTitle>Подписчики</CardTitle>
              <CardValue className="mt-2">{latestMetric?.subscribers ?? "—"}</CardValue>
              <p className="text-xs mt-2" style={{ color: "#6b6885" }}>цель 500+</p>
            </Card>
            <Card>
              <CardTitle>ERR</CardTitle>
              <CardValue className="mt-2">
                {latestMetric?.err ? `${latestMetric.err}%` : "—"}
              </CardValue>
              <p className="text-xs mt-2" style={{ color: "#6b6885" }}>цель 20%+</p>
            </Card>
          </div>

          {/* Sections */}
          <div className="grid grid-cols-2 gap-6">
            {/* Content Plan */}
            <Card>
              <CardHeader>
                <CardTitle>Контент-план</CardTitle>
                <Link href={`/projects/${id}/content`}>
                  <Button variant="ghost" size="sm">
                    Открыть <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </CardHeader>
              <div className="space-y-3">
                <div className="flex justify-between text-xs" style={{ color: "#6b6885" }}>
                  <span>Опубликовано</span>
                  <span style={{ color: "#86efac" }}>{publishedPosts}</span>
                </div>
                <div className="flex justify-between text-xs" style={{ color: "#6b6885" }}>
                  <span>Готово к публикации</span>
                  <span style={{ color: "#fcd34d" }}>{readyPosts}</span>
                </div>
                <div className="flex justify-between text-xs" style={{ color: "#6b6885" }}>
                  <span>Черновики</span>
                  <span style={{ color: "#6b6885" }}>{totalPosts - publishedPosts - readyPosts}</span>
                </div>
                <Progress value={publishedPosts} max={totalPosts || 1} className="mt-2" color="#86efac" />
              </div>
            </Card>

            {/* Tasks */}
            <Card>
              <CardHeader>
                <CardTitle>Задачи</CardTitle>
                <Link href={`/projects/${id}/tasks`}>
                  <Button variant="ghost" size="sm">
                    Открыть <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </CardHeader>
              <div className="space-y-2.5">
                {Object.entries(tasksByCategory).slice(0, 5).map(([cat, { total, done }]) => (
                  <div key={cat} className="flex items-center gap-3">
                    <span className="text-xs w-28 flex-shrink-0" style={{ color: "#6b6885" }}>
                      {categoryLabels[cat] || cat}
                    </span>
                    <Progress value={done} max={total} className="flex-1" />
                    <span className="text-xs font-mono w-10 text-right" style={{ color: "#6b6885" }}>
                      {done}/{total}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Quick links */}
            <Card>
              <CardTitle className="mb-4">Быстрый доступ</CardTitle>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { href: `/projects/${id}/content`, icon: CalendarDays, label: "Контент-план" },
                  { href: `/projects/${id}/tasks`, icon: CheckSquare, label: "Задачи" },
                  { href: `/projects/${id}/bot`, icon: Bot, label: "Бот-воронка" },
                  { href: `/projects/${id}/analytics`, icon: BarChart3, label: "Аналитика" },
                ].map((item) => (
                  <Link key={item.href} href={item.href}>
                    <div className="hover-quicklink flex items-center gap-2.5 p-3 rounded-lg cursor-pointer"
                      style={{ border: "1px solid #1e1c38", background: "#13112a" }}>
                      <item.icon className="w-4 h-4" style={{ color: "#f59e0b" }} />
                      <span className="text-xs" style={{ color: "#ede8ff" }}>{item.label}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>

            {/* Active tasks */}
            <Card>
              <CardHeader>
                <CardTitle>В работе ({inProgressTasks})</CardTitle>
              </CardHeader>
              <div className="space-y-2">
                {project.tasks
                  .filter((t) => t.status === "in_progress")
                  .slice(0, 4)
                  .map((task) => (
                    <div key={task.id} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ background: "#f59e0b" }} />
                      <span className="text-xs line-clamp-1" style={{ color: "#ede8ff" }}>
                        {task.subject}
                      </span>
                    </div>
                  ))}
                {inProgressTasks === 0 && (
                  <p className="text-xs" style={{ color: "#6b6885" }}>Нет активных задач</p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}


export async function generateStaticParams() { return []; }