"use client";
import { cn } from "@/lib/utils";

interface CardProps {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  hover?: boolean;
}

export function Card({ className, children, onClick, hover }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-xl p-5",
        hover && "cursor-pointer transition-all duration-150",
        className
      )}
      style={{
        background: "#0d0b18",
        border: "1px solid #1e1c38",
      }}
      onMouseEnter={hover ? (e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(245,158,11,0.25)";
        (e.currentTarget as HTMLElement).style.background = "#13112a";
      } : undefined}
      onMouseLeave={hover ? (e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "#1e1c38";
        (e.currentTarget as HTMLElement).style.background = "#0d0b18";
      } : undefined}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("flex items-center justify-between mb-4", className)}>{children}</div>;
}

export function CardTitle({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <h3
      className={cn("text-xs font-semibold uppercase tracking-wider", className)}
      style={{ color: "#3d3a5c" }}
    >
      {children}
    </h3>
  );
}

export function CardValue({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn("text-2xl font-bold font-mono", className)}
      style={{ color: "#ede8ff" }}
    >
      {children}
    </div>
  );
}
