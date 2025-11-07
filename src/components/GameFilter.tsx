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
    <nav className="gf-min" aria-label="Game filter">
      <button
        className={`link ${!active ? "is-active" : ""}`}
        onClick={() => setGame(undefined)}
        aria-current={!active ? "page" : undefined}
      >
        all
      </button>

      {games.map((g) => (
        <button
          key={g}
          className={`link ${active === g ? "is-active" : ""}`}
          onClick={() => setGame(g)}
          aria-current={active === g ? "page" : undefined}
          title={g}
        >
          {g}
        </button>
      ))}

      <style>{`
        .gf-min{
          display:flex; gap:18px;
          overflow-x:auto; padding:2px 2px 8px;
          -ms-overflow-style:none; scrollbar-width:none;
          margin:2px 0 10px;
        }
        .gf-min::-webkit-scrollbar{ display:none; }

        .link{
          position:relative;
          font: 700 12px/1.2 ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Inter;
          color:#bdbdbd;
          text-transform:lowercase;
          letter-spacing:.04em;
          background:none; border:0; padding:8px 2px;
          cursor:pointer; white-space:nowrap;
          transition: color .12s ease;
        }
        .link::after{
          content:"";
          position:absolute; left:0; right:0; bottom:2px; height:2px;
          background: transparent;
          border-radius:2px;
          transform: translateY(0);
          transition: background .12s ease, box-shadow .12s ease;
        }
        .link:hover{ color:#e6e6e6; }
        .link:focus-visible{
          outline:none;
          box-shadow: 0 0 0 2px rgba(159,220,255,.18) inset;
          border-radius:6px;
        }
        .link.is-active{
          color:#eaf7ff;
        }
        .link.is-active::after{
          background: #7cc2ff;
          box-shadow: 0 0 14px rgba(124,194,255,.45);
        }

        /* tocchi piccoli = hit area più grande */
        @media (max-width:700px){
          .gf-min{ gap:14px }
          .link{ padding:10px 2px; font-weight:800 }
        }
      `}</style>
    </nav>
  );
}
