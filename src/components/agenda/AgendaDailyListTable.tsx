import { statusColors, statusLabels } from "@/data/mockData";
import { SITUATION_LABELS, SITUATION_COLORS } from "@/types/agenda";
import type { AppointmentWithDetails } from "@/types/agenda";
import type { SituationFinancial } from "@/types/agenda";
import { cn, initials } from "@/lib/utils";

interface AgendaDailyListTableProps {
  appointments: AppointmentWithDetails[];
  onSelectAppointment: (apt: AppointmentWithDetails) => void;
  className?: string;
}

function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return "";
  const total = h * 60 + m + minutes;
  const hh = Math.floor(((total % 1440) + 1440) % 1440 / 60);
  const mm = ((total % 60) + 60) % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

export function AgendaDailyListTable({ appointments, onSelectAppointment, className }: AgendaDailyListTableProps) {
  return (
    <div className={cn("bg-card rounded-xl border border-border shadow-card overflow-hidden", className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left p-3 font-medium whitespace-nowrap">Hora</th>
              <th className="text-left p-3 font-medium">Paciente</th>
              <th className="text-left p-3 font-medium">Doctor / Terapeuta</th>
              <th className="text-left p-3 font-medium hidden md:table-cell">Servicio &amp; área</th>
              <th className="text-left p-3 font-medium">Estado</th>
              <th className="text-left p-3 font-medium">Situación</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {appointments.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                  No hay citas para mostrar
                </td>
              </tr>
            ) : (
              appointments.map((apt) => (
                <tr
                  key={apt.id}
                  className="hover:bg-muted/20 transition-colors cursor-pointer align-top"
                  onClick={() => onSelectAppointment(apt)}
                >
                  <td className="p-3 whitespace-nowrap">
                    <div className="font-medium">{apt.time}</div>
                    <div className="text-xs text-muted-foreground">
                      {apt.duration} min · Fin: {addMinutes(apt.time, apt.duration)}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2.5 min-w-[160px]">
                      <span className="shrink-0 h-8 w-8 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center">
                        {initials(apt.patientName)}
                      </span>
                      <span className="font-medium truncate">{apt.patientName}</span>
                    </div>
                  </td>
                  <td className="p-3 text-muted-foreground">
                    <div className="text-foreground">{apt.doctorName}</div>
                    {apt.specialty && <div className="text-xs">{apt.specialty}</div>}
                  </td>
                  <td className="p-3 hidden md:table-cell text-muted-foreground">
                    <div className="text-foreground truncate max-w-[220px]">{apt.reason || "—"}</div>
                    {apt.chairName && <div className="text-xs">{apt.chairName}</div>}
                  </td>
                  <td className="p-3">
                    <span className={cn("text-xs px-2 py-1 rounded-full border whitespace-nowrap", statusColors[apt.status])}>
                      {statusLabels[apt.status]}
                    </span>
                  </td>
                  <td className="p-3">
                    {apt.situation ? (
                      <span
                        className={cn(
                          "text-xs px-2 py-1 rounded-full border whitespace-nowrap",
                          SITUATION_COLORS[apt.situation as SituationFinancial],
                        )}
                      >
                        {SITUATION_LABELS[apt.situation as SituationFinancial]}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {appointments.length > 0 && (
        <div className="px-4 py-2.5 border-t border-border bg-muted/20 text-xs text-muted-foreground">
          Mostrando {appointments.length} cita{appointments.length !== 1 ? "s" : ""} programada{appointments.length !== 1 ? "s" : ""} para hoy
        </div>
      )}
    </div>
  );
}
