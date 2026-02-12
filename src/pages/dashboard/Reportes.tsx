import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";

const occupancyData = [
  { day: "Lun", value: 85 }, { day: "Mar", value: 72 }, { day: "Mié", value: 78 },
  { day: "Jue", value: 90 }, { day: "Vie", value: 65 }, { day: "Sáb", value: 45 },
];

const revenueData = [
  { month: "Sep", value: 18500 }, { month: "Oct", value: 22000 }, { month: "Nov", value: 19800 },
  { month: "Dic", value: 25000 }, { month: "Ene", value: 21500 }, { month: "Feb", value: 23800 },
];

const specialtyData = [
  { name: "Ortodoncia", value: 35 }, { name: "Endodoncia", value: 20 },
  { name: "Implantología", value: 25 }, { name: "Periodoncia", value: 12 }, { name: "General", value: 8 },
];

const COLORS = ["hsl(172, 66%, 32%)", "hsl(210, 80%, 52%)", "hsl(38, 92%, 50%)", "hsl(152, 60%, 40%)", "hsl(0, 72%, 51%)"];

const kpis = [
  { label: "Ocupación agenda", value: "78%", target: "85%" },
  { label: "Tasa de no show", value: "8%", target: "<10%" },
  { label: "Ticket promedio", value: "$185", target: "$200" },
  { label: "Pacientes nuevos/mes", value: "24", target: "30" },
  { label: "Cartera pendiente", value: "$4,200", target: "" },
  { label: "Rotación inventario", value: "4.2x", target: ">3x" },
];

const Reportes = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reportes y Métricas</h1>
          <p className="text-muted-foreground text-sm">Indicadores clave de desempeño</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={() => toast.success("Exportación iniciada (demo)")}>
          <Download className="w-4 h-4" /> Exportar a Excel
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-card rounded-xl p-5 border border-border shadow-card">
            <p className="text-sm text-muted-foreground">{kpi.label}</p>
            <p className="text-2xl font-bold mt-1">{kpi.value}</p>
            {kpi.target && <p className="text-xs text-muted-foreground mt-1">Meta: {kpi.target}</p>}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Ocupación */}
        <div className="bg-card rounded-xl border border-border shadow-card p-5">
          <h3 className="font-semibold mb-4">Ocupación de agenda (esta semana)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={occupancyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(200, 15%, 90%)" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" fill="hsl(172, 66%, 32%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue */}
        <div className="bg-card rounded-xl border border-border shadow-card p-5">
          <h3 className="font-semibold mb-4">Ingresos mensuales</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(200, 15%, 90%)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="hsl(172, 66%, 32%)" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Specialty distribution */}
        <div className="bg-card rounded-xl border border-border shadow-card p-5">
          <h3 className="font-semibold mb-4">Distribución por especialidad</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={specialtyData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value" label={({ name, value }) => `${name}: ${value}%`}>
                {specialtyData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Productivity */}
        <div className="bg-card rounded-xl border border-border shadow-card p-5">
          <h3 className="font-semibold mb-4">Productividad por doctor</h3>
          <div className="space-y-4">
            {[
              { name: "Dra. María González", patients: 42, revenue: 8500 },
              { name: "Dr. Carlos Mendoza", patients: 35, revenue: 7200 },
              { name: "Dr. Roberto Díaz", patients: 28, revenue: 12000 },
              { name: "Dra. Laura Herrera", patients: 31, revenue: 5800 },
            ].map((doc) => (
              <div key={doc.name} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{doc.name}</p>
                  <p className="text-xs text-muted-foreground">{doc.patients} pacientes</p>
                </div>
                <span className="font-semibold text-sm">${doc.revenue.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reportes;
