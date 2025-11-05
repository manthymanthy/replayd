export const metadata = {
  title: "Replayd",
  description: "Le migliori giocate FPS curate dalla community."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body style={{ background: "#0d0d0d", color: "#fff", fontFamily: "Inter, system-ui, sans-serif", margin: 0 }}>
        <header style={{ display: 'flex', gap: 16, alignItems: 'center', justifyContent: 'space-between', maxWidth: 960, margin: '0 auto', padding: '16px' }}>
          <a href="/" style={{ fontWeight: 800, letterSpacing: .5 }}>REPLAYD</a>
          <nav style={{ display: 'flex', gap: 16 }}>
            <a href="/" style={{ opacity: .9 }}>Feed</a>
            <a href="/submit" style={{ opacity: .9 }}>Submit</a>
            <a href="/leaderboard" style={{ opacity: .9 }}>Leaderboard</a>
          </nav>
        </header>
        <div style={{ borderTop: '1px solid rgba(255,255,255,.08)' }} />
        {children}
      </body>
    </html>
  );
}
