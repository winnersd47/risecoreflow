import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Sidebar } from "@/components/Sidebar";
import { TASK_CATEGORIES, TASK_STATUSES } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { TaskStatusToggle } from "./TaskStatusToggle";

export default async function TasksPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: { tasks: { orderBy: { priority: "asc" } } },
  });

  if (!project) notFound();

  const grouped = project.tasks.reduce((acc, task) => {
    if (!acc[task.category]) acc[task.category] = [];
    acc[task.category].push(task);
    return acc;
  }, {} as Record<string, typeof project.tasks>);

  const total = project.tasks.length;
  const completed = project.tasks.filter((t) => t.status === "completed").length;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar projectId={id} />
      <main className="flex-1 overflow-y-auto" style={{ background: "#07060d" }}>
        <div className="max-w-4xl mx-auto px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-semibold" style={{ color: "#ede8ff" }}>Задачи</h1>
              <p className="text-sm mt-1" style={{ color: "#6b6885" }}>{completed} из {total} выполнено</p>
            </div>
            <div className="w-48">
              <Progress value={completed} max={total || 1} showLabel />
            </div>
          </div>

          <div className="space-y-6">
            {Object.entries(grouped).map(([category, tasks]) => {
              const cat = TASK_CATEGORIES[category as keyof typeof TASK_CATEGORIES];
              const done = tasks.filter((t) => t.status === "completed").length;

              return (
                <div key={category}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{cat?.icon || "📋"}</span>
                      <h2 className="text-sm font-medium" style={{ color: "#ede8ff" }}>{cat?.label || category}</h2>
                      <span className="text-xs font-mono" style={{ color: "#6b6885" }}>{done}/{tasks.length}</span>
                    </div>
                    <div className="w-24">
                      <Progress value={done} max={tasks.length} />
                    </div>
                  </div>

                  <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #1e1c38" }}>
                    {tasks.map((task, i) => {
                      const st = TASK_STATUSES[task.status as keyof typeof TASK_STATUSES];
                      const statusStyle = task.status === "completed"
                        ? { background: "rgba(34,197,94,0.1)", color: "#86efac", border: "1px solid rgba(34,197,94,0.2)" }
                        : task.status === "in_progress"
                        ? { background: "rgba(245,158,11,0.1)", color: "#fcd34d", border: "1px solid rgba(245,158,11,0.2)" }
                        : { background: "rgba(99,102,241,0.1)", color: "#a5b4fc", border: "1px solid rgba(99,102,241,0.2)" };

                      return (
                        <div
                          key={task.id}
                          className={`hover-task flex items-start gap-4 px-4 py-3.5 transition-colors ${
                            i < tasks.length - 1 ? "border-b" : ""
                          } ${task.status === "completed" ? "opacity-50" : ""}`}
                          style={{
                            background: "#0d0b18",
                            borderColor: "#1e1c38",
                          }}
                        >
                          <TaskStatusToggle taskId={task.id} status={task.status} />
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm ${task.status === "completed" ? "line-through" : ""}`}
                              style={{ color: "#ede8ff" }}>
                              {task.subject}
                            </p>
                            <p className="text-xs mt-0.5 line-clamp-1" style={{ color: "#6b6885" }}>
                              {task.description}
                            </p>
                          </div>
                          <span className="text-xs px-2 py-0.5 rounded-md flex-shrink-0" style={statusStyle}>
                            {st?.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}


export async function generateStaticParams() { return []; }