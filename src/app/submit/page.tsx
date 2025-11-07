'use client';

import { useMemo, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Accept only YouTube/Twitch links for now
const SAFE_URL = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|clips\.twitch\.tv|www\.twitch\.tv\/clips)/i;

export default function SubmitPage() {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const trimmed = {
    url: url.trim(),
    title: title.trim(),
    author: author.trim(),
  };

  const valid = {
    url: SAFE_URL.test(trimmed.url),
    title: trimmed.title.length >= 3,
    author: trimmed.author.length >= 2,
  };

  const formValid = useMemo(
    () => valid.url && valid.title && valid.author,
    [valid.url, valid.title, valid.author]
  );

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);

    if (!formValid) {
      if (!trimmed.url) return setMsg({ type: 'err', text: 'URL is required.' });
      if (!valid.url) return setMsg({ type: 'err', text: 'URL must be a valid YouTube or Twitch link.' });
      if (!valid.title) return setMsg({ type: 'err', text: 'Title is required (min 3 characters).' });
      if (!valid.author) return setMsg({ type: 'err', text: 'Author/Nick is required (min 2 characters).' });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('clips').insert({
        url: trimmed.url,
        title: trimmed.title,
        author_name: trimmed.author,
        // game/votes/status have DB defaults
      });

      if (error) {
        setMsg({ type: 'err', text: `Save failed: ${error.message}` });
      } else {
        setMsg({ type: 'ok', text: 'Clip submitted! Check the “clips” table on Supabase.' });
        setUrl('');
        setTitle('');
        setAuthor('');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="page">
      <h1 className="h1">Submit a clip (URL)</h1>

      <form onSubmit={onSubmit} className="stack" noValidate>
        <div className="fieldWrap">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="YouTube/Twitch URL"
            className={`field ${url && !valid.url ? 'field--err' : ''}`}
            required
            inputMode="url"
            aria-invalid={!!(url && !valid.url)}
          />
          {url && !valid.url && <p className="hint hint--err">Enter a valid YouTube/Twitch link.</p>}
        </div>

        <div className="fieldWrap">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className={`field ${title && !valid.title ? 'field--err' : ''}`}
            required
            minLength={3}
            aria-invalid={!!(title && !valid.title)}
          />
          {title && !valid.title && <p className="hint hint--err">Title must be at least 3 characters.</p>}
        </div>

        <div className="fieldWrap">
          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Author / Nick"
            className={`field ${author && !valid.author ? 'field--err' : ''}`}
            required
            minLength={2}
            aria-invalid={!!(author && !valid.author)}
          />
          {author && !valid.author && <p className="hint hint--err">Author/Nick must be at least 2 characters.</p>}
        </div>

        <button className="btn" disabled={loading || !formValid}>
          {loading ? 'Sending…' : 'Submit clip'}
        </button>
      </form>

      <p className="muted">MVP: RLS + safe URL validation. Anti-spam & moderation next.</p>

      {msg && (
        <div className={`notice ${msg.type === 'ok' ? 'notice--ok' : 'notice--err'}`}>
          {msg.text}
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .page{ display:grid; gap:16px; }
        .h1{ font-size:22px; font-weight:800; letter-spacing:.02em; margin:4px 0 6px }
        .stack{ display:grid; gap:12px; max-width:720px }

        .fieldWrap{ display:grid; gap:6px }
        .field{
          padding:12px 14px;
          border-radius:10px;
          border:1px solid var(--line);
          background:var(--panel);
          color:var(--text);
          outline: none;
        }
        .field:hover{ border-color:var(--line-strong) }
        .field--err{ border-color:#7b2b2b; box-shadow: 0 0 0 2px rgba(123,43,43,.15) }

        .hint{ font-size:12px; opacity:.75 }
        .hint--err{ color:#ff6b6b; opacity:1 }

        .btn{
          padding:12px 16px; border-radius:10px;
          border:1px solid var(--line-strong);
          background:color-mix(in oklab, var(--panel) 88%, #fff 12%);
          color:#fff; font-weight:800; letter-spacing:.02em;
          cursor:pointer;
          transition:transform .06s ease, border-color .12s ease, opacity .12s ease;
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
