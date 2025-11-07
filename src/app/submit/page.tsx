'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// accettiamo per ora YouTube/Twitch
const SAFE_URL = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|clips\.twitch\.tv|www\.twitch\.tv\/clips)/i;

export default function SubmitPage() {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{type:'ok'|'err'; text:string} | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);

    if (!url || !title) {
      setMsg({ type: 'err', text: 'Inserisci almeno URL e Titolo.' });
      return;
    }
    if (!SAFE_URL.test(url)) {
      setMsg({ type: 'err', text: 'Per ora accettiamo solo link YouTube o Twitch.' });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('clips')
        .insert({
          url,
          title,
          author_name: author || null,
          // game/votes/status hanno default lato DB
        });

      if (error) setMsg({ type: 'err', text: `Errore salvataggio: ${error.message}` });
      else {
        setMsg({ type: 'ok', text: 'Clip inviata! Controlla la tabella clips su Supabase.' });
        setUrl(''); setTitle(''); setAuthor('');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="page">
      <h1 className="h1">Invia una clip (URL)</h1>

      <form onSubmit={onSubmit} className="stack">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="YouTube/Twitch URL"
          className="field"
        />
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titolo"
          className="field"
        />
        <input
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Autore / Nick (opzionale)"
          className="field"
        />

        <button className="btn" disabled={loading}>
          {loading ? 'Invio…' : 'Invia clip'}
        </button>
      </form>

      <p className="muted">
        MVP: salviamo in DB con RLS e validazione URL base. Anti-spam avanzato e moderazione arriveranno dopo.
      </p>

      {msg && (
        <div className={`notice ${msg.type === 'ok' ? 'notice--ok' : 'notice--err'}`}>
          {msg.text}
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .page{ display:grid; gap:16px; }
        .h1{ font-size:22px; font-weight:800; letter-spacing:.02em; margin:4px 0 6px }
        .stack{ display:grid; gap:12px; max-width:720px }
        .field{
          padding:12px 14px;
          border-radius:10px;
          border:1px solid var(--line);
          background:var(--panel);
          color:var(--text);
        }
        .field:hover{ border-color:var(--line-strong) }
        .btn{
          padding:12px 16px; border-radius:10px;
          border:1px solid var(--line-strong);
          background:color-mix(in oklab, var(--panel) 88%, #fff 12%);
          color:#fff; font-weight:800; letter-spacing:.02em;
          cursor:pointer;
          transition:transform .06s ease, border-color .12s ease;
        }
        .btn:hover{ border-color:#3a3a3a; transform:translateY(-1px) }
        .btn:disabled{ opacity:.6; cursor:not-allowed; transform:none }
        .muted{ opacity:.7; margin-top:4px }
        .notice{
          margin-top:8px;
          padding:12px 14px;
          border-radius:10px;
          border:1px solid var(--line-strong);
          background:var(--panel);
        }
        .notice--ok{ border-color:#2c2c2c }
        .notice--err{ border-color:#633; }
      `}}/>
    </section>
  );
}
