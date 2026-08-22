import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getRecetasByPatient,
  addReceta,
  updateReceta,
  removeReceta,
  type Receta,
  type RecetaMedicamento,
} from "@/lib/patients/recetas";
import { mockDoctors } from "@/data/mockData";
import { getPatientById } from "@/lib/patients/repository";
import { toast } from "sonner";

const EMPTY_MED: RecetaMedicamento = {
  nombre: "",
  dosis: "",
  frecuencia: "",
  duracion: "",
  indicaciones: "",
};

interface RecetasListProps {
  patientId: string;
}

export function RecetasList({ patientId }: RecetasListProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [doctorId, setDoctorId] = useState("");
  const [medicamentos, setMedicamentos] = useState<RecetaMedicamento[]>([{ ...EMPTY_MED }]);
  const [indicacionesGenerales, setIndicacionesGenerales] = useState("");
  const [refresh, setRefresh] = useState(0);

  const patient = getPatientById(patientId);
  const defaultDoctorId = patient?.assignedDoctorId ?? mockDoctors[0]?.id;
  const [recetas, setRecetas] = useState<Receta[]>([]);

  useEffect(() => {
    let cancelled = false;
    getRecetasByPatient(patientId)
      .then((data) => {
        if (!cancelled) setRecetas(data);
      })
      .catch(() => {
        if (!cancelled) toast.error("No se pudieron cargar las recetas.");
      });
    return () => {
      cancelled = true;
    };
  }, [patientId, refresh]);

  const openCreate = () => {
    setEditingId(null);
    setDate(new Date().toISOString().slice(0, 10));
    setDoctorId(patient?.assignedDoctorId ?? mockDoctors[0]?.id ?? "");
    setMedicamentos([{ ...EMPTY_MED }]);
    setIndicacionesGenerales("");
    setModalOpen(true);
  };

  const openEdit = (r: Receta) => {
    setEditingId(r.id);
    setDate(r.date);
    setDoctorId(r.doctorId);
    setMedicamentos(
      r.medicamentos.length > 0
        ? r.medicamentos.map((m) => ({ ...m }))
        : [{ ...EMPTY_MED }]
    );
    setIndicacionesGenerales(r.indicacionesGenerales ?? "");
    setModalOpen(true);
  };

  const addMed = () => setMedicamentos((prev) => [...prev, { ...EMPTY_MED }]);
  const updateMed = (index: number, field: keyof RecetaMedicamento, value: string) => {
    setMedicamentos((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };
  const removeMed = (index: number) => {
    setMedicamentos((prev) => prev.length > 1 ? prev.filter((_, i) => i !== index) : [{ ...EMPTY_MED }]);
  };

  const handleSave = async () => {
    const doctor = mockDoctors.find((d) => d.id === (doctorId || defaultDoctorId));
    if (!doctor) {
      toast.error("Seleccione un profesional");
      return;
    }
    const meds = medicamentos.filter((m) => m.nombre.trim());
    const payload = {
      patientId,
      date,
      doctorId: doctorId || defaultDoctorId,
      doctorName: doctor.name,
      medicamentos: meds.length ? meds : [{ ...EMPTY_MED }],
      indicacionesGenerales: indicacionesGenerales.trim(),
    };
    try {
      if (editingId) {
        const updated = await updateReceta(editingId, payload);
        if (updated) {
          setRefresh((r) => r + 1);
          toast.success("Receta actualizada");
          setModalOpen(false);
        }
      } else {
        await addReceta(payload);
        setRefresh((r) => r + 1);
        toast.success("Receta creada");
        setModalOpen(false);
      }
    } catch {
      toast.error("No se pudo guardar la receta.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Eliminar esta receta?")) return;
    try {
      if (await removeReceta(id)) {
        setRefresh((r) => r + 1);
        toast.success("Receta eliminada");
      }
    } catch {
      toast.error("No se pudo eliminar la receta.");
    }
  };

  const resumen = (r: Receta) => {
    const names = r.medicamentos.filter((m) => m.nombre).map((m) => m.nombre);
    return names.slice(0, 2).join(", ") + (names.length > 2 ? "…" : "");
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva receta
        </Button>
      </div>

      {recetas.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground text-sm">
            No hay recetas. Agregue una con el botón &quot;Nueva receta&quot;.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {recetas.map((r) => (
            <Card key={r.id}>
              <CardContent className="p-4 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-medium">
                    {format(parseISO(r.date), "d MMM yyyy", { locale: es })} · {r.doctorName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {resumen(r) || "Sin medicamentos"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(r)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(r.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar receta" : "Nueva receta"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Fecha</Label>
                <input
                  type="date"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Doctor</Label>
                <Select value={doctorId || defaultDoctorId} onValueChange={setDoctorId}>
                  <SelectTrigger>
                    <SelectValue />
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
            </div>
            <div className="space-y-2">
              <Label>Medicamentos</Label>
              {medicamentos.map((m, i) => (
                <div
                  key={i}
                  className="grid grid-cols-2 gap-2 rounded border p-2 text-sm"
                >
                  <Input
                    placeholder="Nombre"
                    value={m.nombre}
                    onChange={(e) => updateMed(i, "nombre", e.target.value)}
                  />
                  <Input
                    placeholder="Dosis"
                    value={m.dosis}
                    onChange={(e) => updateMed(i, "dosis", e.target.value)}
                  />
                  <Input
                    placeholder="Frecuencia"
                    value={m.frecuencia}
                    onChange={(e) => updateMed(i, "frecuencia", e.target.value)}
                  />
                  <Input
                    placeholder="Duración"
                    value={m.duracion}
                    onChange={(e) => updateMed(i, "duracion", e.target.value)}
                  />
                  <div className="col-span-2">
                    <Input
                      placeholder="Indicaciones"
                      value={m.indicaciones}
                      onChange={(e) => updateMed(i, "indicaciones", e.target.value)}
                    />
                  </div>
                  <div className="col-span-2 flex justify-end">
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeMed(i)}>
                      Quitar
                    </Button>
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addMed}>
                + Añadir medicamento
              </Button>
            </div>
            <div className="space-y-2">
              <Label>Indicaciones generales</Label>
              <Textarea
                value={indicacionesGenerales}
                onChange={(e) => setIndicacionesGenerales(e.target.value)}
                placeholder="Opcional"
                rows={2}
                className="resize-none"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>Guardar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
