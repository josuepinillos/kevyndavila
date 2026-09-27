import type { CSSProperties } from "react";
import { Navigation } from "lucide-react";
import { event } from "@/config/event";
import { AnimatedSection } from "./AnimatedSection";

const i = (n: number) => ({ "--i": n }) as CSSProperties;

/** Mapa abstracto: curvas de nivel doradas y un punto que late. Sin mapas reales en esta fase. */
function AbstractMap() {
  const rings = [38, 62, 90, 122, 158];
  return (
    <svg viewBox="0 0 400 260" className="h-full w-full" fill="none" aria-hidden="true">
      <defs>
        <radialGradient id="map-fade" cx="0.5" cy="0.5" r="0.6">
          <stop stopColor="#D8AE55" stopOpacity=".7" />
          <stop offset="1" stopColor="#D8AE55" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* calles */}
      <g stroke="rgba(247,243,234,0.07)" strokeWidth="1">
        <path d="M-10 190C80 170 150 120 230 128s120 40 190 20" />
        <path d="M60 -10C90 70 130 140 120 280" />
        <path d="M290 -10c-20 80 10 150 60 280" />
        <path d="M-10 70c120 10 260-10 420 18" />
      </g>
      {rings.map((r, n) => (
        <ellipse
          key={r}
          className="draw"
          pathLength={1}
          style={i(n)}
          cx="200"
          cy="130"
          rx={r * 1.25}
          ry={r * 0.72}
          stroke="url(#map-fade)"
          strokeWidth=".8"
          opacity={1 - n * 0.14}
        />
      ))}
      <circle cx="200" cy="130" r="18" fill="rgba(216,174,85,0.12)" className="animate-ping [animation-duration:2.8s] [transform-box:fill-box] [transform-origin:center]" />
      <circle cx="200" cy="130" r="5" fill="#E6C477" />
      <circle cx="200" cy="130" r="10" stroke="#E6C477" strokeOpacity=".6" />
    </svg>
  );
}

export function LocationCard() {
  return (
    <AnimatedSection id="ubicacion" aria-labelledby="ubicacion-title" className="px-5 pb-24 sm:pb-32">
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[28px] border border-gold-400/20 bg-gradient-to-b from-deep-600/70 to-night-800/60 lg:grid lg:grid-cols-2">
        <div className="relative h-56 border-b border-gold-400/15 sm:h-72 lg:order-2 lg:h-auto lg:min-h-[420px] lg:border-b-0 lg:border-l">
          <a
            href={event.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={-1}
            aria-hidden="true"
            className="absolute inset-0"
          >
            <AbstractMap />
          </a>
          <p className="label pointer-events-none absolute bottom-4 left-5 text-[0.5625rem] text-cream/40">Punto de encuentro</p>
        </div>

        <div className="px-6 py-10 text-center sm:px-10 lg:flex lg:flex-col lg:justify-center lg:py-16 lg:text-left">
          <h2
            id="ubicacion-title"
            data-reveal
            style={i(1)}
            className="gold-text mt-6 font-serif text-[2.6rem] font-medium uppercase leading-[0.95] tracking-[0.04em] sm:text-6xl"
          >
            {event.venue}
          </h2>
          <p data-reveal style={i(2)} className="mx-auto mt-5 max-w-[28ch] font-serif text-xl italic leading-snug text-cream/75 lg:mx-0">
            {event.venueReference}
          </p>

          <div data-reveal style={i(3)} className="mt-9">
            <a
              href={event.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline"
              aria-label={`Ver ubicación de ${event.venue} en Google Maps (se abre en una pestaña nueva)`}
            >
              <Navigation aria-hidden="true" size={14} strokeWidth={1.4} />
              Ver ubicación
            </a>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}
