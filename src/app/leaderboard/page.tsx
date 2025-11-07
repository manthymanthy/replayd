// src/app/leaderboard/page.tsx
import { createClient } from "@supabase/supabase-js";
import LeaderboardClient from "../../components/LeaderboardClient";

export const revalidate = 20;

type Row = {
  id: string;
  title: string | null;
  url: string;
  author_name: string | null;
  votes: number;        // LeaderboardClient si aspetta "votes"
  created_at: string;
  game?: string | null;
};

export default async function Page() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // 1) Tenta la view (score = conteggio voti reale)
  let rows: Row[] = [];
  const { data: viewData, error: viewErr } = await supabase
    .from("clips_with_score")
    .select("id,title,url,author_name,score,created_at,game")
    .order("score", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(100);

  if (!viewErr && viewData && viewData.length > 0) {
    rows = viewData.map((r: any) => ({
      id: r.id,
      title: r.title,
      url: r.url,
      author_name: r.author_name,
      votes: Number(r.score ?? 0),
      created_at: r.created_at,
      game: r.game ?? null,
    }));
  } else {
    // 2) FALLBACK: usa la tabella clips (mostra comunque qualcosa)
    const { data: clipsData } = await supabase
      .from("clips")
      .select("id,title,url,author_name,votes,created_at,game")
      .order("votes", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(100);

    rows = (clipsData || []).map((r: any) => ({
      id: r.id,
      title: r.title,
      url: r.url,
      author_name: r.author_name,
      votes: Number(r.votes ?? 0),
      created_at: r.created_at,
      game: r.game ?? null,
    }));
  }

  return (
    <main className="home">
      <header className="hero" style={{ display: "grid", gap: 8 }}>
        <h1
          className="brand"
          style={{ fontSize: 28, fontWeight: 900, letterSpacing: ".36em", textTransform: "uppercase" }}
        >
          R&nbsp;E&nbsp;P&nbsp;L&nbsp;A&nbsp;Y&nbsp;D
        </h1>
        <p className="tag" style={{ opacity: 0.75 }}>Global Leaderboard</p>
      </header>

      <LeaderboardClient rows={rows} />
    </main>
  );
}
