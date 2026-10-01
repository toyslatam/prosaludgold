// Empuja un cash_entry o payroll_entry hacia QuickBooks (Customer/SalesReceipt
// o Vendor/Bill). Llamado por la app justo después de crear el registro.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import {
  createBill,
  createSalesReceipt,
  findOrCreateCustomer,
  findOrCreateVendor,
  getValidAccessToken,
} from "../_shared/quickbooks.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  entity: "cash_entry" | "payroll_entry";
  id: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS_HEADERS });

  const authHeader = req.headers.get("authorization") ?? "";
  const jwt = authHeader.replace(/^Bearer\s+/i, "");
  if (!jwt) {
    return Response.json({ error: "Falta autorización" }, { status: 401, headers: CORS_HEADERS });
  }

  const supabaseAsUser = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { global: { headers: { Authorization: authHeader } } }
  );
  const { data: userData, error: authErr } = await supabaseAsUser.auth.getUser(jwt);
  if (authErr || !userData?.user) {
    return Response.json({ error: "Sesión inválida" }, { status: 401, headers: CORS_HEADERS });
  }
  const userId = userData.user.id;

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "JSON inválido" }, { status: 400, headers: CORS_HEADERS });
  }

  try {
    const { accessToken, realmId } = await getValidAccessToken(supabaseAdmin, userId);

    if (body.entity === "cash_entry") {
      const result = await syncCashEntry(supabaseAdmin, accessToken, realmId, userId, body.id);
      return Response.json(result, { headers: CORS_HEADERS });
    }

    if (body.entity === "payroll_entry") {
      const result = await syncPayrollEntry(supabaseAdmin, accessToken, realmId, userId, body.id);
      return Response.json(result, { headers: CORS_HEADERS });
    }

    return Response.json({ error: "entity inválida" }, { status: 400, headers: CORS_HEADERS });
  } catch (e) {
    console.error("quickbooks-sync error", e);
    return Response.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500, headers: CORS_HEADERS }
    );
  }
});

// deno-lint-ignore no-explicit-any
async function syncCashEntry(supabaseAdmin: any, accessToken: string, realmId: string, userId: string, id: string) {
  const { data: entry, error } = await supabaseAdmin
    .from("cash_entries")
    .select("*, patients(name, email, phone)")
    .eq("id", id)
    .eq("user_id", userId)
    .single();
  if (error || !entry) throw new Error("cash_entry no encontrado");

  if (entry.type !== "ingreso") {
    await supabaseAdmin.from("cash_entries").update({ qb_sync_status: "skipped" }).eq("id", id);
    return { skipped: true, reason: "solo se sincronizan ingresos" };
  }

  let customerId: string | undefined;
  if (entry.patients?.name) {
    customerId = await findOrCreateCustomer(accessToken, realmId, entry.patients);
  }

  const salesReceiptId = await createSalesReceipt(accessToken, realmId, {
    customerId,
    amount: Number(entry.amount),
    description: entry.description,
    date: entry.date,
  });

  await supabaseAdmin
    .from("cash_entries")
    .update({
      qb_sales_receipt_id: salesReceiptId,
      qb_sync_status: "synced",
      qb_synced_at: new Date().toISOString(),
    })
    .eq("id", id);

  return { synced: true, qb_sales_receipt_id: salesReceiptId };
}

// deno-lint-ignore no-explicit-any
async function syncPayrollEntry(supabaseAdmin: any, accessToken: string, realmId: string, userId: string, id: string) {
  const { data: entry, error } = await supabaseAdmin
    .from("payroll_entries")
    .select("*, doctors(name)")
    .eq("id", id)
    .eq("user_id", userId)
    .single();
  if (error || !entry) throw new Error("payroll_entry no encontrado");

  if (entry.party !== "doctor") {
    await supabaseAdmin.from("payroll_entries").update({ qb_sync_status: "skipped" }).eq("id", id);
    return { skipped: true, reason: "solo se sincroniza la parte del profesional" };
  }

  const vendorId = await findOrCreateVendor(accessToken, realmId, entry.doctors);

  const billId = await createBill(accessToken, realmId, {
    vendorId,
    amount: Number(entry.total_amount),
    description: entry.notes ?? `Comisión ${entry.period}`,
    date: new Date().toISOString().slice(0, 10),
  });

  await supabaseAdmin
    .from("payroll_entries")
    .update({
      qb_bill_id: billId,
      qb_sync_status: "synced",
      qb_synced_at: new Date().toISOString(),
    })
    .eq("id", id);

  return { synced: true, qb_bill_id: billId };
}
