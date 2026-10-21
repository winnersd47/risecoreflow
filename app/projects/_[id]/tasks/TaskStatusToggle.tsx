"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function TaskStatusToggle({ taskId, status }: { taskId: string; status: string }) {
  const router = useRouter();
  const [current, setCurrent] = useState(status);
  const [loading, setLoading] = useState(false);

  const cycle = async () => {
    const next = current === "pending" ? "in_progress" : current === "in_progress" ? "completed" : "pending";
    setLoading(true);
    await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setCurrent(next);
    setLoading(false);
    router.refresh();
  };

  const getStyle = () => {
    if (current === "completed") return { background: "#f59e0b", borderColor: "#f59e0b" };
    if (current === "in_progress") return { background: "rgba(245,158,11,0.1)", borderColor: "#f59e0b" };
    return { background: "transparent", borderColor: "#1e1c38" };
  };

  return (
    <button
      onClick={cycle}
      disabled={loading}
      className="w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 transition-all cursor-pointer"
      style={getStyle()}
    >
      {current === "completed" && (
        <svg viewBox="0 0 10 10" className="w-full h-full p-0.5">
          <path d="M1.5 5L4 7.5L8.5 2.5" stroke="#07060d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      )}
    </button>
  );
}
