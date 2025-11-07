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
function buildEmbedSrc(url: string){
  const p = parseClip(url);
  if (p.kind === "youtube") {
    return `https://www.youtube-nocookie.com/embed/${p.id}?autoplay=1&mute=1&playsinline=1&controls=0&modestbranding=1&rel=0`;
  }
  if (p.kind === "twitch-clip") {
    const parent = typeof window !== "undefined" ? window.location.hostname : "localhost";
    return `https://clips.twitch.tv/embed?clip=${p.id}&parent=${encodeURIComponent(parent)}&autoplay=true&muted=true`;
  }
  return null;
}
const canHover = typeof window !== "undefined"
  ? window.matchMedia("(hover: hover)").matches
  : true;

export default function LeaderboardClient({ rows }: { rows: Row[] }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [activeHoverId, setActiveHoverId] = useState<string | null>(null);
  const hoverTimer = useRef<number | null>(null);

  // Body scroll lock quando overlay aperto
  useEffect(() => {
    if (openIdx !== null) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [openIdx]);

  // Tastiera per navigare tra le righe quando overlay aperto
  useEffect(() => {
    if (openIdx === null) return;
    function onKey(e: KeyboardEvent){
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        setOpenIdx(i => (i! > 0 ? (i! - 1) : i));
      } else if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault();
        setOpenIdx(i => (i! < rows.length - 1 ? (i! + 1) : i));
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openIdx, rows.length]);

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
  useEffect(() => () => { if (hoverTimer.current) window.clearTimeout(hoverTimer.current); }, []);

  const currentUrl = openIdx !== null ? rows[openIdx]?.url ?? null : null;

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
                className={`lb__row ${i<10 ? 'lb__row--top10' : ''}`}
                onClick={() => setOpenIdx(i)}
                title="Play"
              >
                <div className={`lb__rank ${i===0?'gold':i===1?'silver':i===2?'bronze':''}`}>
                  #{String(i + 1).padStart(2, "0")}
                </div>

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
                      style={{ pointerEvents: "none" }}
                    />
                  )}
                </div>
              </button>
            </div>
          );
        })}
      </div>

      <PlayerModal url={currentUrl} onClose={() => setOpenIdx(null)} />

      <style>{`
        .lb__list{
          border:1px solid var(--line);
          border-radius:14px;
          overflow:hidden;
          background:var(--panel);
        }
        .lb__empty{ padding:24px; text-align:center; color:#a6a6a6 }

        .lb__rowWrap{ display:block }
        .lb__row{
          width:100%;
          display:grid;
          grid-template-columns: 90px 1fr 240px;
          gap:14px; align-items:center;
          padding:16px 18px;
          background:transparent; border:0; border-bottom:1px solid var(--line);
          color:inherit; text-align:left; cursor:pointer;
          transition: background .07s ease, border-color .12s ease, box-shadow .12s ease;
          position:relative;
        }
        .lb__row:hover{ background:#111; border-color:var(--line-strong) }
        .lb__row:active{ transform:translateY(1px) }
        .lb__row:last-child{ border-bottom:none }

        /* glow barra laterale per Top10 */
        .lb__row--top10::before{
          content:""; position:absolute; left:0; top:0; bottom:0; width:2px;
          background: linear-gradient(180deg, color-mix(in oklab, var(--accent) 60%, transparent) 0%, transparent 100%);
          opacity:.7;
        }

        .lb__rank{
          font-size:20px; font-weight:900; letter-spacing:.08em; text-align:center; color:#fff;
          text-shadow: 0 0 10px rgba(255,255,255,.12);
        }
        .lb__rank.gold{
          color:#ffd76a;
          text-shadow: 0 0 12px rgba(255,215,106,.45), 0 0 22px rgba(255,215,106,.25);
        }
        .lb__rank.silver{
          color:#cfe1ff;
          text-shadow: 0 0 12px rgba(207,225,255,.45), 0 0 22px rgba(207,225,255,.25);
        }
        .lb__rank.bronze{
          color:#cd9b5a;
          text-shadow: 0 0 12px rgba(205,155,90,.45), 0 0 22px rgba(205,155,90,.25);
        }

        .lb__main{ display:grid; gap:6px; min-width:0 }
        .lb__title{ color:#fff; font-weight:800; white-space:nowrap; overflow:hidden; text-overflow:ellipsis }
        .lb__meta{ font-size:12px; color:#a6a6a6; white-space:nowrap; overflow:hidden; text-overflow:ellipsis }

        .lb__thumbBox{
          position:relative; width:100%; height:120px;
          border-radius:12px; overflow:hidden; background:#000;
          box-shadow: 0 0 0 1px rgba(255,255,255,.05) inset;
        }
        .lb__thumb{ position:absolute; inset:0; width:100%; height:100%; object-fit:cover; display:block }
        .lb__iframe{ position:absolute; inset:0; width:100%; height:100%; border:0 }

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
