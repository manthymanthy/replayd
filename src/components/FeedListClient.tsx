// src/components/FeedListClient.tsx
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

import PlayerModal from "./PlayerModal";
import VoteChip from "./VoteChip";
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
  game: string | null;
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
function ymd(s: string){
  const d = new Date(s);
  const mm = String(d.getMonth()+1).padStart(2,"0");
  const dd = String(d.getDate()).padStart(2,"0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}
function isNew(created_at: string){
  // NEW ENTRY visibile per 2 ore
  return (Date.now() - new Date(created_at).getTime()) < 2 * 60 * 60 * 1000;
}
function domainFrom(url: string){
  try { return new URL(url).hostname.replace(/^www\./,""); }
  catch { return ""; }
}
function thumbFrom(url: string){
  const p = parseClip(url);
  if (p.kind === "youtube" && p.id) return `https://i.ytimg.com/vi/${p.id}/hqdefault.jpg`;
  try { return `${new URL(url).origin}/favicon.ico`; } catch { return "/favicon.ico"; }
}
function isHot(votes: number | null){
  return (votes ?? 0) >= 25;
}

export default function FeedListClient({ rows, empty }: { rows: Row[]; empty: string }) {
  const [data, setData] = useState<Row[]>(rows);
  const [openUrl, setOpenUrl] = useState<string | null>(null);

  // 🔁 sincronizza quando il parent (Feed) cambia dataset (es. cambio filtro)
  useEffect(() => {
    setData(rows);
  }, [rows]);

  async function upvote(clipId: string){
    const device = getDeviceId();

    // optimistic
    setData(prev => prev.map(r => r.id === clipId ? ({...r, votes: (r.votes ?? 0) + 1}) : r));

    const { error } = await supabase.from("votes").insert({ clip_id: clipId, fingerprint: device });

    if (error) {
      // rollback
      setData(prev => prev.map(r => r.id === clipId ? ({...r, votes: Math.max(0, (r.votes ?? 1) - 1)}) : r));
      // @ts-ignore
      if (error.code === "23505") alert("You already upvoted this clip on this device.");
      else alert("Vote failed. Please try again.");
    }
  }

  return (
    <>
      <div className="table">
        <div className="tbody">
          {data.map((r) => {
            const thumb = thumbFrom(r.url);
            return (
              <div key={r.id} className="row">
                <img
                  className="thumb"
                  src={thumb}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  onClick={() => setOpenUrl(r.url)}
                  style={{cursor:"pointer"}}
                />

                <div className="info" onClick={() => setOpenUrl(r.url)} style={{cursor:"pointer"}}>
                  <div className="badgerow">
                    {r.game && <span className="badge badge--game">{r.game}</span>}
                    {isNew(r.created_at) && <span className="badge badge--new">NEW ENTRY</span>}
                    {isHot(r.votes) && <span className="badge badge--hot">HOT</span>}
                  </div>
                  <div className="title">{r.title || "Untitled"}</div>
                  <div className="meta">
                    {domainFrom(r.url)}{r.author_name ? ` · ${r.author_name}` : ""} · {timeAgo(r.created_at)} · {ymd(r.created_at)}
                  </div>
                </div>

                <div className="votes">
                  <VoteChip count={r.votes ?? 0} onClick={() => upvote(r.id)} />
                </div>
              </div>
            );
          })}

          {data.length === 0 && <div className="empty">{empty}</div>}
        </div>
      </div>

      <PlayerModal url={openUrl} onClose={() => setOpenUrl(null)} />

      <style>{`
        .table{
          border:1px solid var(--line);
          border-radius:12px;
          overflow:hidden;
          background:var(--panel);
        }
        .tbody{ display:block }

        .row{
          display:grid;
          grid-template-columns: 120px 1fr 86px;
          gap:12px;
          align-items:center;
          padding:12px 12px;
          border-bottom:1px solid var(--line);
          transition: background .08s ease, border-color .12s ease;
        }
        .row:hover{
          background:#101010;
          border-color:var(--line-strong);
        }
        .row:last-child{ border-bottom:none }

        .thumb{
          width:120px;
          height:68px;
          border-radius:8px;
          object-fit:cover;
          background:#000;
        }

        .info{ display:grid; gap:3px; min-width:0; }
        .badgerow{ min-height:18px; display:flex; gap:6px; flex-wrap:wrap }
        .badge{
          display:inline-block;
          font-size:11px; font-weight:900; letter-spacing:.08em;
          padding:3px 8px; border-radius:999px;
          border:1px solid var(--line-strong);
          background: linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.03));
          color:#fff; margin-bottom:4px;
        }
        .badge--game{
          color:#9fdcff; border-color:#1f3242;
          box-shadow:0 0 0 1px rgba(159,220,255,.10) inset, 0 0 18px rgba(159,220,255,.08);
          text-transform:uppercase;
        }
        .badge--new{
          color:#b7ff8a; border-color:#245026;
          box-shadow:0 0 0 1px rgba(130,255,130,.12) inset, 0 0 18px rgba(130,255,130,.10);
        }
        .badge--hot{
          color:#ffb18a; border-color:#5b2a22;
          box-shadow:0 0 0 1px rgba(255,140,100,.14) inset, 0 0 20px rgba(255,120,80,.12);
        }

        .title{
          font-weight:700; color:#fff;
          white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
        }
        .meta{
          font-size:12px; color:#a6a6a6;
          white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
        }

        .votes{ display:grid; justify-items:end; }
      `}</style>
    </>
  );
}
