/**
 * Categorías de procedimientos (escalable).
 */

export interface ProcedureCategory {
  id: string;
  name: string;
  color: string;
}

const STORAGE_KEY = "agenda_procedure_categories";

function load(): ProcedureCategory[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ProcedureCategory[];
  } catch {
    return [];
  }
}

function save(data: ProcedureCategory[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

const SEED: ProcedureCategory[] = [
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

export function getCategories(): ProcedureCategory[] {
  const stored = load();
  if (stored.length > 0) return stored;
  save(SEED);
  return SEED;
}

export function addCategory(name: string, color = "#6b7280"): ProcedureCategory {
  const list = load();
  if (list.length === 0) save(SEED);
  const next = load();
  const id = `cat-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const category: ProcedureCategory = { id, name, color };
  next.push(category);
  save(next);
  return category;
}

export function updateCategory(id: string, data: Partial<Pick<ProcedureCategory, "name" | "color">>): void {
  const list = load();
  const idx = list.findIndex((c) => c.id === id);
  if (idx === -1) return;
  list[idx] = { ...list[idx], ...data };
  save(list);
}

export function deleteCategory(id: string): void {
  save(load().filter((c) => c.id !== id));
}
