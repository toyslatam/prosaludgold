export const GASTO_CATEGORIES = [
  "Materiales",
  "Laboratorio",
  "Servicios",
  "Equipos",
  "Administrativo",
  "Nómina",
  "Otro",
] as const;

export type GastoCategory = (typeof GASTO_CATEGORIES)[number];
