import { useState, useEffect, useMemo } from "react";
import type { Patient } from "@/data/mockData";
import { mockDoctors } from "@/data/mockData";
import { useOutletContext } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { getPatientById, updatePatient } from "@/lib/patients/repository";
import { getClinicalEventsByPatient, type ClinicalEvent } from "@/lib/patients/clinicalHistory";
import { BENEFITS_OPTIONS, BRANCH_OPTIONS } from "@/config/patientOptions";

function getEventTypeLabel(e: ClinicalEvent): string {
  switch (e.type) {
    case "cita_agendada":
      return "Cita";
    case "prestacion_realizada":
      return "Atención";
    case "presupuesto_creado":
      return "Presupuesto";
    default:
      return "—";
  }
}

function getEventNote(e: ClinicalEvent): string {
  switch (e.type) {
    case "cita_agendada":
      return e.reason ?? e.status ?? "—";
    case "prestacion_realizada":
      return e.prestacion;
    case "presupuesto_creado":
      return e.label ?? "—";
    default:
      return "—";
  }
}

export default function PatientData() {
  const { patient: contextPatient } = useOutletContext<{ patient: Patient }>();
  const [editOpen, setEditOpen] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [editForm, setEditForm] = useState({
    benefits: "",
    branch: "",
    assignedDoctorId: "",
    collaborators: "",
  });
  const [patient, setPatient] = useState<Patient>(contextPatient);

  useEffect(() => {
    let cancelled = false;
    getPatientById(contextPatient.id)
      .then((data) => {
        if (!cancelled && data) setPatient(data);
      })
      .catch(() => {
        if (!cancelled) toast.error("No se pudieron cargar los datos del paciente.");
      });
    return () => {
      cancelled = true;
    };
  }, [contextPatient, refresh]);

  const birthDateFormatted = patient.birthDate
    ? format(parseISO(patient.birthDate), "d MMM yyyy", { locale: es })
    : "—";

  const professionalName =
    patient.assignedDoctorId &&
    mockDoctors.find((d) => d.id === patient.assignedDoctorId)?.name;

  const visitHistory = useMemo(() => {
    const events = getClinicalEventsByPatient(patient.id).filter((e) => !e.cancelled);
    return [...events].sort(
      (a, b) => b.date.localeCompare(a.date) || (b.time || "").localeCompare(a.time || "")
    );
  }, [patient.id]);

  const handleEditOpen = (open: boolean) => {
    setEditOpen(open);
    if (open) {
      setEditForm({
        benefits: patient.benefits ?? "",
        branch: patient.branch ?? "",
        assignedDoctorId: patient.assignedDoctorId ?? "",
        collaborators: patient.collaborators?.join(", ") ?? "",
      });
    }
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const collaborators = editForm.collaborators
      ? editForm.collaborators.split(",").map((s) => s.trim()).filter(Boolean)
      : undefined;
    try {
      const updated = await updatePatient(patient.id, {
        benefits: editForm.benefits || undefined,
        branch: editForm.branch || undefined,
        assignedDoctorId: editForm.assignedDoctorId || undefined,
        collaborators: collaborators?.length ? collaborators : undefined,
      });
      if (updated) {
        setRefresh((r) => r + 1);
        toast.success("Datos guardados");
        setEditOpen(false);
      } else {
        toast.error("Error al guardar");
      }
    } catch {
      toast.error("Error al guardar");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Dialog open={editOpen} onOpenChange={handleEditOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              Editar
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar datos personales</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Nombre</Label>
                  <Input defaultValue={patient.name} readOnly className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label>Cédula</Label>
                  <Input name="cedula" defaultValue={patient.cedula} />
                </div>
                <div className="space-y-2">
                  <Label>Teléfono</Label>
                  <Input name="phone" defaultValue={patient.phone} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input name="email" type="email" defaultValue={patient.email} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Dirección</Label>
                  <Input name="address" defaultValue={patient.address ?? ""} placeholder="Opcional" />
                </div>
                <div className="space-y-2">
                  <Label>Convenio / Beneficio</Label>
                  <Select
                    value={editForm.benefits}
                    onValueChange={(v) => setEditForm((f) => ({ ...f, benefits: v }))}
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
                <div className="space-y-2">
                  <Label>Sede / Sucursal</Label>
                  <Select
                    value={editForm.branch}
                    onValueChange={(v) => setEditForm((f) => ({ ...f, branch: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      {BRANCH_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Profesional a cargo</Label>
                  <Select
                    value={editForm.assignedDoctorId}
                    onValueChange={(v) => setEditForm((f) => ({ ...f, assignedDoctorId: v }))}
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
                <div className="space-y-2 sm:col-span-2">
                  <Label>Colaboradores (separados por coma)</Label>
                  <Input
                    value={editForm.collaborators}
                    onChange={(e) => setEditForm((f) => ({ ...f, collaborators: e.target.value }))}
                    placeholder="Ej: Dr. X, Dra. Y"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Guardar</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Datos básicos</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Nombre completo</p>
            <p className="font-medium">{patient.name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Identificación (Cédula/RUT)</p>
            <p className="font-medium">{patient.cedula}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Fecha de nacimiento</p>
            <p className="font-medium">{birthDateFormatted}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Sexo</p>
            <p className="font-medium">
              {patient.gender === "M"
                ? "Masculino"
                : patient.gender === "F"
                  ? "Femenino"
                  : patient.gender ?? "—"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Teléfono</p>
            <p className="font-medium">{patient.phone}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">{patient.email}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-sm text-muted-foreground">Dirección</p>
            <p className="font-medium">{patient.address || "—"}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Convenio y sede</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Convenio / Beneficio</p>
            <p className="font-medium">{patient.benefits || "—"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Sucursal</p>
            <p className="font-medium">{patient.branch || "—"}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Equipo a cargo</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Profesional a cargo</p>
            <p className="font-medium">{professionalName || "—"}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-sm text-muted-foreground">Colaboradores</p>
            <p className="font-medium">
              {patient.collaborators && patient.collaborators.length > 0
                ? patient.collaborators.join(", ")
                : "—"}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Visitas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Última visita</p>
              <p className="font-medium">{patient.lastVisit || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Próxima cita</p>
              <p className="font-medium">{patient.nextAppointment || "—"}</p>
            </div>
          </div>
          <p className="text-sm font-medium text-muted-foreground">Historial de visitas</p>
          {visitHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin visitas registradas.</p>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-3 py-2 text-left font-medium">Fecha</th>
                    <th className="px-3 py-2 text-left font-medium">Doctor</th>
                    <th className="px-3 py-2 text-left font-medium">Tipo</th>
                    <th className="px-3 py-2 text-left font-medium">Nota breve</th>
                  </tr>
                </thead>
                <tbody>
                  {visitHistory.map((e) => (
                    <tr key={e.id} className="border-b last:border-0">
                      <td className="px-3 py-2">
                        {e.date} {e.time}
                      </td>
                      <td className="px-3 py-2">
                        {"doctorName" in e ? e.doctorName : "—"}
                      </td>
                      <td className="px-3 py-2">{getEventTypeLabel(e)}</td>
                      <td className="px-3 py-2 text-muted-foreground">{getEventNote(e)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
