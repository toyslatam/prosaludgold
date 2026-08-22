import { useState, useEffect } from "react";
import { useAppConfig } from "@/contexts/AppConfigContext";
import type { Sede } from "@/contexts/AppConfigContext";
import type { VerticalKey } from "@/config/demos";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Building2,
  MapPin,
  Layers,
  Bell,
  Globe,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Loader2,
} from "lucide-react";

const MODULE_LABELS: Record<VerticalKey, string> = {
  dental: "Odontología",
  medical: "Medicina General",
  spa: "Spa / Bienestar",
  multi: "Multi-vertical",
};

const MODULE_DESCS: Record<string, string> = {
  dental: "Ficha dental, odontograma, laboratorios, planes de tratamiento",
  medical: "Consultas médicas, expedientes, prescripciones",
  spa: "Servicios de spa, estética y bienestar",
};

const TIMEZONES = [
  "America/Panama",
  "America/Bogota",
  "America/Lima",
  "America/Santiago",
  "America/Mexico_City",
  "America/New_York",
];

const CURRENCIES = ["USD", "COP", "PEN", "CLP", "MXN", "EUR"];
const COUNTRIES = [
  { code: "PA", name: "Panamá" },
  { code: "CO", name: "Colombia" },
  { code: "PE", name: "Perú" },
  { code: "CL", name: "Chile" },
  { code: "MX", name: "México" },
  { code: "US", name: "Estados Unidos" },
];

function SectionCard({ title, icon: Icon, children }: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-5">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-primary" />
        <h2 className="font-semibold text-base">{title}</h2>
      </div>
      {children}
    </div>
  );
}

interface SedeRowProps {
  sede: Sede;
  onUpdate: (id: string, data: Partial<Sede>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  enabledModules: VerticalKey[];
}

function SedeRow({ sede, onUpdate, onDelete, enabledModules }: SedeRowProps) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: sede.name, address: sede.address ?? "", phone: sede.phone ?? "" });
  const [sedeModules, setSedeModules] = useState<VerticalKey[]>(
    sede.modules_enabled?.length ? sede.modules_enabled : enabledModules
  );
  const [saving, setSaving] = useState(false);

  const toggleSedeModule = (key: VerticalKey) => {
    setSedeModules((prev) => {
      const has = prev.includes(key);
      if (has && prev.length === 1) return prev; // al menos un módulo
      return has ? prev.filter((m) => m !== key) : [...prev, key];
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdate(sede.id, {
        name: form.name,
        address: form.address || null,
        phone: form.phone || null,
        modules_enabled: sedeModules,
      });
      setEditing(false);
      toast.success("Sede actualizada");
    } catch {
      toast.error("Error al guardar la sede");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`¿Eliminar la sede "${sede.name}"?`)) return;
    try {
      await onDelete(sede.id);
      toast.success("Sede eliminada");
    } catch {
      toast.error("Error al eliminar la sede");
    }
  };

  const toggleActive = async () => {
    try {
      await onUpdate(sede.id, { active: !sede.active });
    } catch {
      toast.error("Error al cambiar el estado de la sede");
    }
  };

  return (
    <div className="border border-border rounded-lg p-4 space-y-3">
      {editing ? (
        <div className="space-y-3">
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Nombre *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Sede Principal"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Dirección</Label>
              <Input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Av. Balboa, Piso 3"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Teléfono</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+507 300-0000"
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Módulos que atiende esta sede</Label>
            <div className="flex flex-wrap gap-1.5">
              {enabledModules.map((m) => {
                const active = sedeModules.includes(m);
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => toggleSedeModule(m)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                      active
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/30"
                    }`}
                  >
                    {MODULE_LABELS[m]}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" size="sm" onClick={() => setEditing(false)} disabled={saving}>
              <X className="w-3.5 h-3.5 mr-1" /> Cancelar
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving || !form.name.trim()}>
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Check className="w-3.5 h-3.5 mr-1" />}
              Guardar
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-medium text-sm">{sede.name}</p>
              {!sede.active && <Badge variant="secondary" className="text-xs">Inactiva</Badge>}
            </div>
            {sede.address && <p className="text-xs text-muted-foreground mt-0.5">{sede.address}</p>}
            {sede.phone && <p className="text-xs text-muted-foreground">{sede.phone}</p>}
            <div className="flex flex-wrap gap-1 mt-2">
              {(sede.modules_enabled?.length ? sede.modules_enabled : enabledModules).map((m) => (
                <Badge key={m} variant="outline" className="text-xs">
                  {MODULE_LABELS[m] ?? m}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Switch checked={sede.active} onCheckedChange={toggleActive} />
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditing(true)}>
              <Pencil className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={handleDelete}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

const Configuracion = () => {
  const { clinicConfig, sedes, enabledModules, saveConfig, saveSede, updateSede, deleteSede, isLoading } = useAppConfig();

  // Form state mirrors clinic_config fields
  const [form, setForm] = useState({
    name: clinicConfig?.name ?? "",
    ruc: clinicConfig?.ruc ?? "",
    address: clinicConfig?.address ?? "",
    phone: clinicConfig?.phone ?? "",
    email: clinicConfig?.email ?? "",
    website: clinicConfig?.website ?? "",
    country: clinicConfig?.country ?? "PA",
    currency: clinicConfig?.currency ?? "USD",
    timezone: clinicConfig?.timezone ?? "America/Panama",
    notify_whatsapp: clinicConfig?.notify_whatsapp ?? false,
    notify_email: clinicConfig?.notify_email ?? true,
    notify_inventory_alert: clinicConfig?.notify_inventory_alert ?? true,
    notify_payment: clinicConfig?.notify_payment ?? true,
    modules_enabled: (clinicConfig?.modules_enabled ?? ["dental"]) as VerticalKey[],
  });
  const [savingOrg, setSavingOrg] = useState(false);

  // Sync form when clinicConfig loads from Supabase
  useEffect(() => {
    if (clinicConfig) {
      setForm({
        name: clinicConfig.name,
        ruc: clinicConfig.ruc ?? "",
        address: clinicConfig.address ?? "",
        phone: clinicConfig.phone ?? "",
        email: clinicConfig.email ?? "",
        website: clinicConfig.website ?? "",
        country: clinicConfig.country,
        currency: clinicConfig.currency,
        timezone: clinicConfig.timezone,
        notify_whatsapp: clinicConfig.notify_whatsapp,
        notify_email: clinicConfig.notify_email,
        notify_inventory_alert: clinicConfig.notify_inventory_alert,
        notify_payment: clinicConfig.notify_payment,
        modules_enabled: clinicConfig.modules_enabled as VerticalKey[],
      });
    }
  }, [clinicConfig]);

  const toggleModule = (key: VerticalKey) => {
    setForm((prev) => {
      const has = prev.modules_enabled.includes(key);
      if (has && prev.modules_enabled.length === 1) return prev; // keep at least one
      return {
        ...prev,
        modules_enabled: has
          ? prev.modules_enabled.filter((m) => m !== key)
          : [...prev.modules_enabled, key],
      };
    });
  };

  const handleSaveOrg = async () => {
    setSavingOrg(true);
    try {
      await saveConfig({
        name: form.name,
        ruc: form.ruc || null,
        address: form.address || null,
        phone: form.phone || null,
        email: form.email || null,
        website: form.website || null,
        country: form.country,
        currency: form.currency,
        timezone: form.timezone,
        notify_whatsapp: form.notify_whatsapp,
        notify_email: form.notify_email,
        notify_inventory_alert: form.notify_inventory_alert,
        notify_payment: form.notify_payment,
        modules_enabled: form.modules_enabled,
      });
      toast.success("Configuración guardada");
    } catch {
      toast.error("Error al guardar la configuración");
    } finally {
      setSavingOrg(false);
    }
  };

  // New sede form
  const [newSede, setNewSede] = useState({ name: "", address: "", phone: "" });
  const [newSedeModules, setNewSedeModules] = useState<VerticalKey[]>(form.modules_enabled);
  const [addingSede, setAddingSede] = useState(false);
  const [showNewSede, setShowNewSede] = useState(false);

  const toggleNewSedeModule = (key: VerticalKey) => {
    setNewSedeModules((prev) => {
      const has = prev.includes(key);
      if (has && prev.length === 1) return prev;
      return has ? prev.filter((m) => m !== key) : [...prev, key];
    });
  };

  const handleAddSede = async () => {
    if (!newSede.name.trim()) return;
    setAddingSede(true);
    try {
      await saveSede({
        name: newSede.name.trim(),
        address: newSede.address || null,
        phone: newSede.phone || null,
        modules_enabled: newSedeModules,
        active: true,
        schedule: {},
        email: null,
      });
      setNewSede({ name: "", address: "", phone: "" });
      setNewSedeModules(form.modules_enabled);
      setShowNewSede(false);
      toast.success("Sede agregada");
    } catch {
      toast.error("Error al agregar la sede");
    } finally {
      setAddingSede(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Configuración</h1>
        <p className="text-muted-foreground text-sm">Datos de la clínica, módulos, sedes y preferencias</p>
      </div>

      {/* Datos de la organización */}
      <SectionCard title="Datos de la organización" icon={Building2}>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nombre de la clínica *</Label>
            <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="ProSalud Gold" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ruc">RUC / Identificación fiscal</Label>
            <Input id="ruc" value={form.ruc} onChange={(e) => setForm({ ...form, ruc: e.target.value })} placeholder="1234567-1-123456" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Teléfono</Label>
            <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+507 300-0000" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email de contacto</Label>
            <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="info@clinica.com" />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="address">Dirección principal</Label>
            <Input id="address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Av. Balboa, Ciudad de Panamá" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="website">Sitio web</Label>
            <Input id="website" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://miclínica.com" />
          </div>
        </div>
      </SectionCard>

      {/* Módulos activos */}
      <SectionCard title="Módulos activos" icon={Layers}>
        <p className="text-sm text-muted-foreground -mt-2">
          Activa los módulos que utiliza tu clínica. Al menos uno debe estar activo.
        </p>
        <div className="grid sm:grid-cols-3 gap-3">
          {(["dental", "medical", "spa"] as VerticalKey[]).map((key) => {
            const active = form.modules_enabled.includes(key);
            return (
              <button
                key={key}
                onClick={() => toggleModule(key)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  active
                    ? "border-primary bg-primary/5"
                    : "border-border bg-background hover:border-primary/30"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <p className="font-medium text-sm">{MODULE_LABELS[key]}</p>
                  {active && <Check className="w-4 h-4 text-primary" />}
                </div>
                <p className="text-xs text-muted-foreground">{MODULE_DESCS[key]}</p>
              </button>
            );
          })}
        </div>
      </SectionCard>

      {/* Sedes */}
      <SectionCard title="Sedes" icon={MapPin}>
        <div className="space-y-3">
          {sedes.length === 0 && !showNewSede && (
            <p className="text-sm text-muted-foreground">No hay sedes registradas.</p>
          )}
          {sedes.map((sede) => (
            <SedeRow
              key={sede.id}
              sede={sede}
              onUpdate={updateSede}
              onDelete={deleteSede}
              enabledModules={enabledModules}
            />
          ))}

          {/* New sede form */}
          {showNewSede && (
            <div className="border border-dashed border-border rounded-lg p-4 space-y-3 bg-muted/20">
              <p className="text-sm font-medium">Nueva sede</p>
              <div className="grid sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Nombre *</Label>
                  <Input
                    value={newSede.name}
                    onChange={(e) => setNewSede({ ...newSede, name: e.target.value })}
                    placeholder="Sede Norte"
                    autoFocus
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Dirección</Label>
                  <Input
                    value={newSede.address}
                    onChange={(e) => setNewSede({ ...newSede, address: e.target.value })}
                    placeholder="Av. Norte 123"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Teléfono</Label>
                  <Input
                    value={newSede.phone}
                    onChange={(e) => setNewSede({ ...newSede, phone: e.target.value })}
                    placeholder="+507 300-1111"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Módulos que atiende esta sede</Label>
                <div className="flex flex-wrap gap-1.5">
                  {form.modules_enabled.map((m) => {
                    const active = newSedeModules.includes(m);
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => toggleNewSedeModule(m)}
                        className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                          active
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground hover:border-primary/30"
                        }`}
                      >
                        {MODULE_LABELS[m]}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" size="sm" onClick={() => { setShowNewSede(false); setNewSede({ name: "", address: "", phone: "" }); }}>
                  <X className="w-3.5 h-3.5 mr-1" /> Cancelar
                </Button>
                <Button size="sm" onClick={handleAddSede} disabled={addingSede || !newSede.name.trim()}>
                  {addingSede ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Check className="w-3.5 h-3.5 mr-1" />}
                  Agregar sede
                </Button>
              </div>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => { setNewSedeModules(form.modules_enabled); setShowNewSede(true); }}
            disabled={showNewSede}
          >
            <Plus className="w-4 h-4" /> Agregar sede
          </Button>
        </div>
      </SectionCard>

      {/* Preferencias regionales */}
      <SectionCard title="Preferencias regionales" icon={Globe}>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label>País</Label>
            <select
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>Moneda</Label>
            <select
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value })}
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>Zona horaria</Label>
            <select
              value={form.timezone}
              onChange={(e) => setForm({ ...form, timezone: e.target.value })}
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
            </select>
          </div>
        </div>
      </SectionCard>

      {/* Notificaciones */}
      <SectionCard title="Notificaciones" icon={Bell}>
        <div className="space-y-4">
          {([
            { key: "notify_whatsapp", label: "Recordatorios por WhatsApp" },
            { key: "notify_email", label: "Recordatorios por email" },
            { key: "notify_inventory_alert", label: "Alertas de inventario bajo" },
            { key: "notify_payment", label: "Notificación de pagos recibidos" },
          ] as const).map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm">{label}</span>
              <Switch
                checked={form[key] as boolean}
                onCheckedChange={(v) => setForm({ ...form, [key]: v })}
              />
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Save button */}
      <div className="flex justify-end pb-6">
        <Button onClick={handleSaveOrg} disabled={savingOrg || !form.name.trim()} className="gap-2 min-w-[160px]">
          {savingOrg ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</>
          ) : (
            <><Check className="w-4 h-4" /> Guardar cambios</>
          )}
        </Button>
      </div>
    </div>
  );
};

export default Configuracion;
