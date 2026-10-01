// Recibe el redirect de Intuit tras la autorización (code + state + realmId).
// Intercambia el code por tokens, guarda la conexión, y redirige de vuelta a la app.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { exchangeCodeForTokens, saveConnection } from "../_shared/quickbooks.ts";

const APP_URL = Deno.env.get("QUICKBOOKS_APP_RETURN_URL") ??
  "https://prosaludgold.plataformapty.cloud/demo/multi/configuracion";

function redirect(status: "connected" | "error", message?: string) {
  const url = new URL(APP_URL);
  url.searchParams.set("qb", status);
  if (message) url.searchParams.set("qb_message", message);
  return new Response(null, { status: 302, headers: { Location: url.toString() } });
}

Deno.serve(async (req: Request) => {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const realmId = url.searchParams.get("realmId");
  const authError = url.searchParams.get("error");

  if (authError) return redirect("error", authError);
  if (!code || !state || !realmId) return redirect("error", "missing_params");

  try {
    const tokens = await exchangeCodeForTokens(code);

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    // state = user_id (ver quickbooks-oauth-start)
    await saveConnection(supabaseAdmin, state, realmId, tokens);

    return redirect("connected");
  } catch (e) {
    console.error("quickbooks-oauth-callback error", e);
    return redirect("error", "token_exchange_failed");
  }
});
