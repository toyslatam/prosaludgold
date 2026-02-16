/**
 * Ubicaciones de consulta (Consultorio, Camilla, Sillón, Box, Salón, etc.)
 */

import { getSiteById, getSites } from "./sites";

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

/** Seed compatible con chairId c1..c6 existentes en citas */
function seed(): Location[] {
  const sites = getSites();
  const central = sites.find((s) => s.name === "Sede Central")?.id ?? sites[0]?.id;
  const sur = sites.find((s) => s.name === "Sede Sur")?.id ?? sites[1]?.id;
  const norte = sites.find((s) => s.name === "Sede Norte")?.id ?? sites[2]?.id;
  const now = new Date().toISOString();
  const list: Location[] = [
    { id: "c1", name: "Sillón 1", type: "Sillón", siteId: central, isActive: true, createdAt: now, updatedAt: now },
    { id: "c2", name: "Sillón 2", type: "Sillón", siteId: central, isActive: true, createdAt: now, updatedAt: now },
    { id: "c3", name: "Sillón 3", type: "Sillón", siteId: central, isActive: true, createdAt: now, updatedAt: now },
    { id: "c4", name: "Box 1", type: "Box", siteId: sur, isActive: true, createdAt: now, updatedAt: now },
    { id: "c5", name: "Box 2", type: "Box", siteId: sur, isActive: true, createdAt: now, updatedAt: now },
    { id: "c6", name: "Sillón 1", type: "Sillón", siteId: norte, isActive: true, createdAt: now, updatedAt: now },
  ];
  save(list);
  return list;
}

export function getLocations(filters: LocationFilters = {}): Location[] {
  let list = load();
  if (list.length === 0) list = seed();

  if (!filters.includeInactive) list = list.filter((l) => l.isActive);
  if (filters.siteId) list = list.filter((l) => l.siteId === filters.siteId);
  if (filters.type) list = list.filter((l) => l.type === filters.type);
  if (filters.q?.trim()) {
    const q = filters.q.trim().toLowerCase();
    list = list.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.type.toLowerCase().includes(q) ||
        (getSiteById(l.siteId)?.name ?? "").toLowerCase().includes(q),
    );
  }
  return list.sort((a, b) => {
    const siteA = getSiteById(a.siteId)?.name ?? "";
    const siteB = getSiteById(b.siteId)?.name ?? "";
    if (siteA !== siteB) return siteA.localeCompare(siteB);
    if (a.type !== b.type) return a.type.localeCompare(b.type);
    return a.name.localeCompare(b.name);
  });
}

export interface LocationWithSiteName extends Location {
  siteName: string;
}

export function getLocationsWithSiteNames(filters: LocationFilters = {}): LocationWithSiteName[] {
  return getLocations(filters).map((l) => ({
    ...l,
    siteName: getSiteById(l.siteId)?.name ?? "",
  }));
}

export function getLocationById(id: string): Location | undefined {
  const list = load();
  if (list.length === 0) seed();
  return load().find((l) => l.id === id);
}

function nextId(): string {
  return `loc-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createLocation(data: Omit<Location, "id" | "createdAt" | "updatedAt">): Location {
  const list = load();
  if (list.length === 0) seed();
  const next = load();
  const exists = next.some(
    (l) => l.siteId === data.siteId && l.name.toLowerCase() === data.name.trim().toLowerCase(),
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
  next.push(loc);
  save(next);
  return loc;
}

export function updateLocation(
  id: string,
  data: Partial<Pick<Location, "name" | "type" | "siteId" | "description" | "isActive">>,
): void {
  const list = load();
  const idx = list.findIndex((l) => l.id === id);
  if (idx === -1) return;
  const current = list[idx];
  if (data.name !== undefined) {
    const duplicate = list.some(
      (l) => l.id !== id && l.siteId === (data.siteId ?? current.siteId) && l.name.toLowerCase() === data.name.trim().toLowerCase(),
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
