/**
 * Módulo de procedimientos de la cita.
 * Aislado por vertical. Código automático por categoría + correlativo.
 */

import type { VerticalKey } from "@/config/demos/types";
import { getAppointmentsRaw } from "./repository";
import { getEncounters } from "@/lib/encounters/repository";

export interface Procedure {
  id: string;
  code: string;
  category: string;
  name: string;
  description: string;
  color: string;
  price: number;
  priceNew?: number;
  /** IDs de doctores que pueden realizar este procedimiento */
  doctorIds: string[];
  /** Si true, el código fue editado manualmente y no se regenera */
  codeCustom?: boolean;
  /** Si false, está archivado/desactivado (no se muestra en listados activos por defecto) */
  isActive?: boolean;
}

function storageKey(vertical: VerticalKey): string {
  return `agenda_procedures_${vertical}`;
}

function loadProcedures(vertical: VerticalKey): Procedure[] {
  try {
    const raw = localStorage.getItem(storageKey(vertical));
    if (!raw) return [];
    return JSON.parse(raw) as Procedure[];
  } catch {
    return [];
  }
}

function saveProcedures(vertical: VerticalKey, data: Procedure[]): void {
  localStorage.setItem(storageKey(vertical), JSON.stringify(data));
}

/** Normaliza texto para prefijo: sin tildes, sin espacios, mayúsculas, primeras 3 letras */
function categoryToPrefix(category: string): string {
  const normalized = category
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "")
    .toUpperCase();
  return normalized.slice(0, 3) || "GEN";
}

/** Obtiene el siguiente correlativo disponible para categoría en el vertical */
export function getNextCorrelative(
  vertical: VerticalKey,
  category: string,
  excludeProcedureId?: string
): number {
  const prefix = categoryToPrefix(category);
  const procedures = loadProcedures(vertical).filter(
    (p) => p.category === category && p.id !== excludeProcedureId && (p.isActive !== false)
  );
  const codes = procedures
    .map((p) => p.code)
    .filter((c) => c.toUpperCase().startsWith(prefix));
  let max = 0;
  for (const c of codes) {
    const match = c.match(/-?(\d+)$/);
    if (match) max = Math.max(max, parseInt(match[1], 10));
  }
  return max + 1;
}

/** Genera código automático: PREF-01, PREF-02... */
export function generateProcedureCode(
  vertical: VerticalKey,
  category: string,
  excludeProcedureId?: string
): string {
  const prefix = categoryToPrefix(category);
  const num = getNextCorrelative(vertical, category, excludeProcedureId);
  return `${prefix}-${String(num).padStart(2, "0")}`;
}

/** Valida unicidad y devuelve código libre (incrementando correlativo si hay colisión) */
export function ensureUniqueCode(
  vertical: VerticalKey,
  category: string,
  proposedCode: string,
  excludeProcedureId?: string
): string {
  const list = loadProcedures(vertical).filter((p) => p.id !== excludeProcedureId);
  const exists = (c: string) => list.some((p) => p.code.toUpperCase() === c.toUpperCase());
  if (!exists(proposedCode)) return proposedCode;
  const prefix = categoryToPrefix(category);
  let n = 1;
  while (exists(`${prefix}-${String(n).padStart(2, "0")}`)) n++;
  return `${prefix}-${String(n).padStart(2, "0")}`;
}

function getSeedProcedures(vertical: VerticalKey): Procedure[] {
  if (vertical === "medical") {
    return [
      { id: "proc-m1", code: "CON-01", category: "Consulta", name: "Consulta general", description: "Consulta médica", color: "#0ea5e9", price: 50, doctorIds: [], isActive: true },
      { id: "proc-m2", code: "LAB-01", category: "Laboratorio", name: "Análisis de sangre", description: "Estudios de laboratorio", color: "#6366f1", price: 25, doctorIds: [], isActive: true },
    ];
  }
  if (vertical === "spa") {
    return [
      { id: "proc-s1", code: "MAS-01", category: "Masajes", name: "Masaje relajante", description: "Masaje corporal", color: "#10b981", price: 60, doctorIds: [], isActive: true },
      { id: "proc-s2", code: "FAC-01", category: "Faciales", name: "Facial hidratante", description: "Tratamiento facial", color: "#ec4899", price: 45, doctorIds: [], isActive: true },
    ];
  }
  return [
    { id: "proc-1", code: "CON-01", category: "Consulta", name: "Consulta regular", description: "Consulta de evaluación", color: "#0ea5e9", price: 50, doctorIds: ["d1", "d2", "d3", "d4", "d5", "d6", "d7", "d8", "d9", "d10"], isActive: true },
    { id: "proc-2", code: "ORT-01", category: "Ortodoncia", name: "Control de brackets", description: "Control y ajuste de aparatología", color: "#8b5cf6", price: 75, doctorIds: ["d1", "d9"], isActive: true },
    { id: "proc-3", code: "ORT-02", category: "Ortodoncia", name: "Evaluación ortodoncia", description: "Evaluación y plan de tratamiento", color: "#8b5cf6", price: 150, doctorIds: ["d1", "d9"], isActive: true },
    { id: "proc-4", code: "ORT-03", category: "Ortodoncia", name: "Colocación aparatología", description: "Colocación de brackets o alineadores", color: "#a855f7", price: 800, doctorIds: ["d1", "d9"], isActive: true },
    { id: "proc-5", code: "END-01", category: "Endodoncia", name: "Tratamiento de conducto", description: "Endodoncia", color: "#6366f1", price: 350, doctorIds: ["d2", "d10"], isActive: true },
    { id: "proc-6", code: "RES-01", category: "Restauración", name: "Reconstrucción", description: "Reconstrucción dental", color: "#f59e0b", price: 120, doctorIds: ["d2", "d6", "d10"], isActive: true },
    { id: "proc-7", code: "PRE-01", category: "Prevención", name: "Limpieza dental", description: "Profilaxis y limpieza", color: "#10b981", price: 65, doctorIds: ["d5", "d6", "d7"], isActive: true },
    { id: "proc-8", code: "PER-01", category: "Periodoncia", name: "Limpieza profunda", description: "Raspado y alisado radicular", color: "#10b981", price: 180, doctorIds: ["d5"], isActive: true },
    { id: "proc-9", code: "IMP-01", category: "Implantología", name: "Colocación de implante", description: "Implante dental", color: "#f97316", price: 1200, doctorIds: ["d4", "d8"], isActive: true },
    { id: "proc-10", code: "CIR-01", category: "Cirugía", name: "Extracción", description: "Extracción dental", color: "#ef4444", price: 80, doctorIds: ["d4", "d8", "d6"], isActive: true },
    { id: "proc-11", code: "CON-02", category: "Consulta", name: "Revisión general", description: "Revisión y diagnóstico", color: "#0ea5e9", price: 40, doctorIds: ["d1", "d2", "d3", "d4", "d5", "d6", "d7", "d8", "d9", "d10"], isActive: true },
    { id: "proc-12", code: "EST-01", category: "Estética", name: "Blanqueamiento", description: "Blanqueamiento dental", color: "#14b8a6", price: 250, doctorIds: ["d7"], isActive: true },
    { id: "proc-13", code: "ODO-01", category: "Odontopediatría", name: "Revisión infantil", description: "Revisión odontopediátrica", color: "#ec4899", price: 55, doctorIds: ["d3"], isActive: true },
  ];
}

export function getProcedures(vertical: VerticalKey, includeInactive = false): Procedure[] {
  const stored = loadProcedures(vertical);
  if (stored.length > 0) {
    return includeInactive ? stored : stored.filter((p) => p.isActive !== false);
  }
  const seed = getSeedProcedures(vertical);
  saveProcedures(vertical, seed);
  return includeInactive ? seed : seed.filter((p) => p.isActive !== false);
}

export function getProcedureById(vertical: VerticalKey, id: string): Procedure | undefined {
  return loadProcedures(vertical).find((p) => p.id === id);
}

export function getProceduresByCategory(vertical: VerticalKey): Map<string, Procedure[]> {
  const procedures = getProcedures(vertical);
  const map = new Map<string, Procedure[]>();
  for (const p of procedures) {
    const list = map.get(p.category) ?? [];
    list.push(p);
    map.set(p.category, list);
  }
  for (const list of map.values()) {
    list.sort((a, b) => a.name.localeCompare(b.name));
  }
  return map;
}

export function saveProcedure(vertical: VerticalKey, procedure: Procedure): void {
  const list = loadProcedures(vertical);
  const idx = list.findIndex((p) => p.id === procedure.id);
  if (idx >= 0) list[idx] = procedure;
  else list.push(procedure);
  saveProcedures(vertical, list);
}

export function createProcedure(vertical: VerticalKey, data: Omit<Procedure, "id">): Procedure {
  let code = data.code?.trim() ?? "";
  if (!code) {
    code = generateProcedureCode(vertical, data.category);
  } else {
    code = ensureUniqueCode(vertical, data.category, code);
  }
  const id = `proc-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const procedure: Procedure = {
    ...data,
    id,
    code,
    codeCustom: !!data.codeCustom,
    isActive: data.isActive !== false,
  };
  const list = loadProcedures(vertical);
  if (list.length === 0) saveProcedures(vertical, getSeedProcedures(vertical));
  const all = loadProcedures(vertical);
  all.push(procedure);
  saveProcedures(vertical, all);
  return procedure;
}

export function deleteProcedure(vertical: VerticalKey, id: string): void {
  saveProcedures(vertical, loadProcedures(vertical).filter((p) => p.id !== id));
}

export function archiveProcedure(vertical: VerticalKey, id: string): void {
  const list = loadProcedures(vertical);
  const idx = list.findIndex((p) => p.id === id);
  if (idx === -1) return;
  list[idx] = { ...list[idx], isActive: false };
  saveProcedures(vertical, list);
}

export function unarchiveProcedure(vertical: VerticalKey, id: string): void {
  const list = loadProcedures(vertical);
  const idx = list.findIndex((p) => p.id === id);
  if (idx === -1) return;
  list[idx] = { ...list[idx], isActive: true };
  saveProcedures(vertical, list);
}

/** Verifica si el procedimiento está en uso (citas, atenciones, etc.). */
export function canDeleteProcedure(procedureId: string, _vertical: VerticalKey): { canDelete: boolean; reason?: string } {
  const appointments = getAppointmentsRaw();
  const inAppointments = appointments.some((a: { procedureId?: string | null }) => a.procedureId === procedureId);
  if (inAppointments) {
    return { canDelete: false, reason: "Citas/Agenda" };
  }

  const encounters = getEncounters();
  const inEncounters = encounters.some((e: { procedures: { procedureId: string }[] }) =>
    e.procedures?.some((p) => p.procedureId === procedureId)
  );
  if (inEncounters) {
    return { canDelete: false, reason: "Atenciones/Consultas" };
  }

  return { canDelete: true };
}
