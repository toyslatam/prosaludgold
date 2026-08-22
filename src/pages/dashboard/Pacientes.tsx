import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDemo } from "@/contexts/DemoContext";
import { useAppConfig } from "@/contexts/AppConfigContext";
import { usePatients, useInsertPatient } from "@/hooks/useSupabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus, Eye, Phone, Mail, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { mockDoctors } from "@/data/mockData";
import { BENEFITS_OPTIONS } from "@/config/patientOptions";

const EMPTY_FORM = {
  name: "",
  cedula: "",
  phone: "",
  email: "",
  birth_date: "",
  address: "",
  benefits: "",
  branch: "",
  assigned_doctor_id: "",
  collaborators: "",
};

const Pacientes = () => {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const navigate = useNavigate();
  const { basePath, vertical } = useDemo();
  const { enabledModules, sedes } = useAppConfig();
  const activeSedes = sedes.filter(
    (s) => s.active && (vertical === "multi" || !s.modules_enabled?.length || s.modules_enabled.includes(vertical))
  );

  const { data: patients = [], isLoading } = usePatients(vertical);
  const insert = useInsertPatient();

  const filtered = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.cedula ?? "").includes(search)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    const collaborators = form.collaborators
      ? form.collaborators.split(",").map((s) => s.trim()).filter(Boolean)
      : [];
    insert.mutate(
      {
        name: form.name.trim(),
        cedula: form.cedula || null,
        phone: form.phone || null,
        email: form.email || null,
        birth_date: form.birth_date || null,
        address: form.address || null,
        benefits: form.benefits || null,
        branch: form.branch || null,
        assigned_doctor_id: form.assigned_doctor_id || null,
        collaborators,
        modules_enabled: vertical === "multi" ? enabledModules : [vertical],
      },
      {
        onSuccess: () => {
          toast.success("Paciente registrado correctamente");
          setForm(EMPTY_FORM);
          setOpen(false);
        },
        onError: (err) => toast.error(`Error al registrar: ${err.message}`),
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Pacientes</h1>
          <p className="text-muted-foreground text-sm">
            {isLoading ? "Cargando…" : `${patients.length} pacientes registrados`}
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> Nuevo paciente</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Registrar paciente</DialogTitle></DialogHeader>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <Label>Nombre completo *</Label>
                <Input
                  placeholder="Nombre completo"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Cédula</Label>
                  <Input
                    placeholder="Cédula"
                    value={form.cedula}
                    onChange={(e) => setForm((f) => ({ ...f, cedula: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Fecha de nacimiento</Label>
                  <Input
                    type="date"
                    value={form.birth_date}
                    onChange={(e) => setForm((f) => ({ ...f, birth_date: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Teléfono</Label>
                  <Input
                    placeholder="Teléfono"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input
                    placeholder="Email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Dirección</Label>
                <Input
                  placeholder="Opcional"
                  value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Convenio / Beneficio</Label>
                  <Select
                    value={form.benefits}
                    onValueChange={(v) => setForm((f) => ({ ...f, benefits: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      {BENEFITS_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Sede / Sucursal</Label>
                  {activeSedes.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-2">
                      No hay sedes registradas. Agrega una en Configuración.
                    </p>
                  ) : (
                    <Select
                      value={form.branch}
                      onValueChange={(v) => setForm((f) => ({ ...f, branch: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {activeSedes.map((s) => (
                          <SelectItem key={s.id} value={s.name}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Profesional a cargo</Label>
                <Select
                  value={form.assigned_doctor_id}
                  onValueChange={(v) => setForm((f) => ({ ...f, assigned_doctor_id: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockDoctors.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Colaboradores (separados por coma)</Label>
                <Input
                  value={form.collaborators}
                  onChange={(e) => setForm((f) => ({ ...f, collaborators: e.target.value }))}
                  placeholder="Ej: Dr. X, Dra. Y"
                />
              </div>
              <Button type="submit" className="w-full" disabled={insert.isPending}>
                {insert.isPending ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Registrando…</> : "Registrar"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre o cédula…"
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
          <Loader2 className="w-5 h-5 animate-spin" /> Cargando pacientes…
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-10">
              {search ? "No se encontraron pacientes con esa búsqueda." : "Aún no hay pacientes registrados."}
            </p>
          ) : (
            filtered.map((patient) => (
              <div key={patient.id} className="bg-card rounded-xl border border-border shadow-card p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="font-bold text-primary">
                        {patient.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold">{patient.name}</h3>
                      <p className="text-sm text-muted-foreground">Cédula: {patient.cedula ?? "—"}</p>
                      <div className="flex items-center gap-3 mt-1">
                        {patient.phone && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Phone className="w-3 h-3" />{patient.phone}
                          </span>
                        )}
                        {patient.email && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Mail className="w-3 h-3" />{patient.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {patient.balance > 0 && (
                      <span className="text-xs px-2 py-1 rounded-full border bg-warning/10 text-warning border-warning/20">
                        Saldo: ${patient.balance}
                      </span>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={() => navigate(`${basePath}/pacientes/${patient.id}/datos`)}
                    >
                      <Eye className="w-3 h-3" /> Ver ficha
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Pacientes;
