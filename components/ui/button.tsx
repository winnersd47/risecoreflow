"use client";
import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, style, ...props }, ref) => {
    const variantStyles: Record<string, React.CSSProperties> = {
      primary: {
        background: "linear-gradient(135deg, #f59e0b, #d97706)",
        color: "#07060d",
        border: "1px solid transparent",
        boxShadow: "0 0 12px rgba(245,158,11,0.25)",
      },
      secondary: {
        background: "#13112a",
        border: "1px solid #1e1c38",
        color: "#ede8ff",
      },
      ghost: {
        background: "transparent",
        border: "1px solid transparent",
        color: "#6b6885",
      },
      danger: {
        background: "rgba(239,68,68,0.1)",
        border: "1px solid rgba(239,68,68,0.2)",
        color: "#f87171",
      },
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-95",
          {
            "text-xs px-3 py-1.5": size === "sm",
            "text-sm px-4 py-2": size === "md",
            "text-base px-6 py-3": size === "lg",
          },
          className
        )}
        style={{ ...variantStyles[variant ?? "primary"], ...style }}
        onMouseEnter={(e) => {
          const el = e.currentTarget;
          if (variant === "primary") {
            el.style.boxShadow = "0 0 20px rgba(245,158,11,0.4)";
            el.style.filter = "brightness(1.1)";
          } else if (variant === "secondary") {
            el.style.borderColor = "rgba(245,158,11,0.3)";
            el.style.background = "#1a1735";
          } else if (variant === "ghost") {
            el.style.color = "#ede8ff";
            el.style.background = "#13112a";
          }
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget;
          if (variant === "primary") {
            el.style.boxShadow = "0 0 12px rgba(245,158,11,0.25)";
            el.style.filter = "";
          } else if (variant === "secondary") {
            el.style.borderColor = "#1e1c38";
            el.style.background = "#13112a";
          } else if (variant === "ghost") {
            el.style.color = "#6b6885";
            el.style.background = "transparent";
          }
        }}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export { Button };
