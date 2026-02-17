/** Antecedentes médicos (dental) por paciente. */

export interface Antecedentes {
  patientId: string;
  alergias: string;
  enfermedadesSistemicas: string;
  medicacionActual: string;
  embarazo: string;
  habitosTabaco: string;
  habitosAlcohol: string;
  observaciones: string;
  updatedAt: string;
}

const STORAGE_KEY = "psg_antecedentes";

function loadAll(): Antecedentes[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Antecedentes[];
  } catch {
    return [];
  }
}

function saveAll(list: Antecedentes[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function getAntecedentesByPatient(patientId: string): Antecedentes | null {
  const list = loadAll();
  return list.find((a) => a.patientId === patientId) ?? null;
}

export function saveAntecedentes(data: Antecedentes): Antecedentes {
  const list = loadAll();
  const now = new Date().toISOString();
  const record: Antecedentes = { ...data, updatedAt: now };
  const idx = list.findIndex((a) => a.patientId === data.patientId);
  if (idx >= 0) {
    list[idx] = record;
  } else {
    list.push(record);
  }
  saveAll(list);
  return record;
}

export function getEmptyAntecedentes(patientId: string): Antecedentes {
  return {
    patientId,
    alergias: "",
    enfermedadesSistemicas: "",
    medicacionActual: "",
    embarazo: "",
    habitosTabaco: "",
    habitosAlcohol: "",
    observaciones: "",
    updatedAt: new Date().toISOString(),
  };
}
