/** Planes de tratamiento (estilo Dentalink) */

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

const STORAGE_KEY = "psg_treatment_plans";

function loadPlans(): TreatmentPlan[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as TreatmentPlan[];
  } catch {
    return [];
  }
}

function savePlans(plans: TreatmentPlan[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
}

function getSeedPlans(): TreatmentPlan[] {
  return [
    {
      id: "plan-p1-1",
      patientId: "p1",
      number: "9781",
      name: "Nuevo plan de tratamiento",
      professionalId: "d1",
      professionalName: "Dra. María González",
      specialty: "Ortodoncia",
      collaborators: [],
      branch: "Sede Central",
      convenio: "Convenio oro",
      totalBudget: 3500,
      discountPercent: 0,
      realizado: 2100,
      paid: 2100,
      status: "en_curso",
      lastAppointmentDate: "2026-01-28",
      lastAppointmentTime: "09:00",
      prestaciones: [
        { id: "pr-1", name: "Evaluación y plan", discountPercent: 0, price: 150, paid: 150 },
        { id: "pr-2", name: "Colocación aparatología fija", discountPercent: 0, price: 1800, paid: 1000 },
        { id: "pr-3", name: "Controles mensuales (12)", discountPercent: 0, price: 1550, paid: 950 },
      ],
      createdAt: "2025-06-01T10:00:00.000Z",
    },
    {
      id: "plan-p2-1",
      patientId: "p2",
      number: "9782",
      name: "Tratamiento de conducto #36",
      professionalId: "d2",
      professionalName: "Dr. Carlos Mendoza",
      specialty: "Endodoncia",
      collaborators: [],
      branch: "Sede Central",
      totalBudget: 800,
      discountPercent: 0,
      realizado: 350,
      paid: 350,
      status: "en_curso",
      lastAppointmentDate: "2026-02-05",
      lastAppointmentTime: "09:30",
      prestaciones: [
        { id: "pr-4", name: "Endodoncia pieza 36", discountPercent: 0, price: 800, paid: 350 },
      ],
      createdAt: "2026-01-20T09:00:00.000Z",
    },
    {
      id: "plan-p4-1",
      patientId: "p4",
      number: "9783",
      name: "Implante dental #14",
      professionalId: "d4",
      professionalName: "Dr. Roberto Díaz",
      specialty: "Implantología",
      collaborators: [],
      branch: "Sede Central",
      totalBudget: 4500,
      discountPercent: 5,
      realizado: 2300,
      paid: 2300,
      status: "en_curso",
      lastAppointmentDate: "2026-02-10",
      lastAppointmentTime: "10:00",
      prestaciones: [
        { id: "pr-5", name: "Implante y corona", discountPercent: 5, price: 4500, paid: 2300 },
      ],
      createdAt: "2026-01-15T09:00:00.000Z",
    },
    {
      id: "plan-p1-2",
      patientId: "p1",
      number: "9770",
      name: "Limpieza y revisión",
      professionalId: "d1",
      professionalName: "Dra. María González",
      specialty: "Ortodoncia",
      collaborators: [],
      branch: "Sede Central",
      totalBudget: 120,
      discountPercent: 0,
      realizado: 120,
      paid: 120,
      status: "finalizado",
      lastAppointmentDate: "2025-05-10",
      lastAppointmentTime: "11:00",
      prestaciones: [
        { id: "pr-6", name: "Limpieza dental", discountPercent: 0, price: 120, paid: 120 },
      ],
      createdAt: "2025-05-01T09:00:00.000Z",
    },
  ];
}

export function ensureTreatmentPlansSeed(): void {
  const current = loadPlans();
  if (current.length > 0) return;
  savePlans(getSeedPlans());
}

export function getPlansByPatient(patientId: string): TreatmentPlan[] {
  ensureTreatmentPlansSeed();
  return loadPlans()
    .filter((p) => p.patientId === patientId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getPlanById(patientId: string, planId: string): TreatmentPlan | undefined {
  ensureTreatmentPlansSeed();
  const plan = loadPlans().find((p) => p.id === planId && p.patientId === patientId);
  return plan;
}

export function getPlansWithBalanceByPatient(patientId: string): TreatmentPlan[] {
  return getPlansByPatient(patientId).filter((p) => p.paid < p.totalBudget * (1 - p.discountPercent / 100));
}

/** Mock: aplica un abono a un plan (actualiza paid) */
export function applyPaymentToPlan(planId: string, amount: number): void {
  const plans = loadPlans();
  const plan = plans.find((p) => p.id === planId);
  if (!plan) return;
  const maxPay = plan.totalBudget * (1 - plan.discountPercent / 100) - plan.paid;
  const toApply = Math.min(amount, Math.max(0, maxPay));
  plan.paid += toApply;
  if (plan.paid >= plan.totalBudget * (1 - plan.discountPercent / 100)) {
    plan.status = "finalizado";
  }
  savePlans(plans);
}
