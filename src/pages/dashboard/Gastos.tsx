import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Plus } from "lucide-react";

const expenses = [
  { id: "g1", date: "2026-02-12", category: "Materiales", description: "Compra material de impresión", amount: 85, method: "Efectivo" },
  { id: "g2", date: "2026-02-11", category: "Laboratorio", description: "Pago laboratorio dental", amount: 350, method: "Transferencia" },
  { id: "g3", date: "2026-02-10", category: "Servicios", description: "Servicio de limpieza", amount: 120, method: "Efectivo" },
  { id: "g4", date: "2026-02-08", category: "Equipos", description: "Mantenimiento compresor dental", amount: 250, method: "Transferencia" },
  { id: "g5", date: "2026-02-05", category: "Administrativo", description: "Insumos de oficina", amount: 45, method: "Tarjeta" },
];

const Gastos = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">Control de Gastos</h1>
        <p className="text-muted-foreground text-sm">Registro y clasificación de gastos</p>
      </div>
      <Button className="gap-2" onClick={() => toast.success("Funcionalidad demo")}><Plus className="w-4 h-4" /> Registrar gasto</Button>
    </div>

    <div className="bg-card rounded-xl border border-border shadow-card overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className="text-left p-3 font-medium">Fecha</th>
            <th className="text-left p-3 font-medium">Categoría</th>
            <th className="text-left p-3 font-medium">Descripción</th>
            <th className="text-left p-3 font-medium hidden md:table-cell">Medio de pago</th>
            <th className="text-right p-3 font-medium">Monto</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {expenses.map((e) => (
            <tr key={e.id} className="hover:bg-muted/20 transition-colors">
              <td className="p-3">{e.date}</td>
              <td className="p-3"><span className="text-xs px-2 py-1 rounded-full bg-muted">{e.category}</span></td>
              <td className="p-3">{e.description}</td>
              <td className="p-3 hidden md:table-cell text-muted-foreground">{e.method}</td>
              <td className="p-3 text-right font-semibold text-destructive">-${e.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default Gastos;
