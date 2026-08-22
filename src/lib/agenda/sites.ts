/**
 * Sedes (Sucursales/Clínicas) para asociar ubicaciones.
 * Fuente única: la tabla real `sedes` (gestionada en Configuración).
 * Ya no hay un CRUD de sedes local aquí — solo lectura, filtrable por módulo.
 */

import { supabase } from "@/integrations/supabase/client";

export interface Site {
  id: string;
  name: string;
}

/** vertical: filtra por módulo ("dental"/"medical"/"spa"); omite el filtro para "multi" o sin valor. */
export async function getSites(vertical?: string): Promise<Site[]> {
  const { data, error } = await supabase
    .from("sedes")
    .select("id, name, active, modules_enabled")
    .eq("active", true)
    .order("name");
  if (error) throw error;
  const filtered = (data ?? []).filter(
    (s) =>
      !vertical ||
      vertical === "multi" ||
      !s.modules_enabled?.length ||
      s.modules_enabled.includes(vertical)
  );
  return filtered.map((s) => ({ id: s.id, name: s.name }));
}

export async function getSiteById(id: string): Promise<Site | undefined> {
  const { data, error } = await supabase.from("sedes").select("id, name").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ?? undefined;
}
