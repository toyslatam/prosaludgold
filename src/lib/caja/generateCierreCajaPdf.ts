/**
 * Genera PDF de cierre de caja: resumen de ingresos/egresos del día,
 * desglosado por medio de pago, para cuadrar la caja física contra
 * el sistema. Usa jspdf en cliente; sin backend.
 */
import { jsPDF } from "jspdf";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export interface CashEntryForClosing {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: string;
  method: string | null;
  patientName?: string | null;
}

const MARGIN = 14;
const LINE_HEIGHT = 6;
const FONT_SIZE_NORMAL = 10;
const FONT_SIZE_SMALL = 8;
const FONT_SIZE_TITLE = 14;
const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;

const METHOD_LABELS: Record<string, string> = {
  efectivo: "Efectivo",
  tarjeta: "Tarjeta",
  transferencia: "Transferencia",
  otro: "Otro",
};

export function generateCierreCajaPdf(clinicName: string, date: string, entries: CashEntryForClosing[]): void {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  let y = MARGIN;

  const pushNewLine = (inc = LINE_HEIGHT) => {
    y += inc;
    if (y > PAGE_HEIGHT - MARGIN) {
      doc.addPage();
      y = MARGIN;
    }
  };

  const text = (str: string, options?: { fontSize?: number; fontStyle?: "normal" | "bold" }) => {
    doc.setFontSize(options?.fontSize ?? FONT_SIZE_NORMAL);
    doc.setFont("helvetica", options?.fontStyle ?? "normal");
    const lines = doc.splitTextToSize(str, PAGE_WIDTH - 2 * MARGIN);
    for (const line of lines) {
      if (y > PAGE_HEIGHT - MARGIN) {
        doc.addPage();
        y = MARGIN;
      }
      doc.text(line, MARGIN, y);
      y += LINE_HEIGHT;
    }
  };

  // —— Encabezado ——
  doc.setFontSize(FONT_SIZE_TITLE);
  doc.setFont("helvetica", "bold");
  doc.text(clinicName, MARGIN, y);
  pushNewLine(8);
  doc.setFontSize(FONT_SIZE_SMALL);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Cierre de caja · ${format(parseISO(date), "d 'de' MMMM 'de' yyyy", { locale: es })}`,
    MARGIN,
    y
  );
  pushNewLine(6);
  doc.text(`Generado: ${new Date().toLocaleString("es-ES")}`, MARGIN, y);
  pushNewLine(10);

  const ingresos = entries.filter((e) => e.type === "ingreso");
  const egresos = entries.filter((e) => e.type === "egreso");
  const totalIngresos = ingresos.reduce((s, e) => s + e.amount, 0);
  const totalEgresos = egresos.reduce((s, e) => s + e.amount, 0);
  const balance = totalIngresos - totalEgresos;

  // —— Resumen ——
  doc.setFont("helvetica", "bold");
  doc.setFontSize(FONT_SIZE_NORMAL);
  doc.text("Resumen", MARGIN, y);
  pushNewLine();
  doc.setFont("helvetica", "normal");
  text(`Ingresos: $${totalIngresos.toFixed(2)}`);
  text(`Egresos: $${totalEgresos.toFixed(2)}`);
  text(`Balance: $${balance.toFixed(2)}`, { fontStyle: "bold" });
  pushNewLine();

  // —— Desglose por medio de pago ——
  doc.setFont("helvetica", "bold");
  doc.text("Desglose por medio de pago", MARGIN, y);
  pushNewLine();
  doc.setFont("helvetica", "normal");
  const methodTotals = new Map<string, { ingresos: number; egresos: number }>();
  for (const e of entries) {
    const key = e.method ?? "sin_especificar";
    const current = methodTotals.get(key) ?? { ingresos: 0, egresos: 0 };
    if (e.type === "ingreso") current.ingresos += e.amount;
    else current.egresos += e.amount;
    methodTotals.set(key, current);
  }
  if (methodTotals.size === 0) {
    text("Sin movimientos.");
  } else {
    for (const [method, totals] of methodTotals) {
      const label = METHOD_LABELS[method] ?? method;
      text(`${label}: Ingresos $${totals.ingresos.toFixed(2)} · Egresos $${totals.egresos.toFixed(2)}`);
    }
  }
  pushNewLine();

  // —— Detalle de movimientos ——
  doc.setFont("helvetica", "bold");
  doc.text("Detalle de movimientos", MARGIN, y);
  pushNewLine();
  doc.setFont("helvetica", "normal");
  doc.setFontSize(FONT_SIZE_SMALL);
  if (entries.length === 0) {
    text("No hay movimientos registrados para esta fecha.");
  } else {
    for (const e of entries) {
      const sign = e.type === "ingreso" ? "+" : "-";
      const methodLabel = e.method ? METHOD_LABELS[e.method] ?? e.method : "—";
      const patientPart = e.patientName ? ` · ${e.patientName}` : "";
      text(`${sign}$${e.amount.toFixed(2)} · ${e.description} · ${methodLabel}${patientPart}`);
    }
  }

  const dateStr = date.replace(/-/g, "");
  doc.save(`Cierre_Caja_${dateStr}.pdf`);
}
