/**
 * Ubicaciones de consulta (Consultorio, Camilla, Sillón, Box, Salón, etc.)
 * dentro de una sede. La sede (siteId) ahora referencia la tabla real
 * `sedes`; ver src/lib/agenda/sites.ts.
 */

import { getSites, type Site } from "./sites";

export const LOCATION_TYPES = [
  "Consultorio",
  "Camilla",
  "Sillón",
  "Box",
  "Salón",
  "Otro",
] as const;

export type LocationType = (typeof LOCATION_TYPES)[number];

export interface Location {
  id: string;
  name: string;
  type: string;
  siteId: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LocationFilters {
  siteId?: string;
  type?: string;
  q?: string;
  includeInactive?: boolean;
}

const STORAGE_KEY = "agenda_locations";

function load(): Location[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Location[];
  } catch {
    return [];
  }
}

function save(data: Location[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/** Siembra ubicaciones de ejemplo repartidas entre las sedes reales existentes. */
async function seed(vertical?: string): Promise<Location[]> {
  const sites = await getSites(vertical);
  if (sites.length === 0) {
    save([]);
    return [];
  }
  const s1 = sites[0].id;
  const s2 = sites[1]?.id ?? s1;
  const s3 = sites[2]?.id ?? s1;
  const now = new Date().toISOString();
  const list: Location[] = [
    { id: "c1", name: "Sillón 1", type: "Sillón", siteId: s1, isActive: true, createdAt: now, updatedAt: now },
    { id: "c2", name: "Sillón 2", type: "Sillón", siteId: s1, isActive: true, createdAt: now, updatedAt: now },
    { id: "c3", name: "Sillón 3", type: "Sillón", siteId: s1, isActive: true, createdAt: now, updatedAt: now },
    { id: "c4", name: "Box 1", type: "Box", siteId: s2, isActive: true, createdAt: now, updatedAt: now },
    { id: "c5", name: "Box 2", type: "Box", siteId: s2, isActive: true, createdAt: now, updatedAt: now },
    { id: "c6", name: "Sillón 1", type: "Sillón", siteId: s3, isActive: true, createdAt: now, updatedAt: now },
  ];
  save(list);
  return list;
}

export interface LocationWithSiteName extends Location {
  siteName: string;
}

async function siteNameMap(vertical?: string): Promise<Map<string, string>> {
  const sites = await getSites(vertical);
  return new Map(sites.map((s: Site) => [s.id, s.name]));
}

/**
 * Variante síncrona sin nombre de sede resuelto (no llama a Supabase).
 * Uso: hidratación masiva de datos ya síncronos (ej. getAppointmentsWithDetails)
 * donde no vale la pena cascadear a async solo por un nombre de sede.
 */
export function getLocationsRaw(filters: Pick<LocationFilters, "includeInactive"> = {}): Location[] {
  const list = load();
  if (!filters.includeInactive) return list.filter((l) => l.isActive);
  return list;
}

export async function getLocations(filters: LocationFilters = {}, vertical?: string): Promise<Location[]> {
  let list = load();
  if (list.length === 0) list = await seed(vertical);

  if (!filters.includeInactive) list = list.filter((l) => l.isActive);
  if (filters.siteId) list = list.filter((l) => l.siteId === filters.siteId);
  if (filters.type) list = list.filter((l) => l.type === filters.type);

  const names = await siteNameMap(vertical);

  if (filters.q?.trim()) {
    const q = filters.q.trim().toLowerCase();
    list = list.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.type.toLowerCase().includes(q) ||
        (names.get(l.siteId) ?? "").toLowerCase().includes(q)
    );
  }
  return list.sort((a, b) => {
    const siteA = names.get(a.siteId) ?? "";
    const siteB = names.get(b.siteId) ?? "";
    if (siteA !== siteB) return siteA.localeCompare(siteB);
    if (a.type !== b.type) return a.type.localeCompare(b.type);
    return a.name.localeCompare(b.name);
  });
}

export async function getLocationsWithSiteNames(
  filters: LocationFilters = {},
  vertical?: string
): Promise<LocationWithSiteName[]> {
  const [list, names] = await Promise.all([getLocations(filters, vertical), siteNameMap(vertical)]);
  return list.map((l) => ({ ...l, siteName: names.get(l.siteId) ?? "" }));
}

export async function getLocationById(id: string, vertical?: string): Promise<Location | undefined> {
  let list = load();
  if (list.length === 0) list = await seed(vertical);
  return list.find((l) => l.id === id);
}

function nextId(): string {
  return `loc-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createLocation(data: Omit<Location, "id" | "createdAt" | "updatedAt">): Location {
  const list = load();
  const exists = list.some(
    (l) => l.siteId === data.siteId && l.name.toLowerCase() === data.name.trim().toLowerCase()
  );
  if (exists) throw new Error("Ya existe una ubicación con ese nombre en esta sede.");
  const now = new Date().toISOString();
  const loc: Location = {
    id: nextId(),
    name: data.name.trim(),
    type: data.type.trim(),
    siteId: data.siteId,
    description: data.description?.trim() || undefined,
    isActive: data.isActive ?? true,
    createdAt: now,
    updatedAt: now,
  };
  list.push(loc);
  save(list);
  return loc;
}

export function updateLocation(
  id: string,
  data: Partial<Pick<Location, "name" | "type" | "siteId" | "description" | "isActive">>
): void {
  const list = load();
  const idx = list.findIndex((l) => l.id === id);
  if (idx === -1) return;
  const current = list[idx];
  if (data.name !== undefined) {
    const duplicate = list.some(
      (l) =>
        l.id !== id &&
        l.siteId === (data.siteId ?? current.siteId) &&
        l.name.toLowerCase() === data.name.trim().toLowerCase()
    );
    if (duplicate) throw new Error("Ya existe una ubicación con ese nombre en esta sede.");
  }
  list[idx] = { ...current, ...data, updatedAt: new Date().toISOString() };
  save(list);
}

export function archiveLocation(id: string): void {
  updateLocation(id, { isActive: false });
}

export function unarchiveLocation(id: string): void {
  updateLocation(id, { isActive: true });
}

export function deleteLocation(id: string): void {
  save(load().filter((l) => l.id !== id));
}
