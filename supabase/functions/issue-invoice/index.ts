import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// Token de cuenta de eFacturaPty (Bearer fijo obtenido desde su portal).
// Configurar en Supabase Dashboard → Edge Functions → issue-invoice → Secrets.
const EFACTURA_API_TOKEN = Deno.env.get("EFACTURA_API_TOKEN") ?? "";
const EFACTURA_BASE_URL = "https://api.efacturapty.com/api/v1";

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate?: number;
}

interface RequestBody {
  buyerName: string;
  buyerRuc?: string;
  buyerEmail?: string;
  items: InvoiceItem[];
  subtotal: number;
  taxTotal: number;
  total: number;
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }
  if (req.method !== "POST") {
    return jsonResponse({ ok: false, error: "Method not allowed" }, 405);
  }
  if (!EFACTURA_API_TOKEN) {
    return jsonResponse(
      { ok: false, error: "Facturación electrónica no configurada (falta EFACTURA_API_TOKEN)." },
      500
    );
  }

  try {
    const body: RequestBody = await req.json();
    if (!body.buyerName || !body.items?.length) {
      return jsonResponse({ ok: false, error: "Faltan datos del comprador o renglones de la factura." }, 400);
    }

    // ── 1. Emitir la factura ──────────────────────────────────────
    // NOTA: "datosGenerales" solo incluye por ahora tipoEmision/tipoDocumento/
    // numeroDocumento/puntoFacturacion/fechaEmision/informacionReceptor,
    // confirmados contra la documentación. Los renglones (items) y los
    // totales (subtotal/impuestos/total) del payload real de eFacturaPty
    // AÚN NO están mapeados — falta confirmar el nombre exacto de esos
    // campos en "datosGenerales" (ej. "detalleItem", "totales", etc.).
    // Ver TODO más abajo antes de usar esto en producción.
    const invoicePayload = {
      datosGenerales: {
        tipoEmision: "01",
        tipoDocumento: "01", // Factura de Operación Interna
        numeroDocumento: await nextInvoiceNumber(),
        puntoFacturacion: "001",
        fechaEmision: new Date().toISOString(),
        informacionReceptor: {
          tipoReceptorFe: body.buyerRuc ? "01" : "02", // 01 = con RUC, 02 = consumidor final (a confirmar)
          ...(body.buyerRuc
            ? {
                datosRucReceptor: {
                  tipoContribuyente: 2,
                  rucReceptor: body.buyerRuc,
                  digitoVerificador: "",
                },
              }
            : {}),
        },
        // TODO: agregar aquí los renglones (items) y totales una vez
        // confirmado el nombre exacto de esos campos en la documentación.
      },
    };

    const issueRes = await fetch(`${EFACTURA_BASE_URL}/Invoices?qr=false&xml=false`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${EFACTURA_API_TOKEN}`,
        "Accept-Language": "es-PA",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(invoicePayload),
    });

    if (!issueRes.ok) {
      const errText = await issueRes.text();
      return jsonResponse({ ok: false, error: `eFacturaPty rechazó la factura: ${errText}` }, 502);
    }

    const issueData = await issueRes.json();
    const invoiceId: string | undefined = issueData?.id;
    if (!invoiceId) {
      return jsonResponse({ ok: false, error: "eFacturaPty no devolvió un id de factura." }, 502);
    }

    // ── 2. Descargar el PDF (CAFE) ────────────────────────────────
    const pdfRes = await fetch(`${EFACTURA_BASE_URL}/Invoices/${invoiceId}/cafe-file`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${EFACTURA_API_TOKEN}`,
        "Accept-Language": "es-PA",
      },
    });

    let pdfBase64: string | null = null;
    if (pdfRes.ok) {
      const pdfBuffer = await pdfRes.arrayBuffer();
      pdfBase64 = btoa(String.fromCharCode(...new Uint8Array(pdfBuffer)));
    }

    return jsonResponse({
      ok: true,
      externalId: invoiceId,
      cufe: issueData?.cufe ?? null,
      pdfBase64,
    });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) }, 500);
  }
});

// TODO: reemplazar por la numeración real requerida por DGI (secuencial por
// puntoFacturacion, sin saltos). Por ahora es un placeholder basado en tiempo.
async function nextInvoiceNumber(): Promise<string> {
  return String(Date.now()).slice(-10).padStart(10, "0");
}
