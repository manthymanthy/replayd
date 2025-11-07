import { createClient } from '@supabase/supabase-js';

export const revalidate = 30; // sensazione "live", ma veloce

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

export default async function LeaderboardPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase
    .from('clips')
    .select('id,title,url,author_name,votes,created_at')
    .order('votes', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    return <p style={{opacity:.8}}>Errore: {error.message}</p>;
  }

  const rows = (data || []) as Row[];

  return (
    <section className="page">
      <h1 className="h1">Leaderboard</h1>
      <p className="muted">Ordinate per voti, poi per data. Aggiornamento ogni 30s.</p>

      <div className="table">
        <div className="thead">
          <div>#</div>
          <div>Clip</div>
          <div className="thVotes">Votes</div>
        </div>

        <div className="tbody">
          {rows.map((r, i) => (
            <a key={r.id} href={r.url} target="_blank" rel="noopener noreferrer" className="row">
              <div className="rank">{i+1}</div>
              <div className="info">
                <div className="title">{r.title || 'Untitled'}</div>
                <div className="meta">
                  {domainFrom(r.url)}{r.author_name ? ` · ${r.author_name}` : ''} · {new Date(r.created_at).toLocaleDateString()}
                </div>
              </div>
              <div className="votes">{r.votes ?? 0}</div>
            </a>
          ))}
          {rows.length === 0 && (
            <div className="empty">Ancora nessuna clip votata.</div>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .page{ display:grid; gap:12px }
        .h1{ font-size:22px; font-weight:800; letter-spacing:.02em; margin:4px 0 2px }
        .muted{ opacity:.7 }

        .table{ border:1px solid var(--line); border-radius:12px; overflow:hidden; background:var(--panel) }
        .thead, .row{
          display:grid;
          grid-template-columns: 56px 1fr 88px;
          align-items:center;
          gap:12px;
        }
        .thead{ padding:10px 12px; border-bottom:1px solid var(--line); color:#cfcfcf; font-size:12px; letter-spacing:.04em }
        .thVotes{ text-align:right }

        .tbody{ display:block }
        .row{
          padding:12px; border-bottom:1px solid var(--line);
          transition: background .08s ease, border-color .12s ease;
        }
        .row:hover{ background:#111; border-color:var(--line-strong) }
        .row:last-child{ border-bottom:none }

        .rank{ color:#bdbdbd; font-weight:700; text-align:center }
        .info{ display:grid; gap:2px }
        .title{ font-weight:700; color:#fff }
        .meta{ font-size:12px; color:#a6a6a6 }
        .votes{ text-align:right; font-weight:800 }

        .empty{ padding:24px; text-align:center; color:#a6a6a6 }
      `}}/>
    </section>
  );
}
