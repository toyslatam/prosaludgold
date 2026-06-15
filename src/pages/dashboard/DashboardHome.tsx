import { CalendarDays, Users, DollarSign, TrendingUp, Clock, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { usePatients, useAppointments, useCashEntries, useInventoryItems } from "@/hooks/useSupabase";

const STATUS_COLORS: Record<string, string> = {
  pendiente:   "bg-warning/10 text-warning border-warning/20",
  confirmada:  "bg-primary/10 text-primary border-primary/20",
  en_sala:     "bg-blue-500/10 text-blue-500 border-blue-500/20",
  atendida:    "bg-success/10 text-success border-success/20",
  no_asistio:  "bg-destructive/10 text-destructive border-destructive/20",
};
const STATUS_LABELS: Record<string, string> = {
  pendiente:  "Pendiente",
  confirmada: "Confirmada",
  en_sala:    "En sala",
  atendida:   "Atendida",
  no_asistio: "No asistió",
};

const today = format(new Date(), "yyyy-MM-dd");
const todayLabel = format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: undefined });

const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-muted rounded ${className}`} />
);

const DashboardHome = () => {
  const { data: patients = [], isLoading: loadingPatients } = usePatients();
  const { data: todayApts = [], isLoading: loadingApts } = useAppointments(today);
  const { data: cashEntries = [], isLoading: loadingCash } = useCashEntries();
  const { data: inventory = [], isLoading: loadingInventory } = useInventoryItems();

  const ingresos = cashEntries.filter((e) => e.type === "ingreso" && e.date === today).reduce((s, e) => s + e.amount, 0);
  const lowStock = inventory.filter((i) => i.stock <= i.min_stock);
  const recentCash = cashEntries.slice(0, 4);

  const stats = [
    {
      label: "Citas hoy",
      value: loadingApts ? "…" : String(todayApts.length),
      icon: CalendarDays,
      change: `${todayApts.filter((a) => a.status === "atendida").length} atendidas`,
    },
    {
      label: "Pacientes",
      value: loadingPatients ? "…" : String(patients.length),
      icon: Users,
      change: "Total registrados",
    },
    {
      label: "Ingresos hoy",
      value: loadingCash ? "…" : `$${ingresos.toFixed(2)}`,
      icon: DollarSign,
      change: `${cashEntries.filter((e) => e.type === "ingreso" && e.date === today).length} movimientos`,
    },
    {
      label: "Alerta inventario",
      value: loadingInventory ? "…" : String(lowStock.length),
      icon: TrendingUp,
      change: lowStock.length > 0 ? "Items bajo mínimo" : "Sin alertas",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Panel de Control</h1>
        <p className="text-muted-foreground">Hoy, {todayLabel}</p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-card rounded-xl p-5 border border-border shadow-card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">{s.label}</span>
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <s.icon className="w-4 h-4 text-primary" />
              </div>
            </div>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.change}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Citas de hoy */}
        <div className="bg-card rounded-xl border border-border shadow-card">
          <div className="p-5 border-b border-border flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <h2 className="font-semibold">Citas de hoy</h2>
          </div>
          <div className="divide-y divide-border">
            {loadingApts ? (
              <div className="p-4 space-y-3">
                {[1,2,3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : todayApts.length === 0 ? (
              <p className="p-5 text-sm text-muted-foreground text-center">No hay citas para hoy</p>
            ) : (
              todayApts.slice(0, 5).map((apt) => (
                <div key={apt.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{apt.patientName}</p>
                    <p className="text-xs text-muted-foreground">
                      {apt.time} · {apt.doctorName} · {apt.reason || "Sin motivo"}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full border ${STATUS_COLORS[apt.status] ?? ""}`}>
                    {STATUS_LABELS[apt.status] ?? apt.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Alertas y movimientos */}
        <div className="space-y-4">
          {/* Low stock */}
          {(loadingInventory || lowStock.length > 0) && (
            <div className="bg-card rounded-xl border border-border shadow-card">
              <div className="p-5 border-b border-border flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-warning" />
                <h2 className="font-semibold">Alertas de inventario</h2>
              </div>
              <div className="divide-y divide-border">
                {loadingInventory ? (
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                ) : lowStock.length === 0 ? (
                  <p className="p-5 text-sm text-muted-foreground text-center">Sin alertas de stock</p>
                ) : (
                  lowStock.map((item) => (
                    <div key={item.id} className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.category} · {item.supplier ? `Proveedor: ${item.supplier}` : "Sin proveedor"}
                        </p>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full border bg-destructive/10 text-destructive border-destructive/20">
                        Stock: {item.stock}/{item.min_stock}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Movimientos recientes */}
          <div className="bg-card rounded-xl border border-border shadow-card">
            <div className="p-5 border-b border-border flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-primary" />
              <h2 className="font-semibold">Movimientos recientes</h2>
            </div>
            <div className="divide-y divide-border">
              {loadingCash ? (
                <div className="p-4 space-y-2">
                  {[1,2,3].map((i) => <Skeleton key={i} className="h-8 w-full" />)}
                </div>
              ) : recentCash.length === 0 ? (
                <p className="p-5 text-sm text-muted-foreground text-center">Sin movimientos registrados</p>
              ) : (
                recentCash.map((entry) => (
                  <div key={entry.id} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{entry.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {entry.method ?? "—"}{entry.patients ? ` · ${entry.patients.name}` : ""}
                      </p>
                    </div>
                    <span className={`text-sm font-semibold ${entry.type === "ingreso" ? "text-success" : "text-destructive"}`}>
                      {entry.type === "ingreso" ? "+" : "-"}${entry.amount.toFixed(2)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
