import type { Patient } from "@/data/mockData";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

function fromRow(row: Tables<"patients">): Patient {
  return {
    id: row.id,
    name: row.name,
    cedula: row.cedula ?? "",
    phone: row.phone ?? "",
    email: row.email ?? "",
    birthDate: row.birth_date ?? "",
    lastVisit: row.last_visit ?? "",
    nextAppointment: row.next_appointment ?? "",
    balance: Number(row.balance),
    treatments: [],
    gender: (row.gender as Patient["gender"]) ?? undefined,
    address: row.address ?? undefined,
    benefits: row.benefits ?? undefined,
    branch: row.branch ?? undefined,
    assignedDoctorId: row.assigned_doctor_id ?? undefined,
    collaborators: row.collaborators?.length ? row.collaborators : undefined,
    modulesEnabled: row.modules_enabled?.length ? row.modules_enabled : undefined,
  };
}

/**
 * Colaboradores (doctores/terapeutas) vinculados a su propia ficha no deben
 * ver datos de contacto de sus pacientes (teléfono/correo/dirección) — para
 * ellos se consulta `patients_clinical` (misma RLS, sin esas columnas) en
 * vez de la tabla real. Dueño/secretarias siguen viendo la tabla completa.
 */
async function patientsSource(): Promise<"patients" | "patients_clinical"> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return "patients";
  const { data } = await supabase
    .from("clinic_members")
    .select("linked_doctor_id")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  return data?.linked_doctor_id ? "patients_clinical" : "patients";
}

/** vertical: filtra por módulo ("dental"/"medical"/"spa"); omite el filtro para "multi" o sin valor. */
export async function getPatients(vertical?: string): Promise<Patient[]> {
  const source = await patientsSource();
  let query = supabase.from(source).select("*").order("name");
  if (vertical && vertical !== "multi") {
    query = query.contains("modules_enabled", [vertical]);
  }
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(fromRow);
}

export async function getPatientById(id: string): Promise<Patient | undefined> {
  const source = await patientsSource();
  const { data, error } = await supabase.from(source).select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? fromRow(data) : undefined;
}

export async function updatePatient(
  id: string,
  patch: Partial<Pick<Patient, "name" | "cedula" | "phone" | "email" | "address" | "benefits" | "branch" | "assignedDoctorId" | "collaborators" | "lastVisit" | "nextAppointment">>
): Promise<Patient | undefined> {
  const { data, error } = await supabase
    .from("patients")
    .update({
      ...(patch.name !== undefined && { name: patch.name }),
      ...(patch.cedula !== undefined && { cedula: patch.cedula }),
      ...(patch.phone !== undefined && { phone: patch.phone }),
      ...(patch.email !== undefined && { email: patch.email }),
      ...(patch.address !== undefined && { address: patch.address }),
      ...(patch.benefits !== undefined && { benefits: patch.benefits }),
      ...(patch.branch !== undefined && { branch: patch.branch }),
      ...(patch.assignedDoctorId !== undefined && { assigned_doctor_id: patch.assignedDoctorId }),
      ...(patch.collaborators !== undefined && { collaborators: patch.collaborators }),
      ...(patch.lastVisit !== undefined && { last_visit: patch.lastVisit }),
      ...(patch.nextAppointment !== undefined && { next_appointment: patch.nextAppointment }),
    })
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data ? fromRow(data) : undefined;
}
