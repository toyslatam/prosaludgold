import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { ClinicConfig, Sede } from "@/contexts/AppConfigContext";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface OnboardingData {
  config: Partial<ClinicConfig>;
  sedes: Array<Partial<Sede> & { name: string }>;
}

interface AgentResponse {
  message: string;
  extracted: {
    name?: string;
    ruc?: string;
    address?: string;
    phone?: string;
    email?: string;
    country?: string;
    currency?: string;
    modules_enabled?: string[];
    sedes?: Array<{ name: string; address?: string; phone?: string }>;
  };
  done: boolean;
}

const WELCOME_MESSAGE =
  "¡Hola! Soy **ProAssist**, tu asistente de configuración. 👋\n\n" +
  "Vamos a configurar tu clínica en ProSalud Gold en pocos minutos.\n\n" +
  "Para empezar: ¿Cuál es el **nombre de tu clínica**?";

const SIMULATED_RESPONSES: AgentResponse[] = [
  {
    message: "Perfecto, ¡{name} quedó registrado! ✅\n\n¿Qué módulos vas a utilizar? Puedes elegir uno o varios:\n\n• **Odontología** — gestión dental completa\n• **Medicina General** — consultas y expedientes\n• **Spa/Bienestar** — servicios estéticos y bienestar\n\n¿Cuáles activas?",
    extracted: { name: "" },
    done: false,
  },
  {
    message: "Módulos configurados ✅\n\nAhora cuéntame sobre tu **sede principal**: ¿Cuál es el nombre y la dirección?",
    extracted: { modules_enabled: [] },
    done: false,
  },
  {
    message: "Sede registrada ✅\n\n¿Tienes **más sedes**? (responde 'sí' con el nombre y dirección, o 'no' para continuar)",
    extracted: { sedes: [] },
    done: false,
  },
  {
    message: "¡Listo! ¿Cuál es el **teléfono de contacto** de la clínica?",
    extracted: {},
    done: false,
  },
  {
    message: "¡Configuración completada! 🎉\n\nTu clínica está lista para operar en ProSalud Gold. Puedes ajustar cualquier dato en **Configuración** cuando quieras.",
    extracted: {},
    done: true,
  },
];

export function useOnboardingAgent() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: WELCOME_MESSAGE },
  ]);
  const [collectedData, setCollectedData] = useState<OnboardingData>({
    config: {},
    sedes: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [simulatedStep, setSimulatedStep] = useState(0);
  const [isSimulated, setIsSimulated] = useState(false);

  const sendMessage = useCallback(async (userInput: string) => {
    if (!userInput.trim() || isLoading) return;

    const newMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: userInput },
    ];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Try Edge Function first
      const { data, error } = await supabase.functions.invoke("onboarding-agent", {
        body: {
          messages: newMessages,
          currentData: {
            ...collectedData.config,
            sedes: collectedData.sedes,
          },
        },
      });

      if (error || !data?.message) {
        throw new Error("Edge function unavailable");
      }

      const response: AgentResponse = data;
      processResponse(response, newMessages);
    } catch (err) {
      console.error("onboarding-agent unavailable, using simulated fallback:", err);
      setIsSimulated(true);
      // Fallback: simulated responses
      const simIndex = simulatedStep % SIMULATED_RESPONSES.length;
      const simResponse = { ...SIMULATED_RESPONSES[simIndex] };

      // First response: extract the name the user just typed
      if (simIndex === 0) {
        simResponse.message = `Perfecto, **${userInput}** quedó registrado ✅\n\n¿Qué módulos vas a utilizar? Puedes elegir uno o varios:\n\n• **Odontología** — gestión dental completa\n• **Medicina General** — consultas y expedientes\n• **Spa/Bienestar** — servicios estéticos y bienestar\n\n¿Cuáles activas?`;
        simResponse.extracted = { name: userInput };
      } else if (simIndex === 1) {
        // Parse modules from user input
        const input = userInput.toLowerCase();
        const mods: string[] = [];
        if (input.includes("odonto") || input.includes("dental")) mods.push("dental");
        if (input.includes("medic") || input.includes("general")) mods.push("medical");
        if (input.includes("spa") || input.includes("bienestar") || input.includes("estet")) mods.push("spa");
        simResponse.extracted = { modules_enabled: mods.length ? mods : ["dental"] };
      } else if (simIndex === 2) {
        simResponse.extracted = {
          sedes: [{ name: userInput.split(",")[0]?.trim() ?? "Sede Principal" }],
        };
      } else if (simIndex === 3) {
        const lower = userInput.toLowerCase();
        if (lower.startsWith("no") || lower === "no") {
          simResponse.extracted = {};
        } else {
          simResponse.extracted = {
            sedes: [{ name: userInput.split(",")[0]?.trim() ?? "Sede 2" }],
          };
        }
      } else if (simIndex === 4) {
        simResponse.extracted = { phone: userInput };
      }

      setSimulatedStep((s) => s + 1);
      processResponse(simResponse, newMessages);
    }
  }, [messages, collectedData, isLoading, simulatedStep]);

  function processResponse(response: AgentResponse, updatedMessages: ChatMessage[]) {
    setMessages([...updatedMessages, { role: "assistant", content: response.message }]);

    // Merge extracted data
    setCollectedData((prev) => {
      const next = { ...prev };
      const ext = response.extracted ?? {};

      // Merge scalar config fields
      const scalarKeys: (keyof ClinicConfig)[] = ["name", "ruc", "address", "phone", "email", "country", "currency", "modules_enabled"];
      for (const k of scalarKeys) {
        const val = ext[k as keyof typeof ext];
        if (val !== undefined && val !== null && val !== "") {
          (next.config as Record<string, unknown>)[k] = val;
        }
      }

      // Merge sedes
      if (ext.sedes?.length) {
        next.sedes = [
          ...prev.sedes,
          ...ext.sedes.map((s) => ({
            name: s.name,
            address: s.address ?? null,
            phone: s.phone ?? null,
            email: null,
            active: true,
            modules_enabled: (next.config.modules_enabled ?? ["dental"]) as never[],
            schedule: {},
          })),
        ];
      }

      return next;
    });

    if (response.done) setIsDone(true);
    setIsLoading(false);
  }

  return { messages, collectedData, isLoading, isDone, isSimulated, sendMessage };
}
