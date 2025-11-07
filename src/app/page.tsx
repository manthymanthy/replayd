// src/app/page.tsx
import { createClient } from '@supabase/supabase-js';

// ISR soft: rigenera ogni 30s
export const revalidate = 30;

type Clip = {
  id: string;
  title: string | null;
  url: string;
  author_name: string | null;
  votes: number | null;
  created_at: string;
};

// Client Supabase anche lato server (usa le env pubbliche)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Estrae l’ID di YouTube, se presente
function getYouTubeId(u: string) {
  // supporta youtu.be/ID e youtube.com/watch?v=ID (& variations)
  const m =
    u.match(/(?:youtu\.be\/|v=)([a-zA-Z0-9_-]{6,})/) ||
    u.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{6,})/);
  return m?.[1];
}

// Thumbnail: YouTube → immagine ufficiale, altrimenti placeholder
function thumbnailFor(url: string) {
  const id = getYouTubeId(url);
  if (id) return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
  // mini placeholder neutro in data URI (grigio scuro)
  return `data:image/svg+xml;utf8,` + encodeURIComponent(`
    <svg xmlns='http://www.w3.org/2000/svg' width='480' height='270'>
      <rect width='100%' height='100%' fill='#1a1a1a'/>
      <text x='50%' y='50%' dy='.35em' text-anchor='middle'
            fill='#7a7a7a' font-family='sans-serif' font-size='16'>No preview</text>
    </svg>
  `);
}

export default async function Page() {
  const { data, error } = await supabase
    .from('clips')
    .select('id, title, url, author_name, votes, created_at')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(60);

  const clips = (data || []) as Clip[];

  return (
    <main style={{ display: 'grid', gap: 24, maxWidth: 1200, margin: '40px auto', padding: '0 16px' }}>
      {/* Hero */}
      <div style={{ display: 'grid', gap: 12 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800 }}>Feed</h1>
        <p style={{ opacity: 0.8 }}>
          Le migliori giocate inviate dalla community. Clicca per aprire la clip originale.
        </p>
      </div>

      {/* Griglia responsive */}
      <div
        style={{
          display: 'grid',
          gap: 16,
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))'
        }}
      >
        {error && (
          <div style={{ opacity: 0.8, color: '#ff8080' }}>
            Errore nel caricamento: {error.message}
          </div>
        )}

        {clips.map((c) => {
          const thumb = thumbnailFor(c.url);
          return (
            <a
              key={c.id}
              href={c.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                position: 'relative',
                display: 'block',
                borderRadius: 12,
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,.08)',
                background: 'rgba(255,255,255,.03)',
                transition: 'transform .08s ease, border-color .12s ease'
              }}
            >
              {/* box 16:9 */}
              <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%' }}>
                <img
                  src={thumb}
                  alt={c.title ?? 'clip'}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                  loading="lazy"
                />
                {/* overlay sfumato basso per testo */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,.55) 0%, rgba(0,0,0,0) 55%)'
                  }}
                />
                {/* info testo */}
                <div
                  style={{
                    position: 'absolute',
                    left: 10,
                    right: 10,
                    bottom: 10,
                    display: 'grid',
                    gap: 6
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>
                    {c.title || 'Senza titolo'}
                  </div>
                  <div style={{ opacity: 0.8, fontSize: 12 }}>
                    {c.author_name ? `by ${c.author_name}` : 'by anonymous'}
                  </div>
                </div>
              </div>
            </a>
          );
        })}
      </div>

      {clips.length === 0 && !error && (
        <div style={{ opacity: 0.8 }}>Ancora nessuna clip. Vai su <a href="/submit">/submit</a> e inviane una!</div>
      )}
    </main>
  );
}
