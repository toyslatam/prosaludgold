import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Building2, Layers, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAppConfig } from "@/contexts/AppConfigContext";
import type { VerticalKey } from "@/config/demos";
import { useOnboardingAgent } from "./useOnboardingAgent";
import { OnboardingChat } from "./OnboardingChat";
import ProSaludLogo from "@/components/ProSaludLogo";

const MODULE_LABELS: Record<string, string> = {
  dental: "Odontología",
  medical: "Medicina General",
  spa: "Spa / Bienestar",
};

function ProgressItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  label: string;
  value: string | undefined;
}) {
  const filled = Boolean(value);
  return (
    <div className="flex items-start gap-2.5">
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
        style={{ background: filled ? "rgba(45,212,191,0.15)" : "rgba(255,255,255,0.05)" }}
      >
        <Icon
          className="w-3.5 h-3.5"
          style={{ color: filled ? "#2dd4bf" : "rgba(255,255,255,0.25)" }}
        />
      </div>
      <div className="min-w-0">
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{label}</p>
        {filled ? (
          <p className="text-xs font-medium text-white truncate">{value}</p>
        ) : (
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>Pendiente</p>
        )}
      </div>
    </div>
  );
}

export function OnboardingWizard() {
  const { completeOnboarding } = useAppConfig();
  const { messages, collectedData, isLoading, isDone, isSimulated, sendMessage } = useOnboardingAgent();
  const [saving, setSaving] = useState(false);

  const handleComplete = async () => {
    setSaving(true);
    try {
      await completeOnboarding(
        {
          ...collectedData.config,
          modules_enabled: ((collectedData.config.modules_enabled as string[] | undefined)?.length
            ? collectedData.config.modules_enabled
            : ["dental"]) as VerticalKey[],
        },
        collectedData.sedes,
      );
      toast.success("¡Configuración guardada! Bienvenido a ProSalud Gold.");
    } catch {
      toast.error("Error al guardar la configuración. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  const moduleValue = (collectedData.config.modules_enabled as string[] | undefined)
    ?.map((m) => MODULE_LABELS[m] ?? m)
    .join(", ");

  const sedeValue = collectedData.sedes.length
    ? `${collectedData.sedes.length} sede${collectedData.sedes.length > 1 ? "s" : ""}`
    : undefined;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, #0a1f1c 0%, #0d2d2a 40%, #0f3630 70%, #0a1f1c 100%)" }}
    >
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #2dd4bf 0%, transparent 70%)" }} />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #0f766e 0%, transparent 70%)" }} />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-4xl h-[90vh] max-h-[700px] rounded-2xl overflow-hidden flex shadow-2xl"
        style={{
          background: "rgba(255,255,255,0.05)",
          backdropFilter: "blur(32px)",
          border: "1px solid rgba(255,255,255,0.10)",
        }}
      >
        {/* Left: Chat */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center gap-3 px-5 py-4 shrink-0"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <ProSaludLogo size={32} />
            <div>
              <p className="font-semibold text-white text-sm">ProAssist</p>
              <p className="text-xs" style={{ color: "rgba(167,243,234,0.6)" }}>
                Asistente de configuración · ProSalud Gold
              </p>
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${isSimulated ? "bg-amber-400" : "bg-teal-400 animate-pulse"}`} />
              <span className={`text-xs ${isSimulated ? "text-amber-400" : "text-teal-400"}`}>
                {isSimulated ? "Modo sin conexión" : "En línea"}
              </span>
            </div>
          </div>

          <div className="flex-1 min-h-0">
            <OnboardingChat messages={messages} isLoading={isLoading} isSimulated={isSimulated} onSend={sendMessage} />
          </div>
        </div>

        {/* Right: Progress panel */}
        <div
          className="w-72 shrink-0 flex-col p-5 gap-5 hidden md:flex"
          style={{ borderLeft: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div>
            <p className="text-xs uppercase tracking-widest mb-3 font-medium"
              style={{ color: "rgba(167,243,234,0.5)" }}>
              Progreso de configuración
            </p>
            <div className="space-y-3">
              <ProgressItem icon={Building2} label="Nombre de clínica" value={collectedData.config.name} />
              <ProgressItem icon={Layers} label="Módulos" value={moduleValue} />
              <ProgressItem icon={MapPin} label="Sedes" value={sedeValue} />
              <ProgressItem icon={Building2} label="Teléfono" value={collectedData.config.phone ?? undefined} />
            </div>
          </div>

          {/* Sedes list */}
          {collectedData.sedes.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-widest mb-2 font-medium"
                style={{ color: "rgba(167,243,234,0.5)" }}>
                Sedes registradas
              </p>
              <div className="space-y-1.5">
                {collectedData.sedes.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
                    style={{ background: "rgba(45,212,191,0.08)", color: "rgba(255,255,255,0.75)" }}>
                    <CheckCircle2 className="w-3 h-3 text-teal-400 shrink-0" />
                    {s.name}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Complete button */}
          <div className="mt-auto">
            <AnimatePresence>
              {isDone && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Button
                    onClick={handleComplete}
                    disabled={saving}
                    className="w-full bg-teal-600 hover:bg-teal-500 text-white font-semibold"
                  >
                    {saving ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Guardando...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Completar configuración
                      </span>
                    )}
                  </Button>
                  <p className="text-xs text-center mt-2" style={{ color: "rgba(255,255,255,0.35)" }}>
                    Podrás editar todo en Configuración
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Mobile: complete button at bottom */}
      <AnimatePresence>
        {isDone && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden fixed bottom-6 left-4 right-4 z-[60]"
          >
            <Button
              onClick={handleComplete}
              disabled={saving}
              className="w-full bg-teal-600 hover:bg-teal-500 text-white font-semibold py-3"
            >
              {saving ? "Guardando..." : "Completar configuración"}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
