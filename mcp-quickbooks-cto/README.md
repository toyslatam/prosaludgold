# MCP QuickBooks — Centro de Terapias Orientales

Conector MCP personalizado (Streamable HTTP) que expone la contabilidad de
QuickBooks Online de **Centro de Terapias Orientales S.A.** a quien lo
agregue como "custom connector" en Claude (claude.ai, Claude Desktop, Claude
Code). Escopado a un solo tenant: usa la conexión de QuickBooks que ya
guardó esa clínica en la app (tabla `quickbooks_connections`, self-hosted).

No reemplaza la app — es un atajo para que alguien le pida a Claude cosas
como "¿cuánto facturamos este mes?" o "créame un recibo de venta de B/.45
para Juan Pérez" sin tener que entrar a QuickBooks ni a ProSalud Gold.

## Herramientas expuestas

- `qb_query` — consulta de solo lectura estilo SQL (QBO Query Language).
- `qb_report` — reportes financieros (ProfitAndLoss, BalanceSheet, etc).
- `qb_company_info` — datos básicos de la empresa conectada.
- `qb_find_or_create_customer` — busca/crea un Customer por nombre.
- `qb_create_sales_receipt` ⚠️ — crea una venta ya cobrada (dinero real).
- `qb_create_invoice` ⚠️ — crea una factura por cobrar (dinero real).
- `qb_raw_request` — llamada directa a cualquier endpoint de la API v3.

## Seguridad

- Un único token fijo (`MCP_AUTH_TOKEN`) protege el endpoint — sin ese
  `Authorization: Bearer <token>` exacto, responde 401. Pensado para un
  grupo chico y de confianza (la dueña, el contador), no para difundirlo.
- Usa `SUPABASE_SERVICE_ROLE_KEY` para leer/refrescar el token de
  QuickBooks guardado — ese secreto nunca sale del contenedor.
- No hay sesiones de usuario ni roles: cualquiera con el token tiene
  acceso completo a esta QuickBooks (lectura y escritura).

## Desarrollo local

```bash
npm install
cp .env.example .env   # completar con credenciales reales
npm run dev
```

## Deploy (VPS, docker compose + Traefik)

El contenedor se sirve bajo el mismo dominio que ya usa la API de
ProSalud Gold, con un path dedicado:

```
https://prosaludgold-api.plataformapty.cloud/mcp/quickbooks-cto
```

En el VPS:

```bash
# copiar esta carpeta completa a /opt/mcp-quickbooks-cto (sin node_modules/dist)
cd /opt/mcp-quickbooks-cto
cp .env.example .env   # completar con las credenciales reales del VPS
docker compose up -d --build
```

Traefik (ya corriendo en el VPS para todos los proyectos) detecta las
labels automáticamente — no hace falta configurarlo aparte, siempre que el
contenedor esté en la red `traefik` como los demás servicios del host.

## Agregarlo en Claude como custom connector

Settings → Connectors → Add custom connector:

- **URL**: `https://prosaludgold-api.plataformapty.cloud/mcp/quickbooks-cto`
- **Autenticación**: header `Authorization: Bearer <MCP_AUTH_TOKEN>`
