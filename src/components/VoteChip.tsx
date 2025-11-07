// src/components/VoteChip.tsx
"use client";

import { useRef } from "react";

export default function VoteChip({
  count,
  onClick,
  title = "Upvote (+1)",
}: {
  count: number | null;
  onClick: () => void;
  title?: string;
}) {
  const ref = useRef<HTMLButtonElement | null>(null);

  function pulse() {
    const el = ref.current;
    if (!el) return;
    el.classList.remove("vc__pulse");
    // force reflow to restart animation
    void el.offsetWidth;
    el.classList.add("vc__pulse");
  }

  return (
    <>
      <button
        ref={ref}
        className="vc"
        title={title}
        onClick={() => { onClick(); pulse(); }}
        aria-label="Upvote"
      >
        <span className="vc__arrow">▲</span>
        <span className="vc__count">{count ?? 0}</span>
      </button>

      <style>{`
        .vc{
          display:inline-grid; grid-auto-flow:column; align-items:center; gap:8px;
          padding:6px 10px; border-radius:999px;
          border:1px solid var(--line-strong);
          background:linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.02));
          color:#fff; font-weight:900; letter-spacing:.02em;
          cursor:pointer; user-select:none;
          transition:transform .06s ease, border-color .12s ease, box-shadow .12s ease;
          box-shadow:0 0 0 1px rgba(255,255,255,.03) inset;
        }
        .vc:hover{ border-color:#3a3a3a; transform:translateY(-1px) }
        .vc:active{ transform:translateY(0) scale(.997) }
        .vc__arrow{ font-size:12px; opacity:.9 }
        .vc__count{ font-variant-numeric:tabular-nums; font-size:13px }

        /* micro-animazione quando voti */
        .vc.vc__pulse{
          animation: vcPulse .28s ease;
        }
        @keyframes vcPulse{
          0%{ transform:translateY(-1px) scale(1.00); box-shadow:0 0 0 0 rgba(80,200,255,.0) }
          40%{ transform:translateY(-1px) scale(1.03); box-shadow:0 0 0 6px rgba(80,200,255,.10) }
          100%{ transform:translateY(-1px) scale(1.00); box-shadow:0 0 0 0 rgba(80,200,255,.0) }
        }
      `}</style>
    </>
  );
}
