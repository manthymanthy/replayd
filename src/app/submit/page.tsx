// src/app/submit/page.tsx
'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Accept only YouTube / Twitch
const SAFE_URL =
  /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|clips\.twitch\.tv\/|www\.twitch\.tv\/clips\/)/i;

export default function SubmitPage() {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [creator, setCreator] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  function onUrl(e: ChangeEvent<HTMLInputElement>) { setUrl(e.target.value.trim()); }
  function onTitle(e: ChangeEvent<HTMLInputElement>) { setTitle(e.target.value); }
  function onCreator(e: ChangeEvent<HTMLInputElement>) { setCreator(e.target.value); }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);

    // Client validations
    if (!url || !title || !creator) {
      setMsg({ type: 'err', text: 'All fields are required.' });
      return;
    }
    if (!SAFE_URL.test(url)) {
      setMsg({ type: 'err', text: 'Only YouTube or Twitch links are allowed.' });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('clips').insert({
        url,
        title,
        author_name: creator,
        game: 'Arc Raiders', // locked to Arc Raiders for the initial phase
      });

      if (error) {
        // Unique-URL violation (duplicate)
        // Postgres duplicate key is 23505; Supabase forwards code in error.code
        // @ts-ignore
        if (error.code === '23505') {
          setMsg({ type: 'err', text: 'This clip is already on Replayd.' });
        } else {
          setMsg({ type: 'err', text: `Save failed: ${error.message}` });
        }
      } else {
        setMsg({ type: 'ok', text: 'Clip submitted! Thanks for contributing to Replayd.' });
        setUrl('');
        setTitle('');
        setCreator('');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="page">
      <h1 className="h1">Submit an Arc Raiders clip</h1>
      <p className="lede">
        Replayd is starting focused on <strong>Arc Raiders</strong>. Share epic moments from creators.
        Please provide the <strong>original creator name</strong> and a clear <strong>title</strong>.
        Only YouTube/Twitch links are accepted for now.
      </p>

      <form onSubmit={onSubmit} className="stack" noValidate>
        <div className="fieldWrap">
          <label className="label">Video URL (YouTube / Twitch)</label>
          <input
            value={url}
            onChange={onUrl}
            placeholder="https://youtube.com/watch?v=…  or  https://clips.twitch.tv/…"
            className="field"
            required
            inputMode="url"
            aria-invalid={(!url || !SAFE_URL.test(url)) ? true : false}
          />
        </div>

        <div className="cols">
          <div className="fieldWrap">
            <label className="label">Title</label>
            <input
              value={title}
              onChange={onTitle}
              placeholder="Original title or a concise description"
              className="field"
              required
              aria-invalid={!title ? true : false}
            />
          </div>

          <div className="fieldWrap">
            <label className="label">Creator</label>
            <input
              value={creator}
              onChange={onCreator}
              placeholder="Channel / Nickname"
              className="field"
              required
              aria-invalid={!creator ? true : false}
            />
          </div>
        </div>

        <div className="fieldWrap">
          <label className="label">Game</label>
          <input className="field" value="Arc Raiders" readOnly aria-readonly="true" />
          <p className="help">We’re in a focused beta — only Arc Raiders clips for now.</p>
        </div>

        <button className="btn" disabled={loading}>
          {loading ? 'Submitting…' : 'Submit clip'}
        </button>
      </form>

      {msg && (
        <div className={`notice ${msg.type === 'ok' ? 'notice--ok' : 'notice--err'}`}>
          {msg.text}
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .page{ display:grid; gap:16px; }
        .h1{ font-size:22px; font-weight:800; letter-spacing:.02em; margin:4px 0 2px }
        .lede{ opacity:.8; max-width:72ch }
        .stack{ display:grid; gap:14px; max-width:820px }
        .cols{ display:grid; gap:14px; grid-template-columns: 1fr 1fr }
        @media(max-width:720px){ .cols{ grid-template-columns: 1fr } }

        .label{ font-size:12px; text-transform:uppercase; letter-spacing:.08em; opacity:.8; margin-bottom:6px; display:block }
        .help{ font-size:12px; opacity:.65; margin:6px 0 0 }

        .field{
          padding:12px 14px;
          border-radius:10px;
          border:1px solid var(--line);
          background:var(--panel);
          color:var(--text);
          width:100%;
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
