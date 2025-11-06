'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

console.log('SUBMIT LIVE BUILD', new Date().toISOString());

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// opzionale: consenti solo YouTube/Twitch (puoi estendere in futuro)
const SAFE_URL = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|clips\.twitch\.tv|www\.twitch\.tv\/clips)/i;

export default function SubmitPage() {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);

    // Validazione molto semplice
    if (!url || !title) {
      setMsg('Inserisci almeno URL e Titolo.');
      return;
    }
    if (!SAFE_URL.test(url)) {
      setMsg('Per ora accettiamo solo link YouTube o Twitch.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('clips')
        .insert({
          url,
          title,
          author_name: author || null, // facoltativo
          // game, votes, status hanno default a DB
        });

      if (error) {
        console.error(error);
        setMsg(`Errore salvataggio: ${error.message}`);
      } else {
        setMsg('Clip inviata! (controlla la tabella clips su Supabase)');
        setUrl('');
        setTitle('');
        setAuthor('');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ display: 'grid', gap: 16, maxWidth: 760, margin: '40px auto' }}>
      <h1>Invia una clip (URL)</h1>

      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="YouTube/Twitch URL"
          style={{ padding: 12, borderRadius: 8, border: '1px solid rgba(255,255,255,.15)', background: 'rgba(255,255,255,.05)', color: 'white' }}
        />
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titolo"
          style={{ padding: 12, borderRadius: 8, border: '1px solid rgba(255,255,255,.15)', background: 'rgba(255,255,255,.05)', color: 'white' }}
        />
        <input
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Autore / Nick (opzionale)"
          style={{ padding: 12, borderRadius: 8, border: '1px solid rgba(255,255,255,.15)', background: 'rgba(255,255,255,.05)', color: 'white' }}
        />

        <button
          disabled={loading}
          style={{
            padding: '12px 16px',
            borderRadius: 8,
            border: '1px solid rgba(255,255,255,.18)',
            background: 'rgba(255,255,255,.08)',
            color: 'white',
            fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Invio…' : 'Invia clip'}
        </button>
      </form>

      <p style={{ opacity: 0.7, marginTop: 8 }}>
        MVP: salviamo in DB con RLS e validazione URL base. Anti-spam avanzato e moderazione arriveranno dopo.
      </p>

      {msg && (
        <div style={{ padding: 12, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.15)', borderRadius: 8 }}>
          {msg}
        </div>
      )}
    </main>
  );
}
