// Tipos para el módulo Agenda tipo Dentalink

export type AppointmentStatus =
  | "pendiente"
  | "confirmada"
  | "en_sala"
  | "atendida"
  | "no_asistio"
  | "anulada";

export type SituationFinancial = "deuda" | "sin_saldo" | "saldada";

export interface Confirmations {
  whatsapp: boolean;
  email: boolean;
  phone: boolean;
  auto_whatsapp?: boolean;
  agenda_online?: boolean;
}

export interface Chair {
  id: string;
  name: string;
  branch?: string;
}

/** Cita con datos denormalizados para la UI (paciente, doctor, sillón, situación) */
export interface AppointmentWithDetails {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  duration: number;
  status: AppointmentStatus;
  branch: string;
  reason: string;
  chairId?: string | null;
  chairName?: string | null;
  situation?: SituationFinancial | null;
  confirmations: Confirmations;
  notes?: string | null;
}

export type AgendaViewMode = "daily_grid" | "daily_list" | "weekly_grid" | "daily_global";

export const SITUATION_LABELS: Record<SituationFinancial, string> = {
  deuda: "Deudas",
  sin_saldo: "No hay saldo",
  saldada: "Saldada",
};

export const SITUATION_COLORS: Record<SituationFinancial, string> = {
  deuda: "bg-destructive/10 text-destructive border-destructive/20",
  sin_saldo: "bg-warning/10 text-warning border-warning/20",
  saldada: "bg-success/10 text-success border-success/20",
};
