import type { AppointmentRow, PatientRow, DoctorRow } from "@/lib/agenda/types";
import type { Confirmations } from "@/types/agenda";
import { addDays, format } from "date-fns";

const defaultConfirmations: Confirmations = {
  whatsapp: false,
  email: false,
  phone: false,
  auto_whatsapp: false,
  agenda_online: false,
};

export const seedDoctors: DoctorRow[] = [
  { id: "d1", name: "Dra. María González", specialty: "Ortodoncia", branch: "Sede Central", available: true, colorTag: "#0ea5e9" },
  { id: "d2", name: "Dr. Carlos Mendoza", specialty: "Endodoncia", branch: "Sede Central", available: true, colorTag: "#8b5cf6" },
  { id: "d3", name: "Dra. Ana Castillo", specialty: "Odontopediatría", branch: "Sede Sur", available: false, colorTag: "#ec4899" },
  { id: "d4", name: "Dr. Roberto Díaz", specialty: "Implantología", branch: "Sede Central", available: true, colorTag: "#f59e0b" },
  { id: "d5", name: "Dra. Laura Herrera", specialty: "Periodoncia", branch: "Sede Norte", available: true, colorTag: "#10b981" },
  { id: "d6", name: "Dr. Miguel Soto", specialty: "General", branch: "Sede Central", available: true, colorTag: "#6366f1" },
  { id: "d7", name: "Dra. Patricia Ruiz", specialty: "Estética", branch: "Sede Sur", available: true, colorTag: "#14b8a6" },
  { id: "d8", name: "Dr. Fernando López", specialty: "Cirugía", branch: "Sede Central", available: true, colorTag: "#f97316" },
  { id: "d9", name: "Dra. Carmen Vega", specialty: "Ortodoncia", branch: "Sede Norte", available: true, colorTag: "#a855f7" },
  { id: "d10", name: "Dr. Jorge Martínez", specialty: "Endodoncia", branch: "Sede Sur", available: true, colorTag: "#0d9488" },
];

/** 30 pacientes con situación (deuda / sin_saldo / saldada) para seed */
export const seedPatients: PatientRow[] = [
  { id: "p1", name: "Sofía Ramírez", phone: "+507 6123-4567", email: "sofia.ramirez@email.com", situation: "saldada", balance: 0 },
  { id: "p2", name: "Juan Pérez", phone: "+507 6234-5678", email: "juan.perez@email.com", situation: "sin_saldo", balance: 450 },
  { id: "p3", name: "María López", phone: "+507 6345-6789", email: "maria.lopez@email.com", situation: "saldada", balance: 0 },
  { id: "p4", name: "Pedro Morales", phone: "+507 6456-7890", email: "pedro.morales@email.com", situation: "deuda", balance: 2200 },
  { id: "p5", name: "Carolina Vega", phone: "+507 6567-8901", email: "carolina.vega@email.com", situation: "sin_saldo", balance: 150 },
  { id: "p6", name: "Luis Torres", phone: "+507 6678-9012", email: "luis.torres@email.com", situation: "saldada", balance: 0 },
  { id: "p7", name: "Andrea Silva", phone: "+507 6789-0123", email: "andrea.silva@email.com", situation: "saldada", balance: 0 },
  { id: "p8", name: "Roberto Castro", phone: "+507 6890-1234", email: "roberto.castro@email.com", situation: "deuda", balance: 800 },
  { id: "p9", name: "Elena Mendoza", phone: "+507 6901-2345", email: "elena.mendoza@email.com", situation: "saldada", balance: 0 },
  { id: "p10", name: "Diego Herrera", phone: "+507 6012-3456", email: "diego.herrera@email.com", situation: "sin_saldo", balance: 120 },
  { id: "p11", name: "Laura Gómez", phone: "+507 6123-4568", email: "laura.gomez@email.com", situation: "saldada", balance: 0 },
  { id: "p12", name: "Martín Reyes", phone: "+507 6234-5679", email: "martin.reyes@email.com", situation: "deuda", balance: 350 },
  { id: "p13", name: "Isabel Fuentes", phone: "+507 6345-6780", email: "isabel.fuentes@email.com", situation: "saldada", balance: 0 },
  { id: "p14", name: "Andrés Navarro", phone: "+507 6456-7891", email: "andres.navarro@email.com", situation: "sin_saldo", balance: 200 },
  { id: "p15", name: "Valentina Ortiz", phone: "+507 6567-8902", email: "valentina.ortiz@email.com", situation: "saldada", balance: 0 },
  { id: "p16", name: "Ricardo Sandoval", phone: "+507 6678-9013", email: "ricardo.sandoval@email.com", situation: "deuda", balance: 1500 },
  { id: "p17", name: "Camila Ríos", phone: "+507 6789-0124", email: "camila.rios@email.com", situation: "saldada", balance: 0 },
  { id: "p18", name: "Javier Mora", phone: "+507 6890-1235", email: "javier.mora@email.com", situation: "sin_saldo", balance: 75 },
  { id: "p19", name: "Daniela Paredes", phone: "+507 6901-2346", email: "daniela.paredes@email.com", situation: "saldada", balance: 0 },
  { id: "p20", name: "Sergio Campos", phone: "+507 6012-3457", email: "sergio.campos@email.com", situation: "deuda", balance: 420 },
  { id: "p21", name: "Natalia Vargas", phone: "+507 6123-4569", email: "natalia.vargas@email.com", situation: "saldada", balance: 0 },
  { id: "p22", name: "Oscar Jiménez", phone: "+507 6234-5680", email: "oscar.jimenez@email.com", situation: "sin_saldo", balance: 90 },
  { id: "p23", name: "Gabriela Soto", phone: "+507 6345-6781", email: "gabriela.soto@email.com", situation: "saldada", balance: 0 },
  { id: "p24", name: "Hugo Delgado", phone: "+507 6456-7892", email: "hugo.delgado@email.com", situation: "deuda", balance: 600 },
  { id: "p25", name: "Paula Núñez", phone: "+507 6567-8903", email: "paula.nunez@email.com", situation: "saldada", balance: 0 },
  { id: "p26", name: "Raúl Guerrero", phone: "+507 6678-9014", email: "raul.guerrero@email.com", situation: "sin_saldo", balance: 180 },
  { id: "p27", name: "Lucía Medina", phone: "+507 6789-0125", email: "lucia.medina@email.com", situation: "saldada", balance: 0 },
  { id: "p28", name: "Emilio Rojas", phone: "+507 6890-1236", email: "emilio.rojas@email.com", situation: "deuda", balance: 1100 },
  { id: "p29", name: "Adriana Luna", phone: "+507 6901-2347", email: "adriana.luna@email.com", situation: "saldada", balance: 0 },
  { id: "p30", name: "Bruno Serrano", phone: "+507 6012-3458", email: "bruno.serrano@email.com", situation: "sin_saldo", balance: 250 },
];

/** Genera ~70 citas para la semana actual (lun–vie) con variedad de estados y confirmaciones */
function generateSeedAppointments(): AppointmentRow[] {
  const now = new Date();
  const appointments: AppointmentRow[] = [];
  let id = 1;
  const times = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00"];
  const statuses: AppointmentRow["status"][] = ["pendiente", "confirmada", "en_sala", "atendida", "no_asistio", "anulada"];
  const reasons = ["Control", "Limpieza", "Revisión", "Ortodoncia", "Endodoncia", "Implante", "Extracción", "Reconstrucción", "Periodoncia", "Revisión general"];

  for (let d = 0; d < 5; d++) {
    const date = addDays(now, d - 2);
    const dateStr = format(date, "yyyy-MM-dd");
    const numSlots = 6 + Math.floor(Math.random() * 6);
    const usedSlots = new Set<string>();

    for (let i = 0; i < numSlots; i++) {
      const time = times[Math.floor(Math.random() * times.length)];
      const slotKey = `${dateStr}-${time}`;
      if (usedSlots.has(slotKey)) continue;
      usedSlots.add(slotKey);

      const patient = seedPatients[Math.floor(Math.random() * seedPatients.length)];
      const doctor = seedDoctors[Math.floor(Math.random() * seedDoctors.length)];
      const chairIds = ["c1", "c2", "c3", "c4", "c5", "c6"];
      const chair = Math.random() > 0.3 ? { id: chairIds[Math.floor(Math.random() * chairIds.length)] } : null;
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const duration = [30, 45, 60, 90][Math.floor(Math.random() * 4)];
      const createdAt = new Date().toISOString();

      appointments.push({
        id: `apt-${id++}`,
        patientId: patient.id,
        doctorId: doctor.id,
        date: dateStr,
        time,
        duration,
        status,
        branch: doctor.branch,
        reason: reasons[Math.floor(Math.random() * reasons.length)],
        chairId: chair?.id ?? null,
        situation: patient.situation,
        confirmations: {
          ...defaultConfirmations,
          whatsapp: Math.random() > 0.5,
          email: Math.random() > 0.6,
          phone: Math.random() > 0.7,
          auto_whatsapp: Math.random() > 0.6,
        },
        notes: Math.random() > 0.7 ? "Nota interna de ejemplo" : null,
        createdAt,
        updatedAt: createdAt,
      });
    }
  }

  return appointments;
}

export const seedAppointments: AppointmentRow[] = generateSeedAppointments();
