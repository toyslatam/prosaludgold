import type { Patient } from "@/data/mockData";
import { mockPatients } from "@/data/mockData";

const STORAGE_KEY = "psg_patients";

function loadPatients(): Patient[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [...mockPatients];
    return JSON.parse(raw) as Patient[];
  } catch {
    return [...mockPatients];
  }
}

export function getPatients(): Patient[] {
  return loadPatients();
}

export function getPatientById(id: string): Patient | undefined {
  return loadPatients().find((p) => p.id === id);
}
