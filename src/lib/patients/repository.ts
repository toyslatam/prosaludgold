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

export function updatePatient(
  id: string,
  patch: Partial<Pick<Patient, "name" | "cedula" | "phone" | "email" | "address" | "benefits" | "branch" | "assignedDoctorId" | "collaborators" | "lastVisit" | "nextAppointment">>
): Patient | undefined {
  const list = loadPatients();
  const idx = list.findIndex((p) => p.id === id);
  if (idx === -1) return undefined;
  list[idx] = { ...list[idx], ...patch };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    return undefined;
  }
  return list[idx];
}
