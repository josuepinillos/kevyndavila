import { describe, expect, it } from "vitest";
import { createRateLimiter } from "@/lib/server/rateLimit";

describe("rate limit", () => {
  it("bloquea tras superar el límite y se recupera al pasar la ventana", () => {
    const allow = createRateLimiter({ limit: 3, windowMs: 1000 });
    expect([allow("ip", 0), allow("ip", 10), allow("ip", 20)]).toEqual([true, true, true]);
    expect(allow("ip", 30)).toBe(false);
    expect(allow("otra-ip", 30)).toBe(true);
    expect(allow("ip", 1011)).toBe(true);
  });
});
