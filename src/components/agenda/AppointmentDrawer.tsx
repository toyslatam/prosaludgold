import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { AppointmentWithDetails } from "@/types/agenda";
import type { DoctorRow, PatientRow } from "@/lib/agenda/types";
import type { LocationWithSiteName } from "@/lib/agenda/locations";
import { statusLabels } from "@/data/mockData";
import { SITUATION_LABELS } from "@/types/agenda";
import { MessageCircle, Mail, Phone, Pin } from "lucide-react";
import { AppointmentForm, type AppointmentFormValues } from "./AppointmentForm";
import { cn } from "@/lib/utils";

interface AppointmentDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: AppointmentWithDetails | null;
  doctors: DoctorRow[];
  locations: LocationWithSiteName[];
  patients: PatientRow[];
  nextAppointmentByPatientId?: Record<string, string>;
  defaultDate?: string;
  defaultTime?: string;
  defaultPatientId?: string;
  onSave: (values: AppointmentFormValues, patient: PatientRow) => void;
  onOpenLocationManager?: () => void;
  onAnular: (id: string, motivo?: string) => void;
  onNoAsiste: (id: string) => void;
  onAtendida: (id: string) => void;
  onEnviarConfirmacion: (id: string) => void;
  onViewPatient?: (patientId: string) => void;
}

export function AppointmentDrawer({
  open,
  onOpenChange,
  appointment,
  doctors,
  locations,
  patients,
  nextAppointmentByPatientId,
  defaultDate,
  defaultTime,
  defaultPatientId,
  onSave,
  onOpenLocationManager,
  onAnular,
  onNoAsiste,
  onAtendida,
  onEnviarConfirmacion,
  onViewPatient,
}: AppointmentDrawerProps) {
  const patient = appointment
    ? patients.find((p) => p.id === appointment.patientId)
    : defaultPatientId
      ? patients.find((p) => p.id === defaultPatientId) ?? null
      : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-lg" aria-describedby="agenda-drawer-desc">
        <SheetHeader>
          <SheetTitle>{appointment ? "Detalle de cita" : "Nueva cita"}</SheetTitle>
          <SheetDescription id="agenda-drawer-desc" className="sr-only">
            {appointment ? "Ver y editar datos de la cita" : "Completar datos para crear una nueva cita"}
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6">
          {appointment ? (
            <>
              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-2xl font-semibold">{appointment.patientName}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                    {appointment.doctorName} · {appointment.specialty}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs px-2 py-1 rounded-full border bg-muted/50">
                    {statusLabels[appointment.status]}
                  </span>
                  {appointment.situation && (
                    <span className="text-xs px-2 py-1 rounded-full border bg-muted/50">
                      {SITUATION_LABELS[appointment.situation]}
                    </span>
                  )}
                  {appointment.chairName && (
                    <span className="text-xs px-2 py-1 rounded-full border flex items-center gap-1">
                      <Pin className="h-3 w-3" />
                      {appointment.chairName}
                    </span>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>{appointment.date} · {appointment.time} · {appointment.duration} min</p>
                  <p className="mt-1">{appointment.reason}</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {appointment.confirmations.whatsapp && (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <MessageCircle className="h-3 w-3" /> WhatsApp
                    </span>
                  )}
                  {appointment.confirmations.email && (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Mail className="h-3 w-3" /> Email
                    </span>
                  )}
                  {appointment.confirmations.phone && (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Phone className="h-3 w-3" /> Teléfono
                    </span>
                  )}
                </div>
                {appointment.notes && (
                  <p className="text-sm text-muted-foreground border-l-2 pl-2">{appointment.notes}</p>
                )}
                {onViewPatient && patient && (
                  <button
                    type="button"
                    onClick={() => onViewPatient(patient.id)}
                    className="text-sm text-primary hover:underline"
                  >
                    Ver ficha del paciente →
                  </button>
                )}
              </div>
              <AppointmentForm
                initial={{
                  ...appointment,
                  patient: patient ?? undefined,
                }}
                doctors={doctors}
                locations={locations}
                patients={patients}
                nextAppointmentByPatientId={nextAppointmentByPatientId}
                onSubmit={onSave}
                onCancel={() => onOpenChange(false)}
                onOpenLocationManager={onOpenLocationManager}
                onAnular={() => onAnular(appointment.id)}
                onNoAsiste={() => onNoAsiste(appointment.id)}
                onAtendida={() => onAtendida(appointment.id)}
                onEnviarConfirmacion={() => onEnviarConfirmacion(appointment.id)}
                isEdit
              />
            </>
          ) : (
            <AppointmentForm
              initial={
                defaultPatientId && patient
                  ? { patientId: defaultPatientId, patient }
                  : undefined
              }
              doctors={doctors}
              locations={locations}
              patients={patients}
              defaultDate={defaultDate}
              defaultTime={defaultTime}
              nextAppointmentByPatientId={nextAppointmentByPatientId}
              onSubmit={onSave}
              onCancel={() => onOpenChange(false)}
              onOpenLocationManager={onOpenLocationManager}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
