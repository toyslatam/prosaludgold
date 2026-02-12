import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";

export interface NotificationItem {
  id: string;
  type: "cita_creada" | "cita_reprogramada" | "recordatorio" | "deuda" | "confirmacion_enviada";
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

interface NotificationsCenterProps {
  items: NotificationItem[];
  onMarkRead?: (id: string) => void;
  onClearAll?: () => void;
  className?: string;
}

const typeLabels: Record<NotificationItem["type"], string> = {
  cita_creada: "Cita creada",
  cita_reprogramada: "Cita reprogramada",
  recordatorio: "Recordatorio",
  deuda: "Paciente con deuda",
  confirmacion_enviada: "Confirmación enviada",
};

export function NotificationsCenter({
  items,
  onMarkRead,
  onClearAll,
  className,
}: NotificationsCenterProps) {
  const unreadCount = items.filter((i) => !i.read).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className={cn("relative", className)} aria-label="Notificaciones">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-3 border-b flex items-center justify-between">
          <span className="font-semibold text-sm">Notificaciones</span>
          {items.length > 0 && onClearAll && (
            <Button variant="ghost" size="sm" className="text-xs" onClick={onClearAll}>
              Limpiar
            </Button>
          )}
        </div>
        <ScrollArea className="h-[280px]">
          {items.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground text-sm">No hay notificaciones</div>
          ) : (
            <ul className="divide-y">
              {items.map((item) => (
                <li
                  key={item.id}
                  className={cn(
                    "p-3 text-sm cursor-pointer transition-colors hover:bg-muted/50",
                    !item.read && "bg-primary/5",
                  )}
                  onClick={() => onMarkRead?.(item.id)}
                >
                  <p className="font-medium text-xs text-muted-foreground">{typeLabels[item.type]}</p>
                  <p className="font-medium mt-0.5">{item.title}</p>
                  {item.body && <p className="text-muted-foreground text-xs mt-0.5">{item.body}</p>}
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
