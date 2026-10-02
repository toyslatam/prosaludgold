// Helpers compartidos para la integración QuickBooks Online.
// Usado por: quickbooks-oauth-start, quickbooks-oauth-callback,
// quickbooks-webhook, quickbooks-sync.

const QB_ENVIRONMENT = Deno.env.get("QUICKBOOKS_ENVIRONMENT") ?? "production";
const QB_API_BASE =
  QB_ENVIRONMENT === "sandbox"
    ? "https://sandbox-quickbooks.api.intuit.com"
    : "https://quickbooks.api.intuit.com";
const QB_OAUTH_TOKEN_URL = "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer";
const QB_AUTHORIZE_URL = "https://appcenter.intuit.com/connect/oauth2";

const CLIENT_ID = Deno.env.get("QUICKBOOKS_CLIENT_ID") ?? "";
const CLIENT_SECRET = Deno.env.get("QUICKBOOKS_CLIENT_SECRET") ?? "";
const REDIRECT_URI = Deno.env.get("QUICKBOOKS_REDIRECT_URI") ?? "";

export interface QBConnectionRow {
  user_id: string;
  realm_id: string;
  access_token: string;
  refresh_token: string;
  access_token_expires_at: string;
  refresh_token_expires_at: string;
}

interface QBTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  x_refresh_token_expires_in: number;
}

function basicAuthHeader(): string {
  return "Basic " + btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);
}

export function buildAuthorizeUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    scope: "com.intuit.quickbooks.accounting",
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    state,
  });
  return `${QB_AUTHORIZE_URL}?${params.toString()}`;
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
  return await res.json();
}

export async function exchangeCodeForTokens(code: string) {
  return await tokenRequest(
    new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: REDIRECT_URI,
    })
  );
}

export async function refreshTokens(refreshToken: string) {
  return await tokenRequest(
    new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    })
  );
}

function tokensToRow(
  userId: string,
  realmId: string,
  tokens: QBTokenResponse
): Omit<QBConnectionRow, never> {
  const now = Date.now();
  return {
    user_id: userId,
    realm_id: realmId,
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    access_token_expires_at: new Date(now + tokens.expires_in * 1000).toISOString(),
    refresh_token_expires_at: new Date(
      now + tokens.x_refresh_token_expires_in * 1000
    ).toISOString(),
  };
}

// deno-lint-ignore no-explicit-any
export async function saveConnection(supabaseAdmin: any, userId: string, realmId: string, tokens: QBTokenResponse) {
  const row = tokensToRow(userId, realmId, tokens);
  const { error } = await supabaseAdmin
    .from("quickbooks_connections")
    .upsert(row, { onConflict: "user_id" });
  if (error) throw error;
}

/** Devuelve un access_token vigente para el usuario, refrescando si hace falta. */
// deno-lint-ignore no-explicit-any
export async function getValidAccessToken(
  supabaseAdmin: any,
  userId: string
): Promise<{ accessToken: string; realmId: string }> {
  const { data: connection, error } = await supabaseAdmin
    .from("quickbooks_connections")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  if (!connection) throw new Error("No hay conexión de QuickBooks para este usuario.");

  const expiresAt = new Date(connection.access_token_expires_at).getTime();
  const stillValid = expiresAt - Date.now() > 60_000; // margen de 1 min

  if (stillValid) {
    return { accessToken: connection.access_token, realmId: connection.realm_id };
  }

  const refreshed = await refreshTokens(connection.refresh_token);
  await saveConnection(supabaseAdmin, userId, connection.realm_id, refreshed);
  return { accessToken: refreshed.access_token, realmId: connection.realm_id };
}

export async function qbApiFetch(
  accessToken: string,
  realmId: string,
  path: string,
  init: RequestInit = {}
) {
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

function escapeQbString(value: string): string {
  return value.replace(/'/g, "\\'");
}

/** Busca un Customer por nombre; si no existe, lo crea. Devuelve el Id de QuickBooks. */
export async function findOrCreateCustomer(
  accessToken: string,
  realmId: string,
  patient: { name: string; email?: string | null; phone?: string | null }
): Promise<string> {
  const query = `select * from Customer where DisplayName = '${escapeQbString(patient.name)}'`;
  const found = await qbApiFetch(
    accessToken,
    realmId,
    `query?query=${encodeURIComponent(query)}`
  );
  const existing = found?.QueryResponse?.Customer?.[0];
  if (existing) return existing.Id;

  const created = await qbApiFetch(accessToken, realmId, "customer", {
    method: "POST",
    body: JSON.stringify({
      DisplayName: patient.name,
      PrimaryEmailAddr: patient.email ? { Address: patient.email } : undefined,
      PrimaryPhone: patient.phone ? { FreeFormNumber: patient.phone } : undefined,
    }),
  });
  return created.Customer.Id;
}

/** Busca un Vendor por nombre (doctor); si no existe, lo crea. Devuelve el Id de QuickBooks. */
export async function findOrCreateVendor(
  accessToken: string,
  realmId: string,
  doctor: { name: string }
): Promise<string> {
  const query = `select * from Vendor where DisplayName = '${escapeQbString(doctor.name)}'`;
  const found = await qbApiFetch(
    accessToken,
    realmId,
    `query?query=${encodeURIComponent(query)}`
  );
  const existing = found?.QueryResponse?.Vendor?.[0];
  if (existing) return existing.Id;

  const created = await qbApiFetch(accessToken, realmId, "vendor", {
    method: "POST",
    body: JSON.stringify({ DisplayName: doctor.name }),
  });
  return created.Vendor.Id;
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
    SalesItemLineDetail: {
      ItemRef: { name: "Services", value: "1" },
    },
  }));
}

/** Requiere una cuenta de ingresos por defecto configurada en QuickBooks (Sales of Product Income). */
export async function createSalesReceipt(
  accessToken: string,
  realmId: string,
  input: { customerId?: string; amount: number; description: string; date: string; lines?: QbLineInput[] }
) {
  const body: Record<string, unknown> = {
    Line: buildLines(input),
    TxnDate: input.date,
    PrivateNote: input.description,
  };
  if (input.customerId) body.CustomerRef = { value: input.customerId };

  const created = await qbApiFetch(accessToken, realmId, "salesreceipt", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return created.SalesReceipt.Id as string;
}

/** Factura (cuenta por cobrar) — a diferencia del Sales Receipt, requiere Customer. */
export async function createInvoice(
  accessToken: string,
  realmId: string,
  input: { customerId: string; amount: number; description: string; date: string; lines?: QbLineInput[] }
) {
  const body: Record<string, unknown> = {
    CustomerRef: { value: input.customerId },
    Line: buildLines(input),
    TxnDate: input.date,
    PrivateNote: input.description,
  };

  const created = await qbApiFetch(accessToken, realmId, "invoice", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return created.Invoice.Id as string;
}

export async function createBill(
  accessToken: string,
  realmId: string,
  input: { vendorId: string; amount: number; description: string; date: string }
) {
  const created = await qbApiFetch(accessToken, realmId, "bill", {
    method: "POST",
    body: JSON.stringify({
      VendorRef: { value: input.vendorId },
      TxnDate: input.date,
      PrivateNote: input.description,
      Line: [
        {
          Amount: input.amount,
          DetailType: "AccountBasedExpenseLineDetail",
          Description: input.description,
          AccountBasedExpenseLineDetail: {
            AccountRef: { name: "Payroll Expenses", value: "1" },
          },
        },
      ],
    }),
  });
  return created.Bill.Id as string;
}

/** Verifica la firma HMAC-SHA256 de un webhook de Intuit contra el verifier token. */
export async function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string | null
): Promise<boolean> {
  const verifierToken = Deno.env.get("QUICKBOOKS_WEBHOOK_VERIFIER_TOKEN") ?? "";
  if (!signatureHeader || !verifierToken) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(verifierToken),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signatureBytes = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(rawBody));
  const computed = btoa(String.fromCharCode(...new Uint8Array(signatureBytes)));
  return computed === signatureHeader;
}
