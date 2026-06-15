import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY") ?? "";

const SYSTEM_PROMPT = `Eres ProAssist, el asistente de configuración inteligente de ProSalud Gold.
Tu misión es guiar al administrador de una clínica de salud para configurar su sistema por primera vez.
Hablas en español, eres profesional, amigable y conciso.

Tu rol es recolectar la siguiente información mediante una conversación natural:
1. Nombre de la clínica (campo: name) - REQUERIDO
2. RUC o identificación fiscal (campo: ruc)
3. Dirección principal (campo: address)
4. Teléfono (campo: phone)
5. Email de contacto (campo: email)
6. País (campo: country) - por defecto "PA" (Panamá)
7. Moneda (campo: currency) - por defecto "USD"
8. Módulos a habilitar (campo: modules_enabled) - REQUERIDO - opciones: "dental" (Odontología), "medical" (Medicina General), "spa" (Spa/Bienestar). Puede ser uno o varios.
9. Sedes: al menos una sede principal con nombre (name), dirección (address) y teléfono (phone)

REGLAS IMPORTANTES:
- Haz UNA sola pregunta a la vez
- Cuando el usuario responda, extrae el dato y pasa a la siguiente pregunta pendiente
- Sé conciso: no repitas lo que el usuario ya dijo
- Para módulos, presenta las opciones claramente: Odontología, Medicina General, Spa
- Para sedes, pregunta si hay más sedes después de registrar la primera
- Cuando hayas recolectado name + modules_enabled + al menos una sede, considera el onboarding completo

FORMATO DE RESPUESTA JSON ESTRICTO:
Siempre responde con un JSON con esta estructura exacta:
{
  "message": "Tu mensaje al usuario (texto amigable)",
  "extracted": {
    "name": "valor si se mencionó",
    "ruc": "valor si se mencionó",
    "address": "valor si se mencionó",
    "phone": "valor si se mencionó",
    "email": "valor si se mencionó",
    "country": "valor si se mencionó",
    "currency": "valor si se mencionó",
    "modules_enabled": ["dental", "medical", "spa"] solo los seleccionados,
    "sedes": [{ "name": "", "address": "", "phone": "" }]
  },
  "done": false
}

Cuando el onboarding esté completo (name + modules + al menos 1 sede), pon "done": true y un mensaje de bienvenida entusiasta.
Solo incluye en "extracted" los campos que el usuario mencionó en ESTE mensaje. No repitas campos ya guardados.`;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface RequestBody {
  messages: ChatMessage[];
  currentData: Record<string, unknown>;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  try {
    const body: RequestBody = await req.json();
    const { messages, currentData } = body;

    const systemWithContext = `${SYSTEM_PROMPT}

Datos ya recolectados hasta ahora:
${JSON.stringify(currentData, null, 2)}

Basa tu próxima pregunta en lo que falta por recolectar.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        system: systemWithContext,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return new Response(JSON.stringify({ error: "AI service error", detail: err }), {
        status: 500,
        headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
      });
    }

    const aiResponse = await response.json();
    const rawContent = aiResponse.content?.[0]?.text ?? "{}";

    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = rawContent.match(/```(?:json)?\s*([\s\S]*?)```/) ?? [null, rawContent];
    const jsonStr = jsonMatch[1]?.trim() ?? rawContent.trim();

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      parsed = { message: rawContent, extracted: {}, done: false };
    }

    return new Response(JSON.stringify(parsed), {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal error", detail: String(err) }), {
      status: 500,
      headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
    });
  }
});
