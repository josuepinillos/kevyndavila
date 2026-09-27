"use client";

import { useEffect, useState } from "react";
import { event } from "@/config/event";

type Parts = { days: number; hours: number; minutes: number; seconds: number } | null;

function diff(target: number): Parts {
  const s = Math.max(0, Math.floor((target - Date.now()) / 1000));
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}

export function Countdown() {
  const target = new Date(event.startsAt).getTime();
  const [parts, setParts] = useState<Parts>(null);

  useEffect(() => {
    let id = 0;
    const tick = () => {
      setParts(diff(target));
      // se alinea con el cambio de segundo para que no "salte" un número
      id = window.setTimeout(tick, 1000 - (Date.now() % 1000));
    };
    tick();
    return () => window.clearTimeout(id);
  }, [target]);

  const cells: [string, number | undefined][] = [
    ["Días", parts?.days],
    ["Horas", parts?.hours],
    ["Minutos", parts?.minutes],
    ["Segundos", parts?.seconds],
  ];

  return (
    <div className="flex items-stretch justify-center">
      {/* Resumen para lectores de pantalla (sin anunciar cada segundo) */}
      <p className="sr-only">
        {parts
          ? `Faltan ${parts.days} días, ${parts.hours} horas y ${parts.minutes} minutos`
          : "Cuenta regresiva"}
      </p>
      {cells.map(([label, value], i) => (
        <div key={label} className="flex items-stretch" aria-hidden="true">
          {i > 0 && (
            <span className="mx-2.5 w-px bg-gradient-to-b from-transparent via-gold-500/40 to-transparent sm:mx-7" />
          )}
          <div className="flex min-w-[3.5rem] flex-col items-center gap-2 sm:min-w-[4.5rem]">
            <span className="gold-text font-serif text-[2.5rem] font-medium leading-none lining-nums tabular-nums sm:text-6xl">
              {value === undefined ? "··" : String(value).padStart(2, "0")}
            </span>
            <span className="font-sans text-[0.5rem] font-semibold uppercase tracking-[0.2em] text-cream/50 sm:text-[0.5625rem] sm:tracking-[0.3em]">
              {label}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
