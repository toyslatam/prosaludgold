import { mockLabOrders, statusColors, statusLabels } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";

const Laboratorios = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">Laboratorios</h1>
        <p className="text-muted-foreground text-sm">Solicitudes, estados y pagos</p>
      </div>
      <Button className="gap-2" onClick={() => toast.success("Funcionalidad demo")}><Plus className="w-4 h-4" /> Nueva solicitud</Button>
    </div>

    <div className="bg-card rounded-xl border border-border shadow-card overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className="text-left p-3 font-medium">Paciente</th>
            <th className="text-left p-3 font-medium">Trabajo</th>
            <th className="text-left p-3 font-medium hidden md:table-cell">Laboratorio</th>
            <th className="text-left p-3 font-medium hidden md:table-cell">Doctor</th>
            <th className="text-left p-3 font-medium">Costo</th>
            <th className="text-left p-3 font-medium">Estado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {mockLabOrders.map((order) => (
            <tr key={order.id} className="hover:bg-muted/20 transition-colors">
              <td className="p-3 font-medium">{order.patient}</td>
              <td className="p-3">{order.work}</td>
              <td className="p-3 hidden md:table-cell text-muted-foreground">{order.lab}</td>
              <td className="p-3 hidden md:table-cell text-muted-foreground">{order.doctor}</td>
              <td className="p-3">${order.cost}</td>
              <td className="p-3">
                <span className={`text-xs px-2 py-1 rounded-full border ${statusColors[order.status]}`}>
                  {statusLabels[order.status]}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default Laboratorios;
