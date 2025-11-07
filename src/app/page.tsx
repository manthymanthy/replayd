// src/app/page.tsx
// Home / Feed
import { createClient } from '@supabase/supabase-js';
import FeedListClient from "../components/FeedListClient";
import GameFilter from "../components/GameFilter";

export const revalidate = 0;

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
  const activeGame = (searchParams?.game || '').trim().toLowerCase() || null;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Applica il filtro per gioco se presente (evita tipi rigidi per non perdere .eq)
  const withGame = (q: any) => (activeGame ? q.eq('game', activeGame) : q);

  const now = new Date();
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const last7d  = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [trendingRes, freshRes, topWeekRes, gamesRes] = await Promise.all([
    withGame(
      supabase
        .from('clips')
        .select('id,title,url,author_name,votes,created_at,game')
        .gte('created_at', last24h)
        .order('votes', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(20)
    ),

    withGame(
      supabase
        .from('clips')
        .select('id,title,url,author_name,votes,created_at,game')
        .order('votes', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(20)
    ),

    withGame(
      supabase
        .from('clips')
        .select('id,title,url,author_name,votes,created_at,game')
        .gte('created_at', last7d)
        .order('votes', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(20)
    ),

    // elenco giochi (unici) per i chip
    supabase
      .from('clips')
      .select('game')
      .neq('game', null)
      .limit(1000),
  ]);

  const trending = (trendingRes.data || []) as Row[];
  const fresh    = (freshRes.data || []) as Row[];
  const topWeek  = (topWeekRes.data || []) as Row[];

  const games = Array.from(
    new Set(
      (gamesRes.data || [])
        .map((r: any) => (r.game || '').toString().toLowerCase())
        .filter(Boolean)
    )
  ).sort();

  return (
    <main className="home">
      {/* HERO */}
      <header className="hero">
        <h1 className="brand">R&nbsp;E&nbsp;P&nbsp;L&nbsp;A&nbsp;Y&nbsp;D</h1>
        <p className="tag">The sharpest FPS highlights — curated by the community.</p>
      </header>

      {/* FILTERS */}
      <GameFilter games={games} active={activeGame} />

      {/* SECTIONS */}
      <section className="block">
        <h2 className="h2">Trending (last 24h){activeGame ? ` — ${activeGame}` : ''}</h2>
        <FeedListClient rows={trending} empty="Nothing in the last 24 hours yet." />
      </section>

      <section className="block">
        <h2 className="h2">Fresh drops{activeGame ? ` — ${activeGame}` : ''}</h2>
        <FeedListClient rows={fresh} empty="New clips will appear here." />
      </section>

      <section className="block">
        <h2 className="h2">Top this week{activeGame ? ` — ${activeGame}` : ''}</h2>
        <FeedListClient rows={topWeek} empty="Once clips get votes, they’ll show up here." />
      </section>

      <style dangerouslySetInnerHTML={{ __html: `
        .home{ display:grid; gap:20px }
        .hero{ display:grid; gap:8px }
        .brand{
          font-size:28px; font-weight:900; letter-spacing:.36em;
          color:#fff; margin:.2rem 0 .4rem;
          text-transform:uppercase;
        }
        .tag{ opacity:.75 }

        .block{ display:grid; gap:10px }
        .h2{
          font-size:16px; font-weight:800; letter-spacing:.06em;
          color:#dcdcdc; margin-top:6px;
        }
      `}}/>
    </main>
  );
}
