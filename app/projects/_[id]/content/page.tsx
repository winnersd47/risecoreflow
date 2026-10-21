import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { PROFILES, POST_TYPES, POST_STATUSES } from "@/lib/utils";
import { PostActions } from "./PostActions";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function ContentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: { posts: { orderBy: { day: "asc" } } },
  });

  if (!project) notFound();

  const published = project.posts.filter((p) => p.status === "published").length;
  const ready = project.posts.filter((p) => p.status === "ready").length;
  const draft = project.posts.filter((p) => p.status === "draft").length;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar projectId={id} />
      <main className="flex-1 overflow-y-auto" style={{ background: "#07060d" }}>
        <div className="max-w-5xl mx-auto px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-semibold" style={{ color: "#ede8ff" }}>Контент-план</h1>
              <div className="flex gap-4 mt-2">
                <span className="text-xs" style={{ color: "#86efac" }}>{published} опубликовано</span>
                <span className="text-xs" style={{ color: "#fcd34d" }}>{ready} готово</span>
                <span className="text-xs" style={{ color: "#6b6885" }}>{draft} черновиков</span>
              </div>
            </div>
            <Link href={`/projects/${id}/content/new`}>
              <Button size="sm">
                <Plus className="w-4 h-4" />
                Добавить пост
              </Button>
            </Link>
          </div>

          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #1e1c38" }}>
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid #1e1c38", background: "#0d0b18" }}>
                  <th className="text-left text-xs font-medium px-4 py-3 w-16" style={{ color: "#3d3a5c" }}>День</th>
                  <th className="text-left text-xs font-medium px-4 py-3" style={{ color: "#3d3a5c" }}>Тема</th>
                  <th className="text-left text-xs font-medium px-4 py-3 w-32" style={{ color: "#3d3a5c" }}>Профиль</th>
                  <th className="text-left text-xs font-medium px-4 py-3 w-28" style={{ color: "#3d3a5c" }}>Тип</th>
                  <th className="text-left text-xs font-medium px-4 py-3 w-28" style={{ color: "#3d3a5c" }}>Статус</th>
                  <th className="text-right text-xs font-medium px-4 py-3 w-24" style={{ color: "#3d3a5c" }}>Действия</th>
                </tr>
              </thead>
              <tbody>
                {project.posts.map((post, i) => {
                  const profile = PROFILES[post.profile as keyof typeof PROFILES] || PROFILES.all;
                  const type = POST_TYPES[post.type as keyof typeof POST_TYPES];
                  const status = POST_STATUSES[post.status as keyof typeof POST_STATUSES];

                  return (
                    <tr
                      key={post.id}
                      className={`hover-row ${i === project.posts.length - 1 ? "" : "border-b"}`}
                      style={{ borderColor: "#1e1c38", background: "#07060d" }}
                    >
                      <td className="px-4 py-3.5">
                        <span className="text-xs font-mono" style={{ color: "#6b6885" }}>{post.day}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <Link href={`/projects/${id}/content/${post.id}`}>
                          <span className="text-sm cursor-pointer line-clamp-1 transition-colors hover:opacity-70"
                            style={{ color: "#ede8ff" }}>
                            {post.title}
                          </span>
                        </Link>
                        {post.content && (
                          <p className="text-xs mt-0.5 line-clamp-1" style={{ color: "#6b6885" }}>
                            {post.content.slice(0, 80)}...
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`text-xs px-2 py-0.5 rounded-md border ${profile.bg} ${profile.text} ${profile.border}`}>
                          {profile.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        {type && (
                          <span className={`text-xs px-2 py-0.5 rounded-md border ${type.color}`}>
                            {type.label}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        {status && (
                          <span className={`text-xs px-2 py-0.5 rounded-md border ${status.color}`}>
                            {status.label}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <PostActions post={post} projectId={id} />
                      </td>
                    </tr>
                  );
                })}
                {project.posts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-sm" style={{ color: "#6b6885" }}>
                      Постов нет. Добавь первый или загрузи готовые данные.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}


export async function generateStaticParams() { return []; }