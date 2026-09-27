/**
 * Ejecuta la migración real de Supabase sobre Postgres embebido (PGlite)
 * para comprobar la tabla, las restricciones y la función atómica confirm_rsvp.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { beforeEach, describe, expect, it } from "vitest";

const dir = join(process.cwd(), "supabase", "migrations");
const migration = readdirSync(dir)
  .filter((f) => f.endsWith(".sql"))
  .sort()
  .map((f) => readFileSync(join(dir, f), "utf8"))
  .join("\n");

let db: PGlite;

type Row = { id: string; created: boolean; created_at: string };
const confirm = (name: string, key: string) =>
  db.query<Row>("select * from public.confirm_rsvp($1, $2)", [name, key]).then((r) => r.rows[0]);

beforeEach(async () => {
  db = new PGlite();
  // Roles que Supabase trae por defecto.
  await db.exec(`create role anon; create role authenticated; create role service_role;`);
  await db.exec(migration);
});

describe("migración rsvps", () => {
  it("crea la confirmación con estado 'confirmed' y email 'pending'", async () => {
    const r = await confirm("Juan Pérez", "juan perez");
    expect(r.created).toBe(true);
    const { rows } = await db.query<{ name: string; status: string; email_status: string }>(
      "select name, status, email_status from public.rsvps",
    );
    expect(rows).toEqual([{ name: "Juan Pérez", status: "confirmed", email_status: "pending" }]);
  });

  it("no duplica: la segunda llamada devuelve la fila existente", async () => {
    const a = await confirm("Juan Pérez", "juan perez");
    const b = await confirm("JUAN PEREZ", "juan perez");
    expect(b.created).toBe(false);
    expect(b.id).toBe(a.id);
    const { rows } = await db.query<{ n: number }>("select count(*)::int as n from public.rsvps");
    expect(rows[0].n).toBe(1);
  });

  it("peticiones simultáneas → una sola fila creada", async () => {
    const results = await Promise.all(Array.from({ length: 5 }, () => confirm("Ana López", "ana lopez")));
    expect(results.filter((r) => r.created)).toHaveLength(1);
    const { rows } = await db.query<{ n: number }>("select count(*)::int as n from public.rsvps");
    expect(rows[0].n).toBe(1);
  });

  it("el índice único protege aunque se inserte directamente", async () => {
    await confirm("Luis", "luis");
    await expect(
      db.query("insert into public.rsvps (name, name_normalized) values ('LUIS', 'luis')"),
    ).rejects.toThrow(/duplicate key|unique/i);
  });

  it("rechaza nombres fuera de 2–100 caracteres", async () => {
    await expect(confirm("J", "j")).rejects.toThrow(/check/i);
    await expect(confirm("a".repeat(101), "a".repeat(101))).rejects.toThrow(/check/i);
  });

  it("RLS activo y sin acceso para anon/authenticated", async () => {
    const { rows } = await db.query<{ rowsecurity: boolean }>(
      "select rowsecurity from pg_tables where schemaname = 'public' and tablename = 'rsvps'",
    );
    expect(rows[0].rowsecurity).toBe(true);
    const grants = await db.query<{ grantee: string }>(
      "select grantee from information_schema.role_table_grants where table_name = 'rsvps' and grantee in ('anon','authenticated')",
    );
    expect(grants.rows).toHaveLength(0);
    const exec = await db.query<{ anon: boolean; service: boolean }>(
      `select has_function_privilege('anon', 'public.confirm_rsvp(text,text)', 'execute') as anon,
              has_function_privilege('service_role', 'public.confirm_rsvp(text,text)', 'execute') as service`,
    );
    expect(exec.rows[0]).toEqual({ anon: false, service: true });
  });
});
