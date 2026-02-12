import { mockCashEntries } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { DollarSign, Plus, Printer } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const Caja = () => {
  const ingresos = mockCashEntries.filter(e => e.type === "ingreso").reduce((s, e) => s + e.amount, 0);
  const egresos = mockCashEntries.filter(e => e.type === "egreso").reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Caja y Pagos</h1>
          <p className="text-muted-foreground text-sm">Control de ingresos, egresos y cierres de caja</p>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="w-4 h-4" /> Registrar movimiento</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Nuevo movimiento</DialogTitle></DialogHeader>
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); toast.success("Movimiento registrado (demo)"); }}>
                <Select><SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger><SelectContent><SelectItem value="ingreso">Ingreso</SelectItem><SelectItem value="egreso">Egreso</SelectItem></SelectContent></Select>
                <Input placeholder="Descripción" />
                <Input placeholder="Monto" type="number" />
                <Select><SelectTrigger><SelectValue placeholder="Medio de pago" /></SelectTrigger><SelectContent><SelectItem value="efectivo">Efectivo</SelectItem><SelectItem value="tarjeta">Tarjeta</SelectItem><SelectItem value="transferencia">Transferencia</SelectItem></SelectContent></Select>
                <Input placeholder="Paciente (opcional)" />
                <Button type="submit" className="w-full">Registrar</Button>
              </form>
            </DialogContent>
          </Dialog>
          <Button variant="outline" className="gap-2" onClick={() => toast.success("Cierre de caja generado (demo)")}><Printer className="w-4 h-4" /> Cierre de caja</Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl p-5 border border-border shadow-card">
          <p className="text-sm text-muted-foreground">Ingresos del día</p>
          <p className="text-2xl font-bold text-success">${ingresos}</p>
        </div>
        <div className="bg-card rounded-xl p-5 border border-border shadow-card">
          <p className="text-sm text-muted-foreground">Egresos del día</p>
          <p className="text-2xl font-bold text-destructive">${egresos}</p>
        </div>
        <div className="bg-card rounded-xl p-5 border border-border shadow-card">
          <p className="text-sm text-muted-foreground">Balance</p>
          <p className="text-2xl font-bold">${ingresos - egresos}</p>
        </div>
      </div>

      {/* Transactions table */}
      <div className="bg-card rounded-xl border border-border shadow-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left p-3 font-medium">Fecha</th>
              <th className="text-left p-3 font-medium">Descripción</th>
              <th className="text-left p-3 font-medium hidden md:table-cell">Paciente</th>
              <th className="text-left p-3 font-medium hidden md:table-cell">Medio de pago</th>
              <th className="text-right p-3 font-medium">Monto</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {mockCashEntries.map((entry) => (
              <tr key={entry.id} className="hover:bg-muted/20 transition-colors">
                <td className="p-3">{entry.date}</td>
                <td className="p-3">{entry.description}</td>
                <td className="p-3 hidden md:table-cell text-muted-foreground">{entry.patient || "—"}</td>
                <td className="p-3 hidden md:table-cell text-muted-foreground">{entry.method}</td>
                <td className={`p-3 text-right font-semibold ${entry.type === "ingreso" ? "text-success" : "text-destructive"}`}>
                  {entry.type === "ingreso" ? "+" : "-"}${entry.amount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Caja;
