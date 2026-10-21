export const dynamic = 'force-static';
import Link from "next/link";
import { prisma } from "@/lib/db";
import { Sidebar } from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Plus, ArrowRight, CalendarDays, CheckSquare } from "lucide-react";

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    include: { posts: true, tasks: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto" style={{ background: "#07060d" }}>
        <div className="max-w-5xl mx-auto px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-xl font-semibold" style={{ color: "#ede8ff" }}>Проекты</h1>
              <p className="text-sm mt-1" style={{ color: "#6b6885" }}>
                {projects.length} {projects.length === 1 ? "проект" : "проекта"}
              </p>
            </div>
            <Link href="/projects/new">
              <Button>
                <Plus className="w-4 h-4" />
                Новый проект
              </Button>
            </Link>
          </div>

          {projects.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function ProjectCard({ project }: { project: any }) {
  const totalPosts = project.posts.length;
  const publishedPosts = project.posts.filter((p: any) => p.status === "published").length;
  const totalTasks = project.tasks.length;
  const completedTasks = project.tasks.filter((t: any) => t.status === "completed").length;
  const postsProgress = totalPosts > 0 ? (publishedPosts / totalPosts) * 100 : 0;
  const tasksProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const overallProgress = (postsProgress + tasksProgress) / 2;

  return (
    <Link href={`/projects/${project.id}`}>
      <Card hover className="group">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="font-semibold transition-colors group-hover:opacity-80"
              style={{ color: "#ede8ff" }}>
              {project.name}
            </h2>
            {project.description && (
              <p className="text-xs mt-1 line-clamp-2" style={{ color: "#6b6885" }}>
                {project.description}
              </p>
            )}
          </div>
          <div className="text-xs font-mono rounded px-2 py-1 flex-shrink-0 ml-3"
            style={{ color: "#f59e0b", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}>
            {project.wave}
          </div>
        </div>

        <div className="flex gap-4 mb-4">
          <div className="flex items-center gap-1.5 text-xs" style={{ color: "#6b6885" }}>
            <CalendarDays className="w-3.5 h-3.5" />
            <span>{publishedPosts}/{totalPosts} постов</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: "#6b6885" }}>
            <CheckSquare className="w-3.5 h-3.5" />
            <span>{completedTasks}/{totalTasks} задач</span>
          </div>
        </div>

        <Progress value={overallProgress} showLabel />

        <div className="mt-4 flex items-center justify-between">
          {project.channel && (
            <span className="text-xs" style={{ color: "#6b6885" }}>{project.channel}</span>
          )}
          <ArrowRight className="w-4 h-4 ml-auto transition-colors" style={{ color: "#6b6885" }} />
        </div>
      </Card>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: "#13112a", border: "1px solid #1e1c38" }}>
        <Plus className="w-6 h-6" style={{ color: "#6b6885" }} />
      </div>
      <h3 className="text-sm font-medium mb-2" style={{ color: "#ede8ff" }}>Нет проектов</h3>
      <p className="text-xs mb-6 max-w-xs" style={{ color: "#6b6885" }}>
        Создай первый маркетинговый проект и управляй контент-планом, задачами и аналитикой в одном месте.
      </p>
      <Link href="/projects/new">
        <Button>
          <Plus className="w-4 h-4" />
          Создать проект
        </Button>
      </Link>
    </div>
  );
}
