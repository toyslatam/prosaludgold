import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus, Printer, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AgendaViewMode } from "@/types/agenda";
import { AgendaViewSwitcher } from "./AgendaViewSwitcher";

interface AgendaToolbarProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  viewMode: AgendaViewMode;
  onViewModeChange: (mode: AgendaViewMode) => void;
  onNewAppointment: () => void;
  onPrint: () => void;
  appointmentCount?: number;
  className?: string;
}

export function AgendaToolbar({
  selectedDate,
  onDateChange,
  viewMode,
  onViewModeChange,
  onNewAppointment,
  onPrint,
  appointmentCount = 0,
  className,
}: AgendaToolbarProps) {
  const prevDay = () => onDateChange(new Date(selectedDate.getTime() - 86400000));
  const nextDay = () => onDateChange(new Date(selectedDate.getTime() + 86400000));

  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="icon" onClick={prevDay} aria-label="Día anterior">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="min-w-[200px] justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(selectedDate, "EEEE d 'de' MMMM yyyy", { locale: es })}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={selectedDate} onSelect={(d) => d && onDateChange(d)} initialFocus />
          </PopoverContent>
        </Popover>
        <Button variant="outline" size="icon" onClick={nextDay} aria-label="Día siguiente">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <AgendaViewSwitcher value={viewMode} onChange={onViewModeChange} />

      <div className="flex-1" />

      {appointmentCount >= 0 && (
        <span className="text-sm text-muted-foreground hidden sm:inline">
          {appointmentCount} cita{appointmentCount !== 1 ? "s" : ""}
        </span>
      )}

      <Button variant="outline" size="sm" onClick={onPrint} className="gap-2">
        <Printer className="h-4 w-4" />
        <span className="hidden sm:inline">Imprimir</span>
      </Button>
      <Button onClick={onNewAppointment} className="gap-2">
        <Plus className="h-4 w-4" />
        Nueva cita
      </Button>
    </div>
  );
}
