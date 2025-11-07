"use client";

import { useEffect } from "react";
import { parseClip } from "../lib/parseClip";

export default function PlayerModal({
  url,
  onClose,
}: {
  url: string | null;
  onClose: () => void;
}) {
  // Chiudi con ESC e click su overlay
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!url) return null;

  const parsed = parseClip(url);

  // Costruisci src dell'iframe
  let src = "";
  if (parsed.kind === "youtube") {
    // privacy-enhanced + autoplay + controls minimal
    src = `https://www.youtube-nocookie.com/embed/${parsed.id}?autoplay=1&rel=0&modestbranding=1`;
  } else if (parsed.kind === "twitch-clip") {
    // Twitch richiede il parametro "parent" = dominio corrente
    const parent = typeof window !== "undefined" ? window.location.hostname : "localhost";
    src = `https://clips.twitch.tv/embed?clip=${parsed.id}&parent=${encodeURIComponent(parent)}&autoplay=true`;
  }

  // Fallback se non embeddabile
  const embeddable = src.length > 0;

  return (
    <div className="pm__overlay" onClick={onClose}>
      <div className="pm__panel" onClick={(e) => e.stopPropagation()}>
        <button className="pm__close" onClick={onClose} aria-label="Close">×</button>

        {embeddable ? (
          <div className="pm__framebox">
            <iframe
              src={src}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              title="clip player"
            />
          </div>
        ) : (
          <div className="pm__fallback">
            <p style={{ margin: 0 }}>Questo link non supporta l’embed in-app.</p>
            <a href={url} target="_blank" rel="noopener noreferrer" className="pm__btn">
              Apri nella sorgente ↗
            </a>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .pm__overlay{
          position:fixed; inset:0; background:rgba(0,0,0,.6);
          display:grid; place-items:center; z-index:50;
          backdrop-filter: blur(2px) saturate(120%);
        }
        .pm__panel{
          position:relative;
          width:min(92vw, 1024px);
          background:var(--panel);
          border:1px solid var(--line-strong);
          border-radius:14px; padding:14px;
          box-shadow: 0 0 0 1px rgba(255,255,255,.03) inset;
        }
        .pm__close{
          position:absolute; top:6px; right:8px;
          width:28px; height:28px; border-radius:8px;
          background:transparent; color:#fff; border:1px solid var(--line);
          font-size:18px; line-height:0; cursor:pointer;
        }
        .pm__close:hover{ border-color:var(--line-strong) }
        .pm__framebox{
          position:relative; width:100%; padding-top:56.25%; /* 16:9 */
          border-radius:10px; overflow:hidden; background:#000;
        }
        .pm__framebox iframe{
          position:absolute; inset:0; width:100%; height:100%; border:0;
        }
        .pm__fallback{ display:grid; gap:10px; padding:20px; text-align:center }
        .pm__btn{
          display:inline-block; padding:10px 14px; border-radius:10px;
          border:1px solid var(--line-strong); background:var(--panel); color:#fff;
        }
      `}}/>
    </div>
  );
}
