import type { VerticalKey } from "@/config/demos";
import type { EncounterFormConfig } from "./types";

const dental: EncounterFormConfig = {
  vertical: "dental",
  title: "Atención Odontológica",
  proceduresLabel: "Procedimientos",
  proceduresAddLabel: "Agregar procedimiento",
  notesLabel: "Evolución odontológica",
  showProcedureZone: true,
};

const medical: EncounterFormConfig = {
  vertical: "medical",
  title: "Consulta médica",
  proceduresLabel: "Actos médicos / Servicios",
  proceduresAddLabel: "Agregar acto o servicio",
  notesLabel: "Notas clínicas",
  showReasonForVisit: true,
  showDiagnosis: true,
  showVitals: true,
  showPrescription: true,
};

const spa: EncounterFormConfig = {
  vertical: "spa",
  title: "Sesión / Atención",
  proceduresLabel: "Servicios",
  proceduresAddLabel: "Agregar servicio",
  notesLabel: "Notas de sesión",
  showCabin: true,
};

const configs: Record<Exclude<VerticalKey, "multi">, EncounterFormConfig> = {
  dental,
  medical,
  spa,
};

export function getEncounterFormConfig(vertical: VerticalKey): EncounterFormConfig {
  return configs[vertical] ?? dental;
}

export type { EncounterFormConfig } from "./types";
