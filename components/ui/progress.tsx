import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  color?: string;
  showLabel?: boolean;
}

export function Progress({ value, max = 100, className, color = "#f59e0b", showLabel }: ProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "#1e1c38" }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: color === "#f59e0b"
              ? "linear-gradient(90deg, #f59e0b, #a78bfa)"
              : color,
          }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-mono w-8 text-right" style={{ color: "#6b6885" }}>
          {Math.round(pct)}%
        </span>
      )}
    </div>
  );
}
