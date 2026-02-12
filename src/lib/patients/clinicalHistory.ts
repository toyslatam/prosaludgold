/** Tipos para historial clínico (timeline estilo Dentalink) */

export type ClinicalEventType =
  | "cita_agendada"
  | "prestacion_realizada"
  | "presupuesto_creado";

export type AppointmentStatusDisplay =
  | "atendido"
  | "anulado"
  | "no_asiste"
  | "pendiente"
  | "confirmada";

export interface ClinicalEventBase {
  id: string;
  patientId: string;
  type: ClinicalEventType;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  /** Si está anulado (solo para citas/presupuestos) */
  cancelled?: boolean;
  createdAt: string; // ISO
}

export interface ClinicalEventCitaAgendada extends ClinicalEventBase {
  type: "cita_agendada";
  doctorName: string;
  status: AppointmentStatusDisplay;
  reason?: string;
}

export interface ClinicalEventPrestacion extends ClinicalEventBase {
  type: "prestacion_realizada";
  planId?: string;
  prestacion: string;
  doctorName: string;
}

export interface ClinicalEventPresupuesto extends ClinicalEventBase {
  type: "presupuesto_creado";
  label?: string; // ej. "Nuevo plan de tratamiento"
}

export type ClinicalEvent =
  | ClinicalEventCitaAgendada
  | ClinicalEventPrestacion
  | ClinicalEventPresupuesto;

const STORAGE_KEY = "psg_clinical_history";

function loadEvents(): ClinicalEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ClinicalEvent[];
  } catch {
    return [];
  }
}

function saveEvents(events: ClinicalEvent[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

export function getClinicalEventsByPatient(patientId: string): ClinicalEvent[] {
  ensureClinicalHistorySeed();
  return loadEvents().filter((e) => e.patientId === patientId);
}

export function addClinicalEvent(event: Omit<ClinicalEvent, "id" | "createdAt">): ClinicalEvent {
  const events = loadEvents();
  const newEvent: ClinicalEvent = {
    ...event,
    id: `ev-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    createdAt: new Date().toISOString(),
  } as ClinicalEvent;
  events.push(newEvent);
  saveEvents(events);
  return newEvent;
}

export function getSeedEvents(): ClinicalEvent[] {
  return [
    {
      id: "ev-seed-1",
      patientId: "p1",
      type: "presupuesto_creado",
      date: "2025-06-01",
      time: "10:00",
      createdAt: "2025-06-01T10:00:00.000Z",
      label: "Nuevo plan de tratamiento",
    },
    {
      id: "ev-seed-2",
      patientId: "p1",
      type: "cita_agendada",
      date: "2025-06-10",
      time: "09:00",
      doctorName: "Dra. María González",
      status: "atendido",
      reason: "Evaluación ortodoncia",
      createdAt: "2025-06-10T09:00:00.000Z",
    },
    {
      id: "ev-seed-3",
      patientId: "p1",
      type: "prestacion_realizada",
      date: "2025-06-10",
      time: "09:30",
      planId: "9781",
      prestacion: "Evaluación y plan de tratamiento",
      doctorName: "Dra. María González",
      createdAt: "2025-06-10T09:30:00.000Z",
    },
    {
      id: "ev-seed-4",
      patientId: "p1",
      type: "cita_agendada",
      date: "2025-07-15",
      time: "14:00",
      doctorName: "Dra. María González",
      status: "atendido",
      reason: "Colocación de brackets",
      createdAt: "2025-07-15T14:00:00.000Z",
    },
    {
      id: "ev-seed-5",
      patientId: "p1",
      type: "prestacion_realizada",
      date: "2025-07-15",
      time: "14:15",
      planId: "9781",
      prestacion: "Colocación de aparatología fija",
      doctorName: "Dra. María González",
      createdAt: "2025-07-15T14:15:00.000Z",
    },
    {
      id: "ev-seed-6",
      patientId: "p1",
      type: "cita_agendada",
      date: "2025-08-20",
      time: "10:00",
      doctorName: "Dra. María González",
      status: "atendido",
      reason: "Ajuste",
      createdAt: "2025-08-20T10:00:00.000Z",
    },
    {
      id: "ev-seed-7",
      patientId: "p1",
      type: "cita_agendada",
      date: "2026-01-28",
      time: "09:00",
      doctorName: "Dra. María González",
      status: "atendido",
      reason: "Control de brackets",
      createdAt: "2026-01-28T09:00:00.000Z",
    },
    {
      id: "ev-seed-8",
      patientId: "p1",
      type: "cita_agendada",
      date: "2026-02-12",
      time: "09:00",
      doctorName: "Dra. María González",
      status: "confirmada",
      reason: "Control de brackets",
      createdAt: "2026-02-01T08:00:00.000Z",
    },
    {
      id: "ev-seed-9",
      patientId: "p1",
      type: "cita_agendada",
      date: "2025-09-05",
      time: "11:00",
      doctorName: "Dra. María González",
      status: "anulado",
      reason: "Control",
      cancelled: true,
      createdAt: "2025-09-01T10:00:00.000Z",
    },
    {
      id: "ev-seed-10",
      patientId: "p2",
      type: "presupuesto_creado",
      date: "2026-01-20",
      time: "09:00",
      createdAt: "2026-01-20T09:00:00.000Z",
      label: "Nuevo plan de tratamiento",
    },
    {
      id: "ev-seed-11",
      patientId: "p2",
      type: "cita_agendada",
      date: "2026-02-05",
      time: "09:30",
      doctorName: "Dr. Carlos Mendoza",
      status: "atendido",
      reason: "Tratamiento de conducto #36",
      createdAt: "2026-02-05T09:30:00.000Z",
    },
    {
      id: "ev-seed-12",
      patientId: "p2",
      type: "prestacion_realizada",
      date: "2026-02-05",
      time: "10:00",
      planId: "9782",
      prestacion: "Endodoncia pieza 36",
      doctorName: "Dr. Carlos Mendoza",
      createdAt: "2026-02-05T10:00:00.000Z",
    },
  ];
}

/** Inicializa seed si no hay datos en localStorage */
export function ensureClinicalHistorySeed(): void {
  const current = loadEvents();
  if (current.length > 0) return;
  saveEvents(getSeedEvents());
}
