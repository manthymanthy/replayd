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
  const params = useSearchParams();

  function setGame(g?: string) {
    const sp = new URLSearchParams(params?.toString());
    if (!g) sp.delete("game");
    else sp.set("game", g);
    router.push(`/?${sp.toString()}`);
  }

  return (
    <div className="gf">
      <button
        className={`chip ${!active ? "chip--on" : ""}`}
        onClick={() => setGame(undefined)}
      >
        All
      </button>

      {games.map((g) => (
        <button
          key={g}
          className={`chip ${active === g ? "chip--on" : ""}`}
          onClick={() => setGame(g)}
          title={`Filter by ${g}`}
        >
          {g}
        </button>
      ))}

      <style jsx>{`
        .gf{
          display:flex; gap:8px; flex-wrap:wrap;
          padding:6px; border:1px solid var(--line); border-radius:999px;
          background:var(--panel); width:max-content;
        }
        .chip{
          padding:8px 12px; border-radius:999px; border:1px solid var(--line);
          background:transparent; color:#ddd; cursor:pointer;
        }
        .chip--on{
          color:#7cc7ff;
          box-shadow: 0 0 0 1px rgba(124,199,255,.25) inset, 0 0 12px rgba(124,199,255,.15);
          border-color: rgba(124,199,255,.35);
        }
      `}</style>
    </div>
  );
}
