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
    void el.offsetWidth; // restart anim
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
          padding:8px 12px; border-radius:999px;
          border:1px solid var(--line-strong);
          background:
            radial-gradient(120% 120% at 50% 0%, color-mix(in oklab, var(--accent) 6%, transparent) 0%, transparent 60%),
            linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.02));
          color:#fff; font-weight:900; letter-spacing:.02em;
          cursor:pointer; user-select:none;
          transition:transform .06s ease, border-color .12s ease, box-shadow .16s ease, background .16s ease;
          box-shadow:
            0 0 0 1px rgba(255,255,255,.03) inset,
            0 0 18px 0 color-mix(in oklab, var(--accent) 0%, transparent);
          will-change: transform, box-shadow;
        }
        .vc:hover{
          transform: translateY(-1px);
          border-color: color-mix(in oklab, var(--accent) 50%, #333 50%);
          box-shadow:
            0 0 0 1px rgba(255,255,255,.05) inset,
            0 0 26px 0 color-mix(in oklab, var(--accent) 28%, transparent);
          background:
            radial-gradient(120% 120% at 50% 0%, color-mix(in oklab, var(--accent) 10%, transparent) 0%, transparent 60%),
            linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.03));
        }
        .vc:active{ transform: translateY(0) scale(.995) }

        .vc__arrow{ font-size:12px; opacity:.95; text-shadow: 0 0 14px color-mix(in oklab, var(--accent) 20%, transparent) }
        .vc__count{ font-variant-numeric: tabular-nums; font-size:13px }

        /* pulse al voto */
        .vc.vc__pulse{ animation: vcPulse .28s ease }
        @keyframes vcPulse{
          0%  { box-shadow: 0 0 0 0 color-mix(in oklab, var(--accent) 0%, transparent) }
          40% { box-shadow: 0 0 22px 6px color-mix(in oklab, var(--accent) 24%, transparent) }
          100%{ box-shadow: 0 0 0 0 color-mix(in oklab, var(--accent) 0%, transparent) }
        }
      `}</style>
    </>
  );
}
