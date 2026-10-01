/**
 * Persistencia de atenciones/consultas/sesiones (multi-vertical).
 * Antes vivía solo en localStorage; ahora en la tabla `care_encounters`.
 */

import { supabase } from "@/integrations/supabase/client";
import type { CareEncounter } from "@/types/careEncounter";
import type { VerticalKey } from "@/config/demos";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const anyFrom = (table: string) => (supabase as any).from(table);

interface CareEncounterRow {
  id: string;
  vertical: string;
  patient_id: string;
  professional_id: string | null;
  start_at: string;
  status: "DRAFT" | "COMPLETED";
  site_id: string | null;
  location_id: string | null;
  procedures: CareEncounter["procedures"];
  inventory_used: CareEncounter["inventoryUsed"];
  clinical_notes: string | null;
  vertical_data: CareEncounter["verticalData"] | null;
  created_at: string;
  updated_at: string;
}

function fromRow(row: CareEncounterRow): CareEncounter {
  return {
    id: row.id,
    vertical: row.vertical as VerticalKey,
    patientId: row.patient_id,
    professionalId: row.professional_id ?? "",
    startAt: row.start_at,
    status: row.status,
    siteId: row.site_id ?? undefined,
    locationId: row.location_id ?? undefined,
    procedures: row.procedures ?? [],
    inventoryUsed: row.inventory_used ?? [],
    clinicalNotes: row.clinical_notes ?? undefined,
    verticalData: row.vertical_data ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toRow(data: Omit<CareEncounter, "id" | "createdAt" | "updatedAt">) {
  return {
    vertical: data.vertical,
    patient_id: data.patientId,
    professional_id: data.professionalId || null,
    start_at: data.startAt,
    status: data.status,
    site_id: data.siteId ?? null,
    location_id: data.locationId ?? null,
    procedures: data.procedures,
    inventory_used: data.inventoryUsed,
    clinical_notes: data.clinicalNotes ?? null,
    vertical_data: data.verticalData ?? null,
  };
}

export async function getEncounters(vertical?: VerticalKey): Promise<CareEncounter[]> {
  let query = anyFrom("care_encounters").select("*").order("start_at", { ascending: false });
  if (vertical) query = query.eq("vertical", vertical);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(fromRow);
}

export async function getEncounterById(id: string): Promise<CareEncounter | undefined> {
  const { data, error } = await anyFrom("care_encounters").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? fromRow(data) : undefined;
}

export async function saveEncounter(
  data: Omit<CareEncounter, "id" | "createdAt" | "updatedAt">
): Promise<CareEncounter> {
  const { data: created, error } = await anyFrom("care_encounters")
    .insert(toRow(data))
    .select()
    .single();
  if (error) throw error;
  return fromRow(created);
}

export async function updateEncounter(
  id: string,
  data: Partial<Omit<CareEncounter, "id" | "createdAt">>
): Promise<CareEncounter | null> {
  const patch: Record<string, unknown> = {};
  if (data.vertical !== undefined) patch.vertical = data.vertical;
  if (data.patientId !== undefined) patch.patient_id = data.patientId;
  if (data.professionalId !== undefined) patch.professional_id = data.professionalId || null;
  if (data.startAt !== undefined) patch.start_at = data.startAt;
  if (data.status !== undefined) patch.status = data.status;
  if (data.siteId !== undefined) patch.site_id = data.siteId ?? null;
  if (data.locationId !== undefined) patch.location_id = data.locationId ?? null;
  if (data.procedures !== undefined) patch.procedures = data.procedures;
  if (data.inventoryUsed !== undefined) patch.inventory_used = data.inventoryUsed;
  if (data.clinicalNotes !== undefined) patch.clinical_notes = data.clinicalNotes ?? null;
  if (data.verticalData !== undefined) patch.vertical_data = data.verticalData ?? null;

  const { data: updated, error } = await anyFrom("care_encounters")
    .update(patch)
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) throw error;
  return updated ? fromRow(updated) : null;
}
