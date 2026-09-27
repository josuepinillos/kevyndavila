import type { CSSProperties } from "react";
import { preload } from "react-dom";
import { ArrowDown } from "lucide-react";
import { event } from "@/config/event";
import { photos, srcSet } from "@/config/photos";
import { PhotoShowcase } from "./PhotoShowcase";
import { GoldText } from "./GoldText";

const i = (n: number) => ({ "--i": n }) as CSSProperties;

export function Hero() {
  // Solo la primera fotografía es un recurso crítico.
  const first = photos[0];
  if (first) {
    preload(first.variants[1]?.src ?? first.variants[0].src, {
      as: "image",
      imageSrcSet: srcSet(first),
      imageSizes: "(min-width: 1024px) 560px, (min-width: 640px) 480px, 100vw",
      fetchPriority: "high",
    });
  }

  return (
    <section
      id="inicio"
      aria-labelledby="hero-title"
      className="relative isolate overflow-hidden pb-16 pt-[calc(var(--header-h)+env(safe-area-inset-top)+0.75rem)] lg:flex lg:min-h-[100svh] lg:items-center lg:pb-12"
    >
      <div aria-hidden="true" className="vignette intro-fade absolute inset-0 -z-10" />

      {/* Rieles editoriales laterales */}
      <p
        aria-hidden="true"
        className="label intro-text absolute left-5 top-1/2 hidden -translate-y-1/2 -rotate-180 text-gold-400/60 [writing-mode:vertical-rl] md:block"
        style={i(6)}
      >
        Nº 01 — Invitación privada
      </p>
      <p
        aria-hidden="true"
        className="label intro-text absolute right-5 top-1/2 hidden -translate-y-1/2 text-gold-400/60 [writing-mode:vertical-rl] md:block"
        style={i(6)}
      >
        {event.dateShort} — {event.time}
      </p>

      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 px-4 sm:px-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:items-center lg:gap-x-6 lg:px-16">
        {/* Fotografía */}
        <div className="relative mt-4 w-full max-w-[460px] justify-self-center lg:col-start-2 lg:row-span-5 lg:row-start-1 lg:mt-0 lg:max-w-[600px]">
          <PhotoShowcase />
        </div>

        {/* Nombre */}
        <h1
          id="hero-title"
          className="intro-name relative z-10 -mt-[29%] text-center font-serif font-medium uppercase leading-[0.84] tracking-[0.045em] sm:-mt-[22%] lg:col-start-1 lg:mt-8 lg:text-left"
        >
          <span className="block overflow-hidden pb-[0.06em] lg:overflow-x-visible lg:overflow-y-clip">
            <GoldText
              shimmer
              className="text-[clamp(4rem,20vw,6.75rem)] lg:text-[clamp(5.5rem,8.6vw,7.75rem)]"
              style={i(0)}
            >
              {event.firstName}
            </GoldText>
          </span>
          <span className="block overflow-hidden pb-[0.08em] lg:overflow-x-visible lg:overflow-y-clip">
            <GoldText
              shimmer
              className="text-[clamp(4rem,20vw,6.75rem)] lg:ml-[0.55em] lg:text-[clamp(5.5rem,8.6vw,7.75rem)]"
              style={i(1)}
            >
              {event.lastName}
            </GoldText>
          </span>
        </h1>

        {/* Invitación */}
        <div className="relative z-10 mt-5 text-center lg:col-start-1 lg:mt-7 lg:text-left">
          <p className="intro-text font-serif text-[1.75rem] italic leading-tight text-cream sm:text-3xl" style={i(0)}>
            {event.headline}
          </p>
          <p
            className="intro-text mx-auto mt-3 max-w-[30ch] text-balance text-[0.9375rem] leading-relaxed text-cream/65 lg:mx-0"
            style={i(1)}
          >
            {event.subline}
          </p>
        </div>

        {/* CTA */}
        <div
          className="intro-text relative z-10 mt-9 flex flex-col items-center gap-6 lg:col-start-1 lg:flex-row lg:gap-8"
          style={i(2)}
        >
          <a href="#confirmar" className="btn-gold w-full max-w-[340px] lg:w-auto">
            Confirmar asistencia
          </a>
          <a
            href="#experiencia"
            className="group flex min-h-11 items-center gap-3 text-cream/55 transition-colors hover:text-gold-300"
          >
            <span className="label text-[0.625rem]">Descubre más</span>
            <ArrowDown
              aria-hidden="true"
              size={14}
              strokeWidth={1.25}
              className="transition-transform duration-500 group-hover:translate-y-1"
            />
          </a>
        </div>
      </div>
    </section>
  );
}
