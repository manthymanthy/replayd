// Home / Feed
import { createClient } from '@supabase/supabase-js';
import { FeedListClient } from "@/components/FeedListClient";

export const revalidate = 30;

type Row = {
  id: string;
  title: string | null;
  url: string;
  author_name: string | null;
  votes: number | null;
  created_at: string;
};

function domainFrom(url: string){
  try { return new URL(url).hostname.replace(/^www\./,''); }
  catch { return ''; }
}

function timeAgo(s: string){
  const ms = Date.now() - new Date(s).getTime();
  const m = Math.floor(ms/60000);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m/60);
  if (h < 48) return `${h}h`;
  const d = Math.floor(h/24);
  return `${d}d`;
}

export default async function Page() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const now = new Date();
  const last24h = new Date(now.getTime() - 24*60*60*1000).toISOString();
  const last7d  = new Date(now.getTime() - 7*24*60*60*1000).toISOString();

  const [trendingRes, freshRes, topWeekRes] = await Promise.all([
    supabase.from('clips')
      .select('id,title,url,author_name,votes,created_at')
      .gte('created_at', last24h)
      .order('votes', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(20),

    supabase.from('clips')
      .select('id,title,url,author_name,votes,created_at')
      .order('created_at', { ascending: false })
      .limit(20),

    supabase.from('clips')
      .select('id,title,url,author_name,votes,created_at')
      .gte('created_at', last7d)
      .order('votes', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(20),
  ]);

  const trending = (trendingRes.data || []) as Row[];
  const fresh    = (freshRes.data || []) as Row[];
  const topWeek  = (topWeekRes.data || []) as Row[];

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

/* —————————————————— */
/*   LISTA compatta    */
/* —————————————————— */

function FeedListClient({ rows, empty }: { rows: Row[]; empty: string }) {
  return (
    <div className="table">
      <div className="tbody">
        {rows.map((r) => (
          <a key={r.id} href={r.url} target="_blank" rel="noopener noreferrer" className="row">
            <div className="dot" />
            <div className="info">
              <div className="title">{r.title || 'Untitled'}</div>
              <div className="meta">
                {domainFrom(r.url)}{r.author_name ? ` · ${r.author_name}` : ''} · {timeAgo(r.created_at)}
              </div>
            </div>
            <div className="votes">{r.votes ?? 0}</div>
          </a>
        ))}
        {rows.length === 0 && (
          <div className="empty">{empty}</div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .table{ border:1px solid var(--line); border-radius:12px; overflow:hidden; background:var(--panel) }
        .tbody{ display:block }
        .row{
          display:grid; grid-template-columns: 12px 1fr 64px; gap:12px;
          align-items:center; padding:12px 12px;
          border-bottom:1px solid var(--line);
          transition: background .08s ease, border-color .12s ease;
        }
        .row:hover{ background:#111; border-color:var(--line-strong) }
        .row:last-child{ border-bottom:none }

        .dot{ width:8px; height:8px; border-radius:999px; background:#7f7f7f; opacity:.9 }
        .info{ display:grid; gap:3px; min-width:0 }
        .title{ font-weight:700; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis }
        .meta{ font-size:12px; color:#a6a6a6; white-space:nowrap; overflow:hidden; text-overflow:ellipsis }
        .votes{ text-align:right; font-weight:800 }
        .empty{ padding:18px; text-align:center; color:#a6a6a6 }
      `}}/>
    </div>
  );
}
