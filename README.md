# Invitación · Kevyn Dávila

Invitación digital con RSVP real.
Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · Supabase · Resend.

```
Invitado → formulario → Server Action → validación → Supabase (rsvps)
                                                        └→ (tras responder) Resend → correo al organizador
```

---

## 1. Ejecutar localmente

```bash
npm install
cp .env.example .env.local      # y rellena los valores (ver sección 4)
npm run dev                     # http://localhost:3000
```

Otros comandos:

```bash
npm run test        # tests (validación, duplicados, correo, migración SQL)
npm run typecheck
npm run lint
npm run build
```

**Probar sin Supabase ni Resend:** añade `RSVP_STORE=memory` a `.env.local`.
Las confirmaciones se guardan en memoria (se pierden al reiniciar) y el correo
falla de forma controlada (se ve en la terminal). Este modo se ignora en producción.

---

## 2. Configurar Supabase

1. Crea un proyecto en <https://supabase.com> (plan gratuito suficiente).
2. **SQL Editor → New query**: pega el contenido de
   `supabase/migrations/20260925000000_create_rsvps.sql` y pulsa **Run**.
   Crea:
   - tabla `rsvps` (`id`, `name`, `name_normalized`, `status`, `created_at`,
     `email_status`, `email_error`, `email_sent_at`)
   - índice único sobre `name_normalized` (anti‑duplicados en la base de datos)
   - función `confirm_rsvp` (inserción atómica)
   - RLS activado sin políticas: los nombres **no** son accesibles públicamente.
3. **Project Settings → API** (o **API Keys**):
   - `SUPABASE_URL` = *Project URL*
   - `SUPABASE_SECRET_KEY` = *Secret key* (`sb_secret_…`).
     En proyectos antiguos, la *service_role key* (también vale como `SUPABASE_SERVICE_ROLE_KEY`).

> ⚠️ Nunca uses la clave *publishable/anon* para esto, ni pongas estas claves en variables `NEXT_PUBLIC_*`.

---

## 3. Configurar Resend

1. Crea una cuenta en <https://resend.com>.
2. **API Keys → Create API Key** (permiso *Sending access*) → `RESEND_API_KEY`.
3. **Domains → Add Domain**: añade tu dominio y crea en tu DNS los registros que indica Resend.
   Cuando aparezca como *Verified*, usa un remitente de ese dominio:
   `EMAIL_FROM="Invitación Kevyn <rsvp@tudominio.com>"`.
   - Sin dominio propio (solo pruebas): `EMAIL_FROM=onboarding@resend.dev`.
     Con ese remitente Resend **solo entrega al email de tu propia cuenta de Resend**.
4. `RSVP_NOTIFICATION_EMAIL` = dirección que recibe las confirmaciones.

---

## 4. Variables de entorno

| Variable | Obligatoria | Descripción |
|---|---|---|
| `SUPABASE_URL` | Sí | URL del proyecto Supabase |
| `SUPABASE_SECRET_KEY` | Sí | Clave secreta del servidor (o `SUPABASE_SERVICE_ROLE_KEY`) |
| `RESEND_API_KEY` | Sí | API key de Resend |
| `EMAIL_FROM` | Sí | Remitente (dominio verificado en Resend) |
| `RSVP_NOTIFICATION_EMAIL` | Sí | Receptor(es) de las notificaciones, separados por comas |
| `RSVP_STORE` | No | `memory` solo para desarrollo sin Supabase |

Todas son **solo de servidor**. Plantilla: `.env.example`. Los archivos `.env*.local` están en `.gitignore`.

### Cambiar el correo receptor

Modifica `RSVP_NOTIFICATION_EMAIL` (en `.env.local` o en Vercel) y reinicia/redeploya.
Para varios destinatarios: `RSVP_NOTIFICATION_EMAIL=uno@dominio.com,otro@dominio.com`.

---

## 5. Cómo funciona el RSVP

- **Validación** (cliente para feedback inmediato + servidor como fuente de verdad):
  2–100 caracteres, letras (con tildes y ñ), espacios, apóstrofes, guiones y puntos.
- **Duplicados**: el nombre se normaliza para comparar (espacios, mayúsculas, tildes;
  la ñ se conserva). `"  Juan   Pérez "` y `"juan perez"` son la misma persona.
  La base de datos lo garantiza con un índice único y `INSERT … ON CONFLICT DO NOTHING`,
  así que doble clic, refresh, reintentos o dos pestañas nunca crean dos filas.
- **Correo**: solo se envía cuando la fila se crea por primera vez, después de responder
  al invitado (`after()` de Next.js). Usa una *idempotency key* por RSVP en Resend.
  - Si el correo falla, la confirmación se mantiene y queda `email_status = 'failed'`
    con el motivo en `email_error` (y en los logs del servidor).
  - Si la base de datos falla, no se envía correo y el invitado ve un error amigable.
- **Anti‑spam**: límite de 8 intentos cada 10 min por IP (en memoria, por instancia),
  campo *honeypot* invisible y validación server‑side. Las Server Actions de Next.js
  además verifican el origen de la petición.
- **Privacidad**: el invitado solo ve el estado de su propia confirmación.

Código relevante:

| Archivo | Rol |
|---|---|
| `src/app/actions/rsvp.ts` | Server Action `confirmAttendance` |
| `src/lib/rsvp/service.ts` | Lógica: validar → guardar → notificar |
| `src/lib/rsvp/name.ts` | Validación y normalización de nombres |
| `src/lib/server/supabaseStore.ts` | Acceso a Supabase (solo servidor) |
| `src/lib/server/resendNotifier.ts` | Envío con Resend (solo servidor) |
| `src/lib/email/rsvpNotification.ts` | Plantilla del correo (HTML + texto) |
| `src/components/RSVPCard.tsx` | Formulario (diseño de la fase 1) |

---

## 6. Probar el RSVP

1. Con las variables configuradas, `npm run dev` y abre <http://localhost:3000/#confirmar>.
2. Escribe `Juan Pérez` → **¡Gracias, Juan!** · *Tu asistencia ha sido confirmada.*
   Debe llegar el correo **"Nueva confirmación — Cumpleaños Kevyn Dávila"**.
3. Vuelve a enviar `juan perez` → *Tu asistencia ya está confirmada.* (sin fila nueva ni correo).
4. Envía el campo vacío → mensaje de validación, sin petición al servidor.
5. Revisa en Supabase: **Table Editor → rsvps** (una fila, `email_status = sent`).

Tests automáticos: `npm run test`.

### Consultar confirmados (SQL Editor)

```sql
select name,
       created_at at time zone 'America/Lima' as confirmado_el,
       email_status
from public.rsvps
where status = 'confirmed'
order by created_at;

select count(*) as total from public.rsvps where status = 'confirmed';
```

Para borrar una prueba: `delete from public.rsvps where name_normalized = 'juan perez';`

---

## 7. Desplegar (Vercel)

1. Sube el proyecto a un repositorio (GitHub/GitLab) e impórtalo en <https://vercel.com/new>
   (framework detectado: Next.js; sin configuración extra).
2. **Settings → Environment Variables**: añade las 5 variables de la sección 4
   (entorno *Production*, y *Preview* si quieres probar ahí).
3. Deploy. No hay persistencia en archivos locales: todo se guarda en Supabase.
4. Prueba un RSVP en la URL pública y borra la fila de prueba desde Supabase.

---

## Fotografías

Los originales viven en `assets/` y nunca se modifican:
`foto_02.jpeg` (principal), `foto_01.HEIC`, `foto_03.HEIC`.

`scripts/process_photos.py` elimina el fondo (rembg, modelo BiRefNet-portrait:
solo genera una máscara alfa, los píxeles de la persona quedan intactos),
normaliza el encuadre y exporta `assets/processed/*-cutout.png`,
`public/images/kevyn-0N-{480,800,1200}.webp` y `src/data/photos.generated.json`.

Para reemplazar una foto: sustituye el archivo en `assets/` (mismo nombre base) y ejecuta:

```bash
pip install -r scripts/requirements.txt
python scripts/process_photos.py --force
```

## Contenido

Textos y datos del evento: `src/config/event.ts`.

## Fuentes

Cormorant Garamond y Manrope se sirven desde `src/app/fonts/` con `next/font/local`
(archivos variables, subset latin, licencia OFL incluida). No se usa `next/font/google`
para que el build no dependa de descargar fuentes de Google en cada deploy.
