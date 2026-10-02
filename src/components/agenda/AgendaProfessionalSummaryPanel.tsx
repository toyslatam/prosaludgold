import { UserRound } from "lucide-react";
import { cn, initials } from "@/lib/utils";
import type { AppointmentWithDetails } from "@/types/agenda";

interface DoctorLike {
  id: string;
  name: string;
  specialty?: string | null;
  commission_percentage?: number | null;
}

interface AgendaProfessionalSummaryPanelProps {
  appointments: AppointmentWithDetails[];
  doctors: DoctorLike[];
  /** Si hay un doctor filtrado explícitamente (FiltersPanel), se prioriza. */
  preferredDoctorId?: string;
  className?: string;
}

export function AgendaProfessionalSummaryPanel({
  appointments,
  doctors,
  preferredDoctorId,
  className,
}: AgendaProfessionalSummaryPanelProps) {
  const countByDoctor = new Map<string, number>();
  const minutesByDoctor = new Map<string, number>();
  appointments.forEach((apt) => {
    countByDoctor.set(apt.doctorId, (countByDoctor.get(apt.doctorId) ?? 0) + 1);
    minutesByDoctor.set(apt.doctorId, (minutesByDoctor.get(apt.doctorId) ?? 0) + (apt.duration || 0));
  });

  let doctorId = preferredDoctorId && preferredDoctorId !== "all" ? preferredDoctorId : undefined;
  if (!doctorId) {
    let max = 0;
    countByDoctor.forEach((n, id) => {
      if (n > max) {
        max = n;
        doctorId = id;
      }
    });
  }

  if (!doctorId) {
    return (
      <div className={cn("bg-card rounded-xl border border-border shadow-card p-4 sm:p-5", className)}>
        <div className="flex items-center gap-2 mb-2">
          <UserRound className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold">Resumen del profesional</h3>
        </div>
        <p className="text-sm text-muted-foreground">Sin citas agendadas hoy para mostrar un resumen.</p>
      </div>
    );
  }

  const doctor = doctors.find((d) => d.id === doctorId);
  const name = doctor?.name ?? appointments.find((a) => a.doctorId === doctorId)?.doctorName ?? "Profesional";
  const specialty = doctor?.specialty ?? appointments.find((a) => a.doctorId === doctorId)?.specialty ?? "";
  const citas = countByDoctor.get(doctorId) ?? 0;
  const totalMinutes = minutesByDoctor.get(doctorId) ?? 0;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return (
    <div className={cn("bg-card rounded-xl border border-border shadow-card p-4 sm:p-5 space-y-4", className)}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <UserRound className="h-4 w-4 text-muted-foreground shrink-0" />
          <h3 className="font-semibold truncate">Resumen del profesional</h3>
        </div>
        <span className="shrink-0 inline-flex items-center rounded-full border border-border bg-muted/40 px-2.5 py-1 text-xs font-medium text-muted-foreground truncate max-w-[140px]">
          {name}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <span className="shrink-0 h-12 w-12 rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center">
          {initials(name)}
        </span>
        <div className="min-w-0">
          <p className="font-medium truncate">{name}</p>
          {specialty && <p className="text-xs text-muted-foreground truncate">{specialty}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-1">
        <div className="rounded-lg bg-muted/30 px-3 py-2.5">
          <p className="text-2xl font-bold">{citas}</p>
          <p className="text-xs text-muted-foreground">cita{citas !== 1 ? "s" : ""} hoy</p>
        </div>
        <div className="rounded-lg bg-muted/30 px-3 py-2.5">
          <p className="text-2xl font-bold">
            {hours}h {String(minutes).padStart(2, "0")}m
          </p>
          <p className="text-xs text-muted-foreground">tiempo en cabina</p>
        </div>
      </div>

      {typeof doctor?.commission_percentage === "number" && (
        <p className="text-xs text-muted-foreground">
          Comisión configurada: <span className="font-medium text-foreground">{doctor.commission_percentage}%</span> ·
          ver montos reales en Comisiones.
        </p>
      )}
    </div>
  );
}
