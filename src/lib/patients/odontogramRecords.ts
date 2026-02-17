/**
 * Odontograma por registros con historial.
 * No se borran registros: solo se anulan (annulledAt) para trazabilidad.
 * Nomenclatura: FDI por defecto; preparado para ADA/Continuo vía setting.
 */

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

const STORAGE_KEY = "psg_odontogram_records";

const ALL_SURFACES: SurfaceCode[] = ["V", "L", "M", "D", "O"];

function loadRecords(): OdontogramRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as OdontogramRecord[];
  } catch {
    return [];
  }
}

function saveRecords(records: OdontogramRecord[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

/** Registros activos (no anulados) del paciente */
export function getActiveRecords(
  patientId: string,
  permanent: boolean
): OdontogramRecord[] {
  return loadRecords().filter(
    (r) =>
      r.patientId === patientId &&
      r.permanent === permanent &&
      r.annulledAt == null
  );
}

/** Todos los registros del paciente (activos + anulados) para historial */
export function getAllRecords(
  patientId: string,
  permanent: boolean
): OdontogramRecord[] {
  return loadRecords()
    .filter((r) => r.patientId === patientId && r.permanent === permanent)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

export function addRecord(
  patientId: string,
  permanent: boolean,
  toothId: string,
  condition: DentalCondition,
  surfaces: SurfaceCode[] = []
): OdontogramRecord {
  return addConditionRecord(patientId, permanent, toothId, condition, surfaces, "PREEXISTENCE");
}

/** Registro de tipo condición (lesión o preexistencia) */
export function addConditionRecord(
  patientId: string,
  permanent: boolean,
  toothId: string,
  condition: DentalCondition,
  surfaces: SurfaceCode[] = [],
  conditionKind: ConditionKind = "PREEXISTENCE",
  notes?: string
): OdontogramRecord {
  const records = loadRecords();
  const record: OdontogramRecord = {
    id: `rec-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    patientId,
    permanent,
    toothId,
    condition,
    surfaces: surfaces.length ? surfaces : [],
    createdAt: new Date().toISOString(),
    annulledAt: null,
    recordType: "CONDITION",
    conditionKind,
    notes,
  };
  records.push(record);
  saveRecords(records);
  return record;
}

/** Registro de tipo procedimiento (prestación) */
export function addProcedureRecord(
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
): OdontogramRecord {
  const records = loadRecords();
  const record: OdontogramRecord = {
    id: `rec-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    patientId,
    permanent,
    toothId,
    condition: "obturacion",
    surfaces: surfaces.length ? surfaces : [],
    createdAt: new Date().toISOString(),
    annulledAt: null,
    recordType: "PROCEDURE",
    procedureId: options.procedureId,
    procedureName: options.procedureName,
    doctorId: options.doctorId,
    quantity: options.quantity ?? 1,
    notes: options.notes,
  };
  records.push(record);
  saveRecords(records);
  return record;
}

export function annulRecord(recordId: string): OdontogramRecord | undefined {
  const records = loadRecords();
  const idx = records.findIndex((r) => r.id === recordId);
  if (idx === -1) return undefined;
  records[idx] = {
    ...records[idx],
    annulledAt: new Date().toISOString(),
  };
  saveRecords(records);
  return records[idx];
}

/** Convierte registros activos al formato PatientDentalChart (para PDF y compat) */
export function getChartFromRecords(
  patientId: string,
  permanent: boolean
): PatientDentalChart {
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

  const active = getActiveRecords(patientId, permanent);
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
        ? active.reduce(
            (max, r) => (r.createdAt > max ? r.createdAt : max),
            ""
          )
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

/** Migra datos del chart legacy (psg_dental_charts) a registros (una sola vez) */
export function migrateLegacyChartsToRecords(): void {
  const records = loadRecords();
  if (records.length > 0) return;
  try {
    const raw = localStorage.getItem("psg_dental_charts");
    if (!raw) return;
    const charts = JSON.parse(raw) as Array<{
      patientId: string;
      permanent: boolean;
      teeth: Record<string, { conditions: Array<{ id: string; type: string; surfaces?: SurfaceCode[] }> }>;
    }>;
    const newRecords: OdontogramRecord[] = [];
    charts.forEach((c) => {
      Object.entries(c.teeth || {}).forEach(([toothId, toothData]) => {
        (toothData.conditions || []).forEach((cond) => {
          newRecords.push({
            id: cond.id,
            patientId: c.patientId,
            permanent: c.permanent,
            toothId,
            condition: cond.type as DentalCondition,
            surfaces: cond.surfaces ?? [],
            createdAt: new Date().toISOString(),
            annulledAt: null,
            recordType: "CONDITION",
          });
        });
      });
    });
    if (newRecords.length > 0) {
      saveRecords(newRecords);
    }
  } catch {
    // ignore
  }
}
