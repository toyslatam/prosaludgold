/**
 * Odontograma por registros con historial. Persistidos en Supabase (tabla `odontogram_records`).
 * No se borran registros: solo se anulan (annulledAt) para trazabilidad.
 * Nomenclatura: FDI por defecto; preparado para ADA/Continuo vía setting.
 */

import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import type {
  DentalCondition,
  SurfaceCode,
  ToothData,
  PatientDentalChart,
} from "./dentalChart";
import {
  PERMANENT_UPPER_RIGHT,
  PERMANENT_UPPER_LEFT,
  PERMANENT_LOWER_LEFT,
  PERMANENT_LOWER_RIGHT,
  TEMPORARY_UPPER_RIGHT,
  TEMPORARY_UPPER_LEFT,
  TEMPORARY_LOWER_LEFT,
  TEMPORARY_LOWER_RIGHT,
} from "./dentalChart";

export type { DentalCondition, SurfaceCode };

/** Tipo de registro: procedimiento (prestación) o condición clínica (lesión/preexistencia) */
export type OdontogramRecordType = "PROCEDURE" | "CONDITION";
export type ConditionKind = "LESION" | "PREEXISTENCE";

/** Un registro = condición o procedimiento aplicado a una pieza (y opcionalmente superficies) en una fecha. */
export interface OdontogramRecord {
  id: string;
  patientId: string;
  permanent: boolean;
  toothId: string;
  condition: DentalCondition;
  /** Superficies: V vestibular, L palatino-lingual, M mesial, D distal, O oclusal-incisal */
  surfaces: SurfaceCode[];
  createdAt: string;
  /** Si está anulado (trazabilidad: no se borra) */
  annulledAt: string | null;
  /** Procedimiento o condición; registros viejos sin valor = CONDITION */
  recordType?: OdontogramRecordType;
  /** Solo si recordType === "CONDITION": lesión o preexistencia */
  conditionKind?: ConditionKind;
  /** Si recordType === "PROCEDURE" */
  procedureId?: string;
  procedureName?: string;
  doctorId?: string;
  /** Cantidad (procedimientos) */
  quantity?: number;
  notes?: string;
}

function fromRow(row: Tables<"odontogram_records">): OdontogramRecord {
  return {
    id: row.id,
    patientId: row.patient_id,
    permanent: row.permanent,
    toothId: row.tooth_id,
    condition: row.condition as DentalCondition,
    surfaces: (row.surfaces as SurfaceCode[]) ?? [],
    createdAt: row.created_at,
    annulledAt: row.annulled_at,
    recordType: (row.record_type as OdontogramRecordType) ?? "CONDITION",
    conditionKind: (row.condition_kind as ConditionKind | null) ?? undefined,
    procedureId: row.procedure_id ?? undefined,
    procedureName: row.procedure_name ?? undefined,
    doctorId: row.doctor_id ?? undefined,
    quantity: row.quantity ?? undefined,
    notes: row.notes ?? undefined,
  };
}

/** Registros activos (no anulados) del paciente */
export async function getActiveRecords(patientId: string, permanent: boolean): Promise<OdontogramRecord[]> {
  const { data, error } = await supabase
    .from("odontogram_records")
    .select("*")
    .eq("patient_id", patientId)
    .eq("permanent", permanent)
    .is("annulled_at", null);
  if (error) throw error;
  return (data ?? []).map(fromRow);
}

/** Todos los registros del paciente (activos + anulados) para historial */
export async function getAllRecords(patientId: string, permanent: boolean): Promise<OdontogramRecord[]> {
  const { data, error } = await supabase
    .from("odontogram_records")
    .select("*")
    .eq("patient_id", patientId)
    .eq("permanent", permanent)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(fromRow);
}

export async function addRecord(
  patientId: string,
  permanent: boolean,
  toothId: string,
  condition: DentalCondition,
  surfaces: SurfaceCode[] = []
): Promise<OdontogramRecord> {
  return addConditionRecord(patientId, permanent, toothId, condition, surfaces, "PREEXISTENCE");
}

/** Registro de tipo condición (lesión o preexistencia) */
export async function addConditionRecord(
  patientId: string,
  permanent: boolean,
  toothId: string,
  condition: DentalCondition,
  surfaces: SurfaceCode[] = [],
  conditionKind: ConditionKind = "PREEXISTENCE",
  notes?: string
): Promise<OdontogramRecord> {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) throw new Error("No autenticado");

  const { data: row, error } = await supabase
    .from("odontogram_records")
    .insert({
      user_id: user.id,
      patient_id: patientId,
      permanent,
      tooth_id: toothId,
      condition,
      surfaces: surfaces.length ? surfaces : [],
      record_type: "CONDITION",
      condition_kind: conditionKind,
      notes: notes ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return fromRow(row);
}

/** Registro de tipo procedimiento (prestación) */
export async function addProcedureRecord(
  patientId: string,
  permanent: boolean,
  toothId: string,
  surfaces: SurfaceCode[],
  options: {
    procedureId?: string;
    procedureName: string;
    doctorId?: string;
    quantity?: number;
    notes?: string;
  }
): Promise<OdontogramRecord> {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) throw new Error("No autenticado");

  const { data: row, error } = await supabase
    .from("odontogram_records")
    .insert({
      user_id: user.id,
      patient_id: patientId,
      permanent,
      tooth_id: toothId,
      condition: "obturacion",
      surfaces: surfaces.length ? surfaces : [],
      record_type: "PROCEDURE",
      procedure_id: options.procedureId ?? null,
      procedure_name: options.procedureName,
      doctor_id: options.doctorId ?? null,
      quantity: options.quantity ?? 1,
      notes: options.notes ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return fromRow(row);
}

export async function annulRecord(recordId: string): Promise<OdontogramRecord | undefined> {
  const { data: row, error } = await supabase
    .from("odontogram_records")
    .update({ annulled_at: new Date().toISOString() })
    .eq("id", recordId)
    .select()
    .maybeSingle();
  if (error) throw error;
  return row ? fromRow(row) : undefined;
}

/** Convierte registros activos al formato PatientDentalChart (para PDF y compat) */
export async function getChartFromRecords(patientId: string, permanent: boolean): Promise<PatientDentalChart> {
  const toothIds = permanent
    ? [
        ...PERMANENT_UPPER_RIGHT,
        ...PERMANENT_UPPER_LEFT,
        ...PERMANENT_LOWER_LEFT,
        ...PERMANENT_LOWER_RIGHT,
      ]
    : [
        ...TEMPORARY_UPPER_RIGHT,
        ...TEMPORARY_UPPER_LEFT,
        ...TEMPORARY_LOWER_LEFT,
        ...TEMPORARY_LOWER_RIGHT,
      ];
  const teeth: Record<string, ToothData> = {};
  toothIds.forEach((id) => (teeth[id] = { conditions: [] }));

  const active = await getActiveRecords(patientId, permanent);
  active.forEach((r) => {
    if (!teeth[r.toothId]) teeth[r.toothId] = { conditions: [] };
    teeth[r.toothId].conditions.push({
      id: r.id,
      type: r.condition,
      surfaces: r.surfaces.length ? r.surfaces : undefined,
      recordType: r.recordType ?? "CONDITION",
      conditionKind: r.conditionKind,
    });
  });

  return {
    patientId,
    permanent,
    teeth,
    updatedAt:
      active.length > 0
        ? active.reduce((max, r) => (r.createdAt > max ? r.createdAt : max), "")
        : new Date().toISOString(),
  };
}

export const SURFACE_LABELS: Record<SurfaceCode, string> = {
  V: "Vestibular",
  L: "Palatino/Lingual",
  M: "Mesial",
  D: "Distal",
  O: "Oclusal/Incisal",
};
