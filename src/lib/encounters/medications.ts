/**
 * Catálogo simple de medicamentos para demo (vertical medical).
 * Permite también medicamento libre (input) si no hay en catálogo.
 */

export interface MedicationOption {
  id: string;
  name: string;
  presentation?: string;
}

const SEED: MedicationOption[] = [
  { id: "med-1", name: "Paracetamol 500mg", presentation: "Tabletas" },
  { id: "med-2", name: "Ibuprofeno 400mg", presentation: "Tabletas" },
  { id: "med-3", name: "Amoxicilina 500mg", presentation: "Cápsulas" },
  { id: "med-4", name: "Loratadina 10mg", presentation: "Tabletas" },
  { id: "med-5", name: "Omeprazol 20mg", presentation: "Cápsulas" },
  { id: "med-6", name: "Metformina 850mg", presentation: "Tabletas" },
  { id: "med-7", name: "Losartán 50mg", presentation: "Tabletas" },
  { id: "med-8", name: "Enalapril 10mg", presentation: "Tabletas" },
  { id: "med-9", name: "Dicloxacilina 500mg", presentation: "Cápsulas" },
  { id: "med-10", name: "Dexametasona 4mg", presentation: "Tabletas" },
  { id: "med-11", name: "Prednisona 5mg", presentation: "Tabletas" },
  { id: "med-12", name: "Ranitidina 150mg", presentation: "Tabletas" },
  { id: "med-13", name: "Diazepam 10mg", presentation: "Tabletas" },
  { id: "med-14", name: "Sertralina 50mg", presentation: "Tabletas" },
  { id: "med-15", name: "Ácido acetilsalicílico 100mg", presentation: "Tabletas" },
  { id: "med-16", name: "Clonazepam 2mg", presentation: "Tabletas" },
  { id: "med-17", name: "Atorvastatina 20mg", presentation: "Tabletas" },
  { id: "med-18", name: "Amlodipino 5mg", presentation: "Tabletas" },
  { id: "med-19", name: "Salbutamol inhalador", presentation: "Inhalador" },
  { id: "med-20", name: "Ketorolaco 10mg", presentation: "Tabletas" },
];

export function getMedications(): MedicationOption[] {
  return SEED;
}

export function getMedicationById(id: string): MedicationOption | undefined {
  return SEED.find((m) => m.id === id);
}
