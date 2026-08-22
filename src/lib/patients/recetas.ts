/** Recetas (dental) por paciente. Persistidas en Supabase (tabla `recetas`). */

import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export interface RecetaMedicamento {
  nombre: string;
  dosis: string;
  frecuencia: string;
  duracion: string;
  indicaciones: string;
}

export interface Receta {
  id: string;
  patientId: string;
  date: string;
  doctorId: string;
  doctorName: string;
  medicamentos: RecetaMedicamento[];
  indicacionesGenerales: string;
  createdAt: string;
}

function fromRow(row: Tables<"recetas">): Receta {
  return {
    id: row.id,
    patientId: row.patient_id,
    date: row.date,
    doctorId: row.doctor_id,
    doctorName: row.doctor_name,
    medicamentos: (row.medicamentos as unknown as RecetaMedicamento[]) ?? [],
    indicacionesGenerales: row.indicaciones_generales,
    createdAt: row.created_at,
  };
}

export async function getRecetasByPatient(patientId: string): Promise<Receta[]> {
  const { data, error } = await supabase
    .from("recetas")
    .select("*")
    .eq("patient_id", patientId)
    .order("date", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(fromRow);
}

export async function getRecetaById(id: string): Promise<Receta | undefined> {
  const { data, error } = await supabase.from("recetas").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? fromRow(data) : undefined;
}

export async function addReceta(data: Omit<Receta, "id" | "createdAt">): Promise<Receta> {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) throw new Error("No autenticado");

  const { data: row, error } = await supabase
    .from("recetas")
    .insert({
      user_id: user.id,
      patient_id: data.patientId,
      date: data.date,
      doctor_id: data.doctorId,
      doctor_name: data.doctorName,
      medicamentos: data.medicamentos as unknown as Tables<"recetas">["medicamentos"],
      indicaciones_generales: data.indicacionesGenerales,
    })
    .select()
    .single();
  if (error) throw error;
  return fromRow(row);
}

export async function updateReceta(
  id: string,
  patch: Partial<Pick<Receta, "date" | "doctorId" | "doctorName" | "medicamentos" | "indicacionesGenerales">>
): Promise<Receta | undefined> {
  const { data: row, error } = await supabase
    .from("recetas")
    .update({
      ...(patch.date !== undefined && { date: patch.date }),
      ...(patch.doctorId !== undefined && { doctor_id: patch.doctorId }),
      ...(patch.doctorName !== undefined && { doctor_name: patch.doctorName }),
      ...(patch.medicamentos !== undefined && {
        medicamentos: patch.medicamentos as unknown as Tables<"recetas">["medicamentos"],
      }),
      ...(patch.indicacionesGenerales !== undefined && { indicaciones_generales: patch.indicacionesGenerales }),
    })
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) throw error;
  return row ? fromRow(row) : undefined;
}

export async function removeReceta(id: string): Promise<boolean> {
  const { error, count } = await supabase.from("recetas").delete({ count: "exact" }).eq("id", id);
  if (error) throw error;
  return (count ?? 0) > 0;
}
