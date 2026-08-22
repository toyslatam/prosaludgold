/**
 * Listas escalables de inventario (categorías, unidades, proveedores).
 * Aisladas por vertical. Mismo patrón que src/lib/professionals/specialties.ts.
 */

import type { VerticalKey } from "@/config/demos";

export type LookupKind = "category" | "unit" | "supplier";

export interface InventoryLookup {
  id: string;
  vertical: VerticalKey;
  kind: LookupKind;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "psg_inventory_lookups";

const LOOKUP_LABELS: Record<LookupKind, string> = {
  category: "Categoría",
  unit: "Unidad",
  supplier: "Proveedor",
};

export function getLookupLabel(kind: LookupKind): string {
  return LOOKUP_LABELS[kind];
}

const SEED_BY_VERTICAL: Record<Exclude<VerticalKey, "multi">, Record<LookupKind, string[]>> = {
  dental: {
    category: ["Descartables", "Restauración", "Anestesia", "Ortodoncia", "Implantología", "Prevención"],
    unit: ["unidad", "caja", "paquete", "jeringa", "carpule", "kit", "bolsa", "ml", "litro"],
    supplier: ["MedSupply Panamá", "DentalPro", "OrthoMax", "ImplantDirect"],
  },
  medical: {
    category: ["Descartables", "Medicamentos", "Laboratorio", "Curación", "Diagnóstico"],
    unit: ["unidad", "caja", "paquete", "frasco", "ampolla", "ml", "litro", "gramo"],
    supplier: ["MedSupply Panamá", "Farmacia Central"],
  },
  spa: {
    category: ["Descartables", "Cosmética", "Masajes", "Faciales", "Depilación"],
    unit: ["unidad", "caja", "paquete", "frasco", "botella", "ml", "litro", "gramo"],
    supplier: ["BeautySupply", "SpaWholesale"],
  },
};

function load(): InventoryLookup[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as InventoryLookup[];
  } catch {
    return [];
  }
}

function save(data: InventoryLookup[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function seedIfNeeded(vertical: VerticalKey, kind: LookupKind): void {
  const list = load();
  const hasAny = list.some((l) => l.vertical === vertical && l.kind === kind);
  if (hasAny) return;
  const specVertical = (vertical === "multi" ? "dental" : vertical) as Exclude<VerticalKey, "multi">;
  const names = SEED_BY_VERTICAL[specVertical][kind];
  const now = new Date().toISOString();
  const items = names.map((name, i) => ({
    id: `lu-${vertical}-${kind}-${i + 1}-${Date.now()}`,
    vertical,
    kind,
    name,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  }));
  save([...list, ...items]);
}

export function getLookups(vertical: VerticalKey, kind: LookupKind, includeInactive = false): InventoryLookup[] {
  seedIfNeeded(vertical, kind);
  const list = load().filter((l) => l.vertical === vertical && l.kind === kind);
  const sorted = list.sort((a, b) => a.name.localeCompare(b.name));
  return includeInactive ? sorted : sorted.filter((l) => l.isActive);
}

export function createLookup(vertical: VerticalKey, kind: LookupKind, name: string): InventoryLookup {
  const list = load();
  const now = new Date().toISOString();
  const item: InventoryLookup = {
    id: `lu-${vertical}-${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    vertical,
    kind,
    name,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };
  list.push(item);
  save(list);
  return item;
}

export function updateLookup(id: string, data: Partial<Pick<InventoryLookup, "name" | "isActive">>): void {
  const list = load();
  const idx = list.findIndex((l) => l.id === id);
  if (idx === -1) return;
  list[idx] = { ...list[idx], ...data, updatedAt: new Date().toISOString() };
  save(list);
}

export function deleteLookup(id: string): void {
  save(load().filter((l) => l.id !== id));
}
