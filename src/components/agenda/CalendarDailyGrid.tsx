import { useMemo } from "react";
import { statusColors, statusLabels } from "@/data/mockData";
import { SITUATION_COLORS, SITUATION_LABELS } from "@/types/agenda";
import type { AppointmentWithDetails, SituationFinancial } from "@/types/agenda";
import { MessageCircle, Mail, Pin, AlertCircle, Plus } from "lucide-react";
import { cn, initials } from "@/lib/utils";

const SLOT_HEIGHT = 56;
const START_HOUR = 8;
const END_HOUR = 20;
const MINUTES_PER_SLOT = 30;

function timeToMinutes(t: string): number {
  const parts = t.split(":");
  const h = parseInt(parts[0], 10);
  const m = parts[1] ? parseInt(parts[1], 10) : 0;
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

/** Calcula top (px) y height (px) según hora de inicio y duración en una grilla continua */
function getBlockStyle(apt: AppointmentWithDetails) {
  const startMinutes = timeToMinutes(apt.time);
  const dayStartMinutes = START_HOUR * 60;
  const topPx = ((startMinutes - dayStartMinutes) / MINUTES_PER_SLOT) * SLOT_HEIGHT + 2;
  const heightPx = Math.max((apt.duration / MINUTES_PER_SLOT) * SLOT_HEIGHT - 4, 28);
  return { topPx, heightPx, startMinutes, endMinutes: startMinutes + apt.duration };
}

/** Detecta solapamientos y asigna a cada cita un "lane" (0, 1, 2...) para mostrarlas en columnas sin apilar */
function assignLanes(appointments: AppointmentWithDetails[]): Map<string, { lane: number; totalLanes: number }> {
  const result = new Map<string, { lane: number; totalLanes: number }>();
  const withStyle = appointments.map((apt) => ({ apt, ...getBlockStyle(apt) }));
  const sorted = [...withStyle].sort((a, b) => a.startMinutes - b.startMinutes);

  for (const { apt, startMinutes, endMinutes } of sorted) {
    const overlapping = withStyle.filter(
      (o) => o.apt.id !== apt.id && o.startMinutes < endMinutes && o.endMinutes > startMinutes,
    );
    const usedLanes = new Set(
      overlapping.map((o) => result.get(o.apt.id)?.lane).filter((l): l is number => l !== undefined),
    );
    let lane = 0;
    while (usedLanes.has(lane)) lane++;
    result.set(apt.id, { lane, totalLanes: lane + 1 });
  }

  // Segundo pase: que todos los que se solapan compartan el mismo totalLanes (el máximo del grupo)
  const allIds = withStyle.map((w) => w.apt.id);
  for (const id of allIds) {
    const w = withStyle.find((x) => x.apt.id === id)!;
    const overlapping = withStyle.filter(
      (o) => o.apt.id !== id && o.startMinutes < w.endMinutes && o.endMinutes > w.startMinutes,
    );
    const current = result.get(id)!;
    const maxTotal = [current.totalLanes, ...overlapping.map((o) => result.get(o.apt.id)!.totalLanes)].reduce(
      (a, b) => Math.max(a, b),
      1,
    );
    result.set(id, { lane: current.lane, totalLanes: maxTotal });
    overlapping.forEach((o) => {
      const cur = result.get(o.apt.id)!;
      if (cur.totalLanes < maxTotal) result.set(o.apt.id, { lane: cur.lane, totalLanes: maxTotal });
    });
  }

  return result;
}

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
  const dayAppointments = useMemo(() => appointments.filter((a) => a.date === date), [appointments, date]);
  const lanesMap = useMemo(() => assignLanes(dayAppointments), [dayAppointments]);

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
              className="group absolute left-0 right-0 border-b border-border cursor-pointer hover:bg-primary/5 transition-colors flex items-center justify-end pr-3"
              style={{
                top: TIME_SLOTS.indexOf(t) * SLOT_HEIGHT,
                height: SLOT_HEIGHT - 1,
              }}
              onClick={() => onSelectSlot(date, t)}
            >
              <span className="hidden group-hover:inline-flex items-center gap-1 text-xs font-medium text-primary">
                <Plus className="h-3.5 w-3.5" /> Agendar turno
              </span>
            </div>
          ))}
          {dayAppointments.map((apt) => {
            const { topPx, heightPx } = getBlockStyle(apt);
            const laneInfo = lanesMap.get(apt.id);
            const totalLanes = laneInfo?.totalLanes ?? 1;
            const lane = laneInfo?.lane ?? 0;
            const gapPx = 4;
            const marginPx = 8;
            const expanded = heightPx >= 72;

            return (
              <div
                key={apt.id}
                className={cn(
                  "absolute rounded-lg border text-xs cursor-pointer transition-shadow hover:shadow-md overflow-hidden",
                  expanded ? "p-2.5" : "p-1.5",
                  statusColors[apt.status],
                )}
                style={{
                  top: `${topPx}px`,
                  height: `${heightPx}px`,
                  ...(totalLanes > 1
                    ? {
                        left: `calc(${marginPx}px + ${lane} * ((100% - ${2 * marginPx}px - ${(totalLanes - 1) * gapPx}px) / ${totalLanes} + ${gapPx}px))`,
                        width: `calc((100% - ${2 * marginPx}px - ${(totalLanes - 1) * gapPx}px) / ${totalLanes})`,
                      }
                    : { left: `${marginPx}px`, right: `${marginPx}px` }),
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectAppointment(apt);
                }}
              >
                {expanded ? (
                  <div className="flex flex-col gap-1 h-full min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="shrink-0 h-6 w-6 rounded-full bg-background/70 text-[10px] font-semibold flex items-center justify-center">
                        {initials(apt.patientName)}
                      </span>
                      <span className="font-semibold truncate min-w-0">{apt.patientName}</span>
                      <span className="ml-auto inline-flex items-center gap-1 shrink-0">
                        {apt.confirmations.whatsapp && <MessageCircle className="h-3 w-3" />}
                        {apt.confirmations.email && <Mail className="h-3 w-3" />}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 min-w-0 text-[11px] opacity-90">
                      <span className="truncate min-w-0">{apt.reason || apt.doctorName}</span>
                      {apt.chairName && (
                        <span className="inline-flex items-center gap-0.5 shrink-0">
                          <Pin className="h-3 w-3" /> {apt.chairName}
                        </span>
                      )}
                    </div>
                    <div className="mt-auto flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-background/70 font-medium whitespace-nowrap">
                        {statusLabels[apt.status]}
                      </span>
                      {apt.situation && (
                        <span
                          className={cn(
                            "text-[10px] px-1.5 py-0.5 rounded-full border whitespace-nowrap",
                            SITUATION_COLORS[apt.situation as SituationFinancial],
                          )}
                        >
                          {SITUATION_LABELS[apt.situation as SituationFinancial]}
                        </span>
                      )}
                      {apt.situation === "deuda" && <AlertCircle className="h-3 w-3 text-destructive ml-auto shrink-0" />}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 min-h-0 h-full">
                    <span className="font-semibold shrink-0">{apt.patientName}</span>
                    <span className="opacity-90 text-[11px] shrink-0">{apt.doctorName}</span>
                    <span className="opacity-75 text-[11px] min-w-0 truncate">{apt.reason}</span>
                    {apt.chairName && (
                      <span className="inline-flex items-center gap-0.5 text-[11px] shrink-0">
                        <Pin className="h-3 w-3" /> {apt.chairName}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 ml-auto shrink-0">
                      {apt.confirmations.whatsapp && <MessageCircle className="h-3 w-3" />}
                      {apt.confirmations.email && <Mail className="h-3 w-3" />}
                      {apt.situation === "deuda" && <AlertCircle className="h-3 w-3 text-destructive" />}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export { TIME_SLOTS };
