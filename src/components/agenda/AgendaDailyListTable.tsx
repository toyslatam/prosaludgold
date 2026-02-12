import { statusColors, statusLabels } from "@/data/mockData";
import { SITUATION_LABELS, SITUATION_COLORS } from "@/types/agenda";
import type { AppointmentWithDetails } from "@/types/agenda";
import type { SituationFinancial } from "@/types/agenda";
import { cn } from "@/lib/utils";

interface AgendaDailyListTableProps {
  appointments: AppointmentWithDetails[];
  onSelectAppointment: (apt: AppointmentWithDetails) => void;
  className?: string;
}

export function AgendaDailyListTable({ appointments, onSelectAppointment, className }: AgendaDailyListTableProps) {
  return (
    <div className={cn("bg-card rounded-xl border border-border shadow-card overflow-hidden", className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left p-3 font-medium">Hora</th>
              <th className="text-left p-3 font-medium">Paciente</th>
              <th className="text-left p-3 font-medium">Doctor</th>
              <th className="text-left p-3 font-medium">Estado</th>
              <th className="text-left p-3 font-medium">Situación</th>
              <th className="text-left p-3 font-medium hidden lg:table-cell">Motivo</th>
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
                  className="hover:bg-muted/20 transition-colors cursor-pointer"
                  onClick={() => onSelectAppointment(apt)}
                >
                  <td className="p-3 font-medium">{apt.time}</td>
                  <td className="p-3">{apt.patientName}</td>
                  <td className="p-3 text-muted-foreground">
                    {apt.doctorName}
                    {apt.specialty && <span className="hidden md:inline"> · {apt.specialty}</span>}
                  </td>
                  <td className="p-3">
                    <span className={cn("text-xs px-2 py-1 rounded-full border", statusColors[apt.status])}>
                      {statusLabels[apt.status]}
                    </span>
                  </td>
                  <td className="p-3">
                    {apt.situation ? (
                      <span
                        className={cn(
                          "text-xs px-2 py-1 rounded-full border",
                          SITUATION_COLORS[apt.situation as SituationFinancial],
                        )}
                      >
                        {SITUATION_LABELS[apt.situation as SituationFinancial]}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </td>
                  <td className="p-3 hidden lg:table-cell text-muted-foreground">{apt.reason}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
