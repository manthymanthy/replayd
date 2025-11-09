// src/components/GameFilter.tsx
"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Props = {
  games: string[];
  active: string | null;
};

export default function GameFilter({ games, active }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();

  // Per ora consentiamo SOLO "Arc Raiders" (oltre ad "All")
  const items = useMemo(() => {
    const allowed = new Set(["Arc Raiders"]);
    const hasArc = games.some(g => g.trim().toLowerCase() === "arc raiders");
    const list = ["All"];
    if (hasArc) list.push("Arc Raiders");
    else list.push("Arc Raiders"); // lo mostriamo comunque
    return list;
  }, [games]);

  function setParam(nextGame: string | null) {
    const sp = new URLSearchParams(search.toString());
    if (!nextGame || nextGame === "All") {
      sp.delete("game");
    } else {
      sp.set("game", nextGame);
    }
    router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
  }

  return (
    <nav className="gf">
      {items.map((label) => {
        const isActive =
          (label === "All" && !active) ||
          (active && label.toLowerCase() === active.toLowerCase());
        return (
          <button
            key={label}
            className={`pill ${isActive ? "is-active" : ""}`}
            onClick={() => setParam(label === "All" ? null : label)}
            aria-pressed={isActive}
          >
            {label}
          </button>
        );
      })}

      <style>{`
        .gf{
          display:flex; gap:8px; align-items:center;
          padding:6px; border:1px solid var(--line);
          border-radius:12px; background:var(--panel);
          overflow-x:auto;
        }
        .pill{
          appearance:none; border:1px solid var(--line);
          background:transparent; color:#ddd;
          font-weight:800; letter-spacing:.04em;
          padding:8px 10px; border-radius:10px;
          cursor:pointer; transition: border-color .12s ease, background .12s ease, transform .04s ease;
          white-space:nowrap;
        }
        .pill:hover{ border-color:var(--line-strong) }
        .pill:active{ transform: translateY(1px) }
        .pill.is-active{
          color:#fff;
          border-color:#2f2f2f;
          background: color-mix(in oklab, var(--panel) 80%, #ffffff 12%);
          box-shadow: 0 0 0 1px rgba(255,255,255,.03) inset;
        }
      `}</style>
    </nav>
  );
}
