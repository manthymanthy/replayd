// Capisce se l'URL è YouTube o Twitch (clip) e ne estrae l'ID
export type Parsed =
  | { kind: "youtube"; id: string }
  | { kind: "twitch-clip"; id: string }
  | { kind: "unknown" };

export function parseClip(url: string): Parsed {
  try {
    const u = new URL(url);
    const h = u.hostname.replace(/^www\./, "");
    // YouTube
    if (h === "youtube.com" || h === "youtu.be") {
      // youtu.be/<id>
      if (h === "youtu.be") {
        const id = u.pathname.split("/").filter(Boolean)[0];
        return id ? { kind: "youtube", id } : { kind: "unknown" };
      }
      // youtube.com/watch?v=<id>  | /shorts/<id>
      const v = u.searchParams.get("v");
      if (v) return { kind: "youtube", id: v };
      const shorts = u.pathname.match(/\/shorts\/([a-zA-Z0-9_-]{6,})/);
      if (shorts?.[1]) return { kind: "youtube", id: shorts[1] };
    }

    // Twitch clip: clips.twitch.tv/<slug>
    if (h === "clips.twitch.tv") {
      const slug = u.pathname.split("/").filter(Boolean)[0];
      return slug ? { kind: "twitch-clip", id: slug } : { kind: "unknown" };
    }

    return { kind: "unknown" };
  } catch {
    return { kind: "unknown" };
  }
}
