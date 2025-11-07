// src/components/GameFilter.tsx
"use client";

import { useMemo, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function GameFilter({
  games,
  active,
}: {
  games: string[];
  active: string | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const allChips = useMemo(() => ["All", ...games], [games]);

  function setGame(next: string | null) {
    // build a new query string
    const params = new URLSearchParams(search?.toString() || "");
    if (!next) params.delete("game");
    else params.set("game", next);

    const url = `${pathname}?${params.toString()}`;
    startTransition(() => {
      router.replace(url, { scroll: false });
    });
  }

  return (
    <div className="gf">
      {allChips.map((g) => {
        const val = g === "All" ? null : g;
        const isActive =
          (val ?? null) === (active ? active.toLowerCase() : null);

        return (
          <button
            key={g}
            onClick={() => setGame(val)}
            className={`gf__chip ${isActive ? "gf__chip--on" : ""}`}
            aria-pressed={isActive}
            disabled={isPending && isActive}
          >
            {g}
          </button>
        );
      })}

      <style>{`
        .gf{ display:flex; gap:8px; flex-wrap:wrap; margin:6px 0 14px }
        .gf__chip{
          padding:8px 12px; border-radius:999px;
          border:1px solid var(--line);
          background:var(--panel); color:#ddd;
          font-weight:700; letter-spacing:.02em;
          cursor:pointer; transition:all .12s ease;
        }
        .gf__chip:hover{ border-color:var(--line-strong); background:#121212 }
        .gf__chip--on{
          color:#7cc7ff;
          box-shadow: 0 0 0 1px rgba(124,199,255,.25) inset,
                      0 0 24px rgba(124,199,255,.12);
          border-color: color-mix(in oklab, #7cc7ff 40%, var(--line-strong));
          background: color-mix(in oklab, var(--panel) 85%, #7cc7ff 15%);
        }
        .gf__chip:disabled{ opacity:.7; cursor:not-allowed }
      `}</style>
    </div>
  );
}
