/**
 * Config de formulario de atención por vertical (labels, secciones visibles).
 */

import type { VerticalKey } from "@/config/demos";

export interface EncounterFormConfig {
  vertical: VerticalKey;
  title: string;
  /** Label de la sección procedimientos (ej. "Procedimientos" | "Actos médicos" | "Servicios") */
  proceduresLabel: string;
  /** Label del placeholder/agregar procedimiento */
  proceduresAddLabel: string;
  /** Label del bloque de notas clínicas */
  notesLabel: string;
  /** Mostrar campo "Pieza/Zona" por procedimiento (dental) */
  showProcedureZone?: boolean;
  /** Mostrar sección Motivo de consulta (medical) */
  showReasonForVisit?: boolean;
  /** Mostrar sección Diagnóstico (medical) */
  showDiagnosis?: boolean;
  /** Mostrar signos vitales (medical) */
  showVitals?: boolean;
  /** Mostrar sección Receta (medical) */
  showPrescription?: boolean;
  /** Label del campo de ubicación/sala (ej. "Ubicación" | "Cabina / Sala") */
  locationLabel?: string;
}
