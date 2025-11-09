// src/app/submit/page.tsx
'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Accept only YouTube / Twitch clip links (can expand later)
const SAFE_URL = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|clips\.twitch\.tv|www\.twitch\.tv\/clips)/i;

export default function SubmitPage() {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);

    // Basic required validation
    if (!url.trim() || !title.trim() || !author.trim()) {
      setMsg({ type: 'err', text: 'Please complete all fields.' });
      return;
    }
    if (!SAFE_URL.test(url.trim())) {
      setMsg({ type: 'err', text: 'For now we only accept YouTube or Twitch clip links.' });
      return;
    }

    setLoading(true);
    try {
      // DUPLICATE CHECK
      const { data: dup } = await supabase
        .from('clips')
        .select('id')
        .eq('url', url.trim())
        .maybeSingle();

      if (dup) {
        setMsg({ type: 'err', text: 'This link is already on REPLAYD.' });
        return;
      }

      // INSERT (game fixed to Arc Raiders)
      const { error } = await supabase.from('clips').insert({
        url: url.trim(),
        title: title.trim(),
        author_name: author.trim(),
        game: 'Arc Raiders',
      });

      if (error) {
        setMsg({ type: 'err', text: `Save failed: ${error.message}` });
      } else {
        setMsg({ type: 'ok', text: 'Clip submitted. Thanks for contributing to the Arc Raiders feed!' });
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

      <p className="intro">
        REPLAYD is currently focused on <b>Arc Raiders</b>. Please submit epic moments, personal records,
        unique plays — strictly via YouTube or Twitch clip links. All fields are required.
      </p>

      <form onSubmit={onSubmit} className="stack" noValidate>
        <div className="fieldWrap">
          <label className="label">Clip URL</label>
          <input
            value={url}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)}
            placeholder="YouTube/Twitch URL"
            className="field"
            required
            inputMode="url"
            aria-invalid={(!url).toString()}
          />
        </div>

        <div className="fieldWrap">
          <label className="label">Title</label>
          <input
            value={title}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
            placeholder="Original title or a clear, accurate title"
            className="field"
            required
            aria-invalid={(!title).toString()}
          />
        </div>

        <div className="fieldWrap">
          <label className="label">Creator</label>
          <input
            value={author}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setAuthor(e.target.value)}
            placeholder="Channel / Creator name"
            className="field"
            required
            aria-invalid={(!author).toString()}
          />
        </div>

        <div className="fieldWrap">
          <label className="label">Game</label>
          <input
            className="field field--readonly"
            value="Arc Raiders"
            readOnly
            aria-readonly="true"
            title="Fixed for the current beta phase"
          />
          <p className="help">During the beta, REPLAYD accepts Arc Raiders clips only.</p>
        </div>

        <button className="btn" disabled={loading}>
          {loading ? 'Sending…' : 'Submit clip'}
        </button>
      </form>

      <div className="disclaimer">
        <p>
          By submitting, you confirm this is a public clip on YouTube or Twitch and that you attribute the original creator.
          REPLAYD embeds links and does not host videos. Duplicate links are not allowed.
        </p>
      </div>

      {msg && (
        <div className={`notice ${msg.type === 'ok' ? 'notice--ok' : 'notice--err'}`}>
          {msg.text}
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .page{ display:grid; gap:16px; }
        .h1{ font-size:22px; font-weight:800; letter-spacing:.02em; margin:4px 0 2px }
        .intro{ opacity:.85 }

        .stack{ display:grid; gap:12px; max-width:720px }
        .fieldWrap{ display:grid; gap:6px }
        .label{ font-size:12px; opacity:.75; letter-spacing:.06em; text-transform:uppercase }
        .field{
          padding:12px 14px;
          border-radius:10px;
          border:1px solid var(--line);
          background:var(--panel);
          color:var(--text);
        }
        .field:hover{ border-color:var(--line-strong) }
        .field--readonly{ opacity:.8; cursor:not-allowed }

        .help{ margin:4px 0 0; font-size:12px; opacity:.65 }

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

        .disclaimer{
          margin-top:4px; opacity:.75; font-size:13px;
        }

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
