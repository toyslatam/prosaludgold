import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, isToday } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AgendaViewMode } from "@/types/agenda";
import { AgendaViewSwitcher } from "./AgendaViewSwitcher";

interface AgendaToolbarProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  viewMode: AgendaViewMode;
  onViewModeChange: (mode: AgendaViewMode) => void;
  appointmentCount?: number;
  className?: string;
}

export function AgendaToolbar({
  selectedDate,
  onDateChange,
  viewMode,
  onViewModeChange,
  appointmentCount = 0,
  className,
}: AgendaToolbarProps) {
  const prevDay = () => onDateChange(new Date(selectedDate.getTime() - 86400000));
  const nextDay = () => onDateChange(new Date(selectedDate.getTime() + 86400000));

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="icon" onClick={prevDay} aria-label="Día anterior" className="shrink-0">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="min-w-[160px] justify-start gap-2 text-left font-normal">
              <CalendarIcon className="h-4 w-4 shrink-0" />
              <span className="truncate">{format(selectedDate, "d MMM yyyy", { locale: es })}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={selectedDate} onSelect={(d) => d && onDateChange(d)} initialFocus />
          </PopoverContent>
        </Popover>
        <Button variant="outline" size="icon" onClick={nextDay} aria-label="Día siguiente" className="shrink-0">
          <ChevronRight className="h-4 w-4" />
        </Button>
        {!isToday(selectedDate) && (
          <Button variant="secondary" size="sm" onClick={() => onDateChange(new Date())} className="shrink-0">
            Hoy
          </Button>
        )}
      </div>

      <AgendaViewSwitcher value={viewMode} onChange={onViewModeChange} />

      <span className="inline-flex items-center rounded-full border border-border bg-muted/40 px-3 py-1.5 text-xs font-medium text-muted-foreground whitespace-nowrap">
        {appointmentCount} cita{appointmentCount !== 1 ? "s" : ""}
      </span>
    </div>
  );
}
