// src/components/LeaderboardClient.tsx
"use client";

import { useEffect, useRef, useState } from "react";
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
  try { return `${new URL(url).origin}/favicon.ico`; } catch { return "/favicon.ico"; }
}

/** Costruisce src di anteprima autoplay e muta per YouTube/Twitch clip */
function buildEmbedSrc(url: string){
  const p = parseClip(url);
  if (p.kind === "youtube") {
    // privacy-enhanced + autoplay mute + UI minimale
    return `https://www.youtube-nocookie.com/embed/${p.id}?autoplay=1&mute=1&playsinline=1&controls=0&modestbranding=1&rel=0`;
  }
  if (p.kind === "twitch-clip") {
    const parent = typeof window !== "undefined" ? window.location.hostname : "localhost";
    return `https://clips.twitch.tv/embed?clip=${p.id}&parent=${encodeURIComponent(parent)}&autoplay=true&muted=true`;
  }
  return null;
}

/** rileva “no hover” (touch) per non creare iframes non cliccabili su mobile */
const canHover = typeof window !== "undefined"
  ? window.matchMedia("(hover: hover)").matches
  : true;

export default function LeaderboardClient({ rows }: { rows: Row[] }) {
  const [openUrl, setOpenUrl] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [activeHoverId, setActiveHoverId] = useState<string | null>(null); // quello che effettivamente riproduce
  const hoverTimer = useRef<number | null>(null);

  // Quando entri su una riga: attiva dopo un piccolo delay per evitare flicker
  function onRowEnter(id: string){
    if (!canHover) return;
    setHoverId(id);
    if (hoverTimer.current) window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => setActiveHoverId(id), 120);
  }
  function onRowLeave(id: string){
    if (!canHover) return;
    if (hoverTimer.current) window.clearTimeout(hoverTimer.current);
    if (activeHoverId === id) setActiveHoverId(null);
    if (hoverId === id) setHoverId(null);
  }

  useEffect(() => {
    return () => {
      if (hoverTimer.current) window.clearTimeout(hoverTimer.current);
    };
  }, []);

  return (
    <>
      <div className="lb__list">
        {rows.length === 0 && <div className="lb__empty">No ranked clips yet.</div>}

        {rows.map((r, i) => {
          const nick = r.author_name?.trim() || "Unknown Player";
          const thumb = getThumb(r.url);
          const showPreview = canHover && activeHoverId === r.id;
          const previewSrc = showPreview ? buildEmbedSrc(r.url) : null;

          return (
            <div
              key={r.id}
              className="lb__rowWrap"
              onMouseEnter={() => onRowEnter(r.id)}
              onMouseLeave={() => onRowLeave(r.id)}
            >
              <button
                className="lb__row"
                onClick={() => setOpenUrl(r.url)}
                title="Play"
              >
                <div className="lb__rank">#{String(i + 1).padStart(2, "0")}</div>

                <div className="lb__col lb__main">
                  <div className="lb__title">{r.title || "Untitled"}</div>
                  <div className="lb__meta">
                    {nick} · {r.votes ?? 0} pts · {domainFrom(r.url)} · {timeAgo(r.created_at)}
                  </div>
                </div>

                <div className="lb__thumbBox">
                  {!showPreview && (
                    <img className="lb__thumb" src={thumb} alt="" loading="lazy" decoding="async" />
                  )}
                  {showPreview && previewSrc && (
                    <iframe
                      className="lb__iframe"
                      src={previewSrc}
                      title="preview"
                      allow="autoplay; encrypted-media; picture-in-picture; clipboard-write"
                      allowFullScreen={false}
                      // importantissimo: niente cattura eventi, così il click prende la riga
                      style={{ pointerEvents: "none" }}
                    />
                  )}
                </div>
              </button>
            </div>
          );
        })}
      </div>

      <PlayerModal url={openUrl} onClose={() => setOpenUrl(null)} />

      <style>{`
        .lb__list{
          border:1px solid var(--line);
          border-radius:14px;
          overflow:hidden;
          background:var(--panel);
        }
        .lb__empty{
          padding:24px; text-align:center; color:#a6a6a6;
        }

        .lb__rowWrap{ display:block } /* wrapper per gli eventi hover */
        .lb__row{
          width:100%;
          display:grid;
          grid-template-columns: 90px 1fr 240px; /* thumb più lunga */
          gap:14px;
          align-items:center;
          padding:16px 18px;
          background:transparent;
          border:0;
          border-bottom:1px solid var(--line);
          color:inherit;
          text-align:left;
          cursor:pointer;
          transition: background .07s ease, border-color .12s ease;
        }
        .lb__row:last-child{ border-bottom:none }
        .lb__row:hover{
          background:#111;
          border-color:var(--line-strong);
        }
        .lb__row:active{ transform:translateY(1px) }

        .lb__rank{
          font-size:20px; font-weight:900; letter-spacing:.08em;
          text-align:center; color:#fff;
        }

        .lb__main{ display:grid; gap:6px; min-width:0 }
        .lb__title{
          color:#fff; font-weight:800;
          white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
        }
        .lb__meta{
          font-size:12px; color:#a6a6a6;
          white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
        }

        .lb__thumbBox{
          position:relative;
          width:100%; height:120px; /* più alta per avere vero “preview” */
          border-radius:12px; overflow:hidden; background:#000;
          box-shadow: 0 0 0 1px rgba(255,255,255,.05) inset;
        }
        .lb__thumb{
          position:absolute; inset:0; width:100%; height:100%;
          object-fit:cover; display:block;
        }
        .lb__iframe{
          position:absolute; inset:0; width:100%; height:100%; border:0;
        }

        @media(max-width:900px){
          .lb__row{ grid-template-columns: 70px 1fr 180px; }
          .lb__thumbBox{ height:100px; }
        }
        @media(max-width:700px){
          .lb__row{ grid-template-columns: 60px 1fr 120px; }
          .lb__thumbBox{ height:80px; }
        }
      `}</style>
    </>
  );
}
