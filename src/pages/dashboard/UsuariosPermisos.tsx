import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAppConfig } from "@/contexts/AppConfigContext";
import { useDemoConfig } from "@/contexts/DemoContext";
import { useDoctors } from "@/hooks/useSupabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users, ShieldCheck, UserPlus, KeyRound, Trash2, Loader2 } from "lucide-react";
import { cn, initials } from "@/lib/utils";

interface StaffMember {
  id: string;
  username: string;
  display_name: string;
  role: string;
  allowed_modules: string[];
  active: boolean;
  created_at: string;
  linked_doctor_id: string | null;
}

async function callManageStaff<T = unknown>(body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke("manage-staff", { body });
  if (error) throw error;
  const res = data as { ok: boolean; error?: string } & T;
  if (!res.ok) throw new Error(res.error ?? "Error desconocido");
  return res as T;
}

export default function UsuariosPermisos() {
  const { clinicConfig, membership } = useAppConfig();
  const config = useDemoConfig();
  const { data: doctorsData } = useDoctors();
  const doctors = (doctorsData ?? []) as DoctorOption[];
  const [members, setMembers] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editMember, setEditMember] = useState<StaffMember | null>(null);
  const [deleteMember, setDeleteMember] = useState<StaffMember | null>(null);

  const assignableModules = config.navItems
    .filter((i) => !["inicio", "configuracion", "usuarios"].includes(i.pathKey))
    .map((i) => ({ pathKey: i.pathKey, label: i.label }));

  const loadMembers = useCallback(async () => {
    if (!clinicConfig) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("clinic_members")
      .select("*")
      .eq("clinic_config_id", clinicConfig.id)
      .order("created_at");
    if (error) toast.error("No se pudieron cargar los usuarios.");
    else setMembers((data ?? []) as StaffMember[]);
    setLoading(false);
  }, [clinicConfig]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  if (membership) {
    return (
      <div className="bg-card rounded-xl border border-border p-8 text-center text-muted-foreground">
        Solo el administrador de la clínica puede ver esta sección.
      </div>
    );
  }

  const activeCount = members.filter((m) => m.active).length;
  const roles = new Set(members.map((m) => m.role));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold">Usuarios y Permisos</h1>
            <Badge className="rounded-full bg-emerald-600 hover:bg-emerald-600 text-white font-normal">
              {clinicConfig?.name ?? "Clínica"}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Control de acceso del personal: quién entra a la app y a qué módulos.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-2 bg-emerald-700 hover:bg-emerald-800">
          <UserPlus className="h-4 w-4" />
          Invitar usuario
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <StatCard label="Total usuarios" value={String(members.length + 1)} hint="incluye al administrador" icon={Users} iconClass="bg-slate-900 text-white" />
        <StatCard label="Roles definidos" value={String(roles.size + 1)} hint="admin + staff" icon={ShieldCheck} iconClass="bg-purple-100 text-purple-700" />
        <StatCard label="Usuarios activos" value={String(activeCount + 1)} hint={`${members.length - activeCount} inactivo(s)`} icon={UserPlus} iconClass="bg-emerald-100 text-emerald-700" />
      </div>

      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Usuario</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Módulos permitidos</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="bg-muted/10">
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <span className="h-8 w-8 rounded-full bg-slate-900 text-white text-xs font-semibold flex items-center justify-center shrink-0">
                      {initials(clinicConfig?.name ?? "Admin")}
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">Administrador</p>
                      <p className="text-xs text-muted-foreground truncate">Dueño de la cuenta</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell><Badge className="bg-slate-900 hover:bg-slate-900 text-white">Administrador</Badge></TableCell>
                <TableCell className="text-xs text-muted-foreground">Todos los módulos</TableCell>
                <TableCell><StatusBadge active /></TableCell>
                <TableCell />
              </TableRow>

              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="p-8 text-center text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin inline mr-2" /> Cargando…
                  </TableCell>
                </TableRow>
              ) : members.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="p-8 text-center text-muted-foreground">
                    Todavía no hay usuarios de staff invitados.
                  </TableCell>
                </TableRow>
              ) : (
                members.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <span className="h-8 w-8 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center shrink-0">
                          {initials(m.display_name)}
                        </span>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{m.display_name}</p>
                          <p className="text-xs text-muted-foreground truncate">@{m.username}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">{m.role}</Badge>
                      {m.linked_doctor_id && (
                        <p className="text-[11px] text-muted-foreground mt-1 truncate max-w-[140px]">
                          {doctors.find((d) => d.id === m.linked_doctor_id)?.name ?? "Colaborador"}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      {m.linked_doctor_id ? (
                        <span className="text-xs text-muted-foreground">Su agenda + historial de sus pacientes</span>
                      ) : m.allowed_modules.length === 0 ? (
                        <span className="text-xs text-muted-foreground">Sin módulos</span>
                      ) : (
                        <div className="flex flex-wrap gap-1 max-w-[260px]">
                          {m.allowed_modules.map((pk) => (
                            <Badge key={pk} variant="outline" className="text-[10px] font-normal">
                              {assignableModules.find((a) => a.pathKey === pk)?.label ?? pk}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </TableCell>
                    <TableCell><StatusBadge active={m.active} /></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button variant="ghost" size="sm" onClick={() => setEditMember(m)}>
                          <KeyRound className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => setDeleteMember(m)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <CreateStaffDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        assignableModules={assignableModules}
        doctors={doctors}
        onCreated={loadMembers}
      />
      <EditStaffDialog
        member={editMember}
        onOpenChange={(open) => !open && setEditMember(null)}
        assignableModules={assignableModules}
        doctors={doctors}
        onSaved={loadMembers}
      />
      <AlertDialog open={!!deleteMember} onOpenChange={(open) => !open && setDeleteMember(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar a {deleteMember?.display_name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Se elimina su cuenta de acceso por completo. No podrá volver a entrar hasta que se le cree una nueva.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={async () => {
                if (!deleteMember) return;
                try {
                  await callManageStaff({ action: "delete", memberId: deleteMember.id });
                  toast.success("Usuario eliminado");
                  setDeleteMember(null);
                  loadMembers();
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : "No se pudo eliminar");
                }
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  iconClass,
}: {
  label: string;
  value: string;
  hint: string;
  icon: typeof Users;
  iconClass: string;
}) {
  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-4 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground truncate">{label}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>
      </div>
      <div className={cn("shrink-0 rounded-lg p-2.5", iconClass)}>
        <Icon className="h-4 w-4" />
      </div>
    </div>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return active ? (
    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 font-normal">Activo</Badge>
  ) : (
    <Badge variant="secondary" className="font-normal">Inactivo</Badge>
  );
}

interface ModuleOption {
  pathKey: string;
  label: string;
}

function ModuleCheckboxes({
  assignableModules,
  value,
  onChange,
}: {
  assignableModules: ModuleOption[];
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const toggle = (pk: string) =>
    onChange(value.includes(pk) ? value.filter((v) => v !== pk) : [...value, pk]);

  return (
    <div className="grid grid-cols-2 gap-2 border border-border rounded-lg p-3 max-h-48 overflow-y-auto">
      {assignableModules.map((m) => (
        <div key={m.pathKey} className="flex items-center gap-2">
          <Checkbox id={`mod-${m.pathKey}`} checked={value.includes(m.pathKey)} onCheckedChange={() => toggle(m.pathKey)} />
          <label htmlFor={`mod-${m.pathKey}`} className="text-sm cursor-pointer">{m.label}</label>
        </div>
      ))}
    </div>
  );
}

type DoctorOption = { id: string; name: string; specialty?: string };

function LinkedDoctorSelect({
  doctors,
  value,
  onChange,
}: {
  doctors: DoctorOption[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label>Vincular a colaborador (opcional)</Label>
      <Select value={value || "none"} onValueChange={(v) => onChange(v === "none" ? "" : v)}>
        <SelectTrigger>
          <SelectValue placeholder="Ninguno — acceso de secretaría" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Ninguno — acceso de secretaría (usa los módulos de abajo)</SelectItem>
          {doctors.map((d) => (
            <SelectItem key={d.id} value={d.id}>
              {d.name}{d.specialty ? ` · ${d.specialty}` : ""}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        Si vinculas a un colaborador, su cuenta queda limitada a su propia agenda y al historial clínico de
        sus pacientes (sin teléfono/correo/dirección), sin importar los módulos marcados abajo.
      </p>
    </div>
  );
}

function CreateStaffDialog({
  open,
  onOpenChange,
  assignableModules,
  doctors,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignableModules: ModuleOption[];
  doctors: DoctorOption[];
  onCreated: () => void;
}) {
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [allowedModules, setAllowedModules] = useState<string[]>([]);
  const [linkedDoctorId, setLinkedDoctorId] = useState("");
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setUsername("");
    setDisplayName("");
    setEmail("");
    setPassword("");
    setAllowedModules([]);
    setLinkedDoctorId("");
  };

  const handleCreate = async () => {
    setSaving(true);
    try {
      await callManageStaff({
        action: "create",
        username,
        displayName,
        email,
        password,
        allowedModules,
        linkedDoctorId: linkedDoctorId || null,
      });
      toast.success(`Usuario ${username} creado`);
      reset();
      onOpenChange(false);
      onCreated();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo crear el usuario");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Invitar usuario</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Nombre completo</Label>
              <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Ma. Gabriela Guerra" />
            </div>
            <div className="space-y-1.5">
              <Label>Usuario</Label>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="MGGuerra" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Correo</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="correo@clinica.com" />
          </div>
          <div className="space-y-1.5">
            <Label>Contraseña (se la entregas tú directamente)</Label>
            <Input type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 8 caracteres" />
          </div>
          <LinkedDoctorSelect doctors={doctors} value={linkedDoctorId} onChange={setLinkedDoctorId} />
          {!linkedDoctorId && (
            <div className="space-y-1.5">
              <Label>Módulos permitidos</Label>
              <ModuleCheckboxes assignableModules={assignableModules} value={allowedModules} onChange={setAllowedModules} />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancelar</Button>
          <Button onClick={handleCreate} disabled={saving} className="gap-2">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Crear usuario
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditStaffDialog({
  member,
  onOpenChange,
  assignableModules,
  doctors,
  onSaved,
}: {
  member: StaffMember | null;
  onOpenChange: (open: boolean) => void;
  assignableModules: ModuleOption[];
  doctors: DoctorOption[];
  onSaved: () => void;
}) {
  const [allowedModules, setAllowedModules] = useState<string[]>([]);
  const [linkedDoctorId, setLinkedDoctorId] = useState("");
  const [active, setActive] = useState(true);
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (member) {
      setAllowedModules(member.allowed_modules);
      setLinkedDoctorId(member.linked_doctor_id ?? "");
      setActive(member.active);
      setNewPassword("");
    }
  }, [member]);

  if (!member) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      await callManageStaff({
        action: "update",
        memberId: member.id,
        allowedModules,
        active,
        linkedDoctorId: linkedDoctorId || null,
        ...(newPassword ? { newPassword } : {}),
      });
      toast.success("Usuario actualizado");
      onOpenChange(false);
      onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo actualizar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={!!member} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Editar a {member.display_name}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Checkbox id="active" checked={active} onCheckedChange={(v) => setActive(!!v)} />
            <label htmlFor="active" className="text-sm cursor-pointer">Cuenta activa</label>
          </div>
          <LinkedDoctorSelect doctors={doctors} value={linkedDoctorId} onChange={setLinkedDoctorId} />
          {!linkedDoctorId && (
            <div className="space-y-1.5">
              <Label>Módulos permitidos</Label>
              <ModuleCheckboxes assignableModules={assignableModules} value={allowedModules} onChange={setAllowedModules} />
            </div>
          )}
          <div className="space-y-1.5">
            <Label>Restablecer contraseña (opcional)</Label>
            <Input type="text" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Dejar vacío para no cambiarla" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
