/**
 * Categorías de procedimientos (escalable). Aisladas por vertical.
 */

import type { VerticalKey } from "@/config/demos/types";

export interface ProcedureCategory {
  id: string;
  name: string;
  color: string;
}

function storageKey(vertical: VerticalKey): string {
  return `agenda_procedure_categories_${vertical}`;
}

function load(vertical: VerticalKey): ProcedureCategory[] {
  try {
    const raw = localStorage.getItem(storageKey(vertical));
    if (!raw) return [];
    return JSON.parse(raw) as ProcedureCategory[];
  } catch {
    return [];
  }
}

function save(vertical: VerticalKey, data: ProcedureCategory[]): void {
  localStorage.setItem(storageKey(vertical), JSON.stringify(data));
}

const SEED_DENTAL: ProcedureCategory[] = [
  { id: "cat-1", name: "Consulta", color: "#0ea5e9" },
  { id: "cat-2", name: "Ortodoncia", color: "#8b5cf6" },
  { id: "cat-3", name: "Endodoncia", color: "#6366f1" },
  { id: "cat-4", name: "Restauración", color: "#f59e0b" },
  { id: "cat-5", name: "Prevención", color: "#10b981" },
  { id: "cat-6", name: "Periodoncia", color: "#10b981" },
  { id: "cat-7", name: "Implantología", color: "#f97316" },
  { id: "cat-8", name: "Cirugía", color: "#ef4444" },
  { id: "cat-9", name: "Estética", color: "#14b8a6" },
  { id: "cat-10", name: "Odontopediatría", color: "#ec4899" },
];

const SEED_MEDICAL: ProcedureCategory[] = [
  { id: "cat-m1", name: "Consulta", color: "#0ea5e9" },
  { id: "cat-m2", name: "Laboratorio", color: "#6366f1" },
  { id: "cat-m3", name: "Estudios", color: "#8b5cf6" },
  { id: "cat-m4", name: "Procedimientos", color: "#10b981" },
];

const SEED_SPA: ProcedureCategory[] = [
  { id: "cat-s1", name: "Masajes", color: "#10b981" },
  { id: "cat-s2", name: "Faciales", color: "#ec4899" },
  { id: "cat-s3", name: "Corporales", color: "#f97316" },
  { id: "cat-s4", name: "Spa día", color: "#14b8a6" },
];

function getSeed(vertical: VerticalKey): ProcedureCategory[] {
  if (vertical === "medical") return SEED_MEDICAL;
  if (vertical === "spa") return SEED_SPA;
  return SEED_DENTAL;
}

export function getCategories(vertical: VerticalKey): ProcedureCategory[] {
  const stored = load(vertical);
  if (stored.length > 0) return stored;
  const seed = getSeed(vertical);
  save(vertical, seed);
  return seed;
}

export function addCategory(vertical: VerticalKey, name: string, color = "#6b7280"): ProcedureCategory {
  const list = load(vertical);
  if (list.length === 0) save(vertical, getSeed(vertical));
  const next = load(vertical);
  const id = `cat-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const category: ProcedureCategory = { id, name, color };
  next.push(category);
  save(vertical, next);
  return category;
}

export function updateCategory(
  vertical: VerticalKey,
  id: string,
  data: Partial<Pick<ProcedureCategory, "name" | "color">>
): void {
  const list = load(vertical);
  const idx = list.findIndex((c) => c.id === id);
  if (idx === -1) return;
  list[idx] = { ...list[idx], ...data };
  save(vertical, list);
}

export function deleteCategory(vertical: VerticalKey, id: string): void {
  save(vertical, load(vertical).filter((c) => c.id !== id));
}
