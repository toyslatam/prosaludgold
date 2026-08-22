/** Planes de tratamiento (estilo Dentalink). Persistidos en Supabase (tabla `treatment_plans`). */

import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type PlanFinancialStatus = "diagnostico" | "en_curso" | "finalizado";

export interface Prestacion {
  id: string;
  sectionLabel?: string;
  name: string;
  discountPercent?: number;
  price: number;
  paid?: number;
}

export interface TreatmentPlan {
  id: string;
  patientId: string;
  /** Número visible (ej. 9781) */
  number: string;
  name: string;
  professionalId: string;
  professionalName: string;
  specialty?: string;
  collaborators: string[];
  branch?: string;
  convenio?: string;
  /** Presupuesto total */
  totalBudget: number;
  /** Descuento comercial % */
  discountPercent: number;
  /** Realizado (monto facturado/realizado) */
  realizado: number;
  /** Abonado por el paciente */
  paid: number;
  status: PlanFinancialStatus;
  lastAppointmentDate?: string;
  lastAppointmentTime?: string;
  prestaciones: Prestacion[];
  createdAt: string;
}

function fromRow(row: Tables<"treatment_plans">): TreatmentPlan {
  return {
    id: row.id,
    patientId: row.patient_id,
    number: row.number,
    name: row.name,
    professionalId: row.professional_id,
    professionalName: row.professional_name,
    specialty: row.specialty ?? undefined,
    collaborators: row.collaborators ?? [],
    branch: row.branch ?? undefined,
    convenio: row.convenio ?? undefined,
    totalBudget: Number(row.total_budget),
    discountPercent: Number(row.discount_percent),
    realizado: Number(row.realizado),
    paid: Number(row.paid),
    status: row.status as PlanFinancialStatus,
    lastAppointmentDate: row.last_appointment_date ?? undefined,
    lastAppointmentTime: row.last_appointment_time ?? undefined,
    prestaciones: (row.prestaciones as unknown as Prestacion[]) ?? [],
    createdAt: row.created_at,
  };
}

export async function addTreatmentPlan(
  data: Omit<TreatmentPlan, "id" | "createdAt" | "number" | "realizado" | "paid" | "status"> & {
    number?: string;
  }
): Promise<TreatmentPlan> {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) throw new Error("No autenticado");

  const number = data.number ?? String(Math.floor(1000 + Math.random() * 9000));

  const { data: row, error } = await supabase
    .from("treatment_plans")
    .insert({
      user_id: user.id,
      patient_id: data.patientId,
      number,
      name: data.name,
      professional_id: data.professionalId,
      professional_name: data.professionalName,
      specialty: data.specialty ?? null,
      collaborators: data.collaborators ?? [],
      branch: data.branch ?? null,
      convenio: data.convenio ?? null,
      total_budget: data.totalBudget,
      discount_percent: data.discountPercent,
      realizado: 0,
      paid: 0,
      status: "diagnostico",
      last_appointment_date: data.lastAppointmentDate ?? null,
      last_appointment_time: data.lastAppointmentTime ?? null,
      prestaciones: data.prestaciones as unknown as Tables<"treatment_plans">["prestaciones"],
    })
    .select()
    .single();
  if (error) throw error;
  return fromRow(row);
}

export async function getPlansByPatient(patientId: string): Promise<TreatmentPlan[]> {
  const { data, error } = await supabase
    .from("treatment_plans")
    .select("*")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(fromRow);
}

export async function getPlanById(patientId: string, planId: string): Promise<TreatmentPlan | undefined> {
  const { data, error } = await supabase
    .from("treatment_plans")
    .select("*")
    .eq("patient_id", patientId)
    .eq("id", planId)
    .maybeSingle();
  if (error) throw error;
  return data ? fromRow(data) : undefined;
}

export async function getPlansWithBalanceByPatient(patientId: string): Promise<TreatmentPlan[]> {
  const plans = await getPlansByPatient(patientId);
  return plans.filter((p) => p.paid < p.totalBudget * (1 - p.discountPercent / 100));
}

/** Aplica un abono a un plan (actualiza paid); marca "finalizado" si cubre el saldo. */
export async function applyPaymentToPlan(planId: string, amount: number): Promise<void> {
  const { data: plan, error: fetchError } = await supabase
    .from("treatment_plans")
    .select("*")
    .eq("id", planId)
    .single();
  if (fetchError) throw fetchError;

  const totalBudget = Number(plan.total_budget);
  const discountPercent = Number(plan.discount_percent);
  const paid = Number(plan.paid);
  const maxPay = totalBudget * (1 - discountPercent / 100) - paid;
  const toApply = Math.min(amount, Math.max(0, maxPay));
  const newPaid = paid + toApply;
  const newStatus = newPaid >= totalBudget * (1 - discountPercent / 100) ? "finalizado" : plan.status;

  const { error: updateError } = await supabase
    .from("treatment_plans")
    .update({ paid: newPaid, status: newStatus })
    .eq("id", planId);
  if (updateError) throw updateError;
}
