"use client";

import type { ComponentPropsWithoutRef, ElementType } from "react";
import { useInView } from "@/hooks/useMotion";

type Props<T extends ElementType> = {
  as?: T;
  threshold?: number;
} & ComponentPropsWithoutRef<T>;

/**
 * Añade `.is-in` cuando entra en pantalla. Los hijos con `data-reveal`,
 * `.words` o `.draw` animan su aparición desde CSS (ver globals.css).
 */
export function AnimatedSection<T extends ElementType = "section">({
  as,
  threshold,
  className = "",
  ...rest
}: Props<T>) {
  const Tag = (as ?? "section") as ElementType;
  const [ref, inView] = useInView<HTMLElement>({ threshold });
  return <Tag ref={ref} className={`${className} ${inView ? "is-in" : ""}`} {...rest} />;
}

/** Divide un texto en palabras para el reveal palabra a palabra. */
export function Words({ text, className = "" }: { text: string; className?: string }) {
  const words = text.split(" ");
  return (
    <span className={`words ${className}`}>
      {words.map((w, i) => (
        <span key={i} style={{ "--w": i } as React.CSSProperties}>
          {w}
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </span>
  );
}
