/** Recetas (dental) por paciente. */

export interface RecetaMedicamento {
  nombre: string;
  dosis: string;
  frecuencia: string;
  duracion: string;
  indicaciones: string;
}

export interface Receta {
  id: string;
  patientId: string;
  date: string;
  doctorId: string;
  doctorName: string;
  medicamentos: RecetaMedicamento[];
  indicacionesGenerales: string;
  createdAt: string;
}

const STORAGE_KEY = "psg_recetas";

function load(): Receta[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Receta[];
  } catch {
    return [];
  }
}

function save(list: Receta[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function getRecetasByPatient(patientId: string): Receta[] {
  return load()
    .filter((r) => r.patientId === patientId)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getRecetaById(id: string): Receta | undefined {
  return load().find((r) => r.id === id);
}

export function addReceta(
  data: Omit<Receta, "id" | "createdAt">
): Receta {
  const list = load();
  const rec: Receta = {
    ...data,
    id: `rec-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    createdAt: new Date().toISOString(),
  };
  list.push(rec);
  save(list);
  return rec;
}

export function updateReceta(
  id: string,
  patch: Partial<Pick<Receta, "date" | "doctorId" | "doctorName" | "medicamentos" | "indicacionesGenerales">>
): Receta | undefined {
  const list = load();
  const idx = list.findIndex((r) => r.id === id);
  if (idx === -1) return undefined;
  list[idx] = { ...list[idx], ...patch };
  save(list);
  return list[idx];
}

export function removeReceta(id: string): boolean {
  const list = load().filter((r) => r.id !== id);
  if (list.length === load().length) return false;
  save(list);
  return true;
}
