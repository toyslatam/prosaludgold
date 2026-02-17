/**
 * Labels del módulo de profesionales por vertical.
 */

import type { VerticalKey } from "@/config/demos";

export interface ProfessionalsConfig {
  vertical: VerticalKey;
  /** Título sección (ej. "Especialistas", "Doctores", "Terapeutas") */
  sectionTitle: string;
  /** Label para "Nuevo profesional" */
  newButtonLabel: string;
  /** Label para botón "Especialidades" */
  specialtiesButtonLabel: string;
  /** Label estado disponible */
  availableLabel: string;
  /** Label no disponible */
  unavailableLabel: string;
  /** Label comisión */
  commissionLabel: string;
}

const configs: Record<VerticalKey, ProfessionalsConfig> = {
  dental: {
    vertical: "dental",
    sectionTitle: "Especialistas",
    newButtonLabel: "Nuevo profesional",
    specialtiesButtonLabel: "Especialidades",
    availableLabel: "Disponible",
    unavailableLabel: "No disponible",
    commissionLabel: "Comisión",
  },
  medical: {
    vertical: "medical",
    sectionTitle: "Doctores",
    newButtonLabel: "Nuevo doctor",
    specialtiesButtonLabel: "Especialidades",
    availableLabel: "Disponible",
    unavailableLabel: "No disponible",
    commissionLabel: "Comisión",
  },
  spa: {
    vertical: "spa",
    sectionTitle: "Terapeutas",
    newButtonLabel: "Nuevo terapeuta",
    specialtiesButtonLabel: "Especialidades",
    availableLabel: "Disponible",
    unavailableLabel: "No disponible",
    commissionLabel: "Comisión",
  },
};

export function getProfessionalsConfig(vertical: VerticalKey): ProfessionalsConfig {
  return configs[vertical] ?? configs.dental;
}
