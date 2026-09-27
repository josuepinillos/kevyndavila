/**
 * Límite de peticiones por IP (ventana deslizante en memoria).
 *
 * Sencillo y sin infraestructura extra. En serverless cada instancia tiene su propio
 * contador, así que es una protección "razonable", no absoluta; la garantía contra
 * duplicados la da la base de datos (índice único).
 */
export function createRateLimiter({ limit, windowMs }: { limit: number; windowMs: number }) {
  const hits = new Map<string, number[]>();

  return function allow(key: string, now = Date.now()): boolean {
    const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
    if (recent.length >= limit) {
      hits.set(key, recent);
      return false;
    }
    recent.push(now);
    hits.set(key, recent);
    // Limpieza ocasional para que el mapa no crezca indefinidamente.
    if (hits.size > 5000) {
      for (const [k, v] of hits) if (!v.some((t) => now - t < windowMs)) hits.delete(k);
    }
    return true;
  };
}
