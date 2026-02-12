// Mock data for ProSalud Gold demo

export interface Appointment {
  id: string;
  patientName: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  duration: number;
  status: "pendiente" | "confirmada" | "en_sala" | "atendida" | "no_asistio";
  branch: string;
  reason: string;
}

export interface Patient {
  id: string;
  name: string;
  cedula: string;
  phone: string;
  email: string;
  birthDate: string;
  lastVisit: string;
  nextAppointment: string;
  balance: number;
  treatments: Treatment[];
  /** Sexo para ficha tipo Dentalink */
  gender?: "M" | "F" | "Otro";
  /** Dirección (opcional) */
  address?: string;
  /** Convenio/beneficio para badge en header */
  benefits?: string;
  /** Sucursal asignada */
  branch?: string;
  /** Profesional a cargo (id o nombre) */
  assignedDoctorId?: string;
  /** Colaboradores (nombres o ids) */
  collaborators?: string[];
}

export interface Treatment {
  id: string;
  name: string;
  status: "pendiente" | "en_curso" | "completado";
  cost: number;
  paid: number;
  date: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  branch: string;
  available: boolean;
}

export interface CashEntry {
  id: string;
  date: string;
  type: "ingreso" | "egreso";
  description: string;
  amount: number;
  method: string;
  patient?: string;
}

export interface LabOrder {
  id: string;
  patient: string;
  doctor: string;
  lab: string;
  work: string;
  status: "solicitado" | "en_proceso" | "recibido" | "entregado";
  date: string;
  cost: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  stock: number;
  minStock: number;
  unit: string;
  supplier: string;
}

export const mockDoctors: Doctor[] = [
  { id: "d1", name: "Dra. María González", specialty: "Ortodoncia", branch: "Sede Central", available: true },
  { id: "d2", name: "Dr. Carlos Mendoza", specialty: "Endodoncia", branch: "Sede Central", available: true },
  { id: "d3", name: "Dra. Ana Castillo", specialty: "Odontopediatría", branch: "Sede Sur", available: false },
  { id: "d4", name: "Dr. Roberto Díaz", specialty: "Implantología", branch: "Sede Central", available: true },
  { id: "d5", name: "Dra. Laura Herrera", specialty: "Periodoncia", branch: "Sede Norte", available: true },
];

export const mockAppointments: Appointment[] = [
  { id: "a1", patientName: "Sofía Ramírez", doctorName: "Dra. María González", specialty: "Ortodoncia", date: "2026-02-12", time: "09:00", duration: 45, status: "confirmada", branch: "Sede Central", reason: "Control de brackets" },
  { id: "a2", patientName: "Juan Pérez", doctorName: "Dr. Carlos Mendoza", specialty: "Endodoncia", date: "2026-02-12", time: "09:30", duration: 60, status: "en_sala", branch: "Sede Central", reason: "Tratamiento de conducto" },
  { id: "a3", patientName: "María López", doctorName: "Dra. Ana Castillo", specialty: "Odontopediatría", date: "2026-02-12", time: "10:00", duration: 30, status: "pendiente", branch: "Sede Sur", reason: "Revisión general" },
  { id: "a4", patientName: "Pedro Morales", doctorName: "Dr. Roberto Díaz", specialty: "Implantología", date: "2026-02-12", time: "10:30", duration: 90, status: "atendida", branch: "Sede Central", reason: "Colocación de implante" },
  { id: "a5", patientName: "Carolina Vega", doctorName: "Dra. Laura Herrera", specialty: "Periodoncia", date: "2026-02-12", time: "11:00", duration: 45, status: "no_asistio", branch: "Sede Norte", reason: "Limpieza profunda" },
  { id: "a6", patientName: "Luis Torres", doctorName: "Dra. María González", specialty: "Ortodoncia", date: "2026-02-12", time: "14:00", duration: 30, status: "pendiente", branch: "Sede Central", reason: "Ajuste de aparato" },
  { id: "a7", patientName: "Andrea Silva", doctorName: "Dr. Carlos Mendoza", specialty: "Endodoncia", date: "2026-02-12", time: "15:00", duration: 60, status: "confirmada", branch: "Sede Central", reason: "Reconstrucción" },
];

export const mockPatients: Patient[] = [
  { id: "p1", name: "Sofía Ramírez", cedula: "8-765-4321", phone: "+507 6123-4567", email: "sofia.ramirez@email.com", birthDate: "1990-05-15", lastVisit: "2026-01-28", nextAppointment: "2026-02-12", balance: 0, treatments: [{ id: "t1", name: "Ortodoncia completa", status: "en_curso", cost: 3500, paid: 2100, date: "2025-06-10" }], gender: "F", benefits: "Convenio oro", branch: "Sede Central", assignedDoctorId: "d1" },
  { id: "p2", name: "Juan Pérez", cedula: "3-234-5678", phone: "+507 6234-5678", email: "juan.perez@email.com", birthDate: "1985-11-22", lastVisit: "2026-02-05", nextAppointment: "2026-02-12", balance: 450, treatments: [{ id: "t2", name: "Tratamiento de conducto #36", status: "en_curso", cost: 800, paid: 350, date: "2026-02-05" }], gender: "M", branch: "Sede Central", assignedDoctorId: "d2" },
  { id: "p3", name: "María López", cedula: "9-876-5432", phone: "+507 6345-6789", email: "maria.lopez@email.com", birthDate: "2015-03-08", lastVisit: "2025-12-15", nextAppointment: "2026-02-12", balance: 0, treatments: [{ id: "t3", name: "Revisión semestral", status: "completado", cost: 75, paid: 75, date: "2025-12-15" }], gender: "F", branch: "Sede Sur", assignedDoctorId: "d3" },
  { id: "p4", name: "Pedro Morales", cedula: "4-567-8901", phone: "+507 6456-7890", email: "pedro.morales@email.com", birthDate: "1978-08-30", lastVisit: "2026-02-10", nextAppointment: "2026-02-12", balance: 2200, treatments: [{ id: "t4", name: "Implante dental #14", status: "en_curso", cost: 4500, paid: 2300, date: "2026-01-15" }], gender: "M", address: "Calle 50, Panamá", branch: "Sede Central", assignedDoctorId: "d4" },
  { id: "p5", name: "Carolina Vega", cedula: "7-890-1234", phone: "+507 6567-8901", email: "carolina.vega@email.com", birthDate: "1995-01-12", lastVisit: "2026-01-20", nextAppointment: "2026-02-12", balance: 150, treatments: [{ id: "t5", name: "Periodoncia - Fase 1", status: "en_curso", cost: 600, paid: 450, date: "2026-01-20" }], gender: "F", benefits: "Seguro dental", branch: "Sede Norte", assignedDoctorId: "d5" },
];

export const mockCashEntries: CashEntry[] = [
  { id: "c1", date: "2026-02-12", type: "ingreso", description: "Pago consulta - Ortodoncia", amount: 150, method: "Tarjeta de crédito", patient: "Sofía Ramírez" },
  { id: "c2", date: "2026-02-12", type: "ingreso", description: "Abono tratamiento conducto", amount: 200, method: "Transferencia", patient: "Juan Pérez" },
  { id: "c3", date: "2026-02-12", type: "egreso", description: "Compra material de impresión", amount: 85, method: "Efectivo" },
  { id: "c4", date: "2026-02-11", type: "ingreso", description: "Pago implante - Abono", amount: 500, method: "Tarjeta de débito", patient: "Pedro Morales" },
  { id: "c5", date: "2026-02-11", type: "ingreso", description: "Limpieza dental", amount: 120, method: "Efectivo", patient: "Andrea Silva" },
  { id: "c6", date: "2026-02-11", type: "egreso", description: "Pago laboratorio dental", amount: 350, method: "Transferencia" },
];

export const mockInventory: InventoryItem[] = [
  { id: "i1", name: "Guantes de nitrilo (caja)", category: "Descartables", stock: 45, minStock: 20, unit: "cajas", supplier: "MedSupply Panamá" },
  { id: "i2", name: "Resina compuesta A2", category: "Restauración", stock: 8, minStock: 10, unit: "jeringas", supplier: "DentalPro" },
  { id: "i3", name: "Anestesia Lidocaína 2%", category: "Anestesia", stock: 120, minStock: 50, unit: "carpules", supplier: "MedSupply Panamá" },
  { id: "i4", name: "Brackets metálicos", category: "Ortodoncia", stock: 3, minStock: 5, unit: "kits", supplier: "OrthoMax" },
  { id: "i5", name: "Implantes titanio 4x13mm", category: "Implantología", stock: 6, minStock: 4, unit: "unidades", supplier: "ImplantDirect" },
  { id: "i6", name: "Algodón dental (bolsa)", category: "Descartables", stock: 30, minStock: 15, unit: "bolsas", supplier: "MedSupply Panamá" },
];

export const mockLabOrders: LabOrder[] = [
  { id: "l1", patient: "Pedro Morales", doctor: "Dr. Roberto Díaz", lab: "Lab Dental Panamá", work: "Corona de zirconio #14", status: "en_proceso", date: "2026-02-08", cost: 280 },
  { id: "l2", patient: "Sofía Ramírez", doctor: "Dra. María González", lab: "OrthoLab", work: "Retenedor superior", status: "solicitado", date: "2026-02-11", cost: 150 },
  { id: "l3", patient: "Luis Torres", doctor: "Dr. Carlos Mendoza", lab: "Lab Dental Panamá", work: "Carilla de porcelana #11", status: "recibido", date: "2026-02-01", cost: 320 },
];

export const statusColors: Record<string, string> = {
  pendiente: "bg-warning/10 text-warning border-warning/20",
  confirmada: "bg-info/10 text-info border-info/20",
  en_sala: "bg-primary/10 text-primary border-primary/20",
  atendida: "bg-success/10 text-success border-success/20",
  no_asistio: "bg-destructive/10 text-destructive border-destructive/20",
  anulada: "bg-muted text-muted-foreground border-border",
  en_curso: "bg-info/10 text-info border-info/20",
  completado: "bg-success/10 text-success border-success/20",
  solicitado: "bg-warning/10 text-warning border-warning/20",
  en_proceso: "bg-info/10 text-info border-info/20",
  recibido: "bg-primary/10 text-primary border-primary/20",
  entregado: "bg-success/10 text-success border-success/20",
};

export const statusLabels: Record<string, string> = {
  pendiente: "Pendiente",
  confirmada: "Confirmada",
  en_sala: "En sala de espera",
  atendida: "Atendida",
  no_asistio: "No asistió",
  anulada: "Anulada",
  en_curso: "En curso",
  completado: "Completado",
  solicitado: "Solicitado",
  en_proceso: "En proceso",
  recibido: "Recibido",
  entregado: "Entregado",
};
