/** Evoluciones clínicas por paciente (dental). Persistidas en Supabase (tabla `evoluciones`). */

import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export interface Evolucion {
  id: string;
  patientId: string;
  date: string;
  time: string;
  doctorId: string;
  doctorName: string;
  procedureIds?: string[];
  notes: string;
  createdAt: string;
}

function fromRow(row: Tables<"evoluciones">): Evolucion {
  return {
    id: row.id,
    patientId: row.patient_id,
    date: row.date,
    time: row.time,
    doctorId: row.doctor_id,
    doctorName: row.doctor_name,
    procedureIds: row.procedure_ids ?? undefined,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

export async function getEvolucionesByPatient(patientId: string): Promise<Evolucion[]> {
  const { data, error } = await supabase
    .from("evoluciones")
    .select("*")
    .eq("patient_id", patientId)
    .order("date", { ascending: false })
    .order("time", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(fromRow);
}

export async function addEvolucion(data: Omit<Evolucion, "id" | "createdAt">): Promise<Evolucion> {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) throw new Error("No autenticado");

  const { data: row, error } = await supabase
    .from("evoluciones")
    .insert({
      user_id: user.id,
      patient_id: data.patientId,
      date: data.date,
      time: data.time,
      doctor_id: data.doctorId,
      doctor_name: data.doctorName,
      procedure_ids: data.procedureIds ?? [],
      notes: data.notes,
    })
    .select()
    .single();
  if (error) throw error;
  return fromRow(row);
}
