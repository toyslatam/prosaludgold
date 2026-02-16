/**
 * Módulo de procedimientos de la cita.
 * Cada procedimiento tiene nombre, categoría, precios y uno o más doctores asignados.
 */

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
}

const STORAGE_KEY = "agenda_procedures";

function loadProcedures(): Procedure[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Procedure[];
  } catch {
    return [];
  }
}

function saveProcedures(data: Procedure[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getSeedProcedures(): Procedure[] {
  return [
    { id: "proc-1", code: "CONS", category: "Consulta", name: "Consulta regular", description: "Consulta de evaluación", color: "#0ea5e9", price: 50, doctorIds: ["d1", "d2", "d3", "d4", "d5", "d6", "d7", "d8", "d9", "d10"] },
    { id: "proc-2", code: "CONT", category: "Ortodoncia", name: "Control de brackets", description: "Control y ajuste de aparatología", color: "#8b5cf6", price: 75, doctorIds: ["d1", "d9"] },
    { id: "proc-3", code: "ORT1", category: "Ortodoncia", name: "Evaluación ortodoncia", description: "Evaluación y plan de tratamiento", color: "#8b5cf6", price: 150, doctorIds: ["d1", "d9"] },
    { id: "proc-4", code: "ORT2", category: "Ortodoncia", name: "Colocación aparatología", description: "Colocación de brackets o alineadores", color: "#a855f7", price: 800, doctorIds: ["d1", "d9"] },
    { id: "proc-5", code: "ENDO", category: "Endodoncia", name: "Tratamiento de conducto", description: "Endodoncia", color: "#6366f1", price: 350, doctorIds: ["d2", "d10"] },
    { id: "proc-6", code: "REC", category: "Restauración", name: "Reconstrucción", description: "Reconstrucción dental", color: "#f59e0b", price: 120, doctorIds: ["d2", "d6", "d10"] },
    { id: "proc-7", code: "LIMP", category: "Prevención", name: "Limpieza dental", description: "Profilaxis y limpieza", color: "#10b981", price: 65, doctorIds: ["d5", "d6", "d7"] },
    { id: "proc-8", code: "PERIO", category: "Periodoncia", name: "Limpieza profunda", description: "Raspado y alisado radicular", color: "#10b981", price: 180, doctorIds: ["d5"] },
    { id: "proc-9", code: "IMPL", category: "Implantología", name: "Colocación de implante", description: "Implante dental", color: "#f97316", price: 1200, doctorIds: ["d4", "d8"] },
    { id: "proc-10", code: "EXT", category: "Cirugía", name: "Extracción", description: "Extracción dental", color: "#ef4444", price: 80, doctorIds: ["d4", "d8", "d6"] },
    { id: "proc-11", code: "REV", category: "Consulta", name: "Revisión general", description: "Revisión y diagnóstico", color: "#0ea5e9", price: 40, doctorIds: ["d1", "d2", "d3", "d4", "d5", "d6", "d7", "d8", "d9", "d10"] },
    { id: "proc-12", code: "EST", category: "Estética", name: "Blanqueamiento", description: "Blanqueamiento dental", color: "#14b8a6", price: 250, doctorIds: ["d7"] },
    { id: "proc-13", code: "PED", category: "Odontopediatría", name: "Revisión infantil", description: "Revisión odontopediátrica", color: "#ec4899", price: 55, doctorIds: ["d3"] },
  ];
}

export function getProcedures(): Procedure[] {
  const stored = loadProcedures();
  if (stored.length > 0) return stored;
  const seed = getSeedProcedures();
  saveProcedures(seed);
  return seed;
}

export function getProcedureById(id: string): Procedure | undefined {
  return getProcedures().find((p) => p.id === id);
}

export function getProceduresByCategory(): Map<string, Procedure[]> {
  const map = new Map<string, Procedure[]>();
  for (const p of getProcedures()) {
    const list = map.get(p.category) ?? [];
    list.push(p);
    map.set(p.category, list);
  }
  for (const list of map.values()) {
    list.sort((a, b) => a.name.localeCompare(b.name));
  }
  return map;
}

export function saveProcedure(procedure: Procedure): void {
  const list = loadProcedures();
  const idx = list.findIndex((p) => p.id === procedure.id);
  if (idx >= 0) list[idx] = procedure;
  else list.push(procedure);
  saveProcedures(list);
}

export function createProcedure(data: Omit<Procedure, "id">): Procedure {
  const id = `proc-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const procedure: Procedure = { ...data, id };
  const list = loadProcedures();
  list.push(procedure);
  saveProcedures(list);
  return procedure;
}

export function deleteProcedure(id: string): void {
  saveProcedures(loadProcedures().filter((p) => p.id !== id));
}
