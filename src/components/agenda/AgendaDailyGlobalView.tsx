import { statusColors, statusLabels } from "@/data/mockData";
import { cn, initials } from "@/lib/utils";
import type { AppointmentWithDetails } from "@/types/agenda";

interface DoctorLike {
  id: string;
  name: string;
  specialty?: string | null;
}

interface AgendaDailyGlobalViewProps {
  appointments: AppointmentWithDetails[];
  doctors: DoctorLike[];
  onSelectAppointment: (apt: AppointmentWithDetails) => void;
  className?: string;
}

export function AgendaDailyGlobalView({
  appointments,
  doctors,
  onSelectAppointment,
  className,
}: AgendaDailyGlobalViewProps) {
  const byDoctor = new Map<string, AppointmentWithDetails[]>();
  appointments.forEach((apt) => {
    const list = byDoctor.get(apt.doctorId) ?? [];
    list.push(apt);
    byDoctor.set(apt.doctorId, list);
  });

  const doctorIds = new Set<string>([...doctors.map((d) => d.id), ...byDoctor.keys()]);
  const rows = Array.from(doctorIds)
    .map((id) => {
      const doctor = doctors.find((d) => d.id === id);
      const list = (byDoctor.get(id) ?? []).sort((a, b) => a.time.localeCompare(b.time));
      return {
        id,
        name: doctor?.name ?? list[0]?.doctorName ?? "Profesional",
        specialty: doctor?.specialty ?? list[0]?.specialty ?? "",
        appointments: list,
      };
    })
    .filter((r) => r.appointments.length > 0 || doctors.some((d) => d.id === r.id))
    .sort((a, b) => b.appointments.length - a.appointments.length);

  if (rows.length === 0) {
    return (
      <div className={cn("bg-card rounded-xl border border-border shadow-card p-6 text-center text-muted-foreground", className)}>
        No hay profesionales configurados.
      </div>
    );
  }

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3", className)}>
      {rows.map((row) => (
        <div key={row.id} className="bg-card rounded-xl border border-border shadow-card flex flex-col">
          <div className="px-3.5 py-3 border-b border-border flex items-center gap-2.5">
            <span className="shrink-0 h-9 w-9 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center">
              {initials(row.name)}
            </span>
            <div className="min-w-0">
              <p className="font-medium text-sm truncate">{row.name}</p>
              {row.specialty && <p className="text-xs text-muted-foreground truncate">{row.specialty}</p>}
            </div>
            <span className="ml-auto shrink-0 text-xs text-muted-foreground whitespace-nowrap">
              {row.appointments.length} cita{row.appointments.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="p-2.5 space-y-1.5">
            {row.appointments.length === 0 ? (
              <p className="text-xs text-muted-foreground px-1 py-1.5">Sin citas hoy</p>
            ) : (
              row.appointments.map((apt) => (
                <button
                  key={apt.id}
                  type="button"
                  onClick={() => onSelectAppointment(apt)}
                  className="w-full flex items-center justify-between gap-2 rounded-lg border border-border px-2.5 py-1.5 text-xs text-left hover:bg-muted/40 transition-colors"
                >
                  <span className="font-medium shrink-0">{apt.time}</span>
                  <span className="truncate flex-1 min-w-0 text-muted-foreground">{apt.patientName}</span>
                  <span className={cn("shrink-0 px-1.5 py-0.5 rounded-full border whitespace-nowrap", statusColors[apt.status])}>
                    {statusLabels[apt.status]}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
