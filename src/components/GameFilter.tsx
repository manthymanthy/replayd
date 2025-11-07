// src/components/GameFilter.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function GameFilter({
  games,
  active,
}: {
  games: string[];
  active: string | null;
}) {
  const router = useRouter();
  const sp = useSearchParams();

  function setGame(g: string | null) {
    // ricostruisco i params per non perdere altri parametri futuri (paginazione ecc.)
    const params = new URLSearchParams(sp?.toString() || "");
    if (g) params.set("game", g);
    else params.delete("game");

    const qs = params.toString();
    router.replace(qs ? `/?${qs}` : "/", { scroll: false });
    router.refresh(); // <- re-render del server component senza full reload
  }

  return (
    <div className="filters">
      <button
        type="button"
        onClick={() => setGame(null)}
        className={`pill ${!active ? "is-active" : ""}`}
      >
        All
      </button>

      {games.map((g) => (
        <button
          key={g}
          type="button"
          onClick={() => setGame(g)}
          className={`pill ${active === g ? "is-active" : ""}`}
          title={g}
        >
          {g}
        </button>
      ))}

      <style>{`
        .filters{ display:flex; gap:8px; flex-wrap:wrap; margin:4px 0 10px }
        .pill{
          padding:8px 12px; border-radius:999px;
          border:1px solid var(--line); background:var(--panel); color:#dcdcdc;
          font-weight:700; letter-spacing:.02em; cursor:pointer;
        }
        .pill:hover{ border-color:var(--line-strong) }
        .pill.is-active{
          outline: 2px solid color-mix(in oklab, var(--accent) 60%, transparent);
          color:#8ecaff;
        }
      `}</style>
    </div>
  );
}
