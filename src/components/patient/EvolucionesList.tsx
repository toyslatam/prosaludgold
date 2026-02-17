import { useState, useMemo } from "react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getEvolucionesByPatient, addEvolucion } from "@/lib/patients/evoluciones";
import { getProcedures } from "@/lib/agenda/procedures";
import { mockDoctors } from "@/data/mockData";
import { getPatientById } from "@/lib/patients/repository";
import { toast } from "sonner";

interface EvolucionesListProps {
  patientId: string;
  onRefresh?: () => void;
}

export function EvolucionesList({ patientId, onRefresh }: EvolucionesListProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState(() => new Date().toTimeString().slice(0, 5));
  const [doctorId, setDoctorId] = useState("");
  const [procedureIds, setProcedureIds] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [refresh, setRefresh] = useState(0);

  const patient = getPatientById(patientId);
  const defaultDoctorId = patient?.assignedDoctorId ?? mockDoctors[0]?.id;
  const procedures = useMemo(() => getProcedures("dental"), []);

  const evoluciones = useMemo(
    () => getEvolucionesByPatient(patientId),
    [patientId, refresh]
  );

  const handleOpenModal = () => {
    setDate(new Date().toISOString().slice(0, 10));
    setTime(new Date().toTimeString().slice(0, 5));
    setDoctorId(patient?.assignedDoctorId ?? mockDoctors[0]?.id ?? "");
    setProcedureIds([]);
    setNotes("");
    setModalOpen(true);
  };

  const handleSave = () => {
    const doctor = mockDoctors.find((d) => d.id === (doctorId || defaultDoctorId));
    if (!doctor) {
      toast.error("Seleccione un profesional");
      return;
    }
    addEvolucion({
      patientId,
      date,
      time,
      doctorId: doctorId || defaultDoctorId,
      doctorName: doctor.name,
      procedureIds: procedureIds.length ? procedureIds : undefined,
      notes,
    });
    setRefresh((r) => r + 1);
    onRefresh?.();
    setModalOpen(false);
    toast.success("Evolución guardada");
  };

  const toggleProcedure = (id: string) => {
    setProcedureIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={handleOpenModal} className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva evolución
        </Button>
      </div>

      {evoluciones.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground text-sm">
            No hay evoluciones. Agregue una con el botón &quot;Nueva evolución&quot;.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {evoluciones.map((ev) => (
            <Card key={ev.id}>
              <CardContent className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      {format(parseISO(ev.date), "d MMM yyyy", { locale: es })}
                      {ev.time && ` · ${ev.time}`} · {ev.doctorName}
                    </p>
                    <p className="text-sm whitespace-pre-wrap">{ev.notes}</p>
                    {ev.procedureIds && ev.procedureIds.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {ev.procedureIds.map((pid) => {
                          const proc = procedures.find((p) => p.id === pid);
                          return (
                            <Badge key={pid} variant="secondary" className="text-xs">
                              {proc?.name ?? pid}
                            </Badge>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nueva evolución</DialogTitle>
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
                <Label>Hora</Label>
                <input
                  type="time"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Profesional</Label>
              <Select
                value={doctorId || defaultDoctorId}
                onValueChange={setDoctorId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
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
            <div className="space-y-2">
              <Label>Procedimiento(s)</Label>
              <div className="flex flex-wrap gap-2 border rounded-md p-2 min-h-10">
                {procedures.slice(0, 12).map((p) => (
                  <Badge
                    key={p.id}
                    variant={procedureIds.includes(p.id) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleProcedure(p.id)}
                  >
                    {p.name}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notas / Evolución</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Descripción de la evolución clínica..."
                rows={4}
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
