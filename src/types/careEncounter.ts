/**
 * Modelo de atención/consulta/sesión (multi-vertical).
 * Flujo común + verticalData para dental | medical | spa.
 */

import type { VerticalKey } from "@/config/demos";

export type CareEncounterStatus = "DRAFT" | "COMPLETED";

export interface ProcedureItem {
  id: string;
  procedureId: string;
  /** Nombre por si se desvincula del catálogo */
  name: string;
  /** Opcional: pieza/zona dental (dental), etc. */
  zone?: string;
}

export interface InventoryUsedItem {
  id: string;
  productId?: string;
  name: string;
  quantity: number;
  unit?: string;
}

export interface MedicalPrescriptionItem {
  id: string;
  medicationName: string;
  presentation?: string;
  dose?: string;
  frequency?: string;
  duration?: string;
  quantity?: number;
  instructions?: string;
}

export interface MedicalPrescription {
  items: MedicalPrescriptionItem[];
  generalInstructions?: string;
}

export interface MedicalVerticalData {
  reasonForVisit?: string;
  diagnoses?: Array<{ id: string; text: string; code?: string }>;
  vitals?: {
    bp?: string;
    hr?: number;
    temp?: number;
    weight?: number;
    height?: number;
  };
  prescription?: MedicalPrescription;
}

export interface SpaVerticalData {
  therapistId?: string;
  cabinLocationId?: string;
}

export interface CareEncounterVerticalData {
  dental?: Record<string, unknown>;
  medical?: MedicalVerticalData;
  spa?: SpaVerticalData;
}

export interface CareEncounter {
  id: string;
  vertical: VerticalKey;
  patientId: string;
  professionalId: string;
  startAt: string;
  status: CareEncounterStatus;
  siteId?: string;
  locationId?: string;

  procedures: ProcedureItem[];
  inventoryUsed: InventoryUsedItem[];
  clinicalNotes?: string;

  verticalData?: CareEncounterVerticalData;
  createdAt: string;
  updatedAt: string;
}
