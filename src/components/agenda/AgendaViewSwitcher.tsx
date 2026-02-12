import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CalendarDays, List, LayoutGrid, Users } from "lucide-react";
import type { AgendaViewMode } from "@/types/agenda";

interface AgendaViewSwitcherProps {
  value: AgendaViewMode;
  onChange: (mode: AgendaViewMode) => void;
}

const VIEWS: { value: AgendaViewMode; label: string; icon: typeof CalendarDays }[] = [
  { value: "daily_grid", label: "Diaria (grid)", icon: CalendarDays },
  { value: "daily_list", label: "Lista", icon: List },
  { value: "weekly_grid", label: "Semanal", icon: LayoutGrid },
  { value: "daily_global", label: "Diaria global", icon: Users },
];

export function AgendaViewSwitcher({ value, onChange }: AgendaViewSwitcherProps) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(v) => v && onChange(v as AgendaViewMode)}
      className="border rounded-lg p-1 bg-muted/30"
    >
      {VIEWS.map(({ value: v, label, icon: Icon }) => (
        <ToggleGroupItem key={v} value={v} aria-label={label} className="gap-1.5 px-3">
          <Icon className="h-4 w-4" />
          <span className="hidden md:inline text-xs">{label}</span>
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
