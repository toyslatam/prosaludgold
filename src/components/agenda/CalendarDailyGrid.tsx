import { statusColors, statusLabels } from "@/data/mockData";
import type { AppointmentWithDetails } from "@/types/agenda";
import { MessageCircle, Mail, Pin, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const SLOT_HEIGHT = 56;
const START_HOUR = 8;
const END_HOUR = 20;

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let h = START_HOUR; h < END_HOUR; h++) {
    slots.push(`${h.toString().padStart(2, "0")}:00`);
    slots.push(`${h.toString().padStart(2, "0")}:30`);
  }
  return slots;
}

const TIME_SLOTS = generateTimeSlots();

interface CalendarDailyGridProps {
  date: string; // YYYY-MM-DD
  appointments: AppointmentWithDetails[];
  onSelectAppointment: (apt: AppointmentWithDetails) => void;
  onSelectSlot: (date: string, time: string) => void;
  className?: string;
}

export function CalendarDailyGrid({
  date,
  appointments,
  onSelectAppointment,
  onSelectSlot,
  className,
}: CalendarDailyGridProps) {
  const dayAppointments = appointments.filter((a) => a.date === date);

  return (
    <div className={cn("bg-card rounded-xl border border-border shadow-card overflow-hidden", className)}>
      <div className="grid grid-cols-[80px_1fr] divide-x divide-border">
        <div className="bg-muted/50">
          {TIME_SLOTS.map((t) => (
            <div
              key={t}
              className="flex items-center justify-center text-xs text-muted-foreground border-b border-border"
              style={{ height: SLOT_HEIGHT }}
            >
              {t}
            </div>
          ))}
        </div>
        <div className="relative" style={{ minHeight: TIME_SLOTS.length * SLOT_HEIGHT }}>
          {TIME_SLOTS.map((t) => (
            <div
              key={t}
              className="absolute left-0 right-0 border-b border-border cursor-pointer hover:bg-primary/5 transition-colors"
              style={{
                top: TIME_SLOTS.indexOf(t) * SLOT_HEIGHT,
                height: SLOT_HEIGHT - 1,
              }}
              onClick={() => onSelectSlot(date, t)}
            />
          ))}
          {dayAppointments.map((apt) => {
            const slotIndex = TIME_SLOTS.indexOf(apt.time);
            if (slotIndex === -1) return null;
            const top = slotIndex * SLOT_HEIGHT + 2;
            const height = Math.max((apt.duration / 30) * SLOT_HEIGHT - 4, 28);
            return (
              <div
                key={apt.id}
                className={cn(
                  "absolute left-2 right-2 rounded-lg p-2 border text-xs cursor-pointer transition-shadow hover:shadow-md",
                  statusColors[apt.status],
                )}
                style={{ top: `${top}px`, height: `${height}px` }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectAppointment(apt);
                }}
              >
                <p className="font-semibold truncate">{apt.patientName}</p>
                <p className="truncate opacity-90 text-[11px]">{apt.doctorName}</p>
                <p className="truncate opacity-75 text-[11px]">{apt.reason}</p>
                <div className="flex gap-1 mt-1 flex-wrap">
                  {apt.confirmations.whatsapp && <MessageCircle className="h-3 w-3 shrink-0" />}
                  {apt.confirmations.email && <Mail className="h-3 w-3 shrink-0" />}
                  {apt.chairName && (
                    <span className="inline-flex items-center gap-0.5">
                      <Pin className="h-3 w-3" /> {apt.chairName}
                    </span>
                  )}
                  {apt.situation === "deuda" && <AlertCircle className="h-3 w-3 text-destructive shrink-0" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export { TIME_SLOTS };
