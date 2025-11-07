// src/app/leaderboard/page.tsx
import { createClient } from '@supabase/supabase-js';
import LeaderboardClient from '../../components/LeaderboardClient'; // percorso relativo

export const revalidate = 60;

type LbRow = {
  id: string;
  title: string | null;
  url: string;
  author_name: string | null;
  votes: number | null;
  created_at: string;
};

export default async function LeaderboardPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Scope: last 30d, Top 100 by votes then recency
  const now = new Date();
  const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data } = await supabase
    .from('clips')
    .select('id,title,url,author_name,votes,created_at')
    .gte('created_at', last30d)
    .order('votes', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(100);

  const rows = (data || []) as LbRow[];

  return (
    <main className="lb">
      <header className="lb__hero">
        <h1 className="brand">R&nbsp;E&nbsp;P&nbsp;L&nbsp;A&nbsp;Y&nbsp;D</h1>
        <p className="tag">Top 100 Arcade Leaderboard — hover to preview, click to play.</p>
      </header>

      <LeaderboardClient rows={rows} />

      <style dangerouslySetInnerHTML={{ __html: `
        .lb{ display:grid; gap:18px }
        .lb__hero{ display:grid; gap:6px }
        .brand{
          font-size:28px; font-weight:900; letter-spacing:.36em;
          color:#fff; margin:.2rem 0 .4rem; text-transform:uppercase;
        }
        .tag{ opacity:.75 }
      `}}/>
    </main>
  );
}
