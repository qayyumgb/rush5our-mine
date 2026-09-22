"use client";

/**
 * VIDEO PLAYER — one lightbox for the whole page, exposed through context.
 *
 * Any component can call `useVideoPlayer().open({ url, poster, title })`.
 * YouTube and Vimeo URLs are converted to embeds; anything else is treated
 * as a direct media file. When `url` is empty the poster is shown with a
 * "coming soon" note, so the UI is complete before the client supplies links.
 *
 * ▸ BACKEND SEAM: `url` will come from the video API response. Nothing here
 *   needs to change — only the data files.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { gsap } from "@/lib/motion/gsap";
import { parseVideoUrl } from "@/lib/video";
import { useMotion } from "@/components/motion/MotionProvider";
import styles from "./VideoPlayer.module.css";

export interface VideoRequest {
  /** YouTube / Vimeo / direct media URL. Empty renders the poster state. */
  url: string;
  poster: string;
  title: string;
}

interface VideoPlayerContextValue {
  open: (req: VideoRequest) => void;
  close: () => void;
}

const VideoPlayerContext = createContext<VideoPlayerContextValue>({
  open: () => {},
  close: () => {},
});

export function useVideoPlayer() {
  return useContext(VideoPlayerContext);
}

// Provider detection and embed-URL building live in lib/video.ts.

export function VideoPlayerProvider({ children }: { children: ReactNode }) {
  const [request, setRequest] = useState<VideoRequest | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  /** Element that had focus before opening, so it can be restored. */
  const lastFocus = useRef<HTMLElement | null>(null);
  const { reduced, lockScroll, unlockScroll } = useMotion();

  const open = useCallback(
    (req: VideoRequest) => {
      lastFocus.current = document.activeElement as HTMLElement | null;
      setRequest(req);
      lockScroll();
    },
    [lockScroll],
  );

  const close = useCallback(() => {
    const overlay = overlayRef.current;
    const finish = () => {
      setRequest(null);
      unlockScroll();
      lastFocus.current?.focus();
    };

    if (!overlay || reduced) {
      finish();
      return;
    }
    gsap.to(overlay, { opacity: 0, duration: 0.3, ease: "power2.in", onComplete: finish });
  }, [reduced, unlockScroll]);

  /* Entrance + initial focus. */
  useEffect(() => {
    if (!request) return;
    closeRef.current?.focus();
    if (reduced) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: "power2.out" });
      gsap.fromTo(
        boxRef.current,
        { scale: 0.9, y: 30, opacity: 0 },
        {
          scale: 1,
          y: 0,
          opacity: 1,
          duration: 0.7,
          ease: "expo.out",
          // Essential, not tidiness: GSAP would otherwise leave an inline
          // `transform: matrix(1,0,0,1,0,0)` behind. An identity transform
          // still makes this element the containing block for `position:
          // fixed` descendants — and a fullscreen element is position:fixed,
          // so fullscreen would anchor to this box instead of the screen.
          clearProps: "transform",
        },
      );
    });
    return () => ctx.revert();
  }, [request, reduced]);

  /* Escape to close. */
  useEffect(() => {
    if (!request) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [request, close]);

  // Vertical formats (TikTok, YouTube Shorts) get a portrait frame; a 16:9
  // box would letterbox them into a sliver.
  const parsed = parseVideoUrl(request?.url);
  const boxClass = [styles.box, parsed.aspect === "portrait" ? styles.boxPortrait : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <VideoPlayerContext.Provider value={{ open, close }}>
      {children}

      {request && (
        <div
          ref={overlayRef}
          className={styles.overlay}
          role="dialog"
          aria-modal="true"
          aria-label={`Video: ${request.title}`}
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div ref={boxRef} className={boxClass}>
            {parsed.embedSrc ? (
              <iframe
                src={parsed.embedSrc}
                title={request.title}
                // `fullscreen` here covers the legacy `allowFullScreen`
                // attribute; setting both makes the browser warn.
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              />
            ) : parsed.provider === "file" ? (
              <video src={request.url} controls autoPlay playsInline />
            ) : (
              <>
                {/* Poster state — the player shell is real, the link isn't set yet. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={request.poster} alt="" />
                <div className={styles.soon}>
                  <strong>{request.title}</strong>
                  <span>Video link coming soon</span>
                </div>
              </>
            )}
          </div>

          <button ref={closeRef} type="button" className={styles.close} aria-label="Close video" onClick={close}>
            &times;
          </button>
        </div>
      )}
    </VideoPlayerContext.Provider>
  );
}

export default VideoPlayerProvider;
