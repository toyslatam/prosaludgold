// Conector MCP personalizado (Streamable HTTP) para QuickBooks Online de
// Centro de Terapias Orientales S.A. Pensado para agregarse en Claude como
// "custom connector" — expone herramientas de lectura/escritura sobre la
// única conexión QB ya guardada para esa clínica.
import express from "express";
import { randomUUID } from "node:crypto";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";
import {
  qbQuery,
  qbReport,
  qbApiFetch,
  findOrCreateCustomer,
  createSalesReceipt,
  createInvoice,
} from "./quickbooks.js";

const PORT = Number(process.env.PORT ?? 3000);
const MCP_AUTH_TOKEN = process.env.MCP_AUTH_TOKEN ?? "";

if (!MCP_AUTH_TOKEN) {
  console.error("Falta MCP_AUTH_TOKEN — el servidor no puede arrancar sin un token de autorización.");
  process.exit(1);
}

function buildServer(): McpServer {
  const server = new McpServer({
    name: "quickbooks-centro-terapias-orientales",
    version: "1.0.0",
  });

  server.registerTool(
    "qb_query",
    {
      title: "Consultar QuickBooks (SQL-like)",
      description:
        "Ejecuta una consulta de solo lectura estilo SQL contra QuickBooks Online " +
        "(QBO Query Language). Ej: \"select * from Invoice where TxnDate >= '2026-09-01' maxresults 50\", " +
        "\"select * from Customer\", \"select * from Item\". Entidades típicas: Customer, Vendor, " +
        "Invoice, SalesReceipt, Bill, Payment, Item, Account, JournalEntry.",
      inputSchema: { query: z.string().describe("Consulta QBO, ej: select * from Invoice maxresults 20") },
    },
    async ({ query }) => {
      const result = await qbQuery(query);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.registerTool(
    "qb_report",
    {
      title: "Reporte financiero de QuickBooks",
      description:
        "Obtiene un reporte financiero estándar de QuickBooks (ProfitAndLoss, BalanceSheet, " +
        "CashFlow, GeneralLedger, CustomerBalance, etc). Acepta parámetros opcionales como " +
        "start_date/end_date (YYYY-MM-DD) o date_macro (This Month, Last Month, This Fiscal Year...).",
      inputSchema: {
        reportName: z.string().describe("Nombre del reporte QBO, ej: ProfitAndLoss, BalanceSheet"),
        startDate: z.string().optional().describe("YYYY-MM-DD"),
        endDate: z.string().optional().describe("YYYY-MM-DD"),
        dateMacro: z.string().optional().describe("Ej: This Month, Last Month, This Fiscal Year"),
      },
    },
    async ({ reportName, startDate, endDate, dateMacro }) => {
      const params: Record<string, string> = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      if (dateMacro) params.date_macro = dateMacro;
      const result = await qbReport(reportName, params);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.registerTool(
    "qb_company_info",
    {
      title: "Información de la empresa en QuickBooks",
      description: "Devuelve los datos básicos de la empresa QuickBooks conectada (nombre legal, dirección, etc).",
      inputSchema: {},
    },
    async () => {
      const found = await qbQuery("select * from CompanyInfo");
      const info = found?.QueryResponse?.CompanyInfo?.[0] ?? null;
      return { content: [{ type: "text", text: JSON.stringify(info, null, 2) }] };
    }
  );

  server.registerTool(
    "qb_find_or_create_customer",
    {
      title: "Buscar o crear cliente en QuickBooks",
      description: "Busca un Customer de QuickBooks por nombre exacto; si no existe, lo crea. Devuelve su Id.",
      inputSchema: {
        name: z.string(),
        email: z.string().optional(),
        phone: z.string().optional(),
      },
    },
    async ({ name, email, phone }) => {
      const id = await findOrCreateCustomer({ name, email, phone });
      return { content: [{ type: "text", text: JSON.stringify({ customerId: id }) }] };
    }
  );

  server.registerTool(
    "qb_create_sales_receipt",
    {
      title: "⚠️ Crear recibo de venta en QuickBooks (transacción real)",
      description:
        "Crea un Sales Receipt (venta ya cobrada) REAL en QuickBooks de producción — mueve dinero/" +
        "contabilidad de verdad, no es una prueba. Confirma con la persona antes de usarlo. " +
        "Si no se da customerId, queda sin cliente asociado (consumidor final).",
      inputSchema: {
        amount: z.number().positive(),
        description: z.string(),
        date: z.string().describe("YYYY-MM-DD"),
        customerId: z.string().optional(),
      },
    },
    async ({ amount, description, date, customerId }) => {
      const id = await createSalesReceipt({ amount, description, date, customerId });
      return { content: [{ type: "text", text: JSON.stringify({ salesReceiptId: id }) }] };
    }
  );

  server.registerTool(
    "qb_create_invoice",
    {
      title: "⚠️ Crear factura (por cobrar) en QuickBooks (transacción real)",
      description:
        "Crea una Invoice (cuenta por cobrar) REAL en QuickBooks de producción. Requiere customerId " +
        "— usa qb_find_or_create_customer primero si hace falta. Confirma con la persona antes de usarlo.",
      inputSchema: {
        customerId: z.string(),
        amount: z.number().positive(),
        description: z.string(),
        date: z.string().describe("YYYY-MM-DD"),
      },
    },
    async ({ customerId, amount, description, date }) => {
      const id = await createInvoice({ customerId, amount, description, date });
      return { content: [{ type: "text", text: JSON.stringify({ invoiceId: id }) }] };
    }
  );

  server.registerTool(
    "qb_raw_request",
    {
      title: "Llamada cruda a la API de QuickBooks (avanzado)",
      description:
        "Para casos no cubiertos por las otras herramientas: llama directamente a un endpoint de la " +
        "API v3 de QuickBooks (relativo a /v3/company/{realmId}/). Ej path=\"item\", method=\"GET\". " +
        "Para escrituras (POST/PATCH) pasa el body como JSON en bodyJson.",
      inputSchema: {
        path: z.string().describe('Ej: "item", "account", "payment/123"'),
        method: z.enum(["GET", "POST", "PATCH"]).default("GET"),
        bodyJson: z.string().optional().describe("Body JSON como texto, solo para POST/PATCH"),
      },
    },
    async ({ path, method, bodyJson }) => {
      const result = await qbApiFetch(path, {
        method,
        ...(bodyJson ? { body: bodyJson } : {}),
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  return server;
}

const app = express();
app.use(express.json({ limit: "2mb" }));

app.get("/healthz", (_req, res) => res.json({ ok: true }));

// Traefik expone esto como https://prosaludgold-api.plataformapty.cloud/mcp/quickbooks-cto
// y quita ese prefijo antes de llegar aquí (stripprefix), así que el endpoint MCP
// real dentro del contenedor vive en la raíz "/".
app.post("/", async (req, res) => {
  const auth = req.headers.authorization ?? "";
  if (auth !== `Bearer ${MCP_AUTH_TOKEN}`) {
    res.status(401).json({ error: "No autorizado" });
    return;
  }

  // Modo stateless: un server+transport nuevo por request, se cierra al terminar.
  const server = buildServer();
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });

  res.on("close", () => {
    transport.close();
    server.close();
  });

  try {
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (err) {
    console.error("Error manejando request MCP:", err);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: { code: -32603, message: "Internal server error" },
        id: null,
      });
    }
  }
});

app.get("/", (req, res) => {
  const auth = req.headers.authorization ?? "";
  if (auth !== `Bearer ${MCP_AUTH_TOKEN}`) {
    res.status(401).json({ error: "No autorizado" });
    return;
  }
  // Streamable HTTP stateless: no hay stream de servidor a mantener sin sesión.
  res.status(405).json({ error: "Method not allowed (modo stateless, sin sesiones)" });
});

app.listen(PORT, () => {
  console.log(`MCP QuickBooks (Centro de Terapias Orientales) escuchando en :${PORT}`);
});
