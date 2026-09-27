import type { CSSProperties, SVGProps } from "react";

/**
 * Degradados compartidos. Se montan una sola vez en el layout, fuera de
 * cualquier contenedor oculto (un <defs> dentro de display:none deja de funcionar).
 */
export function SharedSvgDefs() {
  return (
    <svg aria-hidden="true" width="0" height="0" className="absolute h-0 w-0 overflow-hidden">
      <defs>
        <linearGradient id="sparkle-gold" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#F4E0A8" />
          <stop offset=".55" stopColor="#D8AE55" />
          <stop offset="1" stopColor="#A57B2C" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/** Destello de cuatro puntas. */
export function Sparkle({
  size = 14,
  className = "",
  delay,
  ...rest
}: { size?: number; delay?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      style={delay !== undefined ? ({ "--delay": `${delay}s` } as CSSProperties) : undefined}
      {...rest}
    >
      <path
        d="M12 0c.6 5.6 2.4 8.9 5.2 10.3 1.5.8 3.8 1.3 6.8 1.7-3 .4-5.3.9-6.8 1.7C14.4 15.1 12.6 18.4 12 24c-.6-5.6-2.4-8.9-5.2-10.3C5.3 12.9 3 12.4 0 12c3-.4 5.3-.9 6.8-1.7C9.6 8.9 11.4 5.6 12 0Z"
        fill="url(#sparkle-gold)"
      />
    </svg>
  );
}

/** Línea dorada con rombo central que se dibuja al entrar en pantalla. */
export function DecorativeGoldLine({
  className = "",
  width = 220,
  i = 0,
}: {
  className?: string;
  width?: number;
  i?: number;
}) {
  const mid = width / 2;
  return (
    <svg
      width={width}
      height="14"
      viewBox={`0 0 ${width} 14`}
      fill="none"
      aria-hidden="true"
      className={`max-w-full ${className}`}
      style={{ "--i": i } as CSSProperties}
    >
      <path
        className="draw"
        pathLength={1}
        d={`M${mid - 12} 7H0`}
        stroke={`url(#gl-l-${width})`}
        strokeWidth="1"
      />
      <path
        className="draw"
        pathLength={1}
        d={`M${mid + 12} 7H${width}`}
        stroke={`url(#gl-r-${width})`}
        strokeWidth="1"
      />
      <path d={`M${mid} 1.5 ${mid + 5.5} 7 ${mid} 12.5 ${mid - 5.5} 7Z`} stroke="#D8AE55" strokeWidth="1" />
      <circle cx={mid} cy="7" r="1.4" fill="#E6C477" />
      <defs>
        <linearGradient id={`gl-l-${width}`} x1={mid} x2="0" y1="0" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="#D8AE55" />
          <stop offset="1" stopColor="#D8AE55" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`gl-r-${width}`} x1={mid} x2={width} y1="0" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="#D8AE55" />
          <stop offset="1" stopColor="#D8AE55" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/** Esquinas de marco editorial. */
export function FrameCorners({ className = "" }: { className?: string }) {
  const corner = (
    <path d="M1 22V7a6 6 0 0 1 6-6h15" stroke="currentColor" strokeWidth="1" fill="none" />
  );
  const pos = ["left-0 top-0", "right-0 top-0 rotate-90", "right-0 bottom-0 rotate-180", "left-0 bottom-0 -rotate-90"];
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 text-gold-400/70 ${className}`}>
      {pos.map((p) => (
        <svg key={p} width="23" height="23" viewBox="0 0 23 23" className={`absolute ${p}`}>
          {corner}
        </svg>
      ))}
    </div>
  );
}
