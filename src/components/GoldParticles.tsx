import type { CSSProperties } from "react";

// Posiciones fijas (sin Math.random) para evitar diferencias entre servidor y cliente.
const PARTICLES = [
  { x: 8, y: 18, s: 3, d: 13, delay: 0.2, dx: 8, o: 0.8 },
  { x: 22, y: 8, s: 2, d: 16, delay: 3.1, dx: -6, o: 0.6 },
  { x: 86, y: 20, s: 3, d: 14, delay: 1.4, dx: -8, o: 0.75 },
  { x: 93, y: 38, s: 2, d: 18, delay: 5.2, dx: 5, o: 0.55 },
  { x: 5, y: 44, s: 2, d: 15, delay: 6.8, dx: 6, o: 0.5 },
  { x: 14, y: 70, s: 3, d: 17, delay: 2.4, dx: 7, o: 0.7 },
  { x: 90, y: 64, s: 2, d: 12, delay: 4.3, dx: -5, o: 0.6 },
  { x: 78, y: 6, s: 2, d: 19, delay: 7.5, dx: 6, o: 0.5 },
  { x: 32, y: 3, s: 1.5, d: 14, delay: 8.9, dx: -4, o: 0.6 },
  { x: 70, y: 78, s: 2, d: 16, delay: 0.9, dx: -7, o: 0.5 },
  { x: 97, y: 84, s: 1.5, d: 13, delay: 9.6, dx: -4, o: 0.6 },
  { x: 3, y: 90, s: 2, d: 15, delay: 11, dx: 5, o: 0.5 },
];

export function GoldParticles({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none ${className}`}>
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className="particle"
          style={
            {
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.s * 2,
              height: p.s * 2,
              "--dur": `${p.d}s`,
              "--delay": `${p.delay}s`,
              "--dx": `${p.dx}px`,
              "--o": p.o,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
