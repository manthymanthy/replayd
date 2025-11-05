import Link from "next/link";

function Section(props: { title: string; children?: React.ReactNode }) {
  return (
    <section style={{ display: "grid", gap: 8 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700 }}>{props.title}</h2>
      <div
        style={{
          border: "1px solid rgba(255,255,255,.08)",
          borderRadius: 8,
          padding: 16,
          minHeight: 120,
          display: "grid",
          placeItems: "center",
          opacity: 0.8,
        }}
      >
        {props.children}
      </div>
    </section>
  );
}

function Empty({ text }: { text: string }) {
  return <p style={{ opacity: 0.7 }}>{text}</p>;
}

export default function Page() {
  return (
    <main style={{ display: "grid", gap: 28 }}>
      {/* HERO */}
      <div style={{ display: "grid", gap: 12 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800 }}>
          Le migliori giocate FPS, curate dalla community
        </h1>
        <p style={{ opacity: 0.8 }}>
          Invia una clip e vota quelle degli altri. Niente login (per ora).
        </p>

        <div>
          <Link
            href="/submit"
            style={{
              display: "inline-block",
              padding: "10px 16px",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,.18)",
              background: "rgba(255,255,255,.06)",
              fontWeight: 600,
            }}
          >
            Invia una clip →
          </Link>
        </div>
      </div>

      <hr style={{ border: "none", borderTop: "1px solid rgba(255,255,255,.08)" }} />

      {/* PLACEHOLDER FEED */}
      <div style={{ display: "grid", gap: 24 }}>
        <Section title="Trending (ultime 24h)">
          <Empty text="Ancora nessuna clip. Sii il primo a inviarne una!" />
        </Section>

        <Section title="Fresh drops (più recenti)">
          <Empty text="Le clip più nuove appariranno qui." />
        </Section>

        <Section title="Top della settimana">
          <Empty text="La classifica settimanale apparirà qui." />
        </Section>
      </div>
    </main>
  );
}
