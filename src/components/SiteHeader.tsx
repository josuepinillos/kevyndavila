"use client";

import { useEffect, useRef, useState } from "react";
import { navItems } from "@/config/event";
import { MobileMenu } from "./MobileMenu";

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Bloqueo de scroll, Escape y foco atrapado mientras el menú está abierto.
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    root.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        burgerRef.current?.focus();
      }
      if (e.key === "Tab" && wrapRef.current) {
        const focusables = wrapRef.current.querySelectorAll<HTMLElement>("a[href], button");
        const list = Array.from(focusables).filter((el) => el.offsetParent !== null);
        const first = list[0];
        const last = list[list.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      root.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const solid = scrolled && !open;

  return (
    <div ref={wrapRef}>
      <header
        className={`fixed inset-x-0 top-0 z-50 pt-[env(safe-area-inset-top)] transition-[background-color,backdrop-filter,border-color] duration-500 ${
          solid
            ? "border-b border-gold-400/10 bg-night-900/75 backdrop-blur-md backdrop-saturate-150"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <div className="intro-fade mx-auto flex h-[var(--header-h)] max-w-6xl items-center justify-end px-4 sm:px-8 lg:px-16">
          <nav aria-label="Principal" className="hidden lg:block">
            <ul className="flex items-center gap-9">
              {navItems.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="label relative py-3 text-[0.625rem] text-cream/65 transition-colors duration-300 after:absolute after:inset-x-0 after:bottom-1.5 after:h-px after:origin-left after:scale-x-0 after:bg-gold-400 after:transition-transform after:duration-500 hover:text-gold-300 hover:after:scale-x-100"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <button
            ref={burgerRef}
            type="button"
            className="burger -mr-2 grid size-11 place-items-center lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="flex flex-col items-end gap-[6px]">
              <span className="block h-px w-[22px] bg-gold-300" />
              <span className="block h-px w-[14px] bg-gold-300" />
            </span>
          </button>
        </div>
      </header>

      <MobileMenu open={open} onNavigate={() => setOpen(false)} />
    </div>
  );
}
