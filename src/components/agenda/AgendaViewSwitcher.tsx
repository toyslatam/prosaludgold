import { CalendarDays, List, LayoutGrid, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AgendaViewMode } from "@/types/agenda";

interface AgendaViewSwitcherProps {
  value: AgendaViewMode;
  onChange: (mode: AgendaViewMode) => void;
  className?: string;
}

const VIEWS: { value: AgendaViewMode; label: string; icon: typeof CalendarDays }[] = [
  { value: "daily_grid", label: "Diaria (grid)", icon: CalendarDays },
  { value: "daily_list", label: "Lista", icon: List },
  { value: "weekly_grid", label: "Semanal", icon: LayoutGrid },
  { value: "daily_global", label: "Diaria global", icon: Users },
];

export function AgendaViewSwitcher({ value, onChange, className }: AgendaViewSwitcherProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)} role="tablist" aria-label="Vista de agenda">
      {VIEWS.map(({ value: v, label, icon: Icon }) => {
        const active = value === v;
        return (
          <button
            key={v}
            type="button"
            role="tab"
            aria-selected={active}
            aria-label={label}
            onClick={() => onChange(v)}
            className={cn(
              "inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
              active
                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                : "border-border bg-background text-muted-foreground hover:bg-muted/60 hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="hidden md:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
