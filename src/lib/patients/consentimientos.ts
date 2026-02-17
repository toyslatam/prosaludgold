/** Consentimientos informados por paciente (dental). */

export interface Consentimiento {
  id: string;
  patientId: string;
  type: string;
  date: string;
  signed: boolean;
  signedAt?: string;
  signedByName?: string;
  createdAt: string;
}

const STORAGE_KEY = "psg_consentimientos";

function load(): Consentimiento[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Consentimiento[];
  } catch {
    return [];
  }
}

function save(list: Consentimiento[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function getConsentimientosByPatient(patientId: string): Consentimiento[] {
  return load()
    .filter((c) => c.patientId === patientId)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function addConsentimiento(
  data: Omit<Consentimiento, "id" | "createdAt">
): Consentimiento {
  const list = load();
  const item: Consentimiento = {
    ...data,
    id: `cons-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    createdAt: new Date().toISOString(),
  };
  list.push(item);
  save(list);
  return item;
}

export function setConsentimientoSigned(
  id: string,
  signedByName: string
): Consentimiento | undefined {
  const list = load();
  const idx = list.findIndex((c) => c.id === id);
  if (idx === -1) return undefined;
  list[idx] = {
    ...list[idx],
    signed: true,
    signedAt: new Date().toISOString(),
    signedByName,
  };
  save(list);
  return list[idx];
}
