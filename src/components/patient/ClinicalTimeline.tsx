import { useMemo, useState } from "react";
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar, FileText, Stethoscope, MoreVertical } from "lucide-react";
import {
  getClinicalEventsByPatient,
  type ClinicalEvent,
  type ClinicalEventType,
} from "@/lib/patients/clinicalHistory";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const EVENT_TYPE_LABELS: Record<ClinicalEventType, string> = {
  cita_agendada: "Cita agendada",
  prestacion_realizada: "Prestación realizada",
  presupuesto_creado: "Presupuesto creado",
};

const EVENT_TYPE_STYLES: Record<ClinicalEventType, string> = {
  cita_agendada: "bg-primary/10 text-primary border-primary/20",
  prestacion_realizada: "bg-success/10 text-success border-success/20",
  presupuesto_creado: "bg-info/10 text-info border-info/20",
};

const STATUS_LABELS: Record<string, string> = {
  atendido: "Atendido",
  anulado: "Anulado",
  no_asiste: "No asiste",
  pendiente: "Pendiente",
  confirmada: "Confirmada",
};

function getEventIcon(type: ClinicalEventType) {
  switch (type) {
    case "cita_agendada":
      return <Calendar className="h-4 w-4 shrink-0" />;
    case "prestacion_realizada":
      return <Stethoscope className="h-4 w-4 shrink-0" />;
    case "presupuesto_creado":
      return <FileText className="h-4 w-4 shrink-0" />;
    default:
      return null;
  }
}

interface ClinicalTimelineProps {
  patientId: string;
  className?: string;
}

export function ClinicalTimeline({ patientId, className }: ClinicalTimelineProps) {
  const [filterMonth, setFilterMonth] = useState<string>("all");
  const [filterType, setFilterType] = useState<ClinicalEventType | "all">("all");
  const [showCancelled, setShowCancelled] = useState(false);

  const rawEvents = useMemo(
    () => getClinicalEventsByPatient(patientId),
    [patientId]
  );

  const filteredEvents = useMemo(() => {
    let list: ClinicalEvent[] = [...rawEvents];

    if (!showCancelled) {
      list = list.filter((e) => !e.cancelled);
    }

    if (filterType !== "all") {
      list = list.filter((e) => e.type === filterType);
    }

    if (filterMonth !== "all") {
      const [y, m] = filterMonth.split("-").map(Number);
      const start = startOfMonth(new Date(y, m - 1, 1));
      const end = endOfMonth(start);
      list = list.filter((e) => {
        const d = parseISO(e.date);
        return isWithinInterval(d, { start, end });
      });
    }

    return list.sort((a, b) => {
      const cmp = b.date.localeCompare(a.date) || b.time.localeCompare(a.time);
      return cmp;
    });
  }, [rawEvents, showCancelled, filterType, filterMonth]);

  const byDate = useMemo(() => {
    const map = new Map<string, ClinicalEvent[]>();
    for (const e of filteredEvents) {
      const key = e.date;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    }
    for (const arr of map.values()) {
      arr.sort((a, b) => a.time.localeCompare(b.time));
    }
    const sortedDates = Array.from(map.keys()).sort((a, b) => b.localeCompare(a));
    return sortedDates.map((date) => ({ date, events: map.get(date)! }));
  }, [filteredEvents]);

  const monthsOptions = useMemo(() => {
    const set = new Set(rawEvents.map((e) => e.date.slice(0, 7)));
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [rawEvents]);

  if (rawEvents.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground/50" />
          <p className="mt-2 text-center text-muted-foreground text-sm">
            No hay eventos en el historial de este paciente
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-wrap items-center gap-3">
        <Select value={filterMonth} onValueChange={setFilterMonth}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por mes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los meses</SelectItem>
            {monthsOptions.map((m) => {
              const [y, month] = m.split("-").map(Number);
              const label = format(new Date(y, month - 1, 1), "MMMM yyyy", {
                locale: es,
              });
              return (
                <SelectItem key={m} value={m}>
                  {label}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        <Select
          value={filterType}
          onValueChange={(v) => setFilterType(v as ClinicalEventType | "all")}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            {(Object.keys(EVENT_TYPE_LABELS) as ClinicalEventType[]).map(
              (t) => (
                <SelectItem key={t} value={t}>
                  {EVENT_TYPE_LABELS[t]}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <Checkbox
            checked={showCancelled}
            onCheckedChange={(c) => setShowCancelled(!!c)}
          />
          Mostrar anuladas
        </label>
      </div>

      {filteredEvents.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground text-sm">
            No hay eventos que coincidan con los filtros
          </CardContent>
        </Card>
      ) : (
        <div className="relative space-y-6">
          <div className="absolute left-[11px] top-2 bottom-2 w-px bg-border" />
          {byDate.map(({ date, events }) => (
            <div key={date} className="relative pl-8">
              <div className="sticky top-0 z-10 -ml-8 flex items-center gap-2 bg-background py-1">
                <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  {format(parseISO(date), "d MMM yyyy", { locale: es })}
                </span>
              </div>
              <div className="mt-2 space-y-2">
                {events.map((event) => (
                  <Card
                    key={event.id}
                    className={cn(
                      "relative",
                      event.cancelled && "opacity-60"
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex gap-3 min-w-0">
                          <div
                            className={cn(
                              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border",
                              EVENT_TYPE_STYLES[event.type]
                            )}
                          >
                            {getEventIcon(event.type)}
                          </div>
                          <div className="min-w-0 space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={cn(
                                  "inline-flex text-xs font-medium rounded-full border px-2 py-0.5",
                                  EVENT_TYPE_STYLES[event.type]
                                )}
                              >
                                {EVENT_TYPE_LABELS[event.type].toUpperCase()}
                              </span>
                              {event.type === "cita_agendada" &&
                                "status" in event && (
                                  <span className="text-xs text-muted-foreground">
                                    {STATUS_LABELS[event.status] ?? event.status}
                                  </span>
                                )}
                            </div>
                            {event.type === "cita_agendada" && (
                              <p className="text-sm">
                                {event.doctorName} · {event.time}
                                {event.reason && ` · ${event.reason}`}
                              </p>
                            )}
                            {event.type === "prestacion_realizada" && (
                              <p className="text-sm">
                                Plan #{event.planId ?? "—"} · {event.prestacion}{" "}
                                · {event.doctorName} · {event.time}
                              </p>
                            )}
                            {event.type === "presupuesto_creado" && (
                              <p className="text-sm">
                                {event.label ?? "Presupuesto creado"}
                              </p>
                            )}
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 shrink-0"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Ver detalle</DropdownMenuItem>
                            <DropdownMenuItem>Editar (mock)</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
