/**
 * VIDEO URL PARSING — turns a share link into something we can embed.
 *
 * Content people paste a normal share URL (the one the "Copy link" button
 * gives them); this works out the provider, extracts the id, and builds the
 * provider's own player URL. Nothing else in the app needs to know about
 * providers.
 *
 * ▸ ADDING A LINK: paste the plain share URL into `videoUrl` in
 *   data/videos.ts. Tracking parameters are ignored, so it is fine to paste
 *   the whole thing, though the data files keep the canonical form.
 *
 * ▸ NOT the TikTok <blockquote> embed: that loads TikTok's embed.js, which
 *   replaces the blockquote with TikTok's own card — its chrome, caption and
 *   author bar, none of it styleable, and it cannot sit inside our lightbox.
 *   The player URL built here is the same video without that wrapper.
 */

export type VideoProvider = "youtube" | "vimeo" | "tiktok" | "file" | "none";

/** Vertical formats need a portrait player, or they letterbox badly. */
export type VideoAspect = "landscape" | "portrait";

export interface ParsedVideo {
  provider: VideoProvider;
  /** Ready-to-use iframe src. Null for direct media files and empty input. */
  embedSrc: string | null;
  aspect: VideoAspect;
}

const NONE: ParsedVideo = { provider: "none", embedSrc: null, aspect: "landscape" };

export function parseVideoUrl(url: string | undefined | null): ParsedVideo {
  if (!url) return NONE;
  const u = url.trim();
  if (!u) return NONE;

  /* --- TikTok ---------------------------------------------------------- */
  // Matches the standard share URL (…/@handle/video/<id>) and the ids found
  // in embed URLs. Short vm.tiktok.com links are NOT handled: they are
  // redirects, and resolving one needs a network request — paste the full
  // link the "Copy link" button gives you instead.
  const tiktok = u.match(/tiktok\.com\/(?:.*\/video\/|embed\/v2\/|player\/v1\/)(\d{6,})/);
  if (tiktok) {
    // TikTok's official embed player. Controls stay on, the music and
    // description bars are hidden so the frame is just the video.
    const params = new URLSearchParams({
      autoplay: "1",
      controls: "1",
      music_info: "0",
      description: "0",
      rel: "0",
    });
    return {
      provider: "tiktok",
      embedSrc: `https://www.tiktok.com/player/v1/${tiktok[1]}?${params}`,
      aspect: "portrait",
    };
  }

  /* --- YouTube --------------------------------------------------------- */
  const yt = u.match(/(?:youtu\.be\/|[?&]v=|\/shorts\/|\/embed\/)([\w-]{11})/);
  if (yt) {
    return {
      provider: "youtube",
      embedSrc: `https://www.youtube.com/embed/${yt[1]}?autoplay=1&rel=0`,
      // Shorts are vertical; everything else is assumed widescreen.
      aspect: /\/shorts\//.test(u) ? "portrait" : "landscape",
    };
  }

  /* --- Vimeo ----------------------------------------------------------- */
  const vimeo = u.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) {
    return {
      provider: "vimeo",
      embedSrc: `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1`,
      aspect: "landscape",
    };
  }

  /* --- Direct media file ------------------------------------------------ */
  // Only a recognised media extension is treated as a file. Anything else —
  // a vm.tiktok.com short link, an Instagram URL, a typo — would play as an
  // empty black <video>, so it falls through to "none" and the player shows
  // the thumbnail with its "coming soon" note instead of failing silently.
  if (/\.(mp4|webm|ogv|mov|m3u8)(\?|#|$)/i.test(u)) {
    return { provider: "file", embedSrc: null, aspect: "landscape" };
  }

  return NONE;
}
