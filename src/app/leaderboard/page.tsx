// src/app/leaderboard/page.tsx
export default function LeaderboardPage() {
  return (
    <main style={{ display: 'grid', gap: 12, maxWidth: 860, margin: '40px auto', padding: '0 16px' }}>
      <h1 style={{ fontSize: 22, fontWeight: 800 }}>Leaderboard (MVP)</h1>
      <p style={{ opacity: 0.8 }}>
        Placeholder: qui mostreremo una classifica calcolata (es. Wilson score + time decay).
      </p>
      <p style={{ opacity: 0.7 }}>
        Per ora, torna al feed o invia una clip dalla pagina <a href="/submit">Submit</a>.
      </p>
    </main>
  );
}
