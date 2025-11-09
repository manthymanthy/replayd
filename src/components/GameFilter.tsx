// src/components/GameFilter.tsx
"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function GameFilter({
  games,
  active,
}: {
  games: string[];
  active?: string | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const uniqueGames = useMemo(
    () => Array.from(new Set((games || []).map(g => (g || "").trim()).filter(Boolean))),
    [games]
  );

  // --- SOLO ARC RAIDERS: mostra barra informativa super-minimal
  if (uniqueGames.length <= 1) {
    return (
      <div className="gf__bar" aria-live="polite">
        <span className="dot" /> Arc Raiders only · beta
        <style>{`
          .gf__bar{
            display:flex; align-items:center; gap:8px;
            padding:6px 10px; border:1px dashed var(--line);
            background:var(--panel); border-radius:10px;
            font-size:12px; letter-spacing:.04em; opacity:.85;
            width:max-content;
          }
          .dot{ width:6px; height:6px; border-radius:999px; background:#6bff90; box-shadow:0 0 10px rgba(107,255,144,.35); }
        `}</style>
      </div>
    );
  }

  // --- MULTI-GIOCO: mostra pill minimal, aggiorna query ?game=
  function setGame(g?: string) {
    const params = new URLSearchParams(sp?.toString() || "");
    if (!g) params.delete("game");
    else params.set("game", g);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <nav className="gf">
      <button
        className={`pill ${!active ? "is-active" : ""}`}
        onClick={() => setGame(undefined)}
      >
        ALL
      </button>
      {uniqueGames.map(g => (
        <button
          key={g}
          className={`pill ${active === g ? "is-active" : ""}`}
          onClick={() => setGame(g)}
          title={g}
        >
          {g.toUpperCase()}
        </button>
      ))}

      <style>{`
        .gf{ display:flex; gap:6px; align-items:center; flex-wrap:wrap }
        .pill{
          padding:6px 10px; border-radius:9px;
          border:1px solid var(--line); background:transparent; color:#ddd;
          font-size:11px; font-weight:800; letter-spacing:.08em;
          cursor:pointer; transition:border-color .12s ease, background .08s ease, transform .04s ease;
          text-transform:uppercase;
        }
        .pill:hover{ border-color:var(--line-strong); background:#0f0f0f }
        .pill:active{ transform:translateY(1px) }
        .is-active{
          border-color:#263b2b;
          background: linear-gradient(180deg, rgba(120,255,170,.12), rgba(120,255,170,.04));
          color:#c8ffd8; box-shadow:0 0 0 1px rgba(120,255,170,.12) inset;
        }
      `}</style>
    </nav>
  );
}
