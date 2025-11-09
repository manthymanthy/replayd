// src/app/page.tsx
import { createClient } from "@supabase/supabase-js";
import FeedListClient from "../components/FeedListClient";

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
  game: string | null; // required in type, can be null
};

const ARC_ONLY = "Arc Raiders";

export default async function Page() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const now = new Date();
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  // Trending — last 24h, Arc Raiders only
  const trendingSel = supabase
    .from("clips")
    .select("id,title,url,author_name,votes,created_at,game")
    .eq("game", ARC_ONLY)
    .gte("created_at", last24h)
    .order("votes", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(20);

  // Fresh — most recent (but still sort by votes DESC), Arc Raiders only
  const freshSel = supabase
    .from("clips")
    .select("id,title,url,author_name,votes,created_at,game")
    .eq("game", ARC_ONLY)
    .order("votes", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(20);

  // Top this week — last 7d, Arc Raiders only
  const topWeekSel = supabase
    .from("clips")
    .select("id,title,url,author_name,votes,created_at,game")
    .eq("game", ARC_ONLY)
    .gte("created_at", last7d)
    .order("votes", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(20);

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
      {/* HERO */}
      <header className="hero">
        <h1 className="brand">R&nbsp;E&nbsp;P&nbsp;L&nbsp;A&nbsp;Y&nbsp;D</h1>
        <p className="tag">Top plays, ranked by the community.</p>

        {/* Arc-only banner */}
        <div className="notice">
          <div className="pill">BETA</div>
          <div>
            <strong>Arc Raiders only.</strong> For now we accept highlights from{" "}
            <em>Arc Raiders</em> only — epic moments, personal records, smart plays.
            Lightweight voting. Global leaderboard. If the community grows, we’ll open to more games.
          </div>
        </div>
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

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .home{ display:grid; gap:20px }
        .hero{ display:grid; gap:12px }
        .brand{
          font-size:28px; font-weight:900; letter-spacing:.36em;
          color:#fff; margin:.2rem 0 .2rem; text-transform:uppercase;
        }
        .tag{ opacity:.75 }

        .notice{
          display:grid; grid-template-columns:auto 1fr; align-items:flex-start; gap:10px;
          padding:12px 14px; border-radius:12px;
          border:1px solid var(--line-strong);
          background:color-mix(in oklab, var(--panel) 86%, #9fdcff 14%);
        }
        .pill{
          align-self:center;
          font-size:11px; font-weight:900; letter-spacing:.08em;
          padding:4px 8px; border-radius:999px;
          border:1px solid var(--line-strong);
          background: linear-gradient(180deg, rgba(255,255,255,.10), rgba(255,255,255,.04));
          color:#9fdcff;
        }

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
