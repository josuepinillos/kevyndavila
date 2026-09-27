import type { CSSProperties } from "react";

/**
 * Texto dorado metálico con un resplandor sutil.
 *
 * El brillo es una copia desenfocada del texto, detrás del original, en lugar
 * de un `filter` sobre el propio texto con `background-clip: text`.
 */
export function GoldText({
  children,
  className = "",
  shimmer = false,
  glow = true,
  style,
}: {
  children: string;
  className?: string;
  shimmer?: boolean;
  /** En numerales grandes y compactos el halo forma un bloque: desactivarlo. */
  glow?: boolean;
  style?: CSSProperties;
}) {
  return (
    <span className={`relative inline-block ${className}`} style={style}>
      {glow && (
        <span aria-hidden="true" className="gold-glow-layer">
          {children}
        </span>
      )}
      <span className={`gold-text relative ${shimmer ? "gold-shimmer" : ""}`}>{children}</span>
    </span>
  );
}
