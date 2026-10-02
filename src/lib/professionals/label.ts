import type { VerticalKey } from "@/config/demos";

/** Término usado para el profesional que atiende, según el módulo. */
export function getProfessionalLabel(vertical: VerticalKey): { singular: string; plural: string } {
  if (vertical === "spa") return { singular: "Terapeuta", plural: "Terapeutas" };
  if (vertical === "medical") return { singular: "Médico", plural: "Médicos" };
  return { singular: "Doctor", plural: "Doctores" };
}
