"use client";

import { useState } from "react";
import PlayerModal from "../components/PlayerModal";
import { parseClip } from "../lib/parseClip";

type Row = {
  id: string;
  title: string | null;
  url: string;
  author_name: string | null;
  votes: number | null;
  created_at: string;
};

function timeAgo(s: string){
  const ms = Date.now() - new Date(s).getTime();
  const m = Math.floor(ms/60000);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m/60);
  if (h < 48) return `${h}h`;
  const d = Math.floor(h/24);
  return `${d}d`;
}
function domainFrom(url: string){
  try { return new URL(url).hostname.replace(/^www\./,""); }
  catch { return ""; }
}
function thumbFrom(url: string){
  const p = parseClip(url);
  if (p.kind === "youtube" && p.id) {
    // immagine molto leggera ma pulita
    return `https://i.ytimg.com/vi/${p.id}/hqdefault.jpg`;
  }
  if (p.kind === "twitch-clip" && p.id) {
    // best-effort: molte clip hanno questo pattern
    return `https://clips-media-assets2.twitch.tv/${p.id}-preview-480x272.jpg`;
  }
  // fallback icon
  try { return `${new URL(url).origin}/favicon.ico`; } catch { return "/favicon.ico"; }
}

export function FeedListClient({ rows, empty }: { rows: Row[]; empty: string }) {
  const [openUrl, setOpenUrl] = useState<string | null>(null);

  return (
    <>
      <div className="table">
        <div className="tbody">
          {rows.map((r) => {
            const thumb = thumbFrom(r.url);
            return (
              <button
                key={r.id}
                className="row"
                onClick={() => setOpenUrl(r.url)}
                title="Guarda"
              >
                <img
                  className="thumb"
                  src={thumb}
                  alt=""
                  loading="lazy"
                  decoding="async"
                />
                <div className="info">
                  <div className="title">{r.title || "Untitled"}</div>
                  <div className="meta">
                    {domainFrom(r.url)}{r.author_name ? ` · ${r.author_name}` : ""} · {timeAgo(r.created_at)}
                  </div>
                </div>
                <div className="votes">{r.votes ?? 0}</div>
              </button>
            );
          })}
          {rows.length === 0 && <div className="empty">{empty}</div>}
        </div>
      </div>

      <PlayerModal url={openUrl} onClose={() => setOpenUrl(null)} />

      <style>{`
        .table{ border:1px solid var(--line); border-radius:12px; overflow:hidden; background:var(--panel) }
        .tbody{ display:block }
        .row{
          width:100%;
          display:grid; grid-template-columns: 120px 1fr 56px; gap:12px;
          align-items:center; padding:10px 12px;
          background:none; color:inherit; border:0; text-align:left;
          border-bottom:1px solid var(--line);
          cursor:pointer;
          transition: background .06s ease, border-color .12s ease, transform .06s ease;
        }
        .row:hover{ background:#101010; border-color:var(--line-strong) }
        .row:active{ transform: translateY(1px); }
        .row:last-child{ border-bottom:none }

        .thumb{
          width:120px; height:68px; border-radius:8px; object-fit:cover; background:#000;
          box-shadow: 0 0 0 1px rgba(255,255,255,.04) inset;
        }
        .info{ display:grid; gap:4px; min-width:0 }
        .title{ font-weight:700; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis }
        .meta{ font-size:12px; color:#a6a6a6; white-space:nowrap; overflow:hidden; text-overflow:ellipsis }
        .votes{ text-align:right; font-weight:800; color:#cfcfcf }
        .empty{ padding:18px; text-align:center; color:#a6a6a6 }
      `}</style>
    </>
  );
}
