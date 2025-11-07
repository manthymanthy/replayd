// src/components/LeaderboardClient.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import VoteChip from "./VoteChip";
import PlayerModal from "./PlayerModal";
import { parseClip } from "../lib/parseClip";
import { getDeviceId } from "../lib/device";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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

function isNew(created_at: string){ return (Date.now() - new Date(created_at).getTime()) < 48*60*60*1000 }
function isHot(votes: number | null){ return (votes ?? 0) >= 25 } // cambia soglia quando vuoi

export default function LeaderboardClient({ rows }: { rows: Row[] }) {
  const [data, setData] = useState<Row[]>(rows);
  const [openUrl, setOpenUrl] = useState<string | null>(null);

  // split Top3 + resto
  const top3 = data.slice(0, 3);
  const rest = data.slice(3);

  // hover preview (un solo iframe alla volta, usato nel podio e nella lista)
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [activeHoverId, setActiveHoverId] = useState<string | null>(null);
  const hoverTimer = useRef<number | null>(null);

  function onEnter(id: string){
    if (!canHover) return;
    setHoverId(id);
    if (hoverTimer.current) window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => setActiveHoverId(id), 120);
  }
  function onLeave(id: string){
    if (!canHover) return;
    if (hoverTimer.current) window.clearTimeout(hoverTimer.current);
    if (activeHoverId === id) setActiveHoverId(null);
    if (hoverId === id) setHoverId(null);
  }
  useEffect(() => () => { if (hoverTimer.current) window.clearTimeout(hoverTimer.current); }, []);

  async function upvote(clipId: string){
    const device = getDeviceId();

    // ottimistico
    setData(prev => prev.map(r => r.id === clipId ? ({...r, votes: (r.votes ?? 0) + 1}) : r));

    const { error } = await supabase.from("votes").insert({ clip_id: clipId, fingerprint: device });

    if (error) {
      // rollback
      setData(prev => prev.map(r => r.id === clipId ? ({...r, votes: Math.max(0,(r.votes ?? 1) - 1)}) : r));
      // @ts-ignore
      if (error.code === "23505") alert("You already upvoted this clip on this device.");
      else alert("Vote failed. Please try again.");
    }
  }

  return (
    <>
      {/* ───────────────────────────── */}
      {/*        PODIO TOP 3           */}
      {/* ───────────────────────────── */}
      {top3.length > 0 && (
        <section className="podium">
          {top3.map((r, i) => {
            const rank = i + 1;
            const nick = r.author_name?.trim() || "Unknown Player";
            const showPreview = canHover && activeHoverId === r.id;
            const previewSrc = showPreview ? buildEmbedSrc(r.url) : null;
            const thumb = getThumb(r.url);

            return (
              <article
                key={r.id}
                className={`podium__card podium__card--${rank}`}
                onMouseEnter={() => onEnter(r.id)}
                onMouseLeave={() => onLeave(r.id)}
              >
                <div className="podium__rank">#{String(rank).padStart(2,"0")}</div>

                <div className="podium__thumb" onClick={() => setOpenUrl(r.url)} title="Play">
                  {!showPreview && <img src={thumb} alt="" />}
                  {showPreview && previewSrc && (
                    <iframe
                      src={previewSrc}
                      title="preview"
                      allow="autoplay; encrypted-media; picture-in-picture; clipboard-write"
                      allowFullScreen={false}
                      style={{ pointerEvents: "none" }}
                    />
                  )}
                  <div className="podium__halo" aria-hidden />
                  <div className="podium__badges">
                    {isNew(r.created_at) && <span className="badge badge--new">NEW</span>}
                    {isHot(r.votes) && <span className="badge badge--hot">HOT</span>}
                  </div>
                </div>

                <div className="podium__title" title={r.title || ""}>
                  {r.title || "Untitled"}
                </div>
                <div className="podium__meta">
                  {nick} · {r.votes ?? 0} pts · {domainFrom(r.url)} · {timeAgo(r.created_at)}
                </div>

                <div className="podium__vote">
                  <VoteChip count={r.votes ?? 0} onClick={() => upvote(r.id)} />
                </div>
              </article>
            );
          })}
        </section>
      )}

      {/* ───────────────────────────── */}
      {/*      LISTA CLASSIFICA        */}
      {/* ───────────────────────────── */}
      <div className="lb__list">
        {data.length === 0 && <div className="lb__empty">No ranked clips yet.</div>}

        {rest.map((r, i) => {
          const idx = i + 4; // perché partiamo dal #4
          const nick = r.author_name?.trim() || "Unknown Player";
          const showPreview = canHover && activeHoverId === r.id;
          const previewSrc = showPreview ? buildEmbedSrc(r.url) : null;
          const thumb = getThumb(r.url);

          return (
            <div
              key={r.id}
              className="lb__rowWrap"
              onMouseEnter={() => onEnter(r.id)}
              onMouseLeave={() => onLeave(r.id)}
            >
              <button className={`lb__row ${idx<=10 ? 'lb__row--top10' : ''}`} onClick={() => setOpenUrl(r.url)} title="Play">
                <div className="lb__rank">#{String(idx).padStart(2, "0")}</div>

                <div className="lb__col lb__main">
                  <div className="lb__title">{r.title || "Untitled"}</div>
                  <div className="lb__meta">
                    {nick} · {r.votes ?? 0} pts · {domainFrom(r.url)} · {timeAgo(r.created_at)}
                  </div>
                </div>

                <div className="lb__voteCol" onClick={(e) => e.stopPropagation()}>
                  <VoteChip count={r.votes ?? 0} onClick={() => upvote(r.id)} />
                  <div className="lb__thumbBox">
                    {!showPreview && <img className="lb__thumb" src={thumb} alt="" loading="lazy" decoding="async" />}
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
                </div>
              </button>
            </div>
          );
        })}
      </div>

      <PlayerModal url={openUrl} onClose={() => setOpenUrl(null)} />

      <style>{`
        /* ─── PODIO TOP 3 ───────────────────────────────────────── */
        .podium{
          display:grid;
          grid-template-columns: 1fr 1.2fr 1fr; /* #1 al centro più grande */
          gap:16px; margin-bottom:10px;
        }
        @media(max-width: 1100px){
          .podium{ grid-template-columns: 1fr; }
        }
        .podium__card{
          position:relative;
          display:grid; gap:10px;
          border:1px solid var(--line);
          border-radius:14px; background:var(--panel);
          padding:12px;
          overflow:hidden;
        }
        .podium__card--1{ box-shadow: 0 0 0 1px rgba(255,255,255,.03) inset, 0 16px 40px rgba(0,0,0,.35) }
        .podium__rank{
          position:absolute; top:10px; left:12px;
          font-weight:900; font-size:18px; letter-spacing:.08em;
          color:#ffd76a;
        }
        .podium__thumb{
          position:relative; border-radius:12px; overflow:hidden; background:#000; aspect-ratio:16/9;
          cursor:pointer; border:1px solid var(--line-strong);
        }
        .podium__thumb img, .podium__thumb iframe{ position:absolute; inset:0; width:100%; height:100%; object-fit:cover; border:0; }
        .podium__halo{
          position:absolute; inset:auto 0 -16% 0; height:40%;
          background: radial-gradient(60% 80% at 50% 100%, color-mix(in oklab, var(--accent) 20%, transparent) 0%, transparent 60%);
          filter: blur(12px); opacity:.7; pointer-events:none;
        }
        .podium__badges{
          position:absolute; top:10px; right:10px; display:flex; gap:6px;
        }
        .badge{
          font-size:11px; font-weight:900; letter-spacing:.08em;
          padding:4px 8px; border-radius:999px;
          border:1px solid var(--line-strong);
          background: linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.03));
        }
        .badge--new{ color:#fff }
        .badge--hot{ color:#fff; box-shadow: 0 0 12px rgba(255,100,80,.18) inset; }

        .podium__title{
          font-weight:800; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
        }
        .podium__meta{ font-size:12px; color:#a6a6a6; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .podium__vote{ justify-self:end }

        /* medaglie colore titolo (subtle) */
        .podium__card--1 .podium__title{ color:#ffd76a }
        .podium__card--2 .podium__title{ color:#c9d5e7 }
        .podium__card--3 .podium__title{ color:#cd9bff }

        /* ─── LISTA CLASSIFICA ───────────────────────────────────── */
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
          gap:14px;
          align-items:center;
          padding:16px 18px;
          background:transparent;
          border:0;
          border-bottom:1px solid var(--line);
          color:inherit;
          text-align:left;
          cursor:pointer;
          transition: background .07s ease, border-color .12s ease, box-shadow .12s ease;
          position:relative;
        }
        .lb__row:hover{ background:#111; border-color:var(--line-strong) }
        .lb__row:active{ transform:translateY(1px) }
        .lb__row:last-child{ border-bottom:none }

        /* barra neon laterale per le prime 10 (subtle) */
        .lb__row--top10::before{
          content:"";
          position:absolute; left:0; top:0; bottom:0; width:2px;
          background: linear-gradient(180deg, color-mix(in oklab, var(--accent) 60%, transparent) 0%, transparent 100%);
          opacity:.7;
        }

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

        .lb__voteCol{ display:grid; gap:10px; justify-items:end }

        .lb__thumbBox{
          position:relative;
          width:100%; height:120px;
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

        /* Top 3 colori rank nel PODIO già gestiti; nella lista partiamo dal #4 */
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
