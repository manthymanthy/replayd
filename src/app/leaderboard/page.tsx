// src/app/leaderboard/page.tsx
import { createClient } from "@supabase/supabase-js";
import LeaderboardClient from "../../components/LeaderboardClient";

// per debug immediato (rimetti 20 dopo)
export const revalidate = 0;

type Row = {
  id: string;
  title: string | null;
  url: string;
  author_name: string | null;
  votes: number;        // ⬅️ il client si aspetta "votes"
  created_at: string;
};

export default async function Page() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Leggiamo dalla VIEW che conta i voti reali
  const { data, error } = await supabase
    .from("clips_with_score")
    .select("id,title,url,author_name,score,created_at")
    .order("score", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("Leaderboard query error:", error);
  }

  // Mappa score -> votes per compatibilità con il componente
  const rows: Row[] = (data || []).map((r: any) => ({
    id: r.id,
    title: r.title,
    url: r.url,
    author_name: r.author_name,
    votes: Number(r.score ?? 0),
    created_at: r.created_at,
  }));

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
