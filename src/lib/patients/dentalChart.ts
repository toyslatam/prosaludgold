/**
 * Odontograma FDI por paciente.
 * Estructura: dientes por ID (FDI 11-18, 21-28, 31-38, 41-48 en permanente;
 * 51-55, 61-65, 71-75, 81-85 en temporal).
 */

export type DentalCondition =
  | "caries"
  | "obturacion"
  | "corona"
  | "endodoncia"
  | "extraccion"
  | "ausente"
  | "sellante"
  | "implante"
  | "protesis";

export const DENTAL_CONDITION_LABELS: Record<DentalCondition, string> = {
  caries: "Caries",
  obturacion: "Obturación",
  corona: "Corona",
  endodoncia: "Endodoncia",
  extraccion: "Extracción",
  ausente: "Ausente",
  sellante: "Sellante",
  implante: "Implante",
  protesis: "Prótesis",
};

export const DENTAL_CONDITION_COLORS: Record<DentalCondition, string> = {
  caries: "#dc2626",
  obturacion: "#2563eb",
  corona: "#ca8a04",
  endodoncia: "#9333ea",
  extraccion: "#737373",
  ausente: "#404040",
  sellante: "#059669",
  implante: "#0891b2",
  protesis: "#4f46e5",
};

/** Superficies (opcional): Oclusal, Mesial, Distal, Vestibular, Lingual */
export type SurfaceCode = "O" | "M" | "D" | "V" | "L";

/** Tipo de registro: procedimiento (prestación) o condición (lesión/preexistencia) */
export type OdontogramRecordType = "PROCEDURE" | "CONDITION";
export type ConditionKind = "LESION" | "PREEXISTENCE";

export interface ToothCondition {
  id: string;
  type: DentalCondition;
  surfaces?: SurfaceCode[];
  /** Si viene de record: procedimiento o condición; por defecto CONDITION (compat) */
  recordType?: OdontogramRecordType;
  /** Solo si recordType === "CONDITION" */
  conditionKind?: ConditionKind;
}

export interface ToothData {
  conditions: ToothCondition[];
}

export interface PatientDentalChart {
  patientId: string;
  /** Permanente (true) o Temporal (false) */
  permanent: boolean;
  teeth: Record<string, ToothData>;
  updatedAt: string;
}

const STORAGE_KEY = "psg_dental_charts";

function loadCharts(): PatientDentalChart[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as PatientDentalChart[];
  } catch {
    return [];
  }
}

function saveCharts(charts: PatientDentalChart[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(charts));
}

/** IDs FDI permanentes: superior derecha 18-11, superior izquierda 21-28, inferior izquierda 38-31, inferior derecha 41-48 */
export const PERMANENT_UPPER_RIGHT = ["18", "17", "16", "15", "14", "13", "12", "11"];
export const PERMANENT_UPPER_LEFT = ["21", "22", "23", "24", "25", "26", "27", "28"];
export const PERMANENT_LOWER_LEFT = ["38", "37", "36", "35", "34", "33", "32", "31"];
export const PERMANENT_LOWER_RIGHT = ["41", "42", "43", "44", "45", "46", "47", "48"];

/** IDs FDI temporales: 55-51, 61-65, 75-71, 81-85 */
export const TEMPORARY_UPPER_RIGHT = ["55", "54", "53", "52", "51"];
export const TEMPORARY_UPPER_LEFT = ["61", "62", "63", "64", "65"];
export const TEMPORARY_LOWER_LEFT = ["75", "74", "73", "72", "71"];
export const TEMPORARY_LOWER_RIGHT = ["81", "82", "83", "84", "85"];

function emptyTeeth(permanent: boolean): Record<string, ToothData> {
  const ids = permanent
    ? [...PERMANENT_UPPER_RIGHT, ...PERMANENT_UPPER_LEFT, ...PERMANENT_LOWER_LEFT, ...PERMANENT_LOWER_RIGHT]
    : [...TEMPORARY_UPPER_RIGHT, ...TEMPORARY_UPPER_LEFT, ...TEMPORARY_LOWER_LEFT, ...TEMPORARY_LOWER_RIGHT];
  const rec: Record<string, ToothData> = {};
  ids.forEach((id) => (rec[id] = { conditions: [] }));
  return rec;
}

export function getDentalChart(patientId: string, permanent: boolean): PatientDentalChart {
  ensureDentalChartSeed();
  const charts = loadCharts();
  let chart = charts.find((c) => c.patientId === patientId && c.permanent === permanent);
  if (!chart) {
    chart = {
      patientId,
      permanent,
      teeth: emptyTeeth(permanent),
      updatedAt: new Date().toISOString(),
    };
    charts.push(chart);
    saveCharts(charts);
  }
  return chart;
}

export function updateDentalChart(
  patientId: string,
  permanent: boolean,
  updater: (chart: PatientDentalChart) => void
): void {
  const charts = loadCharts();
  let chart = charts.find((c) => c.patientId === patientId && c.permanent === permanent);
  if (!chart) {
    chart = {
      patientId,
      permanent,
      teeth: emptyTeeth(permanent),
      updatedAt: new Date().toISOString(),
    };
    charts.push(chart);
  }
  updater(chart);
  chart.updatedAt = new Date().toISOString();
  saveCharts(charts);
}

export function addConditionToTooth(
  patientId: string,
  permanent: boolean,
  toothId: string,
  condition: DentalCondition,
  surfaces?: SurfaceCode[]
): void {
  updateDentalChart(patientId, permanent, (chart) => {
    if (!chart.teeth[toothId]) chart.teeth[toothId] = { conditions: [] };
    chart.teeth[toothId].conditions.push({
      id: `cond-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      type: condition,
      surfaces,
    });
  });
}

export function removeConditionFromTooth(
  patientId: string,
  permanent: boolean,
  toothId: string,
  conditionId: string
): void {
  updateDentalChart(patientId, permanent, (chart) => {
    const tooth = chart.teeth[toothId];
    if (!tooth) return;
    tooth.conditions = tooth.conditions.filter((c) => c.id !== conditionId);
  });
}

/** Seed: 2-3 pacientes con algunas condiciones */
function seedCharts(): void {
  const charts = loadCharts();
  if (charts.length > 0) return;
  const now = new Date().toISOString();
  const seed: PatientDentalChart[] = [
    {
      patientId: "p1",
      permanent: true,
      teeth: {
        ...emptyTeeth(true),
        "11": { conditions: [{ id: "s1", type: "obturacion", surfaces: ["V"] }] },
        "36": { conditions: [{ id: "s2", type: "endodoncia" }] },
      },
      updatedAt: now,
    },
    {
      patientId: "p2",
      permanent: true,
      teeth: {
        ...emptyTeeth(true),
        "36": { conditions: [{ id: "s3", type: "caries" }, { id: "s4", type: "obturacion", surfaces: ["O", "M"] }] },
      },
      updatedAt: now,
    },
    {
      patientId: "p4",
      permanent: true,
      teeth: {
        ...emptyTeeth(true),
        "14": { conditions: [{ id: "s5", type: "extraccion" }] },
      },
      updatedAt: now,
    },
  ];
  saveCharts(seed);
}

export function ensureDentalChartSeed(): void {
  seedCharts();
}
