/** Evoluciones clínicas por paciente (dental). */

export interface Evolucion {
  id: string;
  patientId: string;
  date: string;
  time: string;
  doctorId: string;
  doctorName: string;
  procedureIds?: string[];
  notes: string;
  createdAt: string;
}

const STORAGE_KEY = "psg_evoluciones";

function load(): Evolucion[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Evolucion[];
  } catch {
    return [];
  }
}

function save(list: Evolucion[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function getEvolucionesByPatient(patientId: string): Evolucion[] {
  return load()
    .filter((e) => e.patientId === patientId)
    .sort((a, b) => b.date.localeCompare(a.date) || (b.time || "").localeCompare(a.time || ""));
}

export function addEvolucion(
  data: Omit<Evolucion, "id" | "createdAt">
): Evolucion {
  const list = load();
  const newEv: Evolucion = {
    ...data,
    id: `evol-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    createdAt: new Date().toISOString(),
  };
  list.push(newEv);
  save(list);
  return newEv;
}
