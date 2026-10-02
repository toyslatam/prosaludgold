// Administra el staff (secretarias, etc.) vinculado a la clínica del dueño
// autenticado: crear cuenta (correo + contraseña puestos por el admin),
// actualizar permisos/estado/contraseña, o eliminar. Requiere service_role
// porque crear/editar usuarios de auth.users no es posible desde el cliente.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

interface CreateBody {
  action: "create";
  username: string;
  displayName: string;
  email: string;
  password: string;
  allowedModules: string[];
}

interface UpdateBody {
  action: "update";
  memberId: string;
  allowedModules?: string[];
  active?: boolean;
  newPassword?: string;
  displayName?: string;
}

interface DeleteBody {
  action: "delete";
  memberId: string;
}

type RequestBody = CreateBody | UpdateBody | DeleteBody;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS_HEADERS });
  if (req.method !== "POST") return jsonResponse({ ok: false, error: "Method not allowed" }, 405);

  const authHeader = req.headers.get("authorization") ?? "";
  const jwt = authHeader.replace(/^Bearer\s+/i, "");
  if (!jwt) return jsonResponse({ ok: false, error: "Falta autorización" }, 401);

  const supabaseAsUser = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { global: { headers: { Authorization: authHeader } } }
  );
  const { data: userData, error: authErr } = await supabaseAsUser.auth.getUser(jwt);
  if (authErr || !userData?.user) return jsonResponse({ ok: false, error: "Sesión inválida" }, 401);
  const callerId = userData.user.id;

  const admin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  // Solo el dueño de una clínica puede administrar su staff.
  const { data: clinic, error: clinicErr } = await admin
    .from("clinic_config")
    .select("id")
    .eq("user_id", callerId)
    .maybeSingle();
  if (clinicErr) return jsonResponse({ ok: false, error: clinicErr.message }, 500);
  if (!clinic) return jsonResponse({ ok: false, error: "Solo el dueño de la clínica puede administrar usuarios." }, 403);

  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ ok: false, error: "JSON inválido" }, 400);
  }

  try {
    if (body.action === "create") {
      const { username, displayName, email, password, allowedModules } = body;
      if (!username?.trim() || !displayName?.trim() || !email?.trim() || !password || password.length < 8) {
        return jsonResponse(
          { ok: false, error: "Usuario, nombre, correo y contraseña (mínimo 8 caracteres) son obligatorios." },
          400
        );
      }

      const { data: existing } = await admin
        .from("clinic_members")
        .select("id")
        .eq("username", username.trim())
        .maybeSingle();
      if (existing) return jsonResponse({ ok: false, error: "Ese usuario ya existe." }, 409);

      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email: email.trim(),
        password,
        email_confirm: true,
      });
      if (createErr || !created?.user) {
        return jsonResponse({ ok: false, error: createErr?.message ?? "No se pudo crear la cuenta." }, 400);
      }

      const { data: member, error: memberErr } = await admin
        .from("clinic_members")
        .insert({
          clinic_config_id: clinic.id,
          auth_user_id: created.user.id,
          username: username.trim(),
          display_name: displayName.trim(),
          role: "secretaria",
          allowed_modules: allowedModules ?? [],
          active: true,
          must_change_password: false,
        })
        .select()
        .single();
      if (memberErr) {
        // Revertir el usuario de auth creado si no se pudo guardar el miembro.
        await admin.auth.admin.deleteUser(created.user.id);
        return jsonResponse({ ok: false, error: memberErr.message }, 500);
      }

      return jsonResponse({ ok: true, member });
    }

    if (body.action === "update") {
      const { memberId, allowedModules, active, newPassword, displayName } = body;
      const { data: member, error: findErr } = await admin
        .from("clinic_members")
        .select("*")
        .eq("id", memberId)
        .eq("clinic_config_id", clinic.id)
        .maybeSingle();
      if (findErr || !member) return jsonResponse({ ok: false, error: "Usuario no encontrado." }, 404);

      if (newPassword) {
        if (newPassword.length < 8) return jsonResponse({ ok: false, error: "La contraseña debe tener mínimo 8 caracteres." }, 400);
        const { error: pwErr } = await admin.auth.admin.updateUserById(member.auth_user_id, { password: newPassword });
        if (pwErr) return jsonResponse({ ok: false, error: pwErr.message }, 400);
      }

      const patch: Record<string, unknown> = {};
      if (allowedModules !== undefined) patch.allowed_modules = allowedModules;
      if (active !== undefined) patch.active = active;
      if (displayName !== undefined) patch.display_name = displayName;

      const { data: updated, error: updateErr } = await admin
        .from("clinic_members")
        .update(patch)
        .eq("id", memberId)
        .select()
        .single();
      if (updateErr) return jsonResponse({ ok: false, error: updateErr.message }, 500);

      return jsonResponse({ ok: true, member: updated });
    }

    if (body.action === "delete") {
      const { memberId } = body;
      const { data: member, error: findErr } = await admin
        .from("clinic_members")
        .select("auth_user_id")
        .eq("id", memberId)
        .eq("clinic_config_id", clinic.id)
        .maybeSingle();
      if (findErr || !member) return jsonResponse({ ok: false, error: "Usuario no encontrado." }, 404);

      await admin.from("clinic_members").delete().eq("id", memberId);
      await admin.auth.admin.deleteUser(member.auth_user_id);

      return jsonResponse({ ok: true });
    }

    return jsonResponse({ ok: false, error: "Acción no reconocida." }, 400);
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) }, 500);
  }
});
