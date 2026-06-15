import { useMemo } from "react";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { es } from "date-fns/locale";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { usePatients, useAppointments, useCashEntries, useInventoryItems, useDoctors } from "@/hooks/useSupabase";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

const COLORS = ["hsl(172,66%,32%)", "hsl(210,80%,52%)", "hsl(38,92%,50%)", "hsl(152,60%,40%)", "hsl(0,72%,51%)"];

const currentMonth = format(new Date(), "yyyy-MM");

function kpiCard(label: string, value: string | number, sub?: string, color?: string) {
  return (
    <div className="bg-card rounded-xl p-5 border border-border shadow-card">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${color ?? ""}`}>{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

const Reportes = () => {
  const { data: patients = [], isLoading: loadingP } = usePatients();
  const { data: appointments = [], isLoading: loadingA } = useAppointments();
  const { data: cashEntries = [], isLoading: loadingC } = useCashEntries();
  const { data: inventory = [], isLoading: loadingI } = useInventoryItems();
  const { data: doctors = [] } = useDoctors();

  const loading = loadingP || loadingA || loadingC || loadingI;

  const thisMonth = format(new Date(), "yyyy-MM");

  // ── Computed KPIs ──────────────────────────────────────────
  const newPatientsThisMonth = useMemo(
    () => patients.filter((p) => p.created_at.startsWith(thisMonth)).length,
    [patients, thisMonth],
  );

  const aptsThisMonth = useMemo(
    () => appointments.filter((a) => a.date.startsWith(thisMonth)),
    [appointments, thisMonth],
  );

  const noShowRate = useMemo(() => {
    const total = aptsThisMonth.length;
    if (!total) return 0;
    const noShow = aptsThisMonth.filter((a) => a.status === "no_asistio").length;
    return Math.round((noShow / total) * 100);
  }, [aptsThisMonth]);

  const incomeThisMonth = useMemo(
    () => cashEntries.filter((e) => e.type === "ingreso" && e.date.startsWith(thisMonth)).reduce((s, e) => s + e.amount, 0),
    [cashEntries, thisMonth],
  );

  const expensesThisMonth = useMemo(
    () => cashEntries.filter((e) => e.type === "egreso" && e.date.startsWith(thisMonth)).reduce((s, e) => s + e.amount, 0),
    [cashEntries, thisMonth],
  );

  const lowStockCount = useMemo(
    () => inventory.filter((i) => i.stock <= i.min_stock).length,
    [inventory],
  );

  // ── Monthly revenue chart (last 6 months) ──────────────────
  const monthlyRevenue = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const dt = subMonths(new Date(), 5 - i);
      const key = format(dt, "yyyy-MM");
      const label = format(dt, "MMM", { locale: es });
      const ingreso = cashEntries.filter((e) => e.type === "ingreso" && e.date.startsWith(key)).reduce((s, e) => s + e.amount, 0);
      const egreso = cashEntries.filter((e) => e.type === "egreso" && e.date.startsWith(key)).reduce((s, e) => s + e.amount, 0);
      return { mes: label, Ingresos: ingreso, Gastos: egreso };
    });
  }, [cashEntries]);

  // ── Appointment status distribution ────────────────────────
  const aptStatusData = useMemo(() => {
    const STATUS_LABELS: Record<string, string> = {
      atendida: "Atendida", pendiente: "Pendiente", confirmada: "Confirmada",
      en_sala: "En sala", no_asistio: "No asistió",
    };
    const map: Record<string, number> = {};
    aptsThisMonth.forEach((a) => { map[a.status] = (map[a.status] ?? 0) + 1; });
    return Object.entries(map).map(([k, v]) => ({ name: STATUS_LABELS[k] ?? k, value: v }));
  }, [aptsThisMonth]);

  // ── Doctor productivity ────────────────────────────────────
  const doctorProductivity = useMemo(() => {
    const map: Record<string, { name: string; sessions: number; income: number }> = {};
    appointments.filter((a) => a.date.startsWith(thisMonth) && a.status === "atendida").forEach((a) => {
      if (!map[a.doctorId]) map[a.doctorId] = { name: a.doctorName, sessions: 0, income: 0 };
      map[a.doctorId].sessions += 1;
    });
    return Object.values(map).sort((a, b) => b.sessions - a.sessions).slice(0, 5);
  }, [appointments, thisMonth]);

  // ── Day-of-week occupancy ──────────────────────────────────
  const dayOccupancy = useMemo(() => {
    const DAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    const map: Record<number, number> = {};
    appointments.filter((a) => a.date.startsWith(thisMonth)).forEach((a) => {
      const d = new Date(a.date + "T12:00:00").getDay();
      map[d] = (map[d] ?? 0) + 1;
    });
    return DAYS.map((day, i) => ({ day, citas: map[i] ?? 0 })).filter((_, i) => i > 0 && i < 6);
  }, [appointments, thisMonth]);

  const monthLabel = format(new Date(), "MMMM yyyy", { locale: es });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground gap-2">
        <Loader2 className="w-6 h-6 animate-spin" /> Cargando reportes…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reportes y Métricas</h1>
          <p className="text-muted-foreground text-sm capitalize">{monthLabel} · datos en tiempo real</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={() => toast.success("Exportación próximamente")}>
          <Download className="w-4 h-4" /> Exportar
        </Button>
      </div>

      {/* KPI Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpiCard("Total pacientes", patients.length, `+${newPatientsThisMonth} nuevos este mes`)}
        {kpiCard("Citas este mes", aptsThisMonth.length, `${aptsThisMonth.filter((a) => a.status === "atendida").length} atendidas`)}
        {kpiCard("Tasa no-show", `${noShowRate}%`, noShowRate < 10 ? "En rango aceptable" : "Requiere atención", noShowRate >= 10 ? "text-destructive" : "text-success")}
        {kpiCard("Ingresos mes", `$${incomeThisMonth.toFixed(0)}`, "Solo ingresos en caja", "text-success")}
        {kpiCard("Gastos mes", `$${expensesThisMonth.toFixed(0)}`, `Balance: $${(incomeThisMonth - expensesThisMonth).toFixed(0)}`)}
        {kpiCard("Alertas stock", lowStockCount, lowStockCount > 0 ? "Ítems bajo mínimo" : "Stock en orden", lowStockCount > 0 ? "text-warning" : "text-success")}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Monthly revenue */}
        <div className="bg-card rounded-xl border border-border shadow-card p-5">
          <h3 className="font-semibold mb-4">Ingresos vs Gastos (últimos 6 meses)</h3>
          {monthlyRevenue.every((m) => m.Ingresos === 0 && m.Gastos === 0) ? (
            <p className="text-sm text-muted-foreground py-10 text-center">Sin datos en caja aún.</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(200,15%,90%)" />
                <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: number) => `$${v.toFixed(0)}`} />
                <Bar dataKey="Ingresos" fill="hsl(172,66%,32%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Gastos" fill="hsl(0,72%,51%)" radius={[4, 4, 0, 0]} opacity={0.7} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Day occupancy */}
        <div className="bg-card rounded-xl border border-border shadow-card p-5">
          <h3 className="font-semibold mb-4">Citas por día (este mes)</h3>
          {dayOccupancy.every((d) => d.citas === 0) ? (
            <p className="text-sm text-muted-foreground py-10 text-center">Sin citas registradas este mes.</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dayOccupancy}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(200,15%,90%)" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="citas" fill="hsl(210,80%,52%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Status distribution */}
        <div className="bg-card rounded-xl border border-border shadow-card p-5">
          <h3 className="font-semibold mb-4">Estado de citas (este mes)</h3>
          {aptStatusData.length === 0 ? (
            <p className="text-sm text-muted-foreground py-10 text-center">Sin citas registradas este mes.</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={aptStatusData} cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={3} dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                  {aptStatusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Doctor productivity */}
        <div className="bg-card rounded-xl border border-border shadow-card p-5">
          <h3 className="font-semibold mb-4">Productividad — citas atendidas este mes</h3>
          {doctorProductivity.length === 0 ? (
            <p className="text-sm text-muted-foreground py-10 text-center">Sin atenciones registradas este mes.</p>
          ) : (
            <div className="space-y-4">
              {doctorProductivity.map((doc, i) => (
                <div key={doc.name}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium">{doc.name}</p>
                    <span className="text-sm font-semibold">{doc.sessions} sesiones</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(doc.sessions / (doctorProductivity[0]?.sessions || 1)) * 100}%`,
                        background: COLORS[i % COLORS.length],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reportes;
