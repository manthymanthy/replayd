'use client';

import { useMemo, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// YouTube / Twitch only (per ora)
const SAFE_URL = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|clips\.twitch\.tv|www\.twitch\.tv\/clips)/i;

// Preset giochi (puoi ampliare in futuro)
const GAME_PRESETS = [
  { key: 'arc', label: 'ARC Raiders' },
  { key: 'bf6', label: 'Battlefield 6' },
  { key: 'cod', label: 'Call of Duty' },
];

export default function SubmitPage() {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');

  // game
  const [gamePreset, setGamePreset] = useState<string>('arc'); // default ARC
  const [gameCustom, setGameCustom] = useState<string>('');
  const gameIsCustom = useMemo(() => gamePreset === 'custom', [gamePreset]);

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{type:'ok'|'err'; text:string} | null>(null);

  function normalizeGame(raw: string): string {
    // Salviamo lowercase per far funzionare l'eq('game', gameFilter) del feed
    return raw.trim().toLowerCase();
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);

    if (!url || !title) {
      setMsg({ type: 'err', text: 'Please provide at least URL and Title.' });
      return;
    }
    if (!SAFE_URL.test(url)) {
      setMsg({ type: 'err', text: 'For now we only accept YouTube or Twitch links.' });
      return;
    }

    // Risolvi valore gioco finale
    let gameValue = '';
    if (gameIsCustom) {
      if (!gameCustom.trim()) {
        setMsg({ type: 'err', text: 'Please enter a game name or choose a preset.' });
        return;
      }
      gameValue = normalizeGame(gameCustom);
    } else {
      const preset = GAME_PRESETS.find(p => p.key === gamePreset);
      gameValue = normalizeGame(preset ? preset.label : gamePreset);
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('clips')
        .insert({
          url,
          title,
          author_name: author || null,
          game: gameValue, // ⬅️ salva il gioco normalizzato
          // votes/status gestiti dal DB
        });

      if (error) setMsg({ type: 'err', text: `Save failed: ${error.message}` });
      else {
        setMsg({ type: 'ok', text: 'Clip submitted! Check the “clips” table on Supabase.' });
        setUrl(''); setTitle(''); setAuthor('');
        setGamePreset('arc'); setGameCustom('');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="page">
      <h1 className="h1">Submit a clip (URL)</h1>

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
          placeholder="Title"
          className="field"
        />
        <input
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Author / Nick (optional)"
          className="field"
        />

        {/* GAME SELECT */}
        <div className="gameRow">
          <label className="label">Game</label>
          <div className="gameInputs">
            <select
              className="field"
              value={gamePreset}
              onChange={(e) => setGamePreset(e.target.value)}
              aria-label="Game preset"
            >
              {GAME_PRESETS.map(p => (
                <option key={p.key} value={p.key}>{p.label}</option>
              ))}
              <option value="custom">Other…</option>
            </select>

            {gameIsCustom && (
              <input
                className="field"
                value={gameCustom}
                onChange={(e) => setGameCustom(e.target.value)}
                placeholder="Type a game (e.g., apex legends)"
                aria-label="Custom game"
              />
            )}
          </div>
        </div>

        <button className="btn" disabled={loading}>
          {loading ? 'Sending…' : 'Submit clip'}
        </button>
      </form>

      <p className="muted">
        MVP: we store to DB with RLS and basic URL validation. Advanced anti-spam and moderation will come next.
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

        .gameRow{ display:grid; gap:8px }
        .label{ font-size:12px; opacity:.8 }
        .gameInputs{ display:grid; gap:8px; grid-template-columns: 260px 1fr; align-items:center }
        @media (max-width:700px){
          .gameInputs{ grid-template-columns: 1fr; }
        }

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
