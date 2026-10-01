// Genera la URL de autorización de QuickBooks para el usuario logueado.
// La app llama esto (con su JWT) y hace window.location.href = url.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { buildAuthorizeUrl } from "../_shared/quickbooks.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS_HEADERS });

  const authHeader = req.headers.get("authorization") ?? "";
  const jwt = authHeader.replace(/^Bearer\s+/i, "");
  if (!jwt) {
    return Response.json({ error: "Falta autorización" }, { status: 401, headers: CORS_HEADERS });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { global: { headers: { Authorization: authHeader } } }
  );
  const { data: userData, error } = await supabase.auth.getUser(jwt);
  if (error || !userData?.user) {
    return Response.json({ error: "Sesión inválida" }, { status: 401, headers: CORS_HEADERS });
  }

  // NOTA: simplificación MVP — el state es solo el user_id (no hay nonce
  // persistido server-side para validar CSRF). Suficiente porque el callback
  // solo usa este valor para saber en qué fila insertar la conexión.
  const state = userData.user.id;
  const url = buildAuthorizeUrl(state);

  return Response.json({ url }, { headers: CORS_HEADERS });
});
