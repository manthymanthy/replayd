// src/components/LeaderboardClient.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import type { LbRow } from "@/app/leaderboard/page";
import PlayerModal from "@/components/PlayerModal";
import { parseClip } from "@/lib/parseClip";

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
function getThumb(url: string){
  const p = parseClip(url);
  if (p.kind === "youtube") {
    // fast, cacheable thumbnail
    return `https://i.ytimg.com/vi/${p.id}/hqdefault.jpg`;
  }
  // Fallback minimal preview
  return null;
}

export default function LeaderboardClient({ rows }: { rows: LbRow[] }) {
  const firstUrl = rows[0]?.url ?? null;
  const [hoverUrl, setHoverUrl] = useState<string | null>(firstUrl);
  const [openUrl, setOpenUrl] = useState<string | null>(null);

  // Keep preview valid if rows change
  useEffect(() => { if (!hoverUrl && firstUrl) setHoverUrl(firstUrl); }, [firstUrl, hoverUrl]);

  const preview = useMemo(() => {
    if (!hoverUrl) return null;
    const thumb = getThumb(hoverUrl);
    return { thumb, url: hoverUrl };
  }, [hoverUrl]);

  return (
    <>
      <section className="lb__grid">
        {/* Left sticky preview */}
        <aside className="lb__preview">
          <div className="lb__previewBox">
            {preview?.thumb ? (
              <img src={preview.thumb} alt="Preview" />
            ) : (
              <div className="lb__placeholder">
                <div className="dot" />
                <div>Hover a clip to preview</div>
              </div>
            )}
          </div>
          <div className="lb__hint">Hover for preview · Click to play</div>
        </aside>

        {/* Ranked list */}
        <div className="lb__list">
          {rows.length === 0 && (
            <div className="lb__empty">No ranked clips yet.</div>
          )}

          {rows.map((r, i) => (
            <button
              key={r.id}
              className="lb__row"
              onMouseEnter={() => setHoverUrl(r.url)}
              onFocus={() => setHoverUrl(r.url)}
              onClick={() => setOpenUrl(r.url)}
              title="Play"
            >
              <div className="lb__rank">#{i + 1}</div>
              <div className="lb__info">
                <div className="lb__title">{r.title || "Untitled"}</div>
                <div className="lb__meta">
                  {r.votes ?? 0} pts · {domainFrom(r.url)}
                  {r.author_name ? ` · ${r.author_name}` : ""} · {timeAgo(r.created_at)}
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <PlayerModal url={openUrl} onClose={() => setOpenUrl(null)} />

      <style dangerouslySetInnerHTML={{ __html: `
        .lb__grid{
          display:grid; grid-template-columns: 360px 1fr; gap:16px;
        }
        @media (max-width: 980px){
          .lb__grid{ grid-template-columns: 1fr; }
          .lb__preview{ position:relative; top:auto }
        }
        .lb__preview{
          position:sticky; top:18px; align-self:start;
          display:grid; gap:10px;
        }
        .lb__previewBox{
          background:var(--panel); border:1px solid var(--line-strong);
          border-radius:12px; overflow:hidden; aspect-ratio:16/9;
          display:grid; place-items:center;
        }
        .lb__previewBox img{ width:100%; height:100%; object-fit:cover; display:block }
        .lb__placeholder{ color:#aaa; display:grid; place-items:center; gap:8px; font-size:14px }
        .dot{ width:8px; height:8px; border-radius:999px; background:#7f7f7f; opacity:.9 }

        .lb__hint{ opacity:.7; font-size:12px }
        .lb__list{
          border:1px solid var(--line); border-radius:12px; overflow:hidden; background:var(--panel);
        }
        .lb__row{
          width:100%; display:grid; grid-template-columns: 76px 1fr; gap:12px;
          align-items:center; padding:14px 14px; border:0; background:transparent;
          border-bottom:1px solid var(--line); color:inherit; text-align:left; cursor:pointer;
          transition: background .08s ease, border-color .12s ease;
        }
        .lb__row:hover{ background:#111; border-color:var(--line-strong) }
        .lb__row:last-child{ border-bottom:none }

        .lb__rank{
          font-weight:900; letter-spacing:.06em; color:#fff; opacity:.9;
          font-size:18px; text-align:center;
        }
        .lb__info{ min-width:0; display:grid; gap:4px }
        .lb__title{ font-weight:800; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis }
        .lb__meta{ font-size:12px; color:#a6a6a6; white-space:nowrap; overflow:hidden; text-overflow:ellipsis }

        .lb__empty{ padding:22px; text-align:center; color:#a6a6a6 }
      `}}/>
    </>
  );
}
