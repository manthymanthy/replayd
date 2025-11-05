export const metadata = {
  title: "Replayd",
  description: "Le migliori giocate FPS curate dalla community."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body style={{
        background: "#0d0d0d",
        color: "#fff",
        fontFamily: "sans-serif",
        margin: 0,
        padding: 32
      }}>
        {children}
      </body>
    </html>
  );
}
