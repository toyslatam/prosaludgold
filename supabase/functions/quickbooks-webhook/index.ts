// Recibe notificaciones de QuickBooks (solo realmId + entity id + operación).
// Por cada entidad, busca a qué clínica pertenece ese realm y actualiza el
// estado de sync local. No trae el objeto completo salvo que haga falta.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { verifyWebhookSignature } from "../_shared/quickbooks.ts";

interface QBEntity {
  name: string; // "Payment" | "Invoice" | "Bill" | "SalesReceipt" | ...
  id: string;
  operation: string; // "Create" | "Update" | "Delete" | "Merge" | "Void"
  lastUpdated: string;
}

interface QBEventNotification {
  realmId: string;
  dataChangeEvent: { entities: QBEntity[] };
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const rawBody = await req.text();
  const signature = req.headers.get("intuit-signature");
  const valid = await verifyWebhookSignature(rawBody, signature);
  if (!valid) {
    console.error("quickbooks-webhook: firma inválida");
    return new Response("Invalid signature", { status: 401 });
  }

  // Responder rápido: Intuit espera 200 en <3s. Procesamos y devolvemos ya;
  // si el procesamiento falla, solo queda logueado (no reintenta Intuit por sí solo
  // salvo error 5xx, así que devolvemos 200 siempre que la firma sea válida).
  let payload: { eventNotifications?: QBEventNotification[] };
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new Response("Bad payload", { status: 400 });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  for (const notification of payload.eventNotifications ?? []) {
    const { realmId, dataChangeEvent } = notification;

    const { data: connection } = await supabaseAdmin
      .from("quickbooks_connections")
      .select("user_id")
      .eq("realm_id", realmId)
      .maybeSingle();

    if (!connection) {
      console.warn(`quickbooks-webhook: realm ${realmId} sin conexión registrada`);
      continue;
    }

    for (const entity of dataChangeEvent.entities ?? []) {
      console.log(
        `QB webhook: ${entity.name} ${entity.operation} id=${entity.id} realm=${realmId} user=${connection.user_id}`
      );

      // Marca como sincronizado cualquier registro local que ya referencie este
      // id de QuickBooks (creado desde quickbooks-sync). El detalle completo se
      // consulta a demanda desde la UI si hace falta, no en cada webhook.
      if (entity.name === "SalesReceipt") {
        await supabaseAdmin
          .from("cash_entries")
          .update({ qb_sync_status: "synced", qb_synced_at: new Date().toISOString() })
          .eq("qb_sales_receipt_id", entity.id)
          .eq("user_id", connection.user_id);
      }

      if (entity.name === "Bill") {
        await supabaseAdmin
          .from("payroll_entries")
          .update({ qb_sync_status: "synced", qb_synced_at: new Date().toISOString() })
          .eq("qb_bill_id", entity.id)
          .eq("user_id", connection.user_id);
      }
    }
  }

  return new Response("ok", { status: 200 });
});
