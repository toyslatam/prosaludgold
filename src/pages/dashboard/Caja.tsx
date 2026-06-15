import { useState } from "react";
import { format } from "date-fns";
import { useCashEntries, useInsertCashEntry } from "@/hooks/useSupabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Printer, Loader2 } from "lucide-react";
import { toast } from "sonner";

type EntryForm = {
  type: "ingreso" | "egreso";
  description: string;
  amount: string;
  method: string;
};

const EMPTY_FORM: EntryForm = { type: "ingreso", description: "", amount: "", method: "efectivo" };
const today = format(new Date(), "yyyy-MM-dd");

const Caja = () => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<EntryForm>(EMPTY_FORM);
  const [filterDate, setFilterDate] = useState(today);

  const { data: entries = [], isLoading } = useCashEntries();
  const insert = useInsertCashEntry();

  const shown = entries.filter((e) => !filterDate || e.date === filterDate);
  const ingresos = shown.filter((e) => e.type === "ingreso").reduce((s, e) => s + e.amount, 0);
  const egresos  = shown.filter((e) => e.type === "egreso").reduce((s, e) => s + e.amount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(form.amount);
    if (!form.description.trim() || isNaN(amount) || amount <= 0) {
      toast.error("Completa todos los campos correctamente");
      return;
    }
    insert.mutate(
      {
        type: form.type,
        description: form.description.trim(),
        amount,
        method: form.method || null,
        date: today,
      },
      {
        onSuccess: () => { toast.success("Movimiento registrado"); setOpen(false); setForm(EMPTY_FORM); },
        onError: (err) => toast.error(err.message),
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Caja y Pagos</h1>
          <p className="text-muted-foreground text-sm">Control de ingresos, egresos y cierres de caja</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="w-4 h-4" /> Registrar movimiento</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Nuevo movimiento</DialogTitle></DialogHeader>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-1.5">
                  <Label>Tipo *</Label>
                  <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v as "ingreso" | "egreso" }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ingreso">Ingreso</SelectItem>
                      <SelectItem value="egreso">Egreso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Descripción *</Label>
                  <Input
                    placeholder="Descripción del movimiento"
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Monto *</Label>
                  <Input
                    placeholder="0.00"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.amount}
                    onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Medio de pago</Label>
                  <Select value={form.method} onValueChange={(v) => setForm((f) => ({ ...f, method: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="efectivo">Efectivo</SelectItem>
                      <SelectItem value="tarjeta">Tarjeta</SelectItem>
                      <SelectItem value="transferencia">Transferencia</SelectItem>
                      <SelectItem value="otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full" disabled={insert.isPending}>
                  {insert.isPending ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Registrando…</> : "Registrar"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
          <Button variant="outline" className="gap-2" onClick={() => toast.success("Función de cierre próximamente")}>
            <Printer className="w-4 h-4" /> Cierre de caja
          </Button>
        </div>
      </div>

      {/* Date filter */}
      <div className="flex items-center gap-3">
        <Label className="text-sm text-muted-foreground shrink-0">Filtrar por fecha:</Label>
        <Input
          type="date"
          className="w-44"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
        />
        {filterDate !== today && (
          <Button variant="ghost" size="sm" onClick={() => setFilterDate(today)}>Hoy</Button>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl p-5 border border-border shadow-card">
          <p className="text-sm text-muted-foreground">Ingresos</p>
          <p className="text-2xl font-bold text-success">${ingresos.toFixed(2)}</p>
        </div>
        <div className="bg-card rounded-xl p-5 border border-border shadow-card">
          <p className="text-sm text-muted-foreground">Egresos</p>
          <p className="text-2xl font-bold text-destructive">${egresos.toFixed(2)}</p>
        </div>
        <div className="bg-card rounded-xl p-5 border border-border shadow-card">
          <p className="text-sm text-muted-foreground">Balance</p>
          <p className={`text-2xl font-bold ${ingresos - egresos >= 0 ? "text-success" : "text-destructive"}`}>
            ${(ingresos - egresos).toFixed(2)}
          </p>
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
            {isLoading ? (
              <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin inline mr-2" />Cargando movimientos…
              </td></tr>
            ) : shown.length === 0 ? (
              <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">
                No hay movimientos para esta fecha
              </td></tr>
            ) : (
              shown.map((entry) => (
                <tr key={entry.id} className="hover:bg-muted/20 transition-colors">
                  <td className="p-3">{entry.date}</td>
                  <td className="p-3">{entry.description}</td>
                  <td className="p-3 hidden md:table-cell text-muted-foreground">
                    {entry.patients?.name ?? "—"}
                  </td>
                  <td className="p-3 hidden md:table-cell text-muted-foreground">{entry.method ?? "—"}</td>
                  <td className={`p-3 text-right font-semibold ${entry.type === "ingreso" ? "text-success" : "text-destructive"}`}>
                    {entry.type === "ingreso" ? "+" : "-"}${entry.amount.toFixed(2)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Caja;
