/**
 * Genera PDF de historia clínica dental (formato estándar).
 * Usa jspdf en cliente; sin backend.
 */
import { jsPDF } from "jspdf";
import type { Patient } from "@/data/mockData";
import { mockDoctors } from "@/data/mockData";
import { getClinicalEventsByPatient, type ClinicalEvent } from "./clinicalHistory";
import { getDentalChart, DENTAL_CONDITION_LABELS } from "./dentalChart";
import { getEvolucionesByPatient } from "./evoluciones";
import { getClinicalDocumentsByPatient } from "./clinicalDocuments";
import { getConsentimientosByPatient } from "./consentimientos";
import { differenceInYears, parseISO } from "date-fns";

const CLINIC_NAME = "Clínica Dental (Demo)";
const MARGIN = 14;
const LINE_HEIGHT = 6;
const FONT_SIZE_NORMAL = 10;
const FONT_SIZE_SMALL = 8;
const FONT_SIZE_TITLE = 14;
const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;

function getGenderLabel(gender?: string): string {
  if (!gender) return "—";
  if (gender === "M") return "Masculino";
  if (gender === "F") return "Femenino";
  return gender;
}

export function generateClinicalHistoryPdf(patient: Patient): void {
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
  doc.text(CLINIC_NAME, MARGIN, y);
  pushNewLine(8);
  doc.setFontSize(FONT_SIZE_SMALL);
  doc.setFont("helvetica", "normal");
  doc.text(`Fecha de emisión: ${new Date().toLocaleDateString("es-ES", { dateStyle: "long" })}`, MARGIN, y);
  pushNewLine(10);

  // —— Datos del paciente ——
  doc.setFontSize(FONT_SIZE_NORMAL);
  doc.setFont("helvetica", "bold");
  doc.text("Datos del paciente", MARGIN, y);
  pushNewLine();
  doc.setFont("helvetica", "normal");
  const age = patient.birthDate ? differenceInYears(new Date(), parseISO(patient.birthDate)) : null;
  text(`Nombre: ${patient.name}`);
  text(`ID: ${patient.id}`);
  text(`Cédula: ${patient.cedula}`);
  text(`Sexo: ${getGenderLabel(patient.gender)}`);
  text(`Edad: ${age != null ? `${age} años` : "—"}`);
  text(`Teléfono: ${patient.phone}`);
  text(`Email: ${patient.email}`);
  text(`Dirección: ${patient.address || "—"}`);
  pushNewLine();

  // —— Convenio / Sede ——
  doc.setFont("helvetica", "bold");
  doc.text("Convenio y sede", MARGIN, y);
  pushNewLine();
  doc.setFont("helvetica", "normal");
  text(`Convenio/Plan: ${patient.benefits || "—"}`);
  text(`Sede: ${patient.branch || "—"}`);
  pushNewLine();

  // —— Equipo a cargo ——
  doc.setFont("helvetica", "bold");
  doc.text("Equipo a cargo", MARGIN, y);
  pushNewLine();
  doc.setFont("helvetica", "normal");
  const mainDoctor = patient.assignedDoctorId
    ? mockDoctors.find((d) => d.id === patient.assignedDoctorId)?.name
    : null;
  text(`Profesional principal: ${mainDoctor || "—"}`);
  text(`Colaboradores: ${patient.collaborators?.length ? patient.collaborators.join(", ") : "—"}`);
  pushNewLine();

  // —— Historial de visitas ——
  doc.setFont("helvetica", "bold");
  doc.text("Historial de visitas", MARGIN, y);
  pushNewLine();
  const events = getClinicalEventsByPatient(patient.id).filter((e) => !e.cancelled);
  const sortedEvents = [...events].sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time));
  doc.setFont("helvetica", "normal");
  doc.setFontSize(FONT_SIZE_SMALL);
  if (sortedEvents.length === 0) {
    text("Sin visitas registradas.");
  } else {
    for (const e of sortedEvents.slice(0, 30)) {
      const line = formatEventLine(e);
      text(line);
    }
  }
  doc.setFontSize(FONT_SIZE_NORMAL);
  pushNewLine();

  // —— Evoluciones (últimas N) ——
  doc.setFont("helvetica", "bold");
  doc.text("Evoluciones clínicas (últimas 10)", MARGIN, y);
  pushNewLine();
  const evoluciones = getEvolucionesByPatient(patient.id).slice(0, 10);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(FONT_SIZE_SMALL);
  if (evoluciones.length === 0) {
    text("Sin evoluciones registradas.");
  } else {
    for (const ev of evoluciones) {
      text(`${ev.date} ${ev.time || ""} · ${ev.doctorName ?? "—"}: ${(ev.notes || "").slice(0, 120)}${(ev.notes?.length ?? 0) > 120 ? "…" : ""}`);
    }
  }
  doc.setFontSize(FONT_SIZE_NORMAL);
  pushNewLine();

  // —— Odontograma ——
  doc.setFont("helvetica", "bold");
  doc.text("Odontograma", MARGIN, y);
  pushNewLine();
  const chartPermanent = getDentalChart(patient.id, true);
  const hasAny = Object.values(chartPermanent.teeth).some((t) => t.conditions.length > 0);
  if (!hasAny) {
    text("No disponible.");
  } else {
    const parts: string[] = [];
    for (const [toothId, data] of Object.entries(chartPermanent.teeth)) {
      if (data.conditions.length) {
        const conds = data.conditions.map((c) => DENTAL_CONDITION_LABELS[c.type]).join(", ");
        parts.push(`Pieza ${toothId}: ${conds}`);
      }
    }
    text(parts.slice(0, 20).join("; ") + (parts.length > 20 ? "…" : "") || "No disponible.");
  }
  pushNewLine();

  // —— Documentos clínicos ——
  doc.setFont("helvetica", "bold");
  doc.text("Documentos clínicos adjuntos", MARGIN, y);
  pushNewLine();
  const docs = getClinicalDocumentsByPatient(patient.id);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(FONT_SIZE_SMALL);
  if (docs.length === 0) {
    text("Ninguno.");
  } else {
    for (const d of docs) {
      text(`${d.name ?? d.type} · ${d.date ?? "—"}`);
    }
  }
  doc.setFontSize(FONT_SIZE_NORMAL);
  pushNewLine();

  // —— Consentimientos ——
  doc.setFont("helvetica", "bold");
  doc.text("Consentimientos", MARGIN, y);
  pushNewLine();
  const cons = getConsentimientosByPatient(patient.id);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(FONT_SIZE_SMALL);
  if (cons.length === 0) {
    text("Ninguno.");
  } else {
    for (const c of cons) {
      text(`${c.type} · ${c.signed ? "Firmado" : "Pendiente"} · ${c.date ?? "—"}`);
    }
  }

  const safeName = patient.name.replace(/[^a-zA-Z0-9\u00C0-\u024F\s]/g, "_").replace(/\s+/g, "_").slice(0, 40);
  const dateStr = new Date().toISOString().slice(0, 10);
  doc.save(`Historia_Clinica_${safeName}_${dateStr}.pdf`);
}

function formatEventLine(e: ClinicalEvent): string {
  switch (e.type) {
    case "cita_agendada":
      return `${e.date} ${e.time} · ${e.doctorName} · Cita · ${e.reason ?? "—"} (${e.status ?? "—"})`;
    case "prestacion_realizada":
      return `${e.date} ${e.time} · ${e.doctorName} · ${e.prestacion}`;
    case "presupuesto_creado":
      return `${e.date} ${e.time} · Presupuesto · ${e.label ?? "—"}`;
    default:
      return `${e.date} ${e.time}`;
  }
}
