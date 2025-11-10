export function parseClip(url: string) {
  try {
    const u = new URL(url);

    // YouTube
    if (u.hostname.includes("youtube.com")) {
      return { kind: "youtube", id: u.searchParams.get("v") };
    }
    if (u.hostname.includes("youtu.be")) {
      return { kind: "youtube", id: u.pathname.substring(1) };
    }

    // Twitch CLIP
    if (u.hostname.includes("clips.twitch.tv")) {
      return { kind: "twitch-clip", id: u.pathname.substring(1) };
    }

    // Twitch VIDEO (VOD)
    if (u.hostname.includes("twitch.tv") && u.pathname.startsWith("/videos/")) {
      return { kind: "twitch-video", id: u.pathname.replace("/videos/", "") };
    }

    return { kind: "unknown", id: null };
  } catch {
    return { kind: "unknown", id: null };
  }
}
