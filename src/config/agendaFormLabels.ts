/**
 * Labels y placeholders del formulario de cita por vertical.
 * dental: Procedimiento, Doctor
 * medical: Procedimiento/Servicio, Doctor
 * spa: Servicio, Terapeuta
 */
import type { VerticalKey } from "./demos/types";

export interface AgendaFormLabels {
  procedureLabel: string;
  procedureSearchPlaceholder: string;
  procedureSelectPlaceholder: string;
  doctorLabel: string;
  doctorSearchPlaceholder: string;
  doctorSelectPlaceholder: string;
  doctorSelectPlaceholderAssigned: string;
  doctorHintAssigned: string;
}

const LABELS: Record<VerticalKey, AgendaFormLabels> = {
  dental: {
    procedureLabel: "Procedimiento",
    procedureSearchPlaceholder: "Buscar procedimiento…",
    procedureSelectPlaceholder: "Seleccione procedimiento",
    doctorLabel: "Doctor",
    doctorSearchPlaceholder: "Buscar por nombre o especialidad…",
    doctorSelectPlaceholder: "Seleccione doctor",
    doctorSelectPlaceholderAssigned: "Doctores asignados al procedimiento",
    doctorHintAssigned: "Solo doctores asignados a este procedimiento",
  },
  medical: {
    procedureLabel: "Servicio / Tipo de consulta",
    procedureSearchPlaceholder: "Buscar servicio…",
    procedureSelectPlaceholder: "Seleccione servicio",
    doctorLabel: "Doctor",
    doctorSearchPlaceholder: "Buscar por nombre o especialidad…",
    doctorSelectPlaceholder: "Seleccione doctor",
    doctorSelectPlaceholderAssigned: "Médicos asignados al servicio",
    doctorHintAssigned: "Solo médicos asignados a este servicio",
  },
  spa: {
    procedureLabel: "Servicio",
    procedureSearchPlaceholder: "Buscar servicio…",
    procedureSelectPlaceholder: "Seleccione servicio",
    doctorLabel: "Terapeuta",
    doctorSearchPlaceholder: "Buscar por nombre o especialidad…",
    doctorSelectPlaceholder: "Seleccione terapeuta",
    doctorSelectPlaceholderAssigned: "Terapeutas asignados al servicio",
    doctorHintAssigned: "Solo terapeutas asignados a este servicio",
  },
};

export function getAgendaFormLabels(vertical: string): AgendaFormLabels {
  const key = vertical as VerticalKey;
  return LABELS[key] ?? LABELS.dental;
}
