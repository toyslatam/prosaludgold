import { mockInventory, mockLabOrders, statusColors, statusLabels } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Plus, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const Inventario = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">Inventario</h1>
        <p className="text-muted-foreground text-sm">Stock, entradas/salidas y alertas</p>
      </div>
      <Button className="gap-2" onClick={() => toast.success("Funcionalidad demo")}><Plus className="w-4 h-4" /> Registrar entrada</Button>
    </div>

    <div className="bg-card rounded-xl border border-border shadow-card overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className="text-left p-3 font-medium">Producto</th>
            <th className="text-left p-3 font-medium">Categoría</th>
            <th className="text-left p-3 font-medium">Stock</th>
            <th className="text-left p-3 font-medium hidden md:table-cell">Mínimo</th>
            <th className="text-left p-3 font-medium hidden md:table-cell">Proveedor</th>
            <th className="text-left p-3 font-medium">Estado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {mockInventory.map((item) => (
            <tr key={item.id} className="hover:bg-muted/20 transition-colors">
              <td className="p-3 font-medium">{item.name}</td>
              <td className="p-3 text-muted-foreground">{item.category}</td>
              <td className="p-3">{item.stock} {item.unit}</td>
              <td className="p-3 hidden md:table-cell text-muted-foreground">{item.minStock}</td>
              <td className="p-3 hidden md:table-cell text-muted-foreground">{item.supplier}</td>
              <td className="p-3">
                {item.stock <= item.minStock ? (
                  <span className="flex items-center gap-1 text-xs text-destructive"><AlertTriangle className="w-3 h-3" /> Bajo stock</span>
                ) : (
                  <span className="text-xs text-success">OK</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default Inventario;
