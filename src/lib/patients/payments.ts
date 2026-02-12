/** Pagos del paciente (Facturación estilo Dentalink) */

export type PaymentStatus = "completado" | "pendiente" | "anulado";

export interface Payment {
  id: string;
  patientId: string;
  date: string;
  amount: number;
  method: string;
  reference?: string;
  status: PaymentStatus;
  description?: string;
  createdAt: string;
}

const STORAGE_KEY = "psg_patient_payments";

function loadPayments(): Payment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Payment[];
  } catch {
    return [];
  }
}

function savePayments(data: Payment[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getSeedPayments(): Payment[] {
  return [
    { id: "pay-1", patientId: "p1", date: "2025-06-10", amount: 150, method: "Tarjeta", reference: "REF-001", status: "completado", description: "Evaluación ortodoncia", createdAt: "2025-06-10T12:00:00.000Z" },
    { id: "pay-2", patientId: "p1", date: "2025-07-15", amount: 500, method: "Transferencia", reference: "REF-002", status: "completado", description: "Abono ortodoncia", createdAt: "2025-07-15T14:00:00.000Z" },
    { id: "pay-3", patientId: "p1", date: "2026-01-28", amount: 200, method: "Efectivo", reference: "REF-003", status: "completado", description: "Control brackets", createdAt: "2026-01-28T10:00:00.000Z" },
    { id: "pay-4", patientId: "p2", date: "2026-02-05", amount: 350, method: "Tarjeta", reference: "REF-004", status: "completado", description: "Endodoncia #36", createdAt: "2026-02-05T11:00:00.000Z" },
    { id: "pay-5", patientId: "p4", date: "2026-02-11", amount: 500, method: "Tarjeta de débito", reference: "REF-005", status: "completado", description: "Abono implante", createdAt: "2026-02-11T09:00:00.000Z" },
  ];
}

export function ensurePaymentsSeed(): void {
  const current = loadPayments();
  if (current.length > 0) return;
  savePayments(getSeedPayments());
}

export function getPaymentsByPatient(patientId: string): Payment[] {
  ensurePaymentsSeed();
  return loadPayments()
    .filter((p) => p.patientId === patientId)
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
}

export function addPayment(payment: Omit<Payment, "id" | "createdAt">): Payment {
  ensurePaymentsSeed();
  const list = loadPayments();
  const newPayment: Payment = {
    ...payment,
    id: `pay-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    createdAt: new Date().toISOString(),
  };
  list.push(newPayment);
  savePayments(list);
  return newPayment;
}
