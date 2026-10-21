"use client";
import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { HelpCircle } from "lucide-react";

export interface HelpTooltipProps {
  title: string;
  text: string;
  example?: string;
  tip?: string;
  size?: number;
}

export function HelpTooltip({ title, text, example, tip, size = 13 }: HelpTooltipProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);

  function show() {
    if (!btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    setPos({ top: r.top, left: r.left + r.width / 2 });
    setOpen(true);
  }

  const popover = open && (
    <div
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      style={{
        position: "fixed", zIndex: 99999,
        top: pos.top - 8, left: pos.left,
        transform: "translate(-50%, -100%)",
        width: 272, background: "#13112a",
        border: "1px solid #312e81", borderRadius: 12,
        padding: 16, boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
        pointerEvents: "auto",
      }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#818cf8", marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 12, color: "#9ca3af", lineHeight: 1.65 }}>{text}</div>
      {example && (
        <div style={{ marginTop: 10, background: "#07060d", borderRadius: 8, padding: "8px 12px", borderLeft: "2px solid #6366f1" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#6366f1", marginBottom: 4, letterSpacing: "0.05em" }}>ПРИМЕР</div>
          <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.55 }}>{example}</div>
        </div>
      )}
      {tip && (
        <div style={{ marginTop: 10, fontSize: 12, color: "#f59e0b", lineHeight: 1.55 }}>💡 {tip}</div>
      )}
      {/* Arrow */}
      <div style={{
        position: "absolute", bottom: -5, left: "50%",
        transform: "translateX(-50%) rotate(45deg)",
        width: 8, height: 8, background: "#13112a",
        borderRight: "1px solid #312e81", borderBottom: "1px solid #312e81",
      }} />
    </div>
  );

  return (
    <>
      <button ref={btnRef}
        onMouseEnter={show} onMouseLeave={() => setOpen(false)}
        onClick={() => open ? setOpen(false) : show()}
        style={{ background: "none", border: "none", cursor: "pointer", padding: "0 2px", display: "inline-flex", alignItems: "center", lineHeight: 1 }}>
        <HelpCircle style={{ width: size, height: size, color: open ? "#818cf8" : "#374151", transition: "color 0.15s" }} />
      </button>
      {typeof document !== "undefined" && open && createPortal(popover, document.body)}
    </>
  );
}
