"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { confirmAttendance } from "@/app/actions/rsvp";
import { MESSAGES } from "@/lib/rsvp/service";
import { NAME_MAX, firstNameOf, validateName } from "@/lib/rsvp/name";
import { AnimatedSection } from "./AnimatedSection";
import { FrameCorners, Sparkle } from "./Ornaments";

type Status = "idle" | "sending" | "done";

/**
 * RSVP real: el formulario llama a la Server Action `confirmAttendance`
 * (validación, Supabase y correo al organizador ocurren en el servidor).
 */
export function RSVPCard() {
  const [name, setName] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [already, setAlready] = useState(false);
  const [error, setError] = useState("");
  const inFlight = useRef(false);
  const honeypotRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const inputId = useId();
  const errorId = useId();
  const returning = useRef(false);

  // Gestión del foco al cambiar de estado (lectores de pantalla y teclado).
  useEffect(() => {
    if (status === "done") resultRef.current?.focus();
    if (status === "idle" && returning.current) {
      returning.current = false;
      inputRef.current?.focus();
    }
  }, [status]);

  function fail(message: string) {
    setError(message);
    setStatus("idle");
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    // Evita envíos repetidos (doble clic / Enter). El servidor también lo impide.
    if (inFlight.current) return;

    // Validación inmediata: no se hace ninguna petición si el nombre no es válido.
    const check = validateName(name);
    if (!check.ok) {
      fail(check.error);
      return;
    }

    inFlight.current = true;
    setError("");
    setStatus("sending");
    try {
      const result = await confirmAttendance({ name: check.name, website: honeypotRef.current?.value ?? "" });
      if (result.status === "confirmed" || result.status === "already_confirmed") {
        setName(result.name || check.name);
        setAlready(result.status === "already_confirmed");
        setStatus("done");
      } else {
        fail(result.error);
      }
    } catch {
      // Red caída, timeout, servidor no disponible…
      fail(MESSAGES.error);
    } finally {
      inFlight.current = false;
    }
  }

  function reset() {
    returning.current = true;
    setName("");
    setAlready(false);
    setStatus("idle");
  }

  const firstName = firstNameOf(name);

  return (
    <AnimatedSection id="confirmar" aria-labelledby="rsvp-title" className="relative px-5 pb-24 sm:pb-32">
      <div
        data-reveal
        className="relative mx-auto max-w-xl rounded-[28px] border border-gold-400/25 bg-gradient-to-b from-deep-600/60 to-night-800/80 px-6 py-14 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.8)] sm:px-14 sm:py-16"
      >
        <FrameCorners className="m-3" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[28px]"
          style={{ background: "radial-gradient(70% 45% at 50% 0%, rgba(216,174,85,0.06) 0%, transparent 70%)" }}
        />

        <div className="relative text-center">
          <h2
            id="rsvp-title"
            className="gold-text mx-auto mt-6 font-serif text-[2.25rem] font-medium uppercase leading-[0.98] tracking-[0.04em] sm:text-5xl"
          >
            Confirma tu <br />
            asistencia
          </h2>

          {status !== "done" ? (
            <form onSubmit={onSubmit} noValidate aria-busy={status === "sending"} className="mt-10 text-left">
              {/* Honeypot anti-spam: invisible para personas, los bots suelen rellenarlo. */}
              <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
                <label>
                  Sitio web
                  <input ref={honeypotRef} type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
                </label>
              </div>
              <label htmlFor={inputId} className="label text-[0.5625rem] text-gold-400/90">
                Tu nombre
              </label>
              <div className="relative">
                <input
                  ref={inputRef}
                  id={inputId}
                  name="name"
                  type="text"
                  autoComplete="name"
                  autoCapitalize="words"
                  enterKeyHint="send"
                  maxLength={NAME_MAX}
                  placeholder="Escribe tu nombre completo"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (error) setError("");
                  }}
                  disabled={status === "sending"}
                  aria-invalid={!!error}
                  aria-describedby={error ? errorId : undefined}
                  className="field"
                />
                <span aria-hidden="true" className="field-underline absolute inset-x-0 bottom-0 h-px bg-gold-300" />
              </div>
              <p id={errorId} role="alert" className="mt-2 min-h-5 text-sm text-gold-200">
                {error}
              </p>

              <button type="submit" disabled={status === "sending"} className="btn-gold mt-6 w-full">
                {status === "sending" ? (
                  <>
                    <svg aria-hidden="true" viewBox="0 0 24 24" className="spinner size-4" fill="none">
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity=".25" strokeWidth="2" />
                      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    Confirmando…
                  </>
                ) : (
                  "Confirmar asistencia"
                )}
              </button>
            </form>
          ) : (
            <div
              ref={resultRef}
              tabIndex={-1}
              role="status"
              className="swap-in mt-10 flex flex-col items-center outline-none"
            >
              <svg viewBox="0 0 64 64" className="size-16" fill="none" aria-hidden="true">
                <circle className="check-ring" pathLength={1} cx="32" cy="32" r="30" stroke="#D8AE55" strokeWidth="1" />
                <path
                  className="check-path"
                  pathLength={1}
                  d="M21 33.5 28.5 41 44 25"
                  stroke="#E6C477"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="mt-7 font-serif text-4xl italic leading-tight text-cream">
                ¡Gracias, {firstName}!
              </p>
              <p className="mt-3 text-[0.9375rem] text-cream/70">
                {already ? "Tu asistencia ya está confirmada." : "Tu asistencia ha sido confirmada."}
              </p>
              <p className="label mt-8 flex items-center gap-2 text-[0.5625rem] text-gold-300/80">
                <Sparkle size={9} /> Nos vemos el 10.10 <Sparkle size={9} />
              </p>
              <button
                type="button"
                onClick={reset}
                className="mt-6 min-h-11 text-sm text-cream/50 underline decoration-gold-400/40 underline-offset-4 transition-colors hover:text-gold-300"
              >
                Confirmar a otra persona
              </button>
            </div>
          )}
        </div>
      </div>
    </AnimatedSection>
  );
}
