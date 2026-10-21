import { cn } from "@/lib/utils";

interface BadgeProps {
  className?: string;
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "info";
}

export function Badge({ className, children, variant = "default" }: BadgeProps) {
  const styles: Record<string, React.CSSProperties> = {
    default: { background: "rgba(99,102,241,0.1)", color: "#a5b4fc", border: "1px solid rgba(99,102,241,0.2)" },
    success: { background: "rgba(34,197,94,0.1)", color: "#86efac", border: "1px solid rgba(34,197,94,0.2)" },
    warning: { background: "rgba(245,158,11,0.1)", color: "#fcd34d", border: "1px solid rgba(245,158,11,0.2)" },
    error:   { background: "rgba(239,68,68,0.1)",  color: "#fca5a5", border: "1px solid rgba(239,68,68,0.2)" },
    info:    { background: "rgba(167,139,250,0.1)", color: "#c4b5fd", border: "1px solid rgba(167,139,250,0.2)" },
  };

  return (
    <span
      className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium", className)}
      style={styles[variant ?? "default"]}
    >
      {children}
    </span>
  );
}
