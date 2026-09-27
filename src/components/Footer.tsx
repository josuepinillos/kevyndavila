import type { CSSProperties } from "react";
import { event } from "@/config/event";
import { AnimatedSection } from "./AnimatedSection";
import { GoldText } from "./GoldText";
import { DecorativeGoldLine, Sparkle } from "./Ornaments";

// Corazones que salen de la palabra "love": desfase, deriva y giro distintos para cada uno.
const HEARTS = [
  { dx: "-10px", r: "-18deg", delay: "0s", size: 8 },
  { dx: "8px", r: "14deg", delay: "0.55s", size: 6 },
  { dx: "-3px", r: "-6deg", delay: "1.1s", size: 9 },
  { dx: "12px", r: "22deg", delay: "1.65s", size: 6 },
  { dx: "-14px", r: "-24deg", delay: "2.2s", size: 7 },
];

function Love() {
  return (
    <span className="love relative inline-block font-serif text-[1.0625rem] italic text-gold-300">
      love
      <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-[70%]">
        {HEARTS.map((h, n) => (
          <svg
            key={n}
            viewBox="0 0 24 24"
            width={h.size}
            height={h.size}
            className="love-heart"
            style={{ "--dx": h.dx, "--r": h.r, "--delay": h.delay } as CSSProperties}
          >
            <path
              d="M12 21.2s-7.6-4.7-9.7-9.3C.8 8.5 2.8 4.4 6.7 4.4c2.2 0 3.7 1.2 5.3 3 1.6-1.8 3.1-3 5.3-3 3.9 0 5.9 4.1 4.4 7.5-2.1 4.6-9.7 9.3-9.7 9.3Z"
              fill={n % 2 ? "#F1DCA4" : "#E6C477"}
            />
          </svg>
        ))}
      </span>
    </span>
  );
}

export function Footer() {
  return (
    <AnimatedSection
      as="footer"
      aria-label="Cierre"
      className="relative isolate overflow-hidden px-6 pb-[calc(3rem+env(safe-area-inset-bottom))] pt-8 text-center sm:pt-16"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[70%]"
        style={{ background: "radial-gradient(60% 70% at 50% 100%, rgba(18,58,90,0.75) 0%, transparent 75%)" }}
      />

      <div data-reveal className="flex justify-center gap-6" style={{ "--i": 0 } as CSSProperties}>
        <Sparkle size={10} className="sparkle mt-4" delay={1} />
        <Sparkle size={22} className="sparkle" />
        <Sparkle size={10} className="sparkle mt-4" delay={2.2} />
      </div>

      <p data-reveal="mask" style={{ "--i": 1 } as CSSProperties} className="mt-8">
        <GoldText className="px-2 pb-3 font-serif text-[4.25rem] font-medium italic leading-none sm:text-8xl">
          {event.closing}
        </GoldText>
      </p>

      <DecorativeGoldLine width={180} className="mx-auto mt-10" i={2} />

      <p data-reveal style={{ "--i": 3 } as CSSProperties} className="mt-8 font-serif text-lg font-medium uppercase tracking-[0.42em] text-cream/90">
        {event.firstName} {event.lastName}
      </p>

      <p
        data-reveal
        style={{ "--i": 4 } as CSSProperties}
        className="mt-16 text-[0.8125rem] tracking-[0.04em] text-cream/45"
      >
        Made with <Love /> by{" "}
        <a
          href="https://www.sielpsolutions.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center text-cream/75 underline decoration-gold-400/35 underline-offset-4 transition-colors duration-300 hover:text-gold-300 hover:decoration-gold-300"
        >
          Sielp Solutions
        </a>
      </p>
    </AnimatedSection>
  );
}
