"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function isAllowedUrl(input: string) {
  try {
    const u = new URL(input);
    const allowedHosts = new Set([
      "youtube.com",
      "www.youtube.com",
      "youtu.be",
      "twitch.tv",
      "www.twitch.tv",
      "clips.twitch.tv",
    ]);
    return u.protocol === "https:" && allowedHosts.has(u.hostname);
  } catch {
    return false;
  }
}

export default function SubmitPage() {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [game, setGame] = useState("");
  const [author, setAuthor] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<null | { type: "ok" | "err"; text: string }>(
    null
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    const cleanUrl = url.trim();
    const cleanTitle = title.trim();
    const cleanGame = game.trim();
    const cleanAuthor = author.trim();

    if (!isAllowedUrl(cleanUrl)) {
      setMsg({
        type: "err",
        text:
          "URL non valido o non supportato. Solo YouTube e Twitch (https).",
      });
      return;
    }
    if (!cleanTitle || !cleanGame) {
      setMsg({ type: "err", text: "Titolo e Gioco sono obbligatori." });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("clips").insert([
        {
          url: cleanUrl,
          title: cleanTitle,
          game: cleanGame,
          // se vuoi salvare anche l'autore, aggiungi una colonna in tabella:
          // author: cleanAuthor,
        },
      ]);

      if (error) {
        setMsg({ type: "err", text: `Errore salvataggio: ${error.message}` });
      } else {
        setMsg({ type: "ok", text: "Clip inviata! ✅" });
        setUrl("");
        setTitle("");
        setGame("");
        setAuthor("");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: 24 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>
        Invia la tua clip
      </h1>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <input
          placeholder="URL della clip (YouTube/Twitch)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={{ padding: 12, borderRadius: 8, background: "#121212", border: "1px solid #222", color: "#fff" }}
        />
        <input
          placeholder="Titolo"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ padding: 12, borderRadius: 8, background: "#121212", border: "1px solid #222", color: "#fff" }}
        />
        <input
          placeholder="Gioco (es. arc raiders)"
          value={game}
          onChange={(e) => setGame(e.target.value)}
          style={{ padding: 12, borderRadius: 8, background: "#121212", border: "1px solid #222", color: "#fff" }}
        />
        <input
          placeholder="Autore / Nick (opzionale)"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          style={{ padding: 12, borderRadius: 8, background: "#121212", border: "1px solid #222", color: "#fff" }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "12px 16px",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,.18)",
            background: loading ? "rgba(255,255,255,.08)" : "rgba(255,255,255,.12)",
            fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Invio..." : "Invia clip"}
        </button>

        {msg && (
          <p
            style={{
              marginTop: 4,
              color: msg.type === "ok" ? "#5EE39A" : "#ff6b6b",
            }}
          >
            {msg.text}
          </p>
        )}

        <p style={{ opacity: 0.6, marginTop: 12, fontSize: 13 }}>
          Anti-spam attivo: solo link YouTube/Twitch (https). RLS su Supabase.
        </p>
      </form>
    </main>
  );
}
