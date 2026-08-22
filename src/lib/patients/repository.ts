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
  };
}

export async function getPatients(): Promise<Patient[]> {
  const { data, error } = await supabase.from("patients").select("*").order("name");
  if (error) throw error;
  return (data ?? []).map(fromRow);
}

export async function getPatientById(id: string): Promise<Patient | undefined> {
  const { data, error } = await supabase.from("patients").select("*").eq("id", id).maybeSingle();
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
