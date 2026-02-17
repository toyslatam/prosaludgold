/**
 * Especialidades por vertical. Persistencia en localStorage.
 */

import type { VerticalKey } from "@/config/demos";
import type { Specialty } from "@/types/professionals";

const STORAGE_KEY = "psg_specialties";

function load(): Specialty[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Specialty[];
  } catch {
    return [];
  }
}

function save(data: Specialty[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

const SEED_BY_VERTICAL: Record<VerticalKey, Omit<Specialty, "id" | "createdAt" | "updatedAt">[]> = {
  dental: [
    { vertical: "dental", name: "Ortodoncia", isActive: true },
    { vertical: "dental", name: "Endodoncia", isActive: true },
    { vertical: "dental", name: "Periodoncia", isActive: true },
    { vertical: "dental", name: "Implantología", isActive: true },
    { vertical: "dental", name: "Odontopediatría", isActive: true },
    { vertical: "dental", name: "Cirugía oral", isActive: true },
    { vertical: "dental", name: "Estética dental", isActive: true },
    { vertical: "dental", name: "Rehabilitación oral", isActive: true },
    { vertical: "dental", name: "General", isActive: true },
  ],
  medical: [
    { vertical: "medical", name: "Medicina General", isActive: true },
    { vertical: "medical", name: "Pediatría", isActive: true },
    { vertical: "medical", name: "Ginecología", isActive: true },
    { vertical: "medical", name: "Medicina Interna", isActive: true },
    { vertical: "medical", name: "Cardiología", isActive: true },
    { vertical: "medical", name: "Dermatología", isActive: true },
    { vertical: "medical", name: "Nutrición", isActive: true },
  ],
  spa: [
    { vertical: "spa", name: "Masajista", isActive: true },
    { vertical: "spa", name: "Esteticista", isActive: true },
    { vertical: "spa", name: "Cosmetóloga", isActive: true },
    { vertical: "spa", name: "Fisioterapeuta", isActive: true },
    { vertical: "spa", name: "Uñas", isActive: true },
    { vertical: "spa", name: "Depilación", isActive: true },
    { vertical: "spa", name: "Facialista", isActive: true },
  ],
};

function seedIfNeeded(vertical: VerticalKey): void {
  const list = load();
  const hasVertical = list.some((s) => s.vertical === vertical);
  if (hasVertical) return;
  const now = new Date().toISOString();
  const items = SEED_BY_VERTICAL[vertical].map((s, i) => ({
    ...s,
    id: `spec-${vertical}-${i + 1}-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  }));
  save([...list, ...items]);
}

export function getSpecialties(vertical: VerticalKey, includeInactive = false): Specialty[] {
  seedIfNeeded(vertical);
  const list = load().filter((s) => s.vertical === vertical);
  if (!includeInactive) return list.filter((s) => s.isActive);
  return list.sort((a, b) => a.name.localeCompare(b.name));
}

export function getSpecialtyById(id: string): Specialty | undefined {
  return load().find((s) => s.id === id);
}

export function createSpecialty(data: Omit<Specialty, "id" | "createdAt" | "updatedAt">): Specialty {
  const list = load();
  const now = new Date().toISOString();
  const id = `spec-${data.vertical}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const specialty: Specialty = { ...data, id, createdAt: now, updatedAt: now };
  list.push(specialty);
  save(list);
  return specialty;
}

export function updateSpecialty(id: string, data: Partial<Pick<Specialty, "name" | "isActive">>): void {
  const list = load();
  const idx = list.findIndex((s) => s.id === id);
  if (idx === -1) return;
  list[idx] = { ...list[idx], ...data, updatedAt: new Date().toISOString() };
  save(list);
}

export function deleteSpecialty(id: string): void {
  save(load().filter((s) => s.id !== id));
}
