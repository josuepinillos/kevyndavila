import { describe, expect, it, vi } from "vitest";
import { memoryStore } from "@/lib/rsvp/memoryStore";
import { MESSAGES, processRsvp, type RsvpNotifier, type RsvpStore } from "@/lib/rsvp/service";

function setup(opts: { store?: RsvpStore; notify?: RsvpNotifier["notify"] } = {}) {
  const store = opts.store ?? memoryStore();
  const notify = vi.fn(opts.notify ?? (async () => {}));
  const tasks: Promise<void>[] = [];
  const log = { error: vi.fn(), info: vi.fn() };
  const deps = { store, notifier: { notify }, defer: (t: () => Promise<void>) => void tasks.push(t()), log };
  const run = async (name: unknown) => {
    const r = await processRsvp(name, deps);
    await Promise.all(tasks);
    return r;
  };
  return { store, notify, log, run };
}

describe("RSVP", () => {
  it("Test 1 — nuevo invitado: guarda, envía correo y confirma", async () => {
    const { store, notify, run } = setup();
    const r = await run("Juan Pérez");
    expect(r).toEqual({ status: "confirmed", name: "Juan Pérez" });
    const rows = [...(store as ReturnType<typeof memoryStore>).rows.values()];
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ name: "Juan Pérez", emailStatus: "sent" });
    expect(notify).toHaveBeenCalledTimes(1);
    expect(notify.mock.calls[0][0]).toMatchObject({ name: "Juan Pérez", id: rows[0].id });
  });

  it("Test 2 — duplicado (con otra escritura): no crea registro ni envía otro correo", async () => {
    const { store, notify, run } = setup();
    await run("Juan Pérez");
    const r = await run("  juan   perez ");
    expect(r.status).toBe("already_confirmed");
    expect((store as ReturnType<typeof memoryStore>).rows.size).toBe(1);
    expect(notify).toHaveBeenCalledTimes(1);
  });

  it("Test 3 — campo vacío o solo espacios: error de validación sin tocar la base de datos", async () => {
    const confirm = vi.fn();
    const { notify, run } = setup({ store: { confirm, recordEmail: vi.fn() } });
    for (const v of ["", "   ", "J", undefined, 42]) {
      const r = await run(v);
      expect(r.status).toBe("invalid");
    }
    expect(confirm).not.toHaveBeenCalled();
    expect(notify).not.toHaveBeenCalled();
  });

  it("Test 4 — doble clic (peticiones simultáneas): un solo registro y un solo correo", async () => {
    const { store, notify, run } = setup();
    const results = await Promise.all([run("Ana López"), run("Ana López"), run("ana lopez")]);
    expect(results.filter((r) => r.status === "confirmed")).toHaveLength(1);
    expect(results.filter((r) => r.status === "already_confirmed")).toHaveLength(2);
    expect((store as ReturnType<typeof memoryStore>).rows.size).toBe(1);
    expect(notify).toHaveBeenCalledTimes(1);
  });

  it("Test 5 — falla el correo: el RSVP queda guardado, se registra el error y no se duplica", async () => {
    const { store, notify, log, run } = setup({
      notify: async () => {
        throw new Error("Resend: validation_error — domain not verified");
      },
    });
    const r = await run("Luis Gómez");
    expect(r.status).toBe("confirmed"); // el invitado ve éxito: su confirmación está guardada
    const row = [...(store as ReturnType<typeof memoryStore>).rows.values()][0];
    expect(row).toMatchObject({ emailStatus: "failed" });
    expect(row.emailError).toContain("domain not verified");
    expect(log.error).toHaveBeenCalled();

    const again = await run("Luis Gómez");
    expect(again.status).toBe("already_confirmed");
    expect((store as ReturnType<typeof memoryStore>).rows.size).toBe(1);
    expect(notify).toHaveBeenCalledTimes(1);
  });

  it("Test 6 — falla la base de datos: no se envía correo y se muestra un error amigable", async () => {
    const { notify, log, run } = setup({
      store: {
        confirm: async () => {
          throw new Error("Supabase: connection refused");
        },
        recordEmail: vi.fn(),
      },
    });
    const r = await run("Carla Díaz");
    expect(r).toEqual({ status: "error", error: MESSAGES.error });
    expect(notify).not.toHaveBeenCalled();
    expect(log.error).toHaveBeenCalled();
    // el mensaje al invitado no expone detalles técnicos
    expect(JSON.stringify(r)).not.toContain("Supabase");
  });
});
