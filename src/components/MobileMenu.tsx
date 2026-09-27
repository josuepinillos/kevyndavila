"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { event, navItems } from "@/config/event";
import { DecorativeGoldLine, Sparkle } from "./Ornaments";

export function MobileMenu({ open, onNavigate }: { open: boolean; onNavigate: () => void }) {
  const firstLink = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (open) {
      const t = window.setTimeout(() => firstLink.current?.focus({ preventScroll: true }), 250);
      return () => window.clearTimeout(t);
    }
  }, [open]);

  return (
    <div
      id="mobile-menu"
      className="menu-panel fixed inset-0 z-40 flex flex-col overflow-y-auto bg-night-950/[0.97] px-6 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-[calc(var(--header-h)+env(safe-area-inset-top)+2rem)] lg:hidden"
      data-open={open}
      aria-hidden={!open}
      inert={!open}
      role="dialog"
      aria-modal="true"
      aria-label="Menú"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(80% 50% at 100% 0%, rgba(18,58,90,0.7) 0%, transparent 70%), radial-gradient(60% 40% at 0% 100%, rgba(200,155,60,0.1) 0%, transparent 70%)",
        }}
      />

      <nav aria-label="Menú móvil" className="flex-1">
        <ul className="flex flex-col">
          {navItems.map((item, i) => (
            <li
              key={item.href}
              className="menu-item border-b border-gold-400/10"
              style={{ "--i": i } as CSSProperties}
            >
              <a
                ref={i === 0 ? firstLink : undefined}
                href={item.href}
                onClick={onNavigate}
                className="group flex min-h-[4.5rem] items-baseline gap-5 py-4"
              >
                <span className="font-serif text-sm italic text-gold-400/70 lining-nums tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-serif text-[2.5rem] font-medium uppercase leading-none tracking-[0.06em] text-cream transition-colors duration-300 group-hover:text-gold-300 group-active:text-gold-300">
                  {item.label}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="menu-item mt-10 flex flex-col items-center gap-5 text-center" style={{ "--i": 5 } as CSSProperties}>
        <DecorativeGoldLine width={160} className="[&_.draw]:[stroke-dashoffset:0]" />
        <p className="font-serif text-lg italic text-cream/80">
          {event.weekday} {event.dateShort} · {event.time}
        </p>
        <p className="label flex items-center gap-2 text-[0.625rem] text-gold-300/80">
          <Sparkle size={9} /> {event.venue} <Sparkle size={9} />
        </p>
      </div>
    </div>
  );
}
