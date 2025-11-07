// src/components/LeaderboardClient.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import PlayerModal from "./PlayerModal";
import { parseClip } from "../lib/parseClip";

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
function getThumb(url: string){
  const p = parseClip(url);
  if (p.kind === "youtube") return `https://i.ytimg.com/vi/${p.id}/hqdefault.jpg`;
  // fallback minimal (favicon)
  try { return `${new URL(url).origin}/favicon.ico`; } catch { return "/favicon.ico"; }
}

export default function LeaderboardClient({ rows }: { rows: Row[] }) {
  const firstUrl = rows[0]?.url ?? null;
  const [hoverUrl, setHoverUrl] = useState<string | null>(firstUrl);
  const [openUrl, setOpenUrl] = useState<string | null>(null);

  // Keep preview valid if rows change
  useEffect(() => { if (!hoverUrl && firstUrl) setHoverUrl(firstUrl); }, [firstUrl, hoverUrl]);

  const preview = useMemo(() => {
    if (!hoverUrl) return null;
    return { thumb: getThumb(hoverUrl), url: hoverUrl };
  }, [hoverUrl]);

  return (
    <>
      <section className="arc__grid">
        {/* Sticky big preview (left) */}
        <aside className="arc__preview">
          <div className="arc__screen">
            {preview?.thumb ? (
              <img src={preview.thumb} alt="Preview" />
            ) : (
              <div className="arc__placeholder">
                <div className="pixeldot" />
                <div>Hover a clip to preview</div>
              </div>
            )}
          </div>
          <div className="arc__hint">Hover for preview · Click to play</div>
        </aside>

        {/* Ranked list (right) — arcade rows with per-row thumbnail */}
        <div className="arc__list">
          {rows.length === 0 && (
            <div className="arc__empty">No ranked clips yet.</div>
          )}

          {rows.map((r, i) => {
            const nick = r.author_name?.trim() || "Unknown Player";
            const thumb = getThumb(r.url);
            return (
              <button
                key={r.id}
                className="arc__row"
                onMouseEnter={() => setHoverUrl(r.url)}
                onFocus={() => setHoverUrl(r.url)}
                onClick={() => setOpenUrl(r.url)}
                title="Play"
              >
                <div className="arc__rank">#{String(i + 1).padStart(2, "0")}</div>

                <div className="arc__who">
                  <div className="arc__nick">{nick}</div>
                  <div className="arc__meta">
                    {r.votes ?? 0} pts · {domainFrom(r.url)} · {timeAgo(r.created_at)}
                  </div>
                  <div className="arc__title" title={r.title || ""}>
                    {r.title || "Untitled"}
                  </div>
                </div>

                <img
                  className="arc__thumb"
                  src={thumb}
                  alt=""
                  loading="lazy"
                  decoding="async"
                />
              </button>
            );
          })}
        </div>
      </section>

      <PlayerModal url={openUrl} onClose={() => setOpenUrl(null)} />

      <style dangerouslySetInnerHTML={{ __html: `
        /* Grid: preview left, list right */
        .arc__grid{
          display:grid; grid-template-columns: 420px 1fr; gap:18px;
        }
        @media (max-width: 1100px){
          .arc__grid{ grid-template-columns: 1fr; }
          .arc__preview{ position:relative; top:auto }
        }

        /* Big sticky preview */
        .arc__preview{
          position:sticky; top:18px; align-self:start;
          display:grid; gap:10px;
        }
        .arc__screen{
          background:var(--panel); border:1px solid var(--line-strong);
          border-radius:14px; overflow:hidden; aspect-ratio:16/9;
          display:grid; place-items:center;
          box-shadow: 0 0 0 2px rgba(255,255,255,.03) inset,
                      0 10px 30px rgba(0,0,0,.35);
        }
        .arc__screen img{ width:100%; height:100%; object-fit:cover; display:block }
        .arc__placeholder{ color:#aaa; display:grid; place-items:center; gap:8px; font-size:14px }
        .pixeldot{ width:8px; height:8px; border-radius:2px; background:#70f; box-shadow:0 0 12px #70f90; opacity:.9 }

        .arc__hint{ opacity:.7; font-size:12px }

        /* List container */
        .arc__list{
          border:1px solid var(--line); border-radius:14px; overflow:hidden; background:var(--panel);
        }
        .arc__empty{ padding:24px; text-align:center; color:#a6a6a6 }

        /* Arcade row */
        .arc__row{
          width:100%; display:grid;
          grid-template-columns: 92px 1fr 180px; gap:12px;
          align-items:center; padding:14px 14px;
          border:0; background:transparent; color:inherit; text-align:left; cursor:pointer;
          border-bottom:1px solid var(--line);
          transition: background .06s ease, border-color .12s ease, transform .06s ease;
        }
        .arc__row:hover{ background:#101010; border-color:var(--line-strong) }
        .arc__row:active{ transform: translateY(1px) }
        .arc__row:last-child{ border-bottom:none }

        /* Rank badge — arcade vibe */
        .arc__rank{
          font-weight:900; font-size:20px; letter-spacing:.08em;
          color:#fff; text-align:center;
          padding:10px 0;
          border:1px solid var(--line-strong);
          border-radius:10px;
          background:linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.02));
          box-shadow: 0 0 0 1px rgba(255,255,255,.03) inset;
        }

        /* Who/info block */
        .arc__who{ min-width:0; display:grid; gap:4px }
        .arc__nick{
          font-weight:900; text-transform:uppercase; letter-spacing:.06em;
          white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
        }
        .arc__meta{
          font-size:12px; color:#a6a6a6; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
        }
        .arc__title{
          font-size:13px; color:#d5d5d5; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
        }

        /* Right-side thumbnail */
        .arc__thumb{
          width:180px; height:100px; border-radius:10px; object-fit:cover; background:#000;
          box-shadow: 0 0 0 1px rgba(255,255,255,.05) inset;
        }

      `}}/>
    </>
  );
}
