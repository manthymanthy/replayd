"use client";

import { useState } from "react";
import PlayerModal from "./PlayerModal";

export function FeedListClient({ rows, empty }: { rows: any[]; empty: string }) {
  const [openUrl, setOpenUrl] = useState<string | null>(null);

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

  return (
    <>
      <div className="table">
        <div className="tbody">
          {rows.map((r) => (
            <button
              key={r.id}
              className="row row--btn"
              onClick={() => setOpenUrl(r.url)}
              title="Guarda"
            >
              <div className="dot" />
              <div className="info">
                <div className="title">{r.title || "Untitled"}</div>
                <div className="meta">
                  {domainFrom(r.url)}{r.author_name ? ` · ${r.author_name}` : ""} · {timeAgo(r.created_at)}
                </div>
              </div>
              <div className="votes">{r.votes ?? 0}</div>
            </button>
          ))}
          {rows.length === 0 && <div className="empty">{empty}</div>}
        </div>
      </div>

      <PlayerModal url={openUrl} onClose={() => setOpenUrl(null)} />

      <style>{`
        .row--btn{ width:100%; background:none; border:0; color:inherit; text-align:left; cursor:pointer; padding:0; display:contents; }
        .row--btn:hover{ background:#111; border-color:var(--line-strong) }
      `}</style>
    </>
  );
}
