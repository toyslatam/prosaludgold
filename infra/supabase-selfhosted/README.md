# Migración: Supabase Cloud → Supabase self-hosted (VPS)

Runbook para mover ProSalud Gold del proyecto Cloud (`pdgedgpnjazslrbsgchd`, `*.supabase.co`)
a un stack Supabase self-hosted en tu VPS (Docker ya instalado). No cambia código de la app,
solo dónde vive el backend.

Reemplaza estos placeholders en todo el documento antes de ejecutar:

- `TU_DOMINIO` → subdominio que vas a usar, ej. `supabase.prosaludgold.com`
- `TU_VPS_IP` → IP pública del VPS (solo si aún no apuntaste el DNS)

---

## 0. Antes de empezar

- [ ] DNS: crea un registro `A` de `TU_DOMINIO` → IP del VPS (o `TU_VPS_IP` si vas a probar sin DNS primero).
- [ ] Puertos abiertos en el firewall del VPS: `80` y `443` (Kong/Caddy), `22` (SSH).
- [ ] Docker + Docker Compose v2 funcionando (`docker compose version`).
- [ ] Tener a mano, del proyecto Supabase Cloud actual (Dashboard → Project Settings → API / Database):
  - `Project URL` (`https://pdgedgpnjazslrbsgchd.supabase.co`)
  - `anon` key y `service_role` key
  - Connection string de Postgres (Database → Connection string → "URI", modo *Session* o *Transaction pooler* desactivado para el dump)

---

## 1. Clonar el repo oficial de Supabase self-hosted

En el VPS, por SSH:

```bash
git clone --depth 1 https://github.com/supabase/supabase
cd supabase/docker
cp .env.example .env
```

No reescribimos el `docker-compose.yml` a mano: usamos el oficial del repo (`supabase/docker/docker-compose.yml`),
que ya trae Kong (gateway), GoTrue (auth), PostgREST, Realtime, Storage, Postgres, Studio e ImgProxy.

## 2. Generar secretos propios

**Nunca** dejes los valores de ejemplo del `.env.example` (son públicos y conocidos). Genera los tuyos:

```bash
# JWT secret (mínimo 32 caracteres)
openssl rand -base64 32

# Postgres password
openssl rand -base64 24

# Dashboard (Studio) usuario/clave — los que tú quieras
```

Con el JWT secret generado, crea el `anon` key y el `service_role` key firmados con ese secret.
La forma más simple es usar el generador oficial:
https://supabase.com/docs/guides/self-hosting/docker#generate-api-keys
(pega tu JWT secret ahí, o usa el script `generate-jwt.mjs` que incluye el repo en algunas versiones).

Edita `supabase/docker/.env` con:

```env
POSTGRES_PASSWORD=<el que generaste>
JWT_SECRET=<el que generaste>
ANON_KEY=<generado a partir del JWT secret>
SERVICE_ROLE_KEY=<generado a partir del JWT secret>

DASHBOARD_USERNAME=<usuario studio>
DASHBOARD_PASSWORD=<clave studio, fuerte>

SITE_URL=https://TU_DOMINIO
API_EXTERNAL_URL=https://TU_DOMINIO
SUPABASE_PUBLIC_URL=https://TU_DOMINIO

# SMTP propio (self-hosted no trae correo integrado como Cloud)
SMTP_ADMIN_EMAIL=admin@tudominio.com
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_SENDER_NAME=ProSalud Gold
```

Guarda estos valores también fuera del VPS (gestor de contraseñas) — los vas a necesitar para el `.env` de la app.

## 3. Levantar el stack

```bash
docker compose pull
docker compose up -d
docker compose ps   # todos los servicios en "healthy"/"running"
```

Studio queda disponible en `http://TU_VPS_IP:8000` (o `https://TU_DOMINIO` una vez configurado el proxy del paso 4).

## 4. Proxy inverso + TLS (Caddy)

Usa el `Caddyfile` incluido en esta carpeta (`Caddyfile`). Instala Caddy en el VPS (fuera de los contenedores de Supabase,
o como servicio adicional) y apúntalo al puerto de Kong (por defecto `8000`):

```bash
sudo cp Caddyfile /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

Caddy gestiona el certificado TLS automáticamente vía Let's Encrypt usando `TU_DOMINIO`.

## 5. Migrar la base de datos (Cloud → self-hosted)

Desde tu máquina local (no desde el VPS, para no exponer credenciales del Cloud ahí), usando `pg_dump`/`pg_restore`
de un cliente Postgres 15+:

```bash
# 5.1 Dump del proyecto Cloud (schema + datos, sin roles internos de Supabase)
pg_dump "postgresql://postgres:<PASSWORD_CLOUD>@db.pdgedgpnjazslrbsgchd.supabase.co:5432/postgres" \
  --schema=public \
  --no-owner --no-privileges \
  -F c -f prosaludgold_cloud.dump

# 5.2 Restaurar en el Postgres del VPS (puerto expuesto por el stack, revisa docker-compose.yml)
pg_restore "postgresql://postgres:<POSTGRES_PASSWORD_VPS>@TU_DOMINIO:5432/postgres" \
  --no-owner --no-privileges \
  -F c prosaludgold_cloud.dump
```

Después, aplica en orden (si el dump no las trajo ya, o para verificar) las 12 migraciones del repo
(`supabase/migrations/001_*.sql` … `012_payroll_party_split.sql`) contra el Postgres del VPS, usando el
SQL Editor de Studio self-hosted (mismo flujo manual que ya usas hoy en Cloud).

**Verificación**: compara `select count(*) from <tabla>` de unas cuantas tablas clave (patients, doctors,
payroll_entries, encounters) entre Cloud y self-hosted antes de cortar el tráfico.

## 6. Storage (si usas buckets)

Si la app sube archivos a Supabase Storage, descárgalos del Cloud (Dashboard → Storage, o vía API con la
`service_role` key) y súbelos al bucket equivalente en el self-hosted antes de cambiar el `.env` de la app,
para no perder continuidad de archivos ya referenciados en la base de datos.

## 7. Edge Functions

`supabase/functions/issue-invoice` y `supabase/functions/onboarding-agent` corren en Deno. El self-hosted
soporta Edge Functions vía el contenedor `functions` del stack (Deno relay). Despliega con la CLI de Supabase
apuntando al proyecto self-hosted:

```bash
supabase functions deploy issue-invoice --project-ref TU_DOMINIO_O_REF_LOCAL
supabase functions deploy onboarding-agent --project-ref TU_DOMINIO_O_REF_LOCAL
```

Revisa que los secrets que usan esas funciones (ej. `ANTHROPIC_API_KEY`) se configuren de nuevo en el
entorno self-hosted (`supabase secrets set ...` contra el stack local).

## 8. Apuntar la app al nuevo backend

En tu `.env` local y en Vercel (Production + Preview):

```env
VITE_SUPABASE_URL=https://TU_DOMINIO
VITE_SUPABASE_PUBLISHABLE_KEY=<ANON_KEY generado en el paso 2>
```

Regenera `src/integrations/supabase/types.ts` contra el nuevo proyecto:

```bash
npx supabase gen types typescript --project-id TU_DOMINIO --schema public > src/integrations/supabase/types.ts
```

(o usando el flag `--db-url` apuntando directo al Postgres del VPS si `--project-id` no aplica en self-hosted).

## 9. Corte

1. Despliega la app en Vercel con las nuevas env vars (primero en Preview para probar).
2. Prueba login, lectura/escritura en cada módulo (dental/medical/spa), generación de comisiones, PDF, etc.
3. Cuando esté validado, actualiza Production en Vercel y redeploya.
4. Deja el proyecto Cloud activo unos días como respaldo de solo lectura antes de pausarlo/eliminarlo.

---

## Rollback

Si algo falla, revertir es solo volver a poner las env vars de Cloud (`VITE_SUPABASE_URL` /
`VITE_SUPABASE_PUBLISHABLE_KEY`) en Vercel y redeploy — el proyecto Cloud sigue intacto mientras no lo
elimines.
