import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { VerticalKey } from "@/config/demos";

export interface ClinicConfig {
  id: string;
  user_id: string;
  name: string;
  ruc: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  country: string;
  currency: string;
  timezone: string;
  language: string;
  modules_enabled: VerticalKey[];
  notify_whatsapp: boolean;
  notify_email: boolean;
  notify_inventory_alert: boolean;
  notify_payment: boolean;
  onboarding_complete: boolean;
  created_at: string;
  updated_at: string;
}

export interface Sede {
  id: string;
  clinic_config_id: string;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  active: boolean;
  modules_enabled: VerticalKey[];
  schedule: Record<string, { open: string; close: string }>;
  created_at: string;
  updated_at: string;
}

interface AppConfigContextValue {
  clinicConfig: ClinicConfig | null;
  sedes: Sede[];
  enabledModules: VerticalKey[];
  isOnboardingComplete: boolean;
  isLoading: boolean;
  reload: () => Promise<void>;
  saveConfig: (data: Partial<Omit<ClinicConfig, "id" | "user_id" | "created_at" | "updated_at">>) => Promise<void>;
  saveSede: (sede: Partial<Sede> & { name: string }) => Promise<void>;
  updateSede: (id: string, data: Partial<Sede>) => Promise<void>;
  deleteSede: (id: string) => Promise<void>;
  completeOnboarding: (
    config: Partial<ClinicConfig>,
    sedesList: Array<Partial<Sede> & { name: string }>
  ) => Promise<void>;
}

const AppConfigContext = createContext<AppConfigContextValue | null>(null);

export function AppConfigProvider({ children }: { children: React.ReactNode }) {
  const [clinicConfig, setClinicConfig] = useState<ClinicConfig | null>(null);
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadConfig = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setIsLoading(false); return; }

      const { data: config, error } = await supabase
        .from("clinic_config")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        // No tratar un error de red/RLS como "todavía no configuró la clínica":
        // eso forzaría el asistente de onboarding de nuevo aunque la config
        // ya exista. Se deja el estado anterior intacto y solo se registra.
        console.error("Error cargando clinic_config:", error);
        return;
      }

      if (config) {
        setClinicConfig(config as ClinicConfig);

        const { data: sedesData, error: sedesError } = await supabase
          .from("sedes")
          .select("*")
          .eq("clinic_config_id", config.id)
          .order("created_at");

        if (sedesError) {
          console.error("Error cargando sedes:", sedesError);
        } else {
          setSedes((sedesData ?? []) as Sede[]);
        }
      } else {
        setClinicConfig(null);
        setSedes([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const saveConfig = useCallback(async (data: Partial<Omit<ClinicConfig, "id" | "user_id" | "created_at" | "updated_at">>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No autenticado");

    if (clinicConfig) {
      const { data: updated, error } = await supabase
        .from("clinic_config")
        .update(data)
        .eq("id", clinicConfig.id)
        .select()
        .single();
      if (error) throw error;
      setClinicConfig(updated as ClinicConfig);
    } else {
      const { data: created, error } = await supabase
        .from("clinic_config")
        .insert({ ...data, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      setClinicConfig(created as ClinicConfig);
    }
  }, [clinicConfig]);

  const saveSede = useCallback(async (sede: Partial<Sede> & { name: string }) => {
    if (!clinicConfig) throw new Error("No hay configuración de clínica");
    const { data, error } = await supabase
      .from("sedes")
      .insert({ ...sede, clinic_config_id: clinicConfig.id })
      .select()
      .single();
    if (error) throw error;
    setSedes((prev) => [...prev, data as Sede]);
  }, [clinicConfig]);

  const updateSede = useCallback(async (id: string, data: Partial<Sede>) => {
    const { data: updated, error } = await supabase
      .from("sedes")
      .update(data)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    setSedes((prev) => prev.map((s) => (s.id === id ? (updated as Sede) : s)));
  }, []);

  const deleteSede = useCallback(async (id: string) => {
    const { error } = await supabase.from("sedes").delete().eq("id", id);
    if (error) throw error;
    setSedes((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const completeOnboarding = useCallback(async (
    config: Partial<ClinicConfig>,
    sedesList: Array<Partial<Sede> & { name: string }>
  ) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No autenticado");

    // Upsert clinic_config
    let configId = clinicConfig?.id;
    if (configId) {
      const { data: updated, error } = await supabase
        .from("clinic_config")
        .update({ ...config, onboarding_complete: true })
        .eq("id", configId)
        .select()
        .single();
      if (error) throw error;
      setClinicConfig(updated as ClinicConfig);
    } else {
      const { data: created, error } = await supabase
        .from("clinic_config")
        .insert({ ...config, user_id: user.id, onboarding_complete: true })
        .select()
        .single();
      if (error) throw error;
      setClinicConfig(created as ClinicConfig);
      configId = (created as ClinicConfig).id;
    }

    // Insert sedes
    if (sedesList.length > 0 && configId) {
      const { data: createdSedes, error: sedesError } = await supabase
        .from("sedes")
        .insert(sedesList.map((s) => ({ ...s, clinic_config_id: configId })))
        .select();
      if (sedesError) throw sedesError;
      setSedes((createdSedes ?? []) as Sede[]);
    }
  }, [clinicConfig]);

  const enabledModules: VerticalKey[] = clinicConfig?.modules_enabled?.length
    ? clinicConfig.modules_enabled
    : ["dental"];

  const isOnboardingComplete = clinicConfig?.onboarding_complete ?? false;

  return (
    <AppConfigContext.Provider
      value={{
        clinicConfig,
        sedes,
        enabledModules,
        isOnboardingComplete,
        isLoading,
        reload: loadConfig,
        saveConfig,
        saveSede,
        updateSede,
        deleteSede,
        completeOnboarding,
      }}
    >
      {children}
    </AppConfigContext.Provider>
  );
}

export function useAppConfig() {
  const ctx = useContext(AppConfigContext);
  if (!ctx) throw new Error("useAppConfig debe usarse dentro de AppConfigProvider");
  return ctx;
}
