/** Documentos clínicos adjuntos por paciente (dental). */

export interface ClinicalDocument {
  id: string;
  patientId: string;
  type: string;
  name: string;
  date: string;
  doctorId?: string;
  doctorName?: string;
  fileRef?: string; // base64 o URL en demo
  status: "borrador" | "final";
  createdAt: string;
}

const STORAGE_KEY = "psg_clinical_documents";

function load(): ClinicalDocument[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ClinicalDocument[];
  } catch {
    return [];
  }
}

function save(list: ClinicalDocument[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function getClinicalDocumentsByPatient(patientId: string): ClinicalDocument[] {
  return load()
    .filter((d) => d.patientId === patientId)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function addClinicalDocument(
  data: Omit<ClinicalDocument, "id" | "createdAt">
): ClinicalDocument {
  const list = load();
  const doc: ClinicalDocument = {
    ...data,
    id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    createdAt: new Date().toISOString(),
  };
  list.push(doc);
  save(list);
  return doc;
}

export function updateClinicalDocument(
  id: string,
  patch: Partial<Pick<ClinicalDocument, "name" | "date" | "status" | "fileRef">>
): ClinicalDocument | undefined {
  const list = load();
  const idx = list.findIndex((d) => d.id === id);
  if (idx === -1) return undefined;
  list[idx] = { ...list[idx], ...patch };
  save(list);
  return list[idx];
}
