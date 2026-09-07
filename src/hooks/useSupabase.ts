import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import type { AppointmentWithDetails, AppointmentStatus } from "@/types/agenda";

// ── Types for joined queries ──────────────────────────────────

type AppointmentJoined = {
  id: string;
  patient_id: string;
  doctor_id: string;
  date: string;
  time: string;
  duration: number;
  branch: string;
  reason: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  patients: { id: string; name: string } | null;
  doctors: { id: string; name: string; specialty: string } | null;
};

type LabOrderJoined = {
  id: string;
  patient_id: string;
  doctor_id: string;
  lab: string;
  work: string;
  cost: number;
  date: string;
  status: string;
  created_at: string;
  updated_at: string;
  patients: { id: string; name: string } | null;
  doctors: { id: string; name: string } | null;
};

type CashEntryJoined = {
  id: string;
  patient_id: string | null;
  description: string;
  amount: number;
  type: string;
  method: string | null;
  category: string | null;
  date: string;
  created_at: string;
  updated_at: string;
  patients: { id: string; name: string } | null;
};

// ── New local types (tables added in migration 002) ───────────

export type PayrollEntry = {
  id: string;
  doctor_id: string;
  period: string;
  percentage: number;
  sessions: number;
  gross_amount: number;
  total_amount: number;
  status: "pendiente" | "liquidado";
  /** A quién pertenece esta fila: el profesional o la clínica (su contraparte). */
  party: "doctor" | "clinic";
  notes: string | null;
  created_at: string;
  updated_at: string;
  doctors?: { id: string; name: string; specialty: string; branch: string } | null;
};

export type PatientFeedback = {
  id: string;
  patient_id: string | null;
  patient_name: string | null;
  rating: number;
  nps_score: number | null;
  comment: string | null;
  date: string;
  created_at: string;
};

function mapToAppointmentWithDetails(apt: AppointmentJoined): AppointmentWithDetails {
  return {
    id: apt.id,
    patientId: apt.patient_id,
    patientName: apt.patients?.name ?? "Paciente",
    doctorId: apt.doctor_id,
    doctorName: apt.doctors?.name ?? "Doctor",
    specialty: apt.doctors?.specialty ?? "",
    date: apt.date,
    time: apt.time,
    duration: apt.duration,
    status: apt.status as AppointmentStatus,
    branch: apt.branch,
    reason: apt.reason ?? "",
    procedureId: null,
    chairId: null,
    chairName: null,
    situation: null,
    confirmations: { whatsapp: false, email: false, phone: false },
    notes: null,
  };
}

// ── PATIENTS ──────────────────────────────────────────────────

/** vertical: filtra por módulo ("dental"/"medical"/"spa"); omite el filtro para "multi" o sin valor. */
export const usePatients = (vertical?: string) =>
  useQuery({
    queryKey: ["patients", vertical ?? "all"],
    queryFn: async () => {
      let query = supabase.from("patients").select("*").order("name");
      if (vertical && vertical !== "multi") {
        query = query.contains("modules_enabled", [vertical]);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

export const useInsertPatient = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patient: TablesInsert<"patients">) => {
      const { data, error } = await supabase
        .from("patients")
        .insert(patient)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["patients"] }),
  });
};

export const useUpdatePatient = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: TablesUpdate<"patients"> }) => {
      const { data, error } = await supabase
        .from("patients")
        .update(patch)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["patients"] }),
  });
};

// ── DOCTORS ───────────────────────────────────────────────────

/** vertical: filtra por módulo ("dental"/"medical"/"spa"); omite el filtro para "multi" o sin valor. */
export const useDoctors = (vertical?: string) =>
  useQuery({
    queryKey: ["doctors", vertical ?? "all"],
    queryFn: async () => {
      let query = supabase.from("doctors").select("*").order("name");
      if (vertical && vertical !== "multi") {
        query = query.contains("modules_enabled", [vertical]);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

export const useInsertDoctor = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (doctor: TablesInsert<"doctors">) => {
      const { data, error } = await supabase
        .from("doctors")
        .insert(doctor)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["doctors"] }),
  });
};

export const useUpdateDoctor = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: TablesUpdate<"doctors"> }) => {
      const { data, error } = await supabase
        .from("doctors")
        .update(patch)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["doctors"] }),
  });
};

// ── APPOINTMENTS ──────────────────────────────────────────────

export const useAppointments = (date?: string) =>
  useQuery({
    queryKey: ["appointments", date ?? "all"],
    queryFn: async () => {
      let query = supabase
        .from("appointments")
        .select("*, patients(id, name), doctors(id, name, specialty)")
        .order("date")
        .order("time");
      if (date) query = query.eq("date", date);
      const { data, error } = await query;
      if (error) throw error;
      return (data as unknown as AppointmentJoined[]).map(mapToAppointmentWithDetails);
    },
  });

export const useInsertAppointment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (apt: TablesInsert<"appointments">) => {
      const { data, error } = await supabase
        .from("appointments")
        .insert(apt)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["appointments"] }),
  });
};

export const useUpdateAppointment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: TablesUpdate<"appointments"> }) => {
      const { data, error } = await supabase
        .from("appointments")
        .update(patch)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["appointments"] }),
  });
};

export const useDeleteAppointment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("appointments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["appointments"] }),
  });
};

// ── CASH ENTRIES ──────────────────────────────────────────────

export const useCashEntries = (date?: string) =>
  useQuery({
    queryKey: ["cash_entries", date ?? "all"],
    queryFn: async () => {
      let query = supabase
        .from("cash_entries")
        .select("*, patients(id, name)")
        .order("date", { ascending: false })
        .order("created_at", { ascending: false });
      if (date) query = query.eq("date", date);
      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as CashEntryJoined[];
    },
  });

export const useInsertCashEntry = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (entry: TablesInsert<"cash_entries">) => {
      const { data, error } = await supabase
        .from("cash_entries")
        .insert(entry)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cash_entries"] }),
  });
};

// ── INVENTORY ITEMS ───────────────────────────────────────────

export const useInventoryItems = () =>
  useQuery({
    queryKey: ["inventory_items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inventory_items")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

export const useInsertInventoryItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (item: TablesInsert<"inventory_items">) => {
      const { data, error } = await supabase
        .from("inventory_items")
        .insert(item)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["inventory_items"] }),
  });
};

export const useUpdateInventoryItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: TablesUpdate<"inventory_items"> }) => {
      const { data, error } = await supabase
        .from("inventory_items")
        .update(patch)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["inventory_items"] }),
  });
};

// ── LAB ORDERS ────────────────────────────────────────────────

export const useLabOrders = () =>
  useQuery({
    queryKey: ["lab_orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lab_orders")
        .select("*, patients(id, name), doctors(id, name)")
        .order("date", { ascending: false });
      if (error) throw error;
      return data as unknown as LabOrderJoined[];
    },
  });

export const useInsertLabOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (order: TablesInsert<"lab_orders">) => {
      const { data, error } = await supabase
        .from("lab_orders")
        .insert(order)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lab_orders"] }),
  });
};

export const useUpdateLabOrderStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: TablesUpdate<"lab_orders">["status"] }) => {
      const { data, error } = await supabase
        .from("lab_orders")
        .update({ status })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lab_orders"] }),
  });
};

// ── TREATMENTS ────────────────────────────────────────────────

export const useTreatments = (patientId?: string) =>
  useQuery({
    queryKey: ["treatments", patientId ?? "all"],
    queryFn: async () => {
      let query = supabase.from("treatments").select("*").order("date", { ascending: false });
      if (patientId) query = query.eq("patient_id", patientId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

// ── PAYROLL ENTRIES ───────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const anyFrom = (table: string) => (supabase as any).from(table);

export const usePayrollEntries = (period?: string) =>
  useQuery({
    queryKey: ["payroll_entries", period ?? "all"],
    queryFn: async (): Promise<PayrollEntry[]> => {
      let q = anyFrom("payroll_entries")
        .select("*, doctors(id, name, specialty, branch)")
        .order("period", { ascending: false });
      if (period) q = q.eq("period", period);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });

export const useInsertPayrollEntry = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (entry: Omit<PayrollEntry, "id" | "created_at" | "updated_at" | "doctors">) => {
      const { data, error } = await anyFrom("payroll_entries").insert(entry).select().single();
      if (error) throw error;
      return data as PayrollEntry;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["payroll_entries"] }),
  });
};

export const useUpdatePayrollEntry = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<PayrollEntry> }) => {
      const { data, error } = await anyFrom("payroll_entries").update(patch).eq("id", id).select().single();
      if (error) throw error;
      return data as PayrollEntry;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["payroll_entries"] }),
  });
};

export const useDeletePayrollEntry = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await anyFrom("payroll_entries").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["payroll_entries"] }),
  });
};

// ── PATIENT FEEDBACK ──────────────────────────────────────────

export const usePatientFeedback = () =>
  useQuery({
    queryKey: ["patient_feedback"],
    queryFn: async (): Promise<PatientFeedback[]> => {
      const { data, error } = await anyFrom("patient_feedback")
        .select("*")
        .order("date", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

export const useInsertPatientFeedback = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (fb: Omit<PatientFeedback, "id" | "created_at">) => {
      const { data, error } = await anyFrom("patient_feedback").insert(fb).select().single();
      if (error) throw error;
      return data as PatientFeedback;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["patient_feedback"] }),
  });
};

// ── GASTOS (cash_entries egreso with category) ────────────────

export const useInsertGasto = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (entry: {
      description: string;
      amount: number;
      method: string | null;
      category: string | null;
      date: string;
    }) => {
      const { data, error } = await anyFrom("cash_entries")
        .insert({ ...entry, type: "egreso" })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cash_entries"] }),
  });
};

export const useInsertTreatment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (treatment: TablesInsert<"treatments">) => {
      const { data, error } = await supabase
        .from("treatments")
        .insert(treatment)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["treatments"] }),
  });
};
