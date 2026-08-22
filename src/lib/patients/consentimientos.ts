/** Consentimientos informados por paciente (dental). Persistidos en Supabase (tabla `consentimientos`). */

import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export interface Consentimiento {
  id: string;
  patientId: string;
  type: string;
  date: string;
  signed: boolean;
  signedAt?: string;
  signedByName?: string;
  createdAt: string;
}

function fromRow(row: Tables<"consentimientos">): Consentimiento {
  return {
    id: row.id,
    patientId: row.patient_id,
    type: row.type,
    date: row.date,
    signed: row.signed,
    signedAt: row.signed_at ?? undefined,
    signedByName: row.signed_by_name ?? undefined,
    createdAt: row.created_at,
  };
}

export async function getConsentimientosByPatient(patientId: string): Promise<Consentimiento[]> {
  const { data, error } = await supabase
    .from("consentimientos")
    .select("*")
    .eq("patient_id", patientId)
    .order("date", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(fromRow);
}

export async function addConsentimiento(data: Omit<Consentimiento, "id" | "createdAt">): Promise<Consentimiento> {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) throw new Error("No autenticado");

  const { data: row, error } = await supabase
    .from("consentimientos")
    .insert({
      user_id: user.id,
      patient_id: data.patientId,
      type: data.type,
      date: data.date,
      signed: data.signed,
      signed_at: data.signedAt ?? null,
      signed_by_name: data.signedByName ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return fromRow(row);
}

export async function setConsentimientoSigned(id: string, signedByName: string): Promise<Consentimiento | undefined> {
  const { data: row, error } = await supabase
    .from("consentimientos")
    .update({
      signed: true,
      signed_at: new Date().toISOString(),
      signed_by_name: signedByName,
    })
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) throw error;
  return row ? fromRow(row) : undefined;
}
