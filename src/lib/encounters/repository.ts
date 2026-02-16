/**
 * Persistencia de atenciones/consultas/sesiones (multi-vertical).
 */

import type { CareEncounter } from "@/types/careEncounter";
import type { VerticalKey } from "@/config/demos";

const STORAGE_KEY = "psg_care_encounters";

function load(): CareEncounter[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CareEncounter[];
  } catch {
    return [];
  }
}

function save(data: CareEncounter[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getEncounters(vertical?: VerticalKey): CareEncounter[] {
  const list = load();
  if (vertical) return list.filter((e) => e.vertical === vertical);
  return list;
}

export function getEncounterById(id: string): CareEncounter | undefined {
  return load().find((e) => e.id === id);
}

function nextId(): string {
  return `enc-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function saveEncounter(data: Omit<CareEncounter, "id" | "createdAt" | "updatedAt">): CareEncounter {
  const list = load();
  const now = new Date().toISOString();
  const encounter: CareEncounter = {
    ...data,
    id: nextId(),
    createdAt: now,
    updatedAt: now,
  };
  list.push(encounter);
  save(list);
  return encounter;
}

export function updateEncounter(
  id: string,
  data: Partial<Omit<CareEncounter, "id" | "createdAt">>
): CareEncounter | null {
  const list = load();
  const idx = list.findIndex((e) => e.id === id);
  if (idx === -1) return null;
  list[idx] = {
    ...list[idx],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  save(list);
  return list[idx];
}
