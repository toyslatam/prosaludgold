/** Reparto doctor/clínica para una liquidación (payroll_entries). */

export type PayrollPaymentMethod =
  | "yappy"
  | "ach"
  | "tarjeta_credito"
  | "transferencia_internacional"
  | "efectivo";

export interface PayrollSplitInput {
  doctor_id: string;
  period: string;
  sessions: number;
  gross_amount: number;
  /** % que se lleva el profesional; el resto queda para la clínica. */
  doctorPercentage: number;
  notes?: string | null;
  payment_method?: PayrollPaymentMethod | null;
  itbms_percentage?: number | null;
  is_invoiced?: boolean | null;
}

export interface PayrollSplitEntry {
  doctor_id: string;
  period: string;
  percentage: number;
  sessions: number;
  gross_amount: number;
  total_amount: number;
  status: "pendiente";
  party: "doctor" | "clinic";
  notes: string | null;
  payment_method: PayrollPaymentMethod | null;
  itbms_percentage: number | null;
  is_invoiced: boolean | null;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Devuelve las dos filas (doctor + clínica) que componen el reparto de un monto bruto. */
export function buildPayrollSplit(input: PayrollSplitInput): [PayrollSplitEntry, PayrollSplitEntry] {
  const doctorPct = Math.min(100, Math.max(0, input.doctorPercentage));
  const clinicPct = 100 - doctorPct;
  const base = {
    doctor_id: input.doctor_id,
    period: input.period,
    sessions: input.sessions,
    gross_amount: input.gross_amount,
    status: "pendiente" as const,
    notes: input.notes ?? null,
    payment_method: input.payment_method ?? null,
    itbms_percentage: input.itbms_percentage ?? null,
    is_invoiced: input.is_invoiced ?? null,
  };
  return [
    {
      ...base,
      percentage: doctorPct,
      total_amount: round2((input.gross_amount * doctorPct) / 100),
      party: "doctor",
    },
    {
      ...base,
      percentage: clinicPct,
      total_amount: round2((input.gross_amount * clinicPct) / 100),
      party: "clinic",
    },
  ];
}
