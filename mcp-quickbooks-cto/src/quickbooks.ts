// Helpers de QuickBooks Online + almacenamiento de tokens en Supabase
// self-hosted (tabla quickbooks_connections), escopados a UN solo
// tenant: Centro de Terapias Orientales S.A. (CTO_OWNER_USER_ID).
// Puerto a Node de supabase/functions/_shared/quickbooks.ts (Deno),
// misma lógica de refresh/consulta, sin reescribir el diseño.

const QB_ENVIRONMENT = process.env.QUICKBOOKS_ENVIRONMENT ?? "production";
const QB_API_BASE =
  QB_ENVIRONMENT === "sandbox"
    ? "https://sandbox-quickbooks.api.intuit.com"
    : "https://quickbooks.api.intuit.com";
const QB_OAUTH_TOKEN_URL = "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer";

const CLIENT_ID = process.env.QUICKBOOKS_CLIENT_ID ?? "";
const CLIENT_SECRET = process.env.QUICKBOOKS_CLIENT_SECRET ?? "";

const SUPABASE_URL = process.env.SUPABASE_URL ?? "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const CTO_OWNER_USER_ID = process.env.CTO_OWNER_USER_ID ?? "";

interface QBTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  x_refresh_token_expires_in: number;
}

interface QBConnectionRow {
  user_id: string;
  realm_id: string;
  access_token: string;
  refresh_token: string;
  access_token_expires_at: string;
  refresh_token_expires_at: string;
}

function basicAuthHeader(): string {
  return "Basic " + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");
}

async function tokenRequest(body: URLSearchParams): Promise<QBTokenResponse> {
  const res = await fetch(QB_OAUTH_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: basicAuthHeader(),
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`QuickBooks token request failed (${res.status}): ${text}`);
  }
  return (await res.json()) as QBTokenResponse;
}

async function refreshTokens(refreshToken: string): Promise<QBTokenResponse> {
  return tokenRequest(
    new URLSearchParams({ grant_type: "refresh_token", refresh_token: refreshToken })
  );
}

async function supabaseRest(path: string, init: RequestInit = {}): Promise<unknown> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase REST ${path} failed (${res.status}): ${text}`);
  }
  return res.json();
}

async function getConnection(): Promise<QBConnectionRow> {
  const rows = (await supabaseRest(
    `quickbooks_connections?user_id=eq.${CTO_OWNER_USER_ID}&select=*`
  )) as QBConnectionRow[];
  const connection = rows[0];
  if (!connection) {
    throw new Error("No hay conexión de QuickBooks guardada para Centro de Terapias Orientales.");
  }
  return connection;
}

async function saveTokens(realmId: string, tokens: QBTokenResponse): Promise<void> {
  const now = Date.now();
  await supabaseRest(`quickbooks_connections?user_id=eq.${CTO_OWNER_USER_ID}`, {
    method: "PATCH",
    body: JSON.stringify({
      realm_id: realmId,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      access_token_expires_at: new Date(now + tokens.expires_in * 1000).toISOString(),
      refresh_token_expires_at: new Date(now + tokens.x_refresh_token_expires_in * 1000).toISOString(),
    }),
  });
}

/** Devuelve un access_token vigente, refrescando si hace falta. */
export async function getValidAccessToken(): Promise<{ accessToken: string; realmId: string }> {
  const connection = await getConnection();
  const expiresAt = new Date(connection.access_token_expires_at).getTime();
  const stillValid = expiresAt - Date.now() > 60_000;

  if (stillValid) {
    return { accessToken: connection.access_token, realmId: connection.realm_id };
  }

  const refreshed = await refreshTokens(connection.refresh_token);
  await saveTokens(connection.realm_id, refreshed);
  return { accessToken: refreshed.access_token, realmId: connection.realm_id };
}

export async function qbApiFetch(path: string, init: RequestInit = {}): Promise<any> {
  const { accessToken, realmId } = await getValidAccessToken();
  const res = await fetch(`${QB_API_BASE}/v3/company/${realmId}/${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`QuickBooks API ${path} failed (${res.status}): ${JSON.stringify(json)}`);
  }
  return json;
}

export function escapeQbString(value: string): string {
  return value.replace(/'/g, "\\'");
}

export async function qbQuery(query: string): Promise<any> {
  return qbApiFetch(`query?query=${encodeURIComponent(query)}`);
}

export async function qbReport(
  reportName: string,
  params: Record<string, string> = {}
): Promise<any> {
  const qs = new URLSearchParams(params).toString();
  return qbApiFetch(`reports/${reportName}${qs ? `?${qs}` : ""}`);
}

export async function findOrCreateCustomer(input: {
  name: string;
  email?: string;
  phone?: string;
}): Promise<string> {
  const found = await qbQuery(`select * from Customer where DisplayName = '${escapeQbString(input.name)}'`);
  const existing = found?.QueryResponse?.Customer?.[0];
  if (existing) return existing.Id;

  const created = await qbApiFetch("customer", {
    method: "POST",
    body: JSON.stringify({
      DisplayName: input.name,
      PrimaryEmailAddr: input.email ? { Address: input.email } : undefined,
      PrimaryPhone: input.phone ? { FreeFormNumber: input.phone } : undefined,
    }),
  });
  return created.Customer.Id;
}

export interface QbLineInput {
  description: string;
  amount: number;
}

function buildLines(input: { amount: number; description: string; lines?: QbLineInput[] }) {
  const lines = input.lines?.length ? input.lines : [{ description: input.description, amount: input.amount }];
  return lines.map((l) => ({
    Amount: l.amount,
    DetailType: "SalesItemLineDetail",
    Description: l.description,
    SalesItemLineDetail: { ItemRef: { name: "Services", value: "1" } },
  }));
}

export async function createSalesReceipt(input: {
  customerId?: string;
  amount: number;
  description: string;
  date: string;
  lines?: QbLineInput[];
}): Promise<string> {
  const body: Record<string, unknown> = {
    Line: buildLines(input),
    TxnDate: input.date,
    PrivateNote: input.description,
  };
  if (input.customerId) body.CustomerRef = { value: input.customerId };

  const created = await qbApiFetch("salesreceipt", { method: "POST", body: JSON.stringify(body) });
  return created.SalesReceipt.Id as string;
}

export async function createInvoice(input: {
  customerId: string;
  amount: number;
  description: string;
  date: string;
  lines?: QbLineInput[];
}): Promise<string> {
  const body: Record<string, unknown> = {
    CustomerRef: { value: input.customerId },
    Line: buildLines(input),
    TxnDate: input.date,
    PrivateNote: input.description,
  };
  const created = await qbApiFetch("invoice", { method: "POST", body: JSON.stringify(body) });
  return created.Invoice.Id as string;
}
