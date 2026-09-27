import type { CSSProperties } from "react";
import { CalendarDays, Clock3, MapPin, type LucideIcon } from "lucide-react";
import { event } from "@/config/event";
import { AnimatedSection } from "./AnimatedSection";
import { GoldText } from "./GoldText";
import { FrameCorners } from "./Ornaments";

const i = (n: number) => ({ "--i": n }) as CSSProperties;

function Row({ icon: Icon, label, value, note, n }: { icon: LucideIcon; label: string; value: string; note?: string; n: number }) {
  return (
    <li data-reveal style={i(n)} className="flex items-start gap-5 border-t border-gold-400/15 py-6">
      <span className="grid size-11 shrink-0 place-items-center rounded-full border border-gold-400/35 text-gold-300">
        <Icon aria-hidden="true" size={18} strokeWidth={1.1} />
      </span>
      <div className="min-w-0">
        <p className="label text-[0.5625rem] text-gold-400/90">{label}</p>
        <p className="mt-1.5 font-serif text-[1.625rem] leading-tight text-cream">{value}</p>
        {note && <p className="mt-1 text-sm leading-relaxed text-cream/60">{note}</p>}
      </div>
    </li>
  );
}

export function EventDetails() {
  return (
    <AnimatedSection id="detalles" aria-labelledby="detalles-title" className="relative px-5 py-24 sm:py-32">
      <div className="mx-auto max-w-5xl lg:grid lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-20">
        {/* Fecha como composición tipográfica */}
        <div className="text-center lg:text-left">
          <p data-reveal className="label flex items-center justify-center gap-3 text-gold-400 lg:justify-start" style={i(0)}>
            <span className="text-gold-400/60">03</span>
            <span className="h-px w-6 bg-gold-400/50" />
            Detalles
          </p>
          <h2 id="detalles-title" className="sr-only">
            Detalles del evento
          </h2>

          <div className="mt-10 flex items-center justify-center gap-5 lg:justify-start" aria-hidden="true">
            <span data-reveal="mask" style={i(1)} className="inline-block">
              <GoldText glow={false} className="font-serif text-[8.5rem] font-medium leading-[0.8] tracking-tight sm:text-[10rem]">
                {event.day}
              </GoldText>
            </span>
            <span data-reveal style={i(2)} className="flex flex-col items-start gap-2 border-l border-gold-400/30 pl-5 text-left">
              <span className="label text-[0.625rem] text-gold-300">{event.weekday}</span>
              <span className="font-serif text-3xl italic leading-none text-cream">{event.month}</span>
              <span className="font-serif text-xl leading-none tracking-[0.2em] text-cream/60">{event.year}</span>
            </span>
          </div>
        </div>

        <div className="relative mt-14 px-6 py-4 sm:px-10 lg:mt-0">
          <FrameCorners />
          <ul>
            <Row icon={CalendarDays} label="Fecha" value={event.dateNumeric} note={`${event.weekday} ${event.day} de ${event.month.toLowerCase()}`} n={2} />
            <Row icon={Clock3} label="Hora" value={event.time} n={3} />
            <Row icon={MapPin} label="Lugar" value={event.venue} note={event.venueReference} n={4} />
          </ul>
        </div>
      </div>
    </AnimatedSection>
  );
}
