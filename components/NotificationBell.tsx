"use client";
import { useState, useEffect } from "react";
import { Bell, X, Check } from "lucide-react";
import Link from "next/link";

export function NotificationBell() {
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchCount = async () => {
    try {
      const res = await fetch("/api/notifications/count");
      if (res.ok) { const d = await res.json(); setCount(d.count); }
    } catch {}
  };

  const handleOpen = async () => {
    setOpen(!open);
    if (!open) {
      try {
        const res = await fetch("/api/notifications");
        if (res.ok) setNotifications(await res.json());
      } catch {}
    }
  };

  const markRead = async () => {
    await fetch("/api/notifications/read", { method: "POST" });
    setCount(0);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: 1 })));
  };

  const TYPE_COLORS: Record<string, string> = {
    info: "#6366f1", success: "#10b981", warning: "#f59e0b", upgrade: "#f59e0b",
  };

  return (
    <div className="relative">
      <button onClick={handleOpen} className="relative p-2 rounded-lg transition-all"
        style={{ background: open ? "#13112a" : "transparent" }}>
        <Bell className="w-4 h-4" style={{ color: count > 0 ? "#f59e0b" : "#6b6885" }} />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center"
            style={{ background: "#f59e0b", color: "#07060d" }}>
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 rounded-xl overflow-hidden z-50"
          style={{ background: "#0d0b18", border: "1px solid #1e1c38", boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}>
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid #1e1c38" }}>
            <span className="text-xs font-semibold" style={{ color: "#ede8ff" }}>Уведомления</span>
            <div className="flex gap-2">
              {count > 0 && (
                <button onClick={markRead} className="text-[10px]" style={{ color: "#f59e0b" }}>
                  Прочитать все
                </button>
              )}
              <button onClick={() => setOpen(false)}>
                <X className="w-3.5 h-3.5" style={{ color: "#6b6885" }} />
              </button>
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-6 text-center text-xs" style={{ color: "#6b6885" }}>Нет уведомлений</div>
            ) : (
              notifications.map(n => (
                <div key={n.id} className="px-4 py-3 flex items-start gap-3"
                  style={{ background: n.isRead ? "transparent" : "rgba(245,158,11,0.03)", borderBottom: "1px solid #1e1c38" }}>
                  <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
                    style={{ background: n.isRead ? "#3d3a5c" : (TYPE_COLORS[n.type] ?? "#6b6885") }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium" style={{ color: "#ede8ff" }}>{n.title}</div>
                    {n.message && <div className="text-[10px] mt-0.5" style={{ color: "#6b6885" }}>{n.message}</div>}
                    <div className="text-[9px] mt-1" style={{ color: "#3d3a5c" }}>
                      {new Date(n.createdAt).toLocaleDateString("ru")}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
