// src/components/GameFilter.tsx
import Link from "next/link";

export default function GameFilter({
  games,
  active,
}: {
  games: string[];
  active: string | null;
}) {
  const items = ["All", ...games];

  const hrefFor = (label: string) => {
    if (label === "All") return "/";
    const v = encodeURIComponent(label);
    return `/?game=${v}`;
  };

  return (
    <nav className="gf">
      {items.map((g) => {
        const isActive =
          (g === "All" && !active) || (active && g.toLowerCase() === active.toLowerCase());
        return (
          <Link
            key={g}
            href={hrefFor(g)}
            prefetch
            className={`gf__chip ${isActive ? "gf__chip--active" : ""}`}
            aria-current={isActive ? "page" : undefined}
          >
            {g}
          </Link>
        );
      })}

      <style>{`
        .gf{ display:flex; flex-wrap:wrap; gap:8px; margin:4px 0 8px }
        .gf__chip{
          display:inline-block; padding:8px 12px; border-radius:999px;
          border:1px solid var(--line);
          background:var(--panel); color:#fff; font-weight:700; font-size:12px;
          letter-spacing:.02em;
          text-decoration:none;
          transition: border-color .12s ease, background .12s ease, transform .06s ease;
        }
        .gf__chip:hover{ border-color:var(--line-strong); background:#151515; transform:translateY(-1px) }
        .gf__chip--active{
          border-color:#3a3a3a;
          background: color-mix(in oklab, var(--panel) 85%, #fff 15%);
          box-shadow: 0 0 0 1px rgba(255,255,255,.05) inset;
        }
      `}</style>
    </nav>
  );
}
