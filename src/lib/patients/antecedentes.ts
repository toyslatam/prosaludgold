/** Antecedentes médicos (dental) por paciente. Persistidos en Supabase (tabla `antecedentes`). */

import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export interface Antecedentes {
  patientId: string;
  alergias: string;
  enfermedadesSistemicas: string;
  medicacionActual: string;
  embarazo: string;
  habitosTabaco: string;
  habitosAlcohol: string;
  observaciones: string;
  updatedAt: string;
}

function fromRow(row: Tables<"antecedentes">): Antecedentes {
  return {
    patientId: row.patient_id,
    alergias: row.alergias,
    enfermedadesSistemicas: row.enfermedades_sistemicas,
    medicacionActual: row.medicacion_actual,
    embarazo: row.embarazo,
    habitosTabaco: row.habitos_tabaco,
    habitosAlcohol: row.habitos_alcohol,
    observaciones: row.observaciones,
    updatedAt: row.updated_at,
  };
}

export async function getAntecedentesByPatient(patientId: string): Promise<Antecedentes | null> {
  const { data, error } = await supabase
    .from("antecedentes")
    .select("*")
    .eq("patient_id", patientId)
    .maybeSingle();
  if (error) throw error;
  return data ? fromRow(data) : null;
}

export async function saveAntecedentes(data: Antecedentes): Promise<Antecedentes> {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) throw new Error("No autenticado");

  const { data: row, error } = await supabase
    .from("antecedentes")
    .upsert(
      {
        user_id: user.id,
        patient_id: data.patientId,
        alergias: data.alergias,
        enfermedades_sistemicas: data.enfermedadesSistemicas,
        medicacion_actual: data.medicacionActual,
        embarazo: data.embarazo,
        habitos_tabaco: data.habitosTabaco,
        habitos_alcohol: data.habitosAlcohol,
        observaciones: data.observaciones,
      },
      { onConflict: "user_id,patient_id" }
    )
    .select()
    .single();
  if (error) throw error;
  return fromRow(row);
}

export function getEmptyAntecedentes(patientId: string): Antecedentes {
  return {
    patientId,
    alergias: "",
    enfermedadesSistemicas: "",
    medicacionActual: "",
    embarazo: "",
    habitosTabaco: "",
    habitosAlcohol: "",
    observaciones: "",
    updatedAt: new Date().toISOString(),
  };
}
