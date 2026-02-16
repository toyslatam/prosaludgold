/**
 * Sedes (Sucursales/Clínicas) para asociar ubicaciones.
 */

export interface Site {
  id: string;
  name: string;
}

const STORAGE_KEY = "agenda_sites";

const SEED: Site[] = [
  { id: "site-central", name: "Sede Central" },
  { id: "site-sur", name: "Sede Sur" },
  { id: "site-norte", name: "Sede Norte" },
];

function load(): Site[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Site[];
  } catch {
    return [];
  }
}

function save(data: Site[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getSites(): Site[] {
  const stored = load();
  if (stored.length === 0) {
    save(SEED);
    return SEED;
  }
  return stored;
}

export function getSiteById(id: string): Site | undefined {
  return getSites().find((s) => s.id === id);
}

export function addSite(name: string): Site {
  const list = load();
  if (list.length === 0) save(SEED);
  const next = load();
  const id = `site-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const site: Site = { id, name };
  next.push(site);
  save(next);
  return site;
}

export function updateSite(id: string, data: Partial<Pick<Site, "name">>): void {
  const list = load();
  const idx = list.findIndex((s) => s.id === id);
  if (idx === -1) return;
  list[idx] = { ...list[idx], ...data };
  save(list);
}

export function deleteSite(id: string): void {
  save(load().filter((s) => s.id !== id));
}
