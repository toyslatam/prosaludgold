import { CalendarDays, Users, DollarSign, TrendingUp, Clock, AlertTriangle } from "lucide-react";
import { mockAppointments, mockPatients, mockCashEntries, mockInventory, statusColors, statusLabels } from "@/data/mockData";

const stats = [
  { label: "Citas hoy", value: "7", icon: CalendarDays, change: "+2 vs ayer" },
  { label: "Pacientes activos", value: "5", icon: Users, change: "+1 esta semana" },
  { label: "Ingresos hoy", value: "$850", icon: DollarSign, change: "+15%" },
  { label: "Ocupación agenda", value: "78%", icon: TrendingUp, change: "Meta: 85%" },
];

const DashboardHome = () => {
  const lowStock = mockInventory.filter((i) => i.stock <= i.minStock);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Panel de Control</h1>
        <p className="text-muted-foreground">Bienvenido, Admin Demo · Hoy, 12 de febrero de 2026</p>
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
        {/* Próximas citas */}
        <div className="bg-card rounded-xl border border-border shadow-card">
          <div className="p-5 border-b border-border flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <h2 className="font-semibold">Próximas citas de hoy</h2>
          </div>
          <div className="divide-y divide-border">
            {mockAppointments.slice(0, 5).map((apt) => (
              <div key={apt.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{apt.patientName}</p>
                  <p className="text-xs text-muted-foreground">{apt.time} · {apt.doctorName} · {apt.reason}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full border ${statusColors[apt.status]}`}>
                  {statusLabels[apt.status]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Alertas */}
        <div className="space-y-4">
          {/* Low stock */}
          {lowStock.length > 0 && (
            <div className="bg-card rounded-xl border border-border shadow-card">
              <div className="p-5 border-b border-border flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-warning" />
                <h2 className="font-semibold">Alertas de inventario</h2>
              </div>
              <div className="divide-y divide-border">
                {lowStock.map((item) => (
                  <div key={item.id} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.category} · Proveedor: {item.supplier}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full border bg-destructive/10 text-destructive border-destructive/20">
                      Stock: {item.stock}/{item.minStock}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent cash */}
          <div className="bg-card rounded-xl border border-border shadow-card">
            <div className="p-5 border-b border-border flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-primary" />
              <h2 className="font-semibold">Movimientos recientes</h2>
            </div>
            <div className="divide-y divide-border">
              {mockCashEntries.slice(0, 4).map((entry) => (
                <div key={entry.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{entry.description}</p>
                    <p className="text-xs text-muted-foreground">{entry.method}{entry.patient ? ` · ${entry.patient}` : ""}</p>
                  </div>
                  <span className={`text-sm font-semibold ${entry.type === "ingreso" ? "text-success" : "text-destructive"}`}>
                    {entry.type === "ingreso" ? "+" : "-"}${entry.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
