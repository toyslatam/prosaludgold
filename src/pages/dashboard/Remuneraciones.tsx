import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Calculator } from "lucide-react";

const remunerationData = [
  { doctor: "Dra. María González", specialty: "Ortodoncia", contract: "40% por prestación", patients: 42, total: 3400, status: "Pendiente" },
  { doctor: "Dr. Carlos Mendoza", specialty: "Endodoncia", contract: "50% por acción pagada", patients: 35, total: 3600, status: "Liquidado" },
  { doctor: "Dr. Roberto Díaz", specialty: "Implantología", contract: "45% por prestación", patients: 28, total: 5400, status: "Pendiente" },
  { doctor: "Dra. Laura Herrera", specialty: "Periodoncia", contract: "40% por acción pagada", patients: 31, total: 2320, status: "Liquidado" },
];

const Remuneraciones = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">Remuneraciones</h1>
        <p className="text-muted-foreground text-sm">Contratos, configuración y liquidaciones</p>
      </div>
      <Button variant="outline" className="gap-2" onClick={() => toast.success("Liquidación generada (demo)")}><Calculator className="w-4 h-4" /> Generar liquidación</Button>
    </div>

    <div className="bg-card rounded-xl border border-border shadow-card overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className="text-left p-3 font-medium">Doctor</th>
            <th className="text-left p-3 font-medium hidden md:table-cell">Especialidad</th>
            <th className="text-left p-3 font-medium hidden lg:table-cell">Contrato</th>
            <th className="text-left p-3 font-medium">Pacientes</th>
            <th className="text-right p-3 font-medium">Total</th>
            <th className="text-left p-3 font-medium">Estado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {remunerationData.map((r) => (
            <tr key={r.doctor} className="hover:bg-muted/20 transition-colors">
              <td className="p-3 font-medium">{r.doctor}</td>
              <td className="p-3 hidden md:table-cell text-muted-foreground">{r.specialty}</td>
              <td className="p-3 hidden lg:table-cell text-muted-foreground">{r.contract}</td>
              <td className="p-3">{r.patients}</td>
              <td className="p-3 text-right font-semibold">${r.total.toLocaleString()}</td>
              <td className="p-3">
                <span className={`text-xs px-2 py-1 rounded-full border ${r.status === "Liquidado" ? "bg-success/10 text-success border-success/20" : "bg-warning/10 text-warning border-warning/20"}`}>
                  {r.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default Remuneraciones;
