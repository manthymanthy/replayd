// src/components/GameFilter.tsx
"use client";
import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function GameFilter({
  games,
  active,
}: { games: string[]; active: string | null }) {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  const [isPending, start] = useTransition();

  function setGame(next: string | null) {
    const params = new URLSearchParams(search?.toString() || "");
    if (!next) params.delete("game");
    else params.set("game", next);

    const url = `${pathname}?${params.toString()}`;
    start(() => {
      router.replace(url, { scroll: false });
      router.refresh();               // ⬅️ forza il refetch del Server Component
    });
  }

  const chips = ["All", ...games];

  return (
    <div className="gf">
      {chips.map((g) => {
        const val = g === "All" ? null : g;
        const isActive = (val ?? null) === (active ?? null);
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
    </div>
  );
}
