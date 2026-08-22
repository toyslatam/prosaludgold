/**
 * Labels del módulo "Planes de tratamiento" por vertical.
 * dental/medical: plan de tratamiento clínico. spa: paquete de sesiones/servicios.
 */
import type { VerticalKey } from "./demos/types";

export interface TreatmentPlanLabels {
  tabLabel: string;
  sectionTitle: string;
  detailTitlePrefix: string;
  newButtonLabel: string;
  newDialogTitle: string;
  namePlaceholder: string;
  professionalLabel: string;
  itemsLabel: string;
  itemLabelSingular: string;
  itemNamePlaceholder: string;
  addItemLabel: string;
  itemRequiredError: string;
  createdToast: string;
  createErrorToast: string;
}

const LABELS: Record<Exclude<VerticalKey, "multi">, TreatmentPlanLabels> = {
  dental: {
    tabLabel: "Planes de tratamiento",
    sectionTitle: "Planes de tratamiento",
    detailTitlePrefix: "Plan de tratamiento",
    newButtonLabel: "Nuevo plan de tratamiento",
    newDialogTitle: "Nuevo plan de tratamiento",
    namePlaceholder: "Ej: Tratamiento de conducto #36",
    professionalLabel: "Profesional a cargo",
    itemsLabel: "Prestaciones",
    itemLabelSingular: "Prestación",
    itemNamePlaceholder: "Nombre de la prestación",
    addItemLabel: "+ Añadir prestación",
    itemRequiredError: "Agregue al menos una prestación con nombre y precio",
    createdToast: "Plan de tratamiento creado",
    createErrorToast: "No se pudo crear el plan de tratamiento.",
  },
  medical: {
    tabLabel: "Planes de tratamiento",
    sectionTitle: "Planes de tratamiento",
    detailTitlePrefix: "Plan de tratamiento",
    newButtonLabel: "Nuevo plan de tratamiento",
    newDialogTitle: "Nuevo plan de tratamiento",
    namePlaceholder: "Ej: Control de hipertensión",
    professionalLabel: "Médico a cargo",
    itemsLabel: "Prestaciones",
    itemLabelSingular: "Prestación",
    itemNamePlaceholder: "Nombre de la prestación",
    addItemLabel: "+ Añadir prestación",
    itemRequiredError: "Agregue al menos una prestación con nombre y precio",
    createdToast: "Plan de tratamiento creado",
    createErrorToast: "No se pudo crear el plan de tratamiento.",
  },
  spa: {
    tabLabel: "Paquetes de servicios",
    sectionTitle: "Paquetes de servicios",
    detailTitlePrefix: "Paquete de servicios",
    newButtonLabel: "Nuevo paquete de servicios",
    newDialogTitle: "Nuevo paquete de servicios",
    namePlaceholder: "Ej: Paquete 10 masajes relajantes",
    professionalLabel: "Terapeuta a cargo",
    itemsLabel: "Servicios",
    itemLabelSingular: "Servicio",
    itemNamePlaceholder: "Nombre del servicio",
    addItemLabel: "+ Añadir servicio",
    itemRequiredError: "Agregue al menos un servicio con nombre y precio",
    createdToast: "Paquete de servicios creado",
    createErrorToast: "No se pudo crear el paquete de servicios.",
  },
};

export function getTreatmentPlanLabels(vertical: string): TreatmentPlanLabels {
  const key = vertical as VerticalKey;
  return LABELS[key] ?? LABELS.dental;
}
