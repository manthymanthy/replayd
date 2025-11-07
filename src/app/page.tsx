// src/app/page.tsx
// Home / Feed con filtro "game"
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import FeedListClient from "../components/FeedListClient";

export const revalidate = 20;

type Row = {
  id: string;
  title: string | null;
  url: string;
  author_name: string | null;
  votes: number | null;
  created_at: string;
  game: string | null;
};

export default async function Page({
  searchParams,
}: {
  searchParams?: { game?: string };
}) {
  const gameFilter = (searchParams?.game || "all").toLowerCase();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // ——— elenco giochi distinti per la pill-bar
  const { data: gamesRaw } = await supabase
    .from("clips")
    .select("game", { distinct: true })
    .not("game", "is", null);

  const games = Array.from(
    new Set((gamesRaw || []).map((g: any) => (g.game as string).trim()))
  )
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));

  const now = new Date();
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  // helper per applicare il filtro gioco
  const applyGame = (q: any) =>
    gameFilter !== "all" ? q.eq("game", gameFilter) : q;

  const baseCols = "id,title,url,author_name,votes,created_at,game";

  const [trendingRes, freshRes, topWeekRes] = await Promise.all([
    applyGame(
      supabase
        .from("clips")
        .select(baseCols)
        .gte("created_at", last24h)
        .order("votes", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(20)
    ),
    applyGame(
      supabase
        .from("clips")
        .select(baseCols)
        .order("votes", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(20)
    ),
    applyGame(
      supabase
        .from("clips")
        .select(baseCols)
        .gte("created_at", last7d)
        .order("votes", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(20)
    ),
  ]);

  const trending = (trendingRes.data || []) as Row[];
  const fresh = (freshRes.data || []) as Row[];
  const topWeek = (topWeekRes.data || []) as Row[];

  return (
    <main className="home">
      {/* HERO */}
      <header className="hero">
        <h1 className="brand">R&nbsp;E&nbsp;P&nbsp;L&nbsp;A&nbsp;Y&nbsp;D</h1>
        <p className="tag">The sharpest FPS highlights — curated by the community.</p>
      </header>

      {/* FILTER BAR */}
      <nav className="filterbar" aria-label="Game filter">
        <Pill href="/" active={gameFilter === "all"}>
          All
        </Pill>
        {games.map((g) => (
          <Pill key={g} href={`/?game=${encodeURIComponent(g.toLowerCase())}`} active={gameFilter === g.toLowerCase()}>
            {g}
          </Pill>
        ))}
      </nav>

      {/* SECTIONS */}
      <section className="block">
        <h2 className="h2">Trending (last 24h){gameFilter!=="all" ? ` · ${gameFilter}` : ""}</h2>
        <FeedListClient rows={trending} empty="Nothing in the last 24 hours yet." />
      </section>

      <section className="block">
        <h2 className="h2">Fresh drops{gameFilter!=="all" ? ` · ${gameFilter}` : ""}</h2>
        <FeedListClient rows={fresh} empty="New clips will appear here." />
      </section>

      <section className="block">
        <h2 className="h2">Top this week{gameFilter!=="all" ? ` · ${gameFilter}` : ""}</h2>
        <FeedListClient rows={topWeek} empty="Once clips get votes, they’ll show up here." />
      </section>

      <style dangerouslySetInnerHTML={{ __html: `
        .home{ display:grid; gap:20px }
        .hero{ display:grid; gap:8px }
        .brand{
          font-size:28px; font-weight:900; letter-spacing:.36em;
          color:#fff; margin:.2rem 0 .4rem; text-transform:uppercase;
        }
        .tag{ opacity:.75 }

        .filterbar{
          display:flex; gap:8px; flex-wrap:wrap;
          border:1px solid var(--line); border-radius:12px;
          padding:8px; background:var(--panel);
        }
        .pill{
          display:inline-block; padding:8px 10px; border-radius:999px;
          border:1px solid var(--line-strong);
          background: linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.03));
          font-size:12px; font-weight:900; letter-spacing:.06em; color:#eaeaea;
          transition: transform .06s ease, border-color .12s ease, background .12s ease;
        }
        .pill:hover{ transform:translateY(-1px); border-color:#3a3a3a }
        .pill--active{
          color:#9fdcff; border-color:#1f3242;
          box-shadow:0 0 0 1px rgba(159,220,255,.10) inset, 0 0 18px rgba(159,220,255,.08);
        }

        .block{ display:grid; gap:10px }
        .h2{
          font-size:16px; font-weight:800; letter-spacing:.06em;
          color:#dcdcdc; margin-top:6px;
        }
      `}}/>
    </main>
  );
}

/* ——— mini componente pill (server component OK) ——— */
function Pill({ href, active, children }: { href: string; active?: boolean; children: React.ReactNode }) {
  return (
    <Link href={href} className={`pill ${active ? "pill--active" : ""}`}>
      {children}
    </Link>
  );
}
