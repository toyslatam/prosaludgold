/**
 * Facturación electrónica (Panamá, vía PAC). La emisión real (firma XML,
 * envío a DGI) ocurre en la edge function `issue-invoice`; este módulo solo
 * arma el payload, la invoca y persiste el resultado en `invoices`.
 */

import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  /** % de ITBMS (impuesto) aplicado a este renglón, ej. 7 */
  taxRate?: number;
}

export type InvoiceStatus = "draft" | "pending" | "issued" | "error" | "cancelled";

export interface Invoice {
  id: string;
  patientId: string;
  treatmentPlanId?: string;
  buyerName: string;
  buyerRuc?: string;
  buyerEmail?: string;
  items: InvoiceItem[];
  subtotal: number;
  taxTotal: number;
  total: number;
  currency: string;
  status: InvoiceStatus;
  provider: string;
  externalId?: string;
  cufe?: string;
  pdfUrl?: string;
  errorMessage?: string;
  createdAt: string;
  issuedAt?: string;
}

function fromRow(row: Tables<"invoices">): Invoice {
  return {
    id: row.id,
    patientId: row.patient_id,
    treatmentPlanId: row.treatment_plan_id ?? undefined,
    buyerName: row.buyer_name,
    buyerRuc: row.buyer_ruc ?? undefined,
    buyerEmail: row.buyer_email ?? undefined,
    items: (row.items as unknown as InvoiceItem[]) ?? [],
    subtotal: Number(row.subtotal),
    taxTotal: Number(row.tax_total),
    total: Number(row.total),
    currency: row.currency,
    status: row.status,
    provider: row.provider,
    externalId: row.external_id ?? undefined,
    cufe: row.cufe ?? undefined,
    pdfUrl: row.pdf_url ?? undefined,
    errorMessage: row.error_message ?? undefined,
    createdAt: row.created_at,
    issuedAt: row.issued_at ?? undefined,
  };
}

export function computeInvoiceTotals(items: InvoiceItem[]) {
  const subtotal = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const taxTotal = items.reduce(
    (s, i) => s + i.quantity * i.unitPrice * ((i.taxRate ?? 0) / 100),
    0
  );
  return { subtotal, taxTotal, total: subtotal + taxTotal };
}

export async function getInvoicesByPatient(patientId: string): Promise<Invoice[]> {
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(fromRow);
}

export interface IssueInvoiceInput {
  patientId: string;
  treatmentPlanId?: string;
  buyerName: string;
  buyerRuc?: string;
  buyerEmail?: string;
  items: InvoiceItem[];
}

/** Resultado que devuelve la edge function `issue-invoice` (proxy al PAC). */
interface IssueInvoiceFnResponse {
  ok: boolean;
  externalId?: string;
  cufe?: string;
  /** PDF (CAFE) en base64; se sube a Storage en el cliente para obtener una URL firmada. */
  pdfBase64?: string;
  error?: string;
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

const PDF_SIGNED_URL_TTL_SECONDS = 60 * 60 * 24 * 365; // 1 año

async function uploadInvoicePdf(userId: string, invoiceId: string, base64: string): Promise<string | null> {
  const path = `${userId}/${invoiceId}.pdf`;
  const { error: uploadError } = await supabase.storage
    .from("invoices")
    .upload(path, base64ToUint8Array(base64), { contentType: "application/pdf", upsert: true });
  if (uploadError) return null;

  const { data, error } = await supabase.storage
    .from("invoices")
    .createSignedUrl(path, PDF_SIGNED_URL_TTL_SECONDS);
  if (error) return null;
  return data.signedUrl;
}

/** Arma el payload, invoca al PAC vía la edge function, y guarda el resultado (éxito o error). */
export async function issueInvoice(data: IssueInvoiceInput): Promise<Invoice> {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) throw new Error("No autenticado");

  if (data.items.length === 0) {
    throw new Error("La factura debe tener al menos un renglón");
  }

  const { subtotal, taxTotal, total } = computeInvoiceTotals(data.items);

  const { data: fnData, error: fnError } = await supabase.functions.invoke<IssueInvoiceFnResponse>(
    "issue-invoice",
    {
      body: {
        buyerName: data.buyerName,
        buyerRuc: data.buyerRuc,
        buyerEmail: data.buyerEmail,
        items: data.items,
        subtotal,
        taxTotal,
        total,
      },
    }
  );

  const succeeded = !fnError && fnData?.ok;
  const status: InvoiceStatus = succeeded ? "issued" : "error";
  const errorMessage = fnError?.message ?? (fnData && !fnData.ok ? fnData.error : undefined) ?? null;

  const { data: row, error } = await supabase
    .from("invoices")
    .insert({
      user_id: user.id,
      patient_id: data.patientId,
      treatment_plan_id: data.treatmentPlanId ?? null,
      buyer_name: data.buyerName,
      buyer_ruc: data.buyerRuc ?? null,
      buyer_email: data.buyerEmail ?? null,
      items: data.items as unknown as Tables<"invoices">["items"],
      subtotal,
      tax_total: taxTotal,
      total,
      status,
      provider: "efactura_pty",
      external_id: fnData?.externalId ?? null,
      cufe: fnData?.cufe ?? null,
      error_message: errorMessage,
      issued_at: succeeded ? new Date().toISOString() : null,
    })
    .select()
    .single();
  if (error) throw error;

  let finalRow = row;
  if (succeeded && fnData?.pdfBase64) {
    const pdfUrl = await uploadInvoicePdf(user.id, row.id, fnData.pdfBase64);
    if (pdfUrl) {
      const { data: updated } = await supabase
        .from("invoices")
        .update({ pdf_url: pdfUrl })
        .eq("id", row.id)
        .select()
        .single();
      if (updated) finalRow = updated;
    }
  }

  const invoice = fromRow(finalRow);
  if (!succeeded) {
    throw Object.assign(new Error(errorMessage ?? "No se pudo emitir la factura."), { invoice });
  }
  return invoice;
}
