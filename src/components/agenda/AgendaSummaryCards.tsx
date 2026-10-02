import { CalendarCheck, CheckCircle2, Hourglass, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AppointmentWithDetails } from "@/types/agenda";

interface AgendaSummaryCardsProps {
  appointments: AppointmentWithDetails[];
  className?: string;
}

interface CardSpec {
  label: string;
  value: string;
  hint: string;
  icon: typeof CalendarCheck;
  iconClass: string;
}

export function AgendaSummaryCards({ appointments, className }: AgendaSummaryCardsProps) {
  const total = appointments.length;
  const confirmadas = appointments.filter((a) => a.status === "confirmada").length;
  const pendientes = appointments.filter((a) => a.status === "pendiente").length;
  const pendientesCobro = appointments.filter((a) => a.situation === "deuda").length;
  const pct = (n: number) => (total > 0 ? `${Math.round((n / total) * 100)}%` : "—");

  const cards: CardSpec[] = [
    {
      label: "Total citas",
      value: String(total),
      hint: "agendadas",
      icon: CalendarCheck,
      iconClass: "bg-muted text-foreground",
    },
    {
      label: "Confirmadas",
      value: String(confirmadas),
      hint: pct(confirmadas),
      icon: CheckCircle2,
      iconClass: "bg-success/10 text-success",
    },
    {
      label: "Pendientes",
      value: String(pendientes),
      hint: "por validar",
      icon: Hourglass,
      iconClass: "bg-warning/10 text-warning",
    },
    {
      label: "Pendientes de cobro",
      value: String(pendientesCobro),
      hint: "con deuda",
      icon: Receipt,
      iconClass: "bg-destructive/10 text-destructive",
    },
  ];

  return (
    <div className={cn("grid grid-cols-2 lg:grid-cols-4 gap-3", className)}>
      {cards.map((c) => (
        <div key={c.label} className="bg-card rounded-xl border border-border shadow-card p-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground truncate">{c.label}</p>
            <p className="text-2xl font-bold mt-1">{c.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{c.hint}</p>
          </div>
          <div className={cn("shrink-0 rounded-lg p-2.5", c.iconClass)}>
            <c.icon className="h-4 w-4" />
          </div>
        </div>
      ))}
    </div>
  );
}
