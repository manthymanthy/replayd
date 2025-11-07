// src/lib/parseClip.ts
export type Parsed =
  | { kind: "youtube"; id: string }
  | { kind: "twitch-clip"; id: string }
  | { kind: "unknown"; id: "" };

export function parseClip(url: string): Parsed {
  try {
    const u = new URL(url);

    // YouTube (watch, short, youtu.be)
    if (u.hostname.includes("youtube.com") || u.hostname.includes("youtu.be")) {
      // youtu.be/<id>
      if (u.hostname === "youtu.be") {
        const id = u.pathname.split("/")[1] || "";
        if (id) return { kind: "youtube", id };
      }
      // /watch?v=<id>
      const v = u.searchParams.get("v");
      if (v) return { kind: "youtube", id: v };
      // /shorts/<id>
      if (u.pathname.startsWith("/shorts/")) {
        const id = u.pathname.split("/")[2] || "";
        if (id) return { kind: "youtube", id };
      }
    }

    // Twitch clip (clips.twitch.tv/<id>)
    if (u.hostname.includes("clips.twitch.tv")) {
      const id = u.pathname.replace(/^\//, "");
      if (id) return { kind: "twitch-clip", id };
    }

    return { kind: "unknown", id: "" };
  } catch {
    return { kind: "unknown", id: "" };
  }
}
