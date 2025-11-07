// Home / Feed
import { createClient } from '@supabase/supabase-js';
import { FeedListClient } from '../components/FeedListClient'; // <— percORSO RELATIVO

export const revalidate = 30;

type Row = {
  id: string;
  title: string | null;
  url: string;
  author_name: string | null;
  votes: number | null;
  created_at: string;
};

export default async function Page() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const now = new Date();
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [trendingRes, freshRes, topWeekRes] = await Promise.all([
    supabase
      .from('clips')
      .select('id,title,url,author_name,votes,created_at')
      .gte('created_at', last24h)
      .order('votes', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(20),

    supabase
      .from('clips')
      .select('id,title,url,author_name,votes,created_at')
      .order('created_at', { ascending: false })
      .limit(20),

    supabase
      .from('clips')
      .select('id,title,url,author_name,votes,created_at')
      .gte('created_at', last7d)
      .order('votes', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(20),
  ]);

  const trending = (trendingRes.data || []) as Row[];
  const fresh = (freshRes.data || []) as Row[];
  const topWeek = (topWeekRes.data || []) as Row[];

  return (
    <main className="home">
      {/* HERO */}
      <header className="hero">
        <h1 className="brand">R&nbsp;E&nbsp;P&nbsp;L&nbsp;A&nbsp;Y&nbsp;D</h1>
        <p className="tag">Le migliori giocate FPS, curate dalla community.</p>
      </header>

      {/* SECTIONS */}
      <section className="block">
        <h2 className="h2">Trending (ultime 24h)</h2>
        <FeedListClient rows={trending} empty="Ancora niente nelle ultime 24 ore." />
      </section>

      <section className="block">
        <h2 className="h2">Fresh drops</h2>
        <FeedListClient rows={fresh} empty="Le clip più nuove appariranno qui." />
      </section>

      <section className="block">
        <h2 className="h2">Top settimana</h2>
        <FeedListClient rows={topWeek} empty="Appena ci saranno clip votate, le trovi qui." />
      </section>

      <style
        dangerouslySetInnerHTML={{
          __html: `
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
      `,
        }}
      />
    </main>
  );
}
