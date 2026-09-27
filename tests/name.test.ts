import { describe, expect, it } from "vitest";
import { cleanName, firstNameOf, nameKey, validateName } from "@/lib/rsvp/name";

describe("normalización de nombres", () => {
  it("unifica espacios, mayúsculas y tildes", () => {
    expect(nameKey("  Juan   Pérez ")).toBe(nameKey("juan pérez"));
    expect(nameKey("JUAN PEREZ")).toBe("juan perez");
    expect(nameKey("José Müller")).toBe("jose muller");
  });

  it("conserva la ñ (Peña ≠ Pena)", () => {
    expect(nameKey("Peña")).toBe("peña");
    expect(nameKey("Peña")).not.toBe(nameKey("Pena"));
    expect(nameKey("PEÑA")).toBe(nameKey("peña"));
  });

  it("unifica apóstrofes y guiones tipográficos", () => {
    expect(nameKey("O’Brien")).toBe(nameKey("o'brien"));
    expect(nameKey("Ana‑María")).toBe(nameKey("ana-maría"));
  });

  it("el nombre original solo pierde espacios sobrantes", () => {
    expect(cleanName("  María   José  Pérez ")).toBe("María José Pérez");
    expect(firstNameOf("  María José ")).toBe("María");
    expect(firstNameOf("juan perez")).toBe("Juan");
    expect(firstNameOf("ñusta")).toBe("Ñusta");
  });
});

describe("validación de nombres", () => {
  it.each(["Juan Pérez", "María José Ñúñez", "O'Connor", "Ana-María", "Ma. José", "Zoë", "李小龙"])(
    "acepta %s",
    (n) => expect(validateName(n).ok).toBe(true),
  );

  it.each([
    ["", "Escribe tu nombre para confirmar."],
    ["    ", "Escribe tu nombre para confirmar."],
    ["J", "Escribe tu nombre completo."],
    ["--", "Escribe tu nombre completo."],
    ["Juan <script>", "Usa solo letras, espacios, apóstrofes o guiones."],
    ["Juan123", "Usa solo letras, espacios, apóstrofes o guiones."],
    ["a".repeat(101), "El nombre es demasiado largo (máximo 100 caracteres)."],
  ])("rechaza %j", (n, msg) => {
    const r = validateName(n);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(msg);
  });

  it("acepta exactamente 100 caracteres", () => {
    expect(validateName("a".repeat(100)).ok).toBe(true);
  });
});
