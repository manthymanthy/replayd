// src/components/GameFilter.tsx
"use client";

import { useCallback, useMemo } from "react";
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
  const searchParams = useSearchParams();

  // Costruiamo l’elenco finale: "All" + giochi (deduplicati e ordinati)
  const items = useMemo(() => {
    const set = new Set<string>(games.map((g) => (g || "").trim()).filter(Boolean));
    return ["All", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [games]);

  const handleSelect = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams?.toString() || "");
      if (value === "All") {
        params.delete("game");
      } else {
        params.set("game", value);
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      router.refresh(); // forza aggiornamento senza reload manuale
    },
    [pathname, router, searchParams]
  );

  const isActive = (value: string) =>
    (value === "All" && !active) || value === active;

  return (
    <div className="gf" role="radiogroup" aria-label="Filter by game">
      {items.map((g) => (
        <button
          key={g}
          role="radio"
          aria-checked={isActive(g)}
          className={`gf__chip ${isActive(g) ? "gf__chip--on" : ""}`}
          onClick={() => handleSelect(g)}
          title={g === "All" ? "Show all games" : `Only ${g}`}
        >
          {g}
        </button>
      ))}

      <style>{`
        .gf{
          display:flex; gap:8px; flex-wrap:wrap;
          padding:6px 0 2px;
        }
        .gf__chip{
          -webkit-tap-highlight-color: transparent;
          padding:6px 10px;
          border-radius:999px;
          border:1px solid var(--line);
          background:var(--panel);
          color:#d7d7d7;
          font-weight:800; letter-spacing:.02em;
          font-size:12px;
          cursor:pointer;
          transition:transform .06s ease, border-color .12s ease, background .12s ease;
        }
        .gf__chip:hover{ border-color:var(--line-strong); transform:translateY(-1px) }
        .gf__chip--on{
          color:#b7ff8a;
          border-color:#245026;
          background:linear-gradient(180deg, rgba(183,255,138,.10), rgba(255,255,255,.03));
          box-shadow:0 0 0 1px rgba(130,255,130,.12) inset, 0 0 20px rgba(130,255,130,.09);
          transform:none;
        }
      `}</style>
    </div>
  );
}
