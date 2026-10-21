import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const PROFILES = {
  developer: { label: "Developer", color: "#3b82f6", bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" },
  founder: { label: "Founder", color: "#f59e0b", bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20" },
  pm: { label: "Product Manager", color: "#8b5cf6", bg: "bg-violet-500/10", text: "text-violet-400", border: "border-violet-500/20" },
  all: { label: "Все профили", color: "#2dd4bf", bg: "bg-teal-500/10", text: "text-teal-400", border: "border-teal-500/20" },
  // WinExtraFlow profiles
  crypto: { label: "Крипто-трейдер", color: "#f97316", bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/20" },
  investor: { label: "Инвестор MOEX", color: "#10b981", bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
  trader: { label: "Трейдер", color: "#06b6d4", bg: "bg-cyan-500/10", text: "text-cyan-400", border: "border-cyan-500/20" },
  beginner: { label: "Начинающий", color: "#a78bfa", bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20" },
};

export const POST_TYPES = {
  education: { label: "Образование", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  proof: { label: "Доказательство", color: "bg-green-500/10 text-green-400 border-green-500/20" },
  community: { label: "Комьюнити", color: "bg-violet-500/10 text-violet-400 border-violet-500/20" },
  pain: { label: "Боль", color: "bg-red-500/10 text-red-400 border-red-500/20" },
  conversion: { label: "Конверсия", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  data: { label: "Данные", color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" },
};

export const POST_STATUSES = {
  draft: { label: "Черновик", color: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20" },
  ready: { label: "Готов", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  published: { label: "Опубликован", color: "bg-green-500/10 text-green-400 border-green-500/20" },
};

export const TASK_CATEGORIES = {
  content: { label: "Контент", icon: "📝" },
  bot: { label: "Бот", icon: "🤖" },
  growth: { label: "Рост", icon: "📈" },
  multiplatform: { label: "Мультиплатформа", icon: "🌐" },
  analytics: { label: "Аналитика", icon: "📊" },
  conversion: { label: "Конверсия", icon: "🎯" },
};

export const TASK_STATUSES = {
  pending: { label: "Ожидает", color: "bg-zinc-500/10 text-zinc-400" },
  in_progress: { label: "В работе", color: "bg-amber-500/10 text-amber-400" },
  completed: { label: "Выполнено", color: "bg-green-500/10 text-green-400" },
};
