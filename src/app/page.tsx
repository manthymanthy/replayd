// src/app/page.tsx
import { createClient } from "@supabase/supabase-js";
import FeedListClient from "../components/FeedListClient";
import GameFilter from "../components/GameFilter";

export const revalidate = 0;
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

type Row = {
  id: string;
  title: string | null;
  url: string;
  author_name: string | null;
  votes: number | null;
  created_at: string;
  game: string | null; // required (nullable)
};

export default async function Page({
  searchParams,
}: {
  searchParams?: { game?: string };
}) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const activeGame = searchParams?.game ?? null;

  // games list (distinct client-side)
  const { data: gamesRaw } = await supabase
    .from("clips")
    .select("game")
    .not("game", "is", null);

  const games = Array.from(
    new Set(
      (gamesRaw || [])
        .map((r: any) => (r.game || "").toString().trim())
        .filter(Boolean)
    )
  ).sort();

  const now = new Date();
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  // Trending (24h)
  const trendingSel = supabase
    .from("clips")
    .select("id,title,url,author_name,votes,created_at,game")
    .gte("created_at", last24h)
    .order("votes", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(20);
  if (activeGame) trendingSel.eq("game", activeGame);

  // Fresh (recenti ma ord. anche per voti)
  const freshSel = supabase
    .from("clips")
    .select("id,title,url,author_name,votes,created_at,game")
    .order("votes", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(20);
  if (activeGame) freshSel.eq("game", activeGame);

  // Top settimana (7d)
  const topWeekSel = supabase
    .from("clips")
    .select("id,title,url,author_name,votes,created_at,game")
    .gte("created_at", last7d)
    .order("votes", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(20);
  if (activeGame) topWeekSel.eq("game", activeGame);

  const [trendingRes, freshRes, topWeekRes] = await Promise.all([
    trendingSel,
    freshSel,
    topWeekSel,
  ]);

  const trending = (trendingRes.data || []) as Row[];
  const fresh = (freshRes.data || []) as Row[];
  const topWeek = (topWeekRes.data || []) as Row[];

  return (
    <main className="home">
      <header className="hero">
        <h1 className="brand">R&nbsp;E&nbsp;P&nbsp;L&nbsp;A&nbsp;Y&nbsp;D</h1>
        <p className="tag">The sharpest FPS highlights — curated by the community.</p>
      </header>

      {/* FILTER */}
      <GameFilter games={games} active={activeGame} />

      <section className="block">
        <h2 className="h2">Trending (last 24h)</h2>
        <FeedListClient
          key={`trending-${activeGame ?? "all"}`}
          rows={trending}
          empty="Nothing in the last 24 hours yet."
        />
      </section>

      <section className="block">
        <h2 className="h2">Fresh drops</h2>
        <FeedListClient
          key={`fresh-${activeGame ?? "all"}`}
          rows={fresh}
          empty="New clips will appear here."
        />
      </section>

      <section className="block">
        <h2 className="h2">Top this week</h2>
        <FeedListClient
          key={`topweek-${activeGame ?? "all"}`}
          rows={topWeek}
          empty="Once clips get votes, they’ll show up here."
        />
      </section>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .home{ display:grid; gap:20px }
        .hero{ display:grid; gap:8px }
        .brand{
          font-size:28px; font-weight:900; letter-spacing:.36em;
          color:#fff; margin:.2rem 0 .4rem; text-transform:uppercase;
        }
        .tag{ opacity:.75 }
        .block{ display:grid; gap:10px }
        .h2{ font-size:16px; font-weight:800; letter-spacing:.06em; color:#dcdcdc; margin-top:6px; }
      `,
        }}
      />
    </main>
  );
}
