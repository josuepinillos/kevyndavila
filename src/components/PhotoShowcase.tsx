"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { PHOTO_INTERVAL, photos, srcSet } from "@/config/photos";
import { useInView, useReducedMotion } from "@/hooks/useMotion";
import { GoldParticles } from "./GoldParticles";
import { Sparkle } from "./Ornaments";

const SIZES = "(min-width: 1024px) 560px, (min-width: 640px) 480px, 100vw";

/**
 * Composición de la persona: halo y luz detrás, fotografía recortada,
 * arco y destellos delante. Las fotos rotan con fade + escala leve.
 */
export function PhotoShowcase({ className = "" }: { className?: string }) {
  const [active, setActive] = useState(0);
  const [leaving, setLeaving] = useState<number | null>(null);
  const [stageRef, visible] = useInView<HTMLDivElement>({ once: false, threshold: 0.05, rootMargin: "0px" });
  const [pageVisible, setPageVisible] = useState(true);
  const reduced = useReducedMotion();
  const count = photos.length;

  // Pausa cuando la pestaña está oculta.
  useEffect(() => {
    const onVis = () => setPageVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const running = visible && pageVisible && count > 1;

  useEffect(() => {
    if (!running) return;
    const t = window.setTimeout(() => {
      setLeaving(active);
      setActive((active + 1) % count);
    }, PHOTO_INTERVAL);
    return () => window.clearTimeout(t);
  }, [active, running, count]);

  // Parallax muy leve: el halo y la foto se desplazan a ritmos distintos.
  const parallaxRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (reduced) return;
    const el = parallaxRef.current;
    if (!el) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = Math.min(window.scrollY, 900);
      el.style.setProperty("--p", String(y));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [reduced]);

  return (
    <div
      ref={parallaxRef}
      className={`photo-stage relative mx-auto aspect-[4/5] w-full ${className}`}
      style={{ "--p": 0 } as CSSProperties}
    >
      <div ref={stageRef} className="absolute inset-0">
        {/* ── Detrás: luz ambiental ── */}
        <div
          aria-hidden="true"
          className="intro-fade absolute inset-0"
          style={{
            background:
              "radial-gradient(46% 36% at 50% 30%, rgba(216,174,85,0.16) 0%, rgba(216,174,85,0) 70%), radial-gradient(70% 55% at 50% 42%, rgba(18,58,90,0.9) 0%, rgba(13,42,70,0.35) 55%, rgba(6,21,37,0) 80%)",
          }}
        />

        {/* ── Detrás: halo dorado ── */}
        <div
          aria-hidden="true"
          className="intro-gold absolute inset-0"
          style={{ transform: "translate3d(0, calc(var(--p) * -0.07px), 0)" }}
        >
          <svg viewBox="0 0 400 500" className="h-full w-full" fill="none">
            <defs>
              <linearGradient id="halo" x1="60" y1="20" x2="340" y2="330" gradientUnits="userSpaceOnUse">
                <stop stopColor="#F1DCA4" />
                <stop offset=".45" stopColor="#C89B3C" stopOpacity=".85" />
                <stop offset="1" stopColor="#C89B3C" stopOpacity=".15" />
              </linearGradient>
            </defs>
            <circle
              cx="200"
              cy="172"
              r="146"
              stroke="url(#halo)"
              strokeWidth="1"
              pathLength={1}
              className="draw-intro"
              style={{ "--delay": "0.5s" } as CSSProperties}
            />
            <circle cx="200" cy="26" r="2.2" fill="#E6C477" />
          </svg>
        </div>

        {/* Anillo punteado exterior: rota en su propia capa (compositor) */}
        <div
          aria-hidden="true"
          className="intro-gold absolute left-[9%] top-[1.6%] aspect-square w-[82%] opacity-45"
          style={{ transform: "translate3d(0, calc(var(--p) * -0.07px), 0)" }}
        >
          <svg viewBox="0 0 330 330" className="halo-spin h-full w-full" fill="none">
            <circle cx="165" cy="165" r="164" stroke="#D8AE55" strokeWidth=".6" strokeDasharray="1 7" />
          </svg>
        </div>

        <GoldParticles className="intro-gold absolute inset-0" />

        {/* ── Fotografías ── */}
        <div
          className="intro-photo absolute inset-0"
          style={{ transform: "translate3d(0, calc(var(--p) * 0.06px), 0)" }}
        >
          <div className="photo-mask absolute inset-0">
            {photos.map((photo, i) => {
              const base = photo.variants[1] ?? photo.variants[0];
              return (
                <div
                  key={photo.id}
                  className="photo-layer"
                  data-active={i === active}
                  data-leaving={i === leaving && i !== active}
                  aria-hidden={i !== active}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={base.src}
                    srcSet={srcSet(photo)}
                    sizes={SIZES}
                    width={base.width}
                    height={base.height}
                    alt={photo.alt}
                    fetchPriority={i === 0 ? "high" : "low"}
                    loading={i === 0 ? "eager" : "lazy"}
                    decoding={i === 0 ? "sync" : "async"}
                    draggable={false}
                    className="h-full w-full select-none object-contain object-top"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Delante: arco que cruza a la persona y destellos ── */}
        <div
          aria-hidden="true"
          className="intro-gold pointer-events-none absolute inset-0"
          style={{ transform: "translate3d(0, calc(var(--p) * -0.07px), 0)" }}
        >
          <svg viewBox="0 0 400 500" className="h-full w-full" fill="none">
            <defs>
              <linearGradient id="halo-front" x1="346" y1="172" x2="250" y2="310" gradientUnits="userSpaceOnUse">
                <stop stopColor="#E6C477" stopOpacity="0" />
                <stop offset=".35" stopColor="#E6C477" stopOpacity=".9" />
                <stop offset="1" stopColor="#C89B3C" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* segmento inferior derecho del halo (r=146), dibujado por delante */}
            <path
              d="M343.8 197.4A146 146 0 0 1 247.6 310.1"
              stroke="url(#halo-front)"
              strokeWidth="1.1"
              pathLength={1}
              className="draw-intro"
              style={{ "--delay": "1.6s" } as CSSProperties}
            />
          </svg>
          <Sparkle size={16} className="sparkle absolute left-[15%] top-[22%]" delay={0.4} />
          <Sparkle size={10} className="sparkle absolute right-[19%] top-[30%]" delay={2.1} />
          <Sparkle size={12} className="sparkle absolute right-[9%] top-[50%]" delay={3.4} />
          <Sparkle size={8} className="sparkle absolute left-[10%] top-[58%]" delay={1.2} />
        </div>

      </div>
    </div>
  );
}
