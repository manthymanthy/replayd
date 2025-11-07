"use client";

import Link from "next/link";

export default function GameFilter({
  games,
  active,
}: {
  games: string[];
  active: string | null;
}) {
  return (
    <nav className="gf">
      <Link href="/" className={`pill ${!active ? "is-active" : ""}`}>All</Link>
      {games.map((g) => (
        <Link
          key={g}
          href={`/?game=${encodeURIComponent(g)}`}
          className={`pill ${active === g ? "is-active" : ""}`}
        >
          {g}
        </Link>
      ))}

      <style>{`
        .gf{ display:flex; gap:10px; flex-wrap:wrap; margin:6px 0 8px }
        .pill{
          display:inline-flex; align-items:center; gap:6px;
          padding:8px 12px; border-radius:999px;
          border:1px solid var(--line);
          background:var(--panel); color:#dcdcdc;
          font-weight:800; letter-spacing:.02em; text-transform:lowercase;
          transition: border-color .12s ease, background .12s ease, color .12s ease;
        }
        .pill:hover{ border-color:var(--line-strong) }
        .pill.is-active{
          color:#8ecbff;
          box-shadow: 0 0 0 1px rgba(142,203,255,.25) inset, 0 0 16px rgba(142,203,255,.12);
          border-color: color-mix(in oklab, #8ecbff 50%, var(--line-strong));
          background: color-mix(in oklab, var(--panel) 85%, #0b1a24 15%);
        }
      `}</style>
    </nav>
  );
}
