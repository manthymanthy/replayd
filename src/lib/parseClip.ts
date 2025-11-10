// src/lib/parseClip.ts
export type Parsed =
  | { kind: 'youtube'; id: string }
  | { kind: 'twitch-clip'; id: string }
  | { kind: 'twitch-vod'; id: string }
  | { kind: 'unknown'; id: null };

export function parseClip(url: string): Parsed {
  try {
    const u = new URL(url);

    // YouTube (watch, short, share)
    const ytId =
      u.hostname.includes('youtube.com')
        ? u.searchParams.get('v')
        : u.hostname.includes('youtu.be')
        ? u.pathname.slice(1)
        : null;
    if (ytId) return { kind: 'youtube', id: ytId };

    // Twitch CLIP
    if (u.hostname.includes('clips.twitch.tv') || u.pathname.startsWith('/clips/')) {
      const parts = u.pathname.split('/').filter(Boolean);
      const id = parts.pop() || '';
      if (id) return { kind: 'twitch-clip', id };
    }

    // Twitch VOD  twitch.tv/videos/123456789
    if (u.hostname.includes('twitch.tv') && u.pathname.startsWith('/videos/')) {
      const id = u.pathname.replace('/videos/', '').split('/')[0];
      if (/^\d+$/.test(id)) return { kind: 'twitch-vod', id };
    }

    return { kind: 'unknown', id: null };
  } catch {
    return { kind: 'unknown', id: null };
  }
}
