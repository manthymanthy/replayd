"use client";

import { useState } from "react";
import PlayerModal from "./PlayerModal";
import { parseClip } from "../lib/parseClip";
import { createClient } from "@supabase/supabase-js";
import { getDeviceId } from "../lib/device";
import VoteChip from "./VoteChip";

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
  if (p.kind === "youtube" && p.id) return `https://i.ytimg.com/vi/${p.id}/hqdefault.jpg`;
  try { return `${new URL(url).origin}/favicon.ico`; } catch { return "/favicon.ico"; }
}

export function FeedListClient({ rows, empty }: { rows: Row[]; empty: string }) {
  const [data, setData] = useState<Row[]>(rows);
  const [openUrl, setOpenUrl] = useState<string | null>(null);

  async function upvote(clipId: string){
    const device = getDeviceId();

    // Update ottimistico
    setData(prev => prev.map(r => r.id === clipId ? ({...r, votes: (r.votes ?? 0) + 1}) : r));

    const { error } = await supabase.from("votes").insert({ clip_id: clipId, fingerprint: device });

    if (error) {
      // se è unique violation (già votato), ripristina e avvisa
      if ((error as any).code === "23505") {
        setData(prev => prev.map(r => r.id === clipId ? ({...r, votes: Math.max(0, (r.votes ?? 1) - 1)}) : r));
        alert("You already upvoted this clip on this device.");
      } else {
        setData(prev => prev.map(r => r.id === clipId ? ({...r, votes: Math.max(0, (r.votes ?? 1) - 1)}) : r));
        alert("Vote failed. Please try again.");
      }
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
                  <div className="title">{r.title || "Untitled"}</div>
                  <div className="meta">
                    {domainFrom(r.url)}{r.author_name ? ` · ${r.author_name}` : ""} · {timeAgo(r.created_at)}
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
        .table{ border:1px solid var(--line); border-radius:12px; overflow:hidden; background:var(--panel) }
        .tbody{ display:block }
        .row{
          display:grid; grid-template-columns: 120px 1fr 86px; gap:12px;
          align-items:center; padding:12px 12px;
          border-bottom:1px solid var(--line);
        }
        .row:hover{ background:#101010; border-color:var(--line-strong) }
        .row:last-child{ border-bottom:none }

        .thumb{ width:120px; height:68px; border-radius:8px; object-fit:cover; background:#000; }
        .info{ display:grid; gap:3px; min-width:0 }
        .title{ font-weight:700; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis }
        .meta{ font-size:12px; color:#a6a6a6; white-space:nowrap; overflow:hidden; text-overflow:ellipsis }

        .votes{ display:grid; gap:6px; justify-items:end }
        .upbtn{
          padding:6px 10px; border-radius:8px; border:1px solid var(--line-strong);
          background:rgba(255,255,255,.06); color:#fff; font-weight:800; cursor:pointer;
        }
        .upbtn:hover{ background:rgba(255,255,255,.1) }
        .count{ font-weight:900; }
      `}</style>
    </>
  );
}
