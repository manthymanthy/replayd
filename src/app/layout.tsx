// src/app/layout.tsx
export const metadata = {
  title: 'REPLAYD',
  description: 'Nerd-speed highlight board',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body className="shell">
        <header className="topbar">
          <a href="/" className="logo" aria-label="REPLAYD home">R&nbsp;E&nbsp;P&nbsp;L&nbsp;A&nbsp;Y&nbsp;D</a>
          <nav className="nav">
            <a href="/" className="nav__link">Feed</a>
            <a href="/submit" className="nav__link">Submit</a>
            <a href="/leaderboard" className="nav__link">Leaderboard</a>
          </nav>
        </header>

        <main className="container">{children}</main>

        <style dangerouslySetInnerHTML={{ __html: `
          :root{
            --bg:#0b0b0b;
            --panel:#101010;
            --muted:#a3a3a3;
            --text:#f1f1f1;
            --line:#1a1a1a;
            --line-strong:#2a2a2a;
            --accent: #ffffff; /* tutto bianco, nerd */
            --radius:12px;
          }
          *{box-sizing:border-box}
          html,body{height:100%}
          html{color-scheme:dark}
          body{
            margin:0;
            background:var(--bg);
            color:var(--text);
            font:400 15px/1.5 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji","Segoe UI Emoji";
            -webkit-font-smoothing:antialiased;
            text-rendering:optimizeLegibility;
          }
          a{color:inherit;text-decoration:none}
          img{display:block;max-width:100%}
          /* Focus nerd-clean */
          :focus-visible{outline:2px solid #fff; outline-offset:2px}

          .shell{display:flex; min-height:100%; flex-direction:column}
          .topbar{
            position:sticky; top:0; z-index:10;
            display:flex; align-items:center; justify-content:space-between;
            gap:16px;
            height:56px;
            padding:0 16px;
            background:color-mix(in oklab, var(--bg) 92%, black 8%); /* barely different */
            border-bottom:1px solid var(--line);
            backdrop-filter:saturate(140%) blur(4px);
          }
          .logo{
            letter-spacing:.45em;
            font-weight:800;
            white-space:nowrap;
            color:#fff;
            font-size:14px;
          }
          .nav{display:flex; gap:14px; align-items:center}
          .nav__link{
            padding:6px 8px;
            border:1px solid transparent;
            border-radius:8px;
            color:var(--muted);
            font-size:13px;
          }
          .nav__link:hover{border-color:var(--line-strong); color:#eaeaea}
          .container{width:100%; max-width:1200px; margin:24px auto 64px; padding:0 16px}
        `}} />
      </body>
    </html>
  );
}
