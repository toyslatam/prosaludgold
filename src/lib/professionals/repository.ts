/**
 * Profesionales por vertical. Persistencia en localStorage.
 */

import type { VerticalKey } from "@/config/demos";
import type { Professional } from "@/types/professionals";
import { getSpecialties } from "./specialties";

const STORAGE_KEY = "psg_professionals";

function load(): Professional[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Professional[];
  } catch {
    return [];
  }
}

function save(data: Professional[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/** Seed dental desde seedDoctors (ids d1-d10) para compatibilidad con agenda */
function seedDentalIfNeeded(): void {
  const list = load();
  if (list.some((p) => p.vertical === "dental")) return;
  const now = new Date().toISOString();
  const seed = [
    { fullName: "Dra. María González", specialtyName: "Ortodoncia", branch: "Sede Central", available: true },
    { fullName: "Dr. Carlos Mendoza", specialtyName: "Endodoncia", branch: "Sede Central", available: true },
    { fullName: "Dra. Ana Castillo", specialtyName: "Odontopediatría", branch: "Sede Sur", available: false },
    { fullName: "Dr. Roberto Díaz", specialtyName: "Implantología", branch: "Sede Central", available: true },
    { fullName: "Dra. Laura Herrera", specialtyName: "Periodoncia", branch: "Sede Norte", available: true },
    { fullName: "Dr. Miguel Soto", specialtyName: "General", branch: "Sede Central", available: true },
    { fullName: "Dra. Patricia Ruiz", specialtyName: "Estética", branch: "Sede Sur", available: true },
    { fullName: "Dr. Fernando López", specialtyName: "Cirugía", branch: "Sede Central", available: true },
    { fullName: "Dra. Carmen Vega", specialtyName: "Ortodoncia", branch: "Sede Norte", available: true },
    { fullName: "Dr. Jorge Martínez", specialtyName: "Endodoncia", branch: "Sede Sur", available: true },
  ];
  const dentalSpecs = getSpecialties("dental");
  const specByName = new Map(dentalSpecs.map((s) => [s.name, s.id]));
  const professionals: Professional[] = seed.map((s, i) => {
    const id = `d${i + 1}`;
    const specialtyId =
      specByName.get(s.specialtyName) ??
      dentalSpecs.find((sp) => sp.name.includes(s.specialtyName) || s.specialtyName.includes(sp.name))?.id ??
      dentalSpecs[0]?.id ??
      "";
    return {
      id,
      vertical: "dental",
      fullName: s.fullName,
      specialtyId,
      siteIds: [],
      isAvailable: s.available,
      isActive: true,
      commissionDefault: { type: "PERCENT" as const, value: 10 },
      createdAt: now,
      updatedAt: now,
    };
  });
  save([...list, ...professionals]);
}

export function getProfessionals(vertical: VerticalKey, includeInactive = false): Professional[] {
  if (vertical === "dental") seedDentalIfNeeded();
  const list = load().filter((p) => p.vertical === vertical);
  if (!includeInactive) return list.filter((p) => p.isActive);
  return list;
}

export function getProfessionalById(id: string): Professional | undefined {
  return load().find((p) => p.id === id);
}

function nextId(): string {
  return `pro-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createProfessional(
  data: Omit<Professional, "id" | "createdAt" | "updatedAt">
): Professional {
  const list = load();
  const now = new Date().toISOString();
  const id = nextId();
  const professional: Professional = { ...data, id, createdAt: now, updatedAt: now };
  list.push(professional);
  save(list);
  return professional;
}

export function updateProfessional(
  id: string,
  data: Partial<Omit<Professional, "id" | "vertical" | "createdAt">>
): void {
  const list = load();
  const idx = list.findIndex((p) => p.id === id);
  if (idx === -1) return;
  list[idx] = { ...list[idx], ...data, updatedAt: new Date().toISOString() };
  save(list);
}
