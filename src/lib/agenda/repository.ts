import type { AppointmentWithDetails } from "@/types/agenda";
import type { AppointmentRow, PatientRow, DoctorRow, ChairRow } from "./types";
import { seedDoctors, seedChairs, seedPatients, seedAppointments } from "@/data/agendaSeed";

const STORAGE_KEYS = {
  appointments: "agenda_appointments",
  patients: "agenda_patients",
  doctors: "agenda_doctors",
  chairs: "agenda_chairs",
} as const;

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveJson(key: string, data: unknown): void {
  localStorage.setItem(key, JSON.stringify(data));
}

/** Doctores: seed por defecto, persistibles si se agregan después */
export function getDoctors(): DoctorRow[] {
  return loadJson(STORAGE_KEYS.doctors, seedDoctors);
}

export function getChairs(): ChairRow[] {
  return loadJson(STORAGE_KEYS.chairs, seedChairs);
}

/** Pacientes: seed por defecto */
export function getPatients(): PatientRow[] {
  return loadJson(STORAGE_KEYS.patients, seedPatients);
}

export function getPatientById(id: string): PatientRow | undefined {
  return getPatients().find((p) => p.id === id);
}

/** Citas: seed por defecto, luego persistidas en localStorage */
export function getAppointmentsRaw(): AppointmentRow[] {
  return loadJson(STORAGE_KEYS.appointments, seedAppointments);
}

export function setAppointmentsRaw(rows: AppointmentRow[]): void {
  saveJson(STORAGE_KEYS.appointments, rows);
}

/** Hidrata filas a AppointmentWithDetails para la UI */
export function getAppointmentsWithDetails(): AppointmentWithDetails[] {
  const appointments = getAppointmentsRaw();
  const patients = getPatients();
  const doctors = getDoctors();
  const chairs = getChairs();

  const patientMap = new Map(patients.map((p) => [p.id, p]));
  const doctorMap = new Map(doctors.map((d) => [d.id, d]));
  const chairMap = new Map(chairs.map((c) => [c.id, c]));

  return appointments.map((apt) => {
    const patient = patientMap.get(apt.patientId);
    const doctor = doctorMap.get(apt.doctorId);
    const chair = apt.chairId ? chairMap.get(apt.chairId) : null;
    return {
      id: apt.id,
      patientId: apt.patientId,
      patientName: patient?.name ?? "Paciente",
      doctorId: apt.doctorId,
      doctorName: doctor?.name ?? "Doctor",
      specialty: doctor?.specialty ?? "",
      date: apt.date,
      time: apt.time,
      duration: apt.duration,
      status: apt.status,
      branch: apt.branch,
      reason: apt.reason,
      chairId: apt.chairId ?? null,
      chairName: chair?.name ?? null,
      situation: apt.situation ?? patient?.situation ?? null,
      confirmations: apt.confirmations,
      notes: apt.notes ?? null,
    };
  });
}

export function createAppointment(row: Omit<AppointmentRow, "id" | "createdAt" | "updatedAt">): AppointmentRow {
  const list = getAppointmentsRaw();
  const now = new Date().toISOString();
  const newRow: AppointmentRow = {
    ...row,
    id: `apt-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  };
  list.push(newRow);
  setAppointmentsRaw(list);
  return newRow;
}

export function updateAppointment(id: string, patch: Partial<Omit<AppointmentRow, "id" | "createdAt">>): AppointmentRow | null {
  const list = getAppointmentsRaw();
  const idx = list.findIndex((a) => a.id === id);
  if (idx === -1) return null;
  list[idx] = { ...list[idx], ...patch, updatedAt: new Date().toISOString() };
  setAppointmentsRaw(list);
  return list[idx];
}

export function deleteAppointment(id: string): boolean {
  const list = getAppointmentsRaw().filter((a) => a.id !== id);
  if (list.length === getAppointmentsRaw().length) return false;
  setAppointmentsRaw(list);
  return true;
}

export function createPatient(row: Omit<PatientRow, "id">): PatientRow {
  const list = getPatients();
  const newRow: PatientRow = { ...row, id: `p-${Date.now()}` };
  list.push(newRow);
  saveJson(STORAGE_KEYS.patients, list);
  return newRow;
}
