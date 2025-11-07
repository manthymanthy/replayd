// src/app/page.tsx
// Home / Feed
import { createClient } from '@supabase/supabase-js';
import FeedListClient from "../components/FeedListClient";

// Per debug immediato dei conteggi reali (puoi rimettere 30 dopo)
export const revalidate = 0;

type Row = {
  id: string;
  title: string | null;
  url: string;
  author_name: string | null;
  votes: number;           // mappiamo score -> votes per compatibilità UI
  created_at: string;
};

export default async function Page() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const now = new Date();
  const last24h = new Date(now.getTime() - 24*60*60*1000).toISOString();
  const last7d  = new Date(now.getTime() - 7*24*60*60*1000).toISOString();

  const [trendingRes, freshRes, topWeekRes] = await Promise.all([
    // Trending: 24h + score desc
    supabase.from('clips_with_score')
      .select('id,title,url,author_name,score,created_at')
      .gte('created_at', last24h)
      .order('score', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(20),

    // Fresh: anch’esso ordinato per score desc (poi recency)
    supabase.from('clips_with_score')
      .select('id,title,url,author_name,score,created_at')
      .order('score', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(20),

    // Top settimana: 7d + score desc
    supabase.from('clips_with_score')
      .select('id,title,url,author_name,score,created_at')
      .gte('created_at', last7d)
      .order('score', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(20),
  ]);

  // Mappiamo score -> votes per non toccare FeedListClient
  const mapRows = (rows: any[] | null): Row[] =>
    (rows || []).map(r => ({
      id: r.id,
      title: r.title,
      url: r.url,
      author_name: r.author_name,
      votes: Number(r.score ?? 0),
      created_at: r.created_at,
    }));

  const trending = mapRows(trendingRes.data);
  const fresh    = mapRows(freshRes.data);
  const topWeek  = mapRows(topWeekRes.data);

  return (
    <main className="home">
      {/* HERO */}
      <header className="hero">
        <h1 className="brand">R&nbsp;E&nbsp;P&nbsp;L&nbsp;A&nbsp;Y&nbsp;D</h1>
        <p className="tag">The sharpest FPS highlights — curated by the community.</p>
      </header>

      {/* SECTIONS */}
      <section className="block">
        <h2 className="h2">Trending (last 24h)</h2>
        <FeedListClient rows={trending} empty="Nothing in the last 24 hours yet." />
      </section>

      <section className="block">
        <h2 className="h2">Fresh drops</h2>
        <FeedListClient rows={fresh} empty="New clips will appear here." />
      </section>

      <section className="block">
        <h2 className="h2">Top this week</h2>
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
