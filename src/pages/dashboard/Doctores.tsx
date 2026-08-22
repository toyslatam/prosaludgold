import { useState } from "react";
import { useDoctors, useInsertDoctor, useUpdateDoctor } from "@/hooks/useSupabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Stethoscope, Plus, Pencil, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { useDemo } from "@/contexts/DemoContext";
import { useAppConfig } from "@/contexts/AppConfigContext";
import type { VerticalKey } from "@/config/demos";

const MODULE_LABELS: Record<string, string> = {
  dental: "Odontología",
  medical: "Medicina General",
  spa: "Spa / Bienestar",
};

type DoctorForm = {
  name: string;
  specialty: string;
  branch: string;
  available: boolean;
};

const EMPTY_FORM: DoctorForm = { name: "", specialty: "", branch: "", available: true };

const Doctores = () => {
  const { vertical } = useDemo();
  const { enabledModules } = useAppConfig();
  const [search, setSearch] = useState("");
  const [filterAvailable, setFilterAvailable] = useState<"all" | "active" | "inactive">("all");
  const [openNew, setOpenNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<DoctorForm>(EMPTY_FORM);
  const [formModules, setFormModules] = useState<VerticalKey[]>(
    vertical === "multi" ? enabledModules : [vertical as VerticalKey]
  );

  const { data: doctors = [], isLoading } = useDoctors(vertical);
  const insert = useInsertDoctor();
  const update = useUpdateDoctor();

  const toggleFormModule = (key: VerticalKey) => {
    setFormModules((prev) => {
      const has = prev.includes(key);
      if (has && prev.length === 1) return prev;
      return has ? prev.filter((m) => m !== key) : [...prev, key];
    });
  };

  const professionalLabel = vertical === "spa" ? "Terapeuta" : vertical === "medical" ? "Médico" : "Doctor";

  const filtered = doctors.filter((d) => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.specialty.toLowerCase().includes(search.toLowerCase());
    const matchAvail =
      filterAvailable === "all" ? true :
      filterAvailable === "active" ? d.available :
      !d.available;
    return matchSearch && matchAvail;
  });

  const openEdit = (id: string) => {
    const doc = doctors.find((d) => d.id === id);
    if (!doc) return;
    setForm({ name: doc.name, specialty: doc.specialty, branch: doc.branch, available: doc.available });
    setFormModules(doc.modules_enabled?.length ? (doc.modules_enabled as VerticalKey[]) : enabledModules);
    setEditingId(id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.specialty.trim()) return;

    if (editingId) {
      update.mutate(
        { id: editingId, patch: { ...form, modules_enabled: formModules } },
        {
          onSuccess: () => { toast.success(`${professionalLabel} actualizado`); setEditingId(null); setForm(EMPTY_FORM); },
          onError: (err) => toast.error(err.message),
        }
      );
    } else {
      insert.mutate(
        { ...form, branch: form.branch || "Principal", modules_enabled: formModules },
        {
          onSuccess: () => { toast.success(`${professionalLabel} registrado`); setOpenNew(false); setForm(EMPTY_FORM); },
          onError: (err) => toast.error(err.message),
        }
      );
    }
  };

  const toggleAvailable = (id: string, current: boolean) => {
    update.mutate(
      { id, patch: { available: !current } },
      {
        onSuccess: () => toast.success(current ? "Marcado como inactivo" : "Marcado como activo"),
        onError: (err) => toast.error(err.message),
      }
    );
  };

  const isPending = insert.isPending || update.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{professionalLabel}es</h1>
          <p className="text-muted-foreground text-sm">
            {isLoading ? "Cargando…" : `${doctors.length} profesionales registrados`}
          </p>
        </div>
        <Dialog open={openNew} onOpenChange={setOpenNew}>
          <DialogTrigger asChild>
            <Button
              className="gap-2"
              onClick={() => {
                setForm(EMPTY_FORM);
                setFormModules(vertical === "multi" ? enabledModules : [vertical as VerticalKey]);
              }}
            >
              <Plus className="w-4 h-4" /> Nuevo {professionalLabel.toLowerCase()}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Registrar {professionalLabel}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Nombre completo *</Label>
                <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Dr. Juan Pérez" required />
              </div>
              <div className="space-y-1.5">
                <Label>Especialidad *</Label>
                <Input value={form.specialty} onChange={(e) => setForm((f) => ({ ...f, specialty: e.target.value }))} placeholder="Odontología General" required />
              </div>
              <div className="space-y-1.5">
                <Label>Sede / Sucursal</Label>
                <Input value={form.branch} onChange={(e) => setForm((f) => ({ ...f, branch: e.target.value }))} placeholder="Principal" />
              </div>
              <div className="space-y-1.5">
                <Label>Módulos en los que atiende</Label>
                <div className="flex flex-wrap gap-1.5">
                  {enabledModules.map((m) => {
                    const active = formModules.includes(m);
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => toggleFormModule(m)}
                        className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                          active
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground hover:border-primary/30"
                        }`}
                      >
                        {MODULE_LABELS[m] ?? m}
                      </button>
                    );
                  })}
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Guardando…</> : "Registrar"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar por nombre o especialidad…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={filterAvailable} onValueChange={(v) => setFilterAvailable(v as typeof filterAvailable)}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Activos</SelectItem>
            <SelectItem value="inactive">Inactivos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
          <Loader2 className="w-5 h-5 animate-spin" /> Cargando {professionalLabel.toLowerCase()}es…
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-10">
          {search ? "No se encontraron resultados." : `Aún no hay ${professionalLabel.toLowerCase()}es registrados.`}
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((doc) => (
            <div key={doc.id} className="bg-card rounded-xl border border-border shadow-card p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Stethoscope className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm leading-tight">{doc.name}</h3>
                    <p className="text-xs text-muted-foreground">{doc.specialty}</p>
                  </div>
                </div>
                <Badge variant={doc.available ? "default" : "secondary"} className="text-xs shrink-0">
                  {doc.available ? "Activo" : "Inactivo"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">Sede: {doc.branch}</p>
              <div className="flex gap-2 mt-auto">
                <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={() => openEdit(doc.id)}>
                  <Pencil className="w-3 h-3" /> Editar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => toggleAvailable(doc.id, doc.available)}
                >
                  {doc.available ? "Desactivar" : "Activar"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit dialog */}
      <Dialog open={!!editingId} onOpenChange={(o) => { if (!o) { setEditingId(null); setForm(EMPTY_FORM); } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar {professionalLabel}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nombre completo *</Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
            </div>
            <div className="space-y-1.5">
              <Label>Especialidad *</Label>
              <Input value={form.specialty} onChange={(e) => setForm((f) => ({ ...f, specialty: e.target.value }))} required />
            </div>
            <div className="space-y-1.5">
              <Label>Sede / Sucursal</Label>
              <Input value={form.branch} onChange={(e) => setForm((f) => ({ ...f, branch: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Módulos en los que atiende</Label>
              <div className="flex flex-wrap gap-1.5">
                {enabledModules.map((m) => {
                  const active = formModules.includes(m);
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => toggleFormModule(m)}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                        active
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/30"
                      }`}
                    >
                      {MODULE_LABELS[m] ?? m}
                    </button>
                  );
                })}
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Guardando…</> : "Guardar cambios"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Doctores;
