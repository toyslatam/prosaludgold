import { addDays, format, isSameDay, startOfWeek } from "date-fns";
import { es } from "date-fns/locale";
import { Plus } from "lucide-react";
import { statusColors } from "@/data/mockData";
import { cn } from "@/lib/utils";
import type { AppointmentWithDetails } from "@/types/agenda";

interface AgendaWeeklyGridProps {
  selectedDate: Date;
  appointments: AppointmentWithDetails[];
  onSelectAppointment: (apt: AppointmentWithDetails) => void;
  onSelectDay: (dateStr: string) => void;
  className?: string;
}

export function AgendaWeeklyGrid({
  selectedDate,
  appointments,
  onSelectAppointment,
  onSelectDay,
  className,
}: AgendaWeeklyGridProps) {
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3", className)}>
      {days.map((day) => {
        const dayStr = format(day, "yyyy-MM-dd");
        const dayAppointments = appointments
          .filter((a) => a.date === dayStr)
          .sort((a, b) => a.time.localeCompare(b.time));
        const today = isSameDay(day, new Date());

        return (
          <div
            key={dayStr}
            className={cn(
              "bg-card rounded-xl border shadow-card flex flex-col min-h-[220px]",
              today ? "border-primary" : "border-border",
            )}
          >
            <div className="px-3 py-2.5 border-b border-border flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className={cn("text-xs font-semibold uppercase tracking-wide", today ? "text-primary" : "text-muted-foreground")}>
                  {format(day, "EEEE", { locale: es })}
                </p>
                <p className="text-sm font-medium">{format(day, "d MMM", { locale: es })}</p>
              </div>
              <button
                type="button"
                onClick={() => onSelectDay(dayStr)}
                className="shrink-0 h-6 w-6 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                aria-label={`Nueva cita el ${dayStr}`}
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="flex-1 p-2 space-y-1.5 overflow-y-auto max-h-[420px]">
              {dayAppointments.length === 0 ? (
                <p className="text-xs text-muted-foreground px-1 py-2">Sin citas</p>
              ) : (
                dayAppointments.map((apt) => (
                  <button
                    key={apt.id}
                    type="button"
                    onClick={() => onSelectAppointment(apt)}
                    className={cn(
                      "w-full text-left rounded-lg border px-2 py-1.5 text-xs transition-shadow hover:shadow-sm",
                      statusColors[apt.status],
                    )}
                  >
                    <div className="font-semibold truncate">{apt.time} · {apt.patientName}</div>
                    <div className="opacity-80 truncate">{apt.doctorName}</div>
                  </button>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
