// src/app/leaderboard/page.tsx
import { createClient } from "@supabase/supabase-js";
import LeaderboardClient from "../../components/LeaderboardClient";

export const revalidate = 20;

type Row = {
  id: string;
  title: string | null;
  url: string;
  author_name: string | null;
  score: number;          // <— usa score
  created_at: string;
};

export default async function Page() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data } = await supabase
  .from("clips_with_score")
  .select("id,title,url,author_name,score,created_at")
  .order("score", { ascending: false })
  .order("created_at", { ascending: false })
  .limit(100);

  return (
    <main className="home">
      <header className="hero" style={{display:"grid",gap:8}}>
        <h1 className="brand" style={{fontSize:28,fontWeight:900,letterSpacing:".36em",textTransform:"uppercase"}}>
          R&nbsp;E&nbsp;P&nbsp;L&nbsp;A&nbsp;Y&nbsp;D
        </h1>
        <p className="tag" style={{opacity:.75}}>Global Leaderboard</p>
      </header>

      <LeaderboardClient rows={(data || []) as Row[]} />
    </main>
  );
}
