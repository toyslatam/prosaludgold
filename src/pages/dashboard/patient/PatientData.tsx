import { useState } from "react";
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
import { toast } from "sonner";

export default function PatientData() {
  const { patient } = useOutletContext<{ patient: Patient }>();
  const [editOpen, setEditOpen] = useState(false);

  const birthDateFormatted = patient.birthDate
    ? format(parseISO(patient.birthDate), "d MMM yyyy", { locale: es })
    : "—";

  const professionalName =
    patient.assignedDoctorId &&
    mockDoctors.find((d) => d.id === patient.assignedDoctorId)?.name;

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Datos guardados (demo)");
    setEditOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              Editar
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Editar datos personales</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Formulario de edición (mock). Los cambios no se persisten aún.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nombre</label>
                  <input
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                    defaultValue={patient.name}
                    readOnly
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Cédula</label>
                  <input
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                    defaultValue={patient.cedula}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Teléfono</label>
                  <input
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                    defaultValue={patient.phone}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <input
                    type="email"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                    defaultValue={patient.email}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-medium">Dirección</label>
                  <input
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                    defaultValue={patient.address ?? ""}
                    placeholder="Opcional"
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
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Última visita</p>
            <p className="font-medium">{patient.lastVisit || "—"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Próxima cita</p>
            <p className="font-medium">{patient.nextAppointment || "—"}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
