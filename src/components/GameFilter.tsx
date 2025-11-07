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
  const search = useSearchParams();

  function setGame(g?: string) {
    const params = new URLSearchParams(search?.toString() || "");
    if (!g) params.delete("game");
    else params.set("game", g);
    router.push(`/?${params.toString()}`, { scroll: false });
  }

  return (
    <nav className="gf">
      <button
        className={`pill ${!active ? "is-active" : ""}`}
        onClick={() => setGame(undefined)}
        aria-current={!active ? "page" : undefined}
      >
        ALL
      </button>

      {games.map((g) => (
        <button
          key={g}
          className={`pill ${active === g ? "is-active" : ""}`}
          onClick={() => setGame(g)}
          aria-current={active === g ? "page" : undefined}
          title={g}
        >
          {g.toUpperCase()}
        </button>
      ))}

      <style>{`
        .gf{
          display:flex; gap:8px;
          overflow-x:auto; padding:2px 2px 6px;
          scrollbar-width:none;
          -ms-overflow-style:none;
          margin:6px 0 12px;
        }
        .gf::-webkit-scrollbar{ display:none; }

        .pill{
          --bd: var(--line);
          font-size:11px; font-weight:800; letter-spacing:.10em;
          padding:8px 10px;
          border-radius:999px;
          border:1px solid var(--bd);
          color:#dcdcdc; background:transparent;
          white-space:nowrap; cursor:pointer;
          transition: border-color .12s ease, background .08s ease, transform .06s ease, box-shadow .12s ease;
          text-transform:uppercase;
        }
        .pill:hover{
          background:rgba(255,255,255,.04);
          border-color:var(--line-strong);
        }
        .pill:active{ transform:translateY(1px); }

        .pill.is-active{
          color:#eaf7ff;
          --bd: #1f3242;
          border-color: var(--bd);
          box-shadow:
            0 0 0 1px rgba(159,220,255,.10) inset,
            0 0 22px rgba(159,220,255,.10);
          background: linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.02));
        }

        @media (max-width: 700px){
          .pill{ padding:7px 9px; font-size:10px; }
        }
      `}</style>
    </nav>
  );
}
