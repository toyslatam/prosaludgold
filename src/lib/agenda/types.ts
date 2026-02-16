/** Tipos raw para persistencia (repo/API). Compatible con UI AppointmentWithDetails al hidratar. */
import type { AppointmentStatus, SituationFinancial, Confirmations } from "@/types/agenda";

export interface AppointmentRow {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  duration: number;
  status: AppointmentStatus;
  branch: string;
  reason: string;
  procedureId?: string | null;
  chairId?: string | null;
  situation?: SituationFinancial | null;
  confirmations: Confirmations;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PatientRow {
  id: string;
  name: string;
  phone: string;
  email: string;
  situation: SituationFinancial;
  birthDate?: string;
  cedula?: string;
  lastVisit?: string;
  nextAppointment?: string;
  balance: number;
}

export interface DoctorRow {
  id: string;
  name: string;
  specialty: string;
  branch: string;
  available: boolean;
  colorTag?: string;
}

export interface ChairRow {
  id: string;
  name: string;
  branch?: string;
}
