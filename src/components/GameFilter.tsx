// src/components/GameFilter.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

type Props = {
  games: string[];          // viene ignorata se vogliamo forzare una whitelist
  active?: string | null;
};

// normalizza i nomi per confronto case-insensitive
function norm(s: string) {
  return (s || "").trim().toLowerCase();
}

export default function GameFilter({ games, active }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ⚠️ Per ora mostriamo SOLO "Arc Raiders" (più "All")
  // In futuro, rimuovi la whitelist per mostrare tutti i giochi disponibili.
  const whitelist = new Set(["arc raiders"]);
  const list = useMemo(() => {
    const base = ["Arc Raiders"];
    // se vuoi includere anche altri giochi presenti nel DB in futuro, usa:
    // const base = Array.from(new Set(games.map(g => (g || "").trim())))
    //   .filter(Boolean)
    //   .sort((a,b)=>a.localeCompare(b));
    return base;
  }, [games]);

  const activeGame = active ? active : null;

  function setGame(value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value) params.delete("game");
    else params.set("game", value);
    router.replace(`?${params.toString()}`, { scroll: false });
  }

  return (
    <nav className="gf">
      <button
        className={`pill ${!activeGame ? "is-active" : ""}`}
        onClick={() => setGame(null)}
        aria-pressed={!activeGame}
      >
        ALL
      </button>

      {list
        .filter(g => whitelist.has(norm(g)))   // rispetta la scelta “solo Arc Raiders”
        .map((g) => {
          const isActive = norm(activeGame || "") === norm(g);
          return (
            <button
              key={g}
              className={`pill ${isActive ? "is-active" : ""}`}
              onClick={() => setGame(g)}
              aria-pressed={isActive}
            >
              {g.toUpperCase()}
            </button>
          );
        })}
      <style>{`
        .gf{
          display:flex; gap:6px; align-items:center; flex-wrap:wrap;
          margin:6px 0 10px;
        }
        .pill{
          appearance:none; border:1px solid var(--line);
          background:var(--panel); color:#dcdcdc;
          font-weight:900; letter-spacing:.12em; font-size:11px;
          padding:6px 10px; border-radius:999px; cursor:pointer;
          transition: border-color .12s ease, background .12s ease, transform .05s ease;
          text-transform:uppercase;
        }
        .pill:hover{ border-color:var(--line-strong); transform:translateY(-1px) }
        .pill.is-active{
          border-color:#1f3242;
          color:#9fdcff;
          box-shadow:0 0 0 1px rgba(159,220,255,.10) inset, 0 0 18px rgba(159,220,255,.08);
        }
      `}</style>
    </nav>
  );
}
