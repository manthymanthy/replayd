// src/app/submit/page.tsx
'use client';
import { useState, FormEvent } from 'react';
import Link from 'next/link';

export default function SubmitPage() {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    // MVP: niente backend. Solo placeholder.
    alert(`MVP only.\nURL: ${url}\nTitle: ${title}\nAuthor: ${author || '(anon)'}`);
    setUrl('');
    setTitle('');
    setAuthor('');
  }

  return (
    <main style={{ display: 'grid', gap: 16, maxWidth: 860, margin: '40px auto', padding: '0 16px' }}>
      <h1 style={{ fontSize: 24, fontWeight: 800 }}>Invia una clip (URL)</h1>

      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="URL della clip (YouTube/Twitch)"
          required
          style={{ padding: 12, borderRadius: 8, border: '1px solid rgba(255,255,255,.15)', background: 'rgba(255,255,255,.04)', color: '#fff' }}
        />
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titolo"
          required
          style={{ padding: 12, borderRadius: 8, border: '1px solid rgba(255,255,255,.15)', background: 'rgba(255,255,255,.04)', color: '#fff' }}
        />
        <input
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Autore / Nick (opzionale)"
          style={{ padding: 12, borderRadius: 8, border: '1px solid rgba(255,255,255,.15)', background: 'rgba(255,255,255,.04)', color: '#fff' }}
        />
        <button
          type="submit"
          style={{
            padding: '12px 16px',
            borderRadius: 8,
            border: '1px solid rgba(255,255,255,.25)',
            background: 'rgba(255,255,255,.08)',
            color: '#fff',
            fontWeight: 700
          }}
        >
          Invia clip
        </button>
      </form>

      <p style={{ opacity: .7, marginTop: 8 }}>
        MVP: nessun salvataggio. Più avanti abiliteremo il DB e l’anti-spam.
      </p>

      <div>
        <Link href="/" style={{ opacity: .9 }}>← Torna al feed</Link>
      </div>
    </main>
  );
}
