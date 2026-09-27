import type { CSSProperties } from "react";
import { event } from "@/config/event";
import { AnimatedSection, Words } from "./AnimatedSection";
import { Countdown } from "./Countdown";
import { DecorativeGoldLine, Sparkle } from "./Ornaments";

export function Experience() {
  return (
    <AnimatedSection
      id="experiencia"
      aria-label="La celebración"
      className="relative isolate overflow-hidden px-6 pb-16 pt-24 text-center sm:pb-24 sm:pt-36"
    >
      {/* Numeral editorial de fondo */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-[58%] select-none font-serif text-[62vw] font-medium leading-none text-transparent [-webkit-text-stroke:1px_rgba(216,174,85,0.09)] sm:text-[22rem]"
      >
        {event.day}
      </span>

      <p data-reveal className="label flex items-center justify-center gap-3 text-gold-400" style={{ "--i": 0 } as CSSProperties}>
        <span className="text-gold-400/60">02</span>
        <span className="h-px w-6 bg-gold-400/50" />
        La celebración
      </p>

      <blockquote className="mx-auto mt-10 max-w-[18ch] font-serif text-[2.35rem] font-normal italic leading-[1.12] text-cream sm:max-w-[20ch] sm:text-6xl">
        <Words text={event.experience} />
      </blockquote>

      <DecorativeGoldLine width={200} className="mx-auto mt-12" i={3} />

      <div data-reveal className="mt-14" style={{ "--i": 4 } as CSSProperties}>
        <p className="label mb-7 flex items-center justify-center gap-2 text-[0.625rem] text-gold-300/80">
          <Sparkle size={9} /> La cuenta regresiva <Sparkle size={9} />
        </p>
        <Countdown />
      </div>
    </AnimatedSection>
  );
}
