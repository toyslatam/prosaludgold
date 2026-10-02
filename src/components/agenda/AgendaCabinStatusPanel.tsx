import { Button } from "@/components/ui/button";
import { DoorOpen, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AppointmentWithDetails } from "@/types/agenda";
import type { LocationWithSiteName } from "@/lib/agenda/locations";

interface AgendaCabinStatusPanelProps {
  locations: LocationWithSiteName[];
  appointments: AppointmentWithDetails[];
  onManageLocations: () => void;
  className?: string;
}

export function AgendaCabinStatusPanel({
  locations,
  appointments,
  onManageLocations,
  className,
}: AgendaCabinStatusPanelProps) {
  const countByChair = new Map<string, number>();
  appointments.forEach((apt) => {
    if (!apt.chairId) return;
    countByChair.set(apt.chairId, (countByChair.get(apt.chairId) ?? 0) + 1);
  });
  const occupied = locations.filter((l) => (countByChair.get(l.id) ?? 0) > 0).length;

  return (
    <div className={cn("bg-card rounded-xl border border-border shadow-card p-4 sm:p-5 space-y-4", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <DoorOpen className="h-4 w-4 text-muted-foreground shrink-0" />
          <h3 className="font-semibold truncate">Estado de cabinas</h3>
        </div>
        {locations.length > 0 && (
          <span className="shrink-0 inline-flex items-center rounded-full border border-border bg-muted/40 px-2.5 py-1 text-xs font-medium text-muted-foreground whitespace-nowrap">
            {occupied}/{locations.length} con citas hoy
          </span>
        )}
      </div>

      {locations.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Todavía no hay cabinas o salas configuradas para esta sede.
        </p>
      ) : (
        <div className="space-y-2.5">
          {locations.map((loc) => {
            const count = countByChair.get(loc.id) ?? 0;
            const busy = count > 0;
            return (
              <div
                key={loc.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">
                    {loc.name} <span className="text-muted-foreground font-normal">· {loc.type}</span>
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {loc.siteName || "Sede sin asignar"}
                  </p>
                </div>
                <span
                  className={cn(
                    "shrink-0 text-xs px-2 py-1 rounded-full border whitespace-nowrap",
                    busy
                      ? "bg-warning/10 text-warning border-warning/20"
                      : "bg-success/10 text-success border-success/20",
                  )}
                >
                  {busy ? `${count} cita${count !== 1 ? "s" : ""}` : "Disponible"}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <Button variant="outline" size="sm" className="w-full gap-2" onClick={onManageLocations}>
        <Settings2 className="h-4 w-4" />
        Gestionar disponibilidad de cabinas
      </Button>
    </div>
  );
}
