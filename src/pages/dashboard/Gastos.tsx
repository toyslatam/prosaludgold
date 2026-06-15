import { useState, useMemo } from "react";
import { format } from "date-fns";
import { useCashEntries, useInsertGasto } from "@/hooks/useSupabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Loader2, Receipt, TrendingDown } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = ["Materiales", "Laboratorio", "Servicios", "Equipos", "Administrativo", "Nómina", "Otro"] as const;
type Category = typeof CATEGORIES[number];

const CATEGORY_COLORS: Record<string, string> = {
  Materiales:    "bg-blue-500/10 text-blue-600 border-blue-500/20",
  Laboratorio:   "bg-purple-500/10 text-purple-600 border-purple-500/20",
  Servicios:     "bg-orange-500/10 text-orange-600 border-orange-500/20",
  Equipos:       "bg-teal-500/10 text-teal-600 border-teal-500/20",
  Administrativo:"bg-gray-500/10 text-gray-600 border-gray-500/20",
  Nómina:        "bg-success/10 text-success border-success/20",
  Otro:          "bg-muted text-muted-foreground border-border",
};

type GastoForm = {
  description: string;
  amount: string;
  category: Category;
  method: string;
  date: string;
};

const today = format(new Date(), "yyyy-MM-dd");
const EMPTY: GastoForm = { description: "", amount: "", category: "Materiales", method: "efectivo", date: today };

const Gastos = () => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<GastoForm>(EMPTY);
  const [filterMonth, setFilterMonth] = useState(format(new Date(), "yyyy-MM"));
  const [filterCategory, setFilterCategory] = useState<Category | "Todas">("Todas");

  const { data: allEntries = [], isLoading } = useCashEntries();
  const insertGasto = useInsertGasto();

  const egresos = useMemo(
    () => allEntries.filter((e) => e.type === "egreso"),
    [allEntries],
  );

  const filtered = useMemo(() => {
    return egresos.filter((e) => {
      const matchMonth = !filterMonth || e.date.startsWith(filterMonth);
      const matchCat = filterCategory === "Todas" || e.category === filterCategory;
      return matchMonth && matchCat;
    });
  }, [egresos, filterMonth, filterCategory]);

  const totalFiltered = filtered.reduce((s, e) => s + e.amount, 0);

  const byCategory = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach((e) => {
      const cat = e.category ?? "Otro";
      map[cat] = (map[cat] ?? 0) + e.amount;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [filtered]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(form.amount);
    if (!form.description.trim() || isNaN(amount) || amount <= 0) {
      return toast.error("Completa todos los campos correctamente");
    }
    insertGasto.mutate(
      {
        description: form.description.trim(),
        amount,
        method: form.method || null,
        category: form.category,
        date: form.date,
      },
      {
        onSuccess: () => { toast.success("Gasto registrado"); setOpen(false); setForm(EMPTY); },
        onError: (err) => toast.error(err.message),
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Control de Gastos</h1>
          <p className="text-muted-foreground text-sm">Registro y clasificación de gastos operacionales</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={() => setForm(EMPTY)}><Plus className="w-4 h-4" /> Registrar gasto</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nuevo gasto</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Categoría *</Label>
                <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v as Category }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Descripción *</Label>
                <Input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Descripción del gasto" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Monto *</Label>
                  <Input type="number" min="0.01" step="0.01" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} placeholder="0.00" required />
                </div>
                <div className="space-y-1.5">
                  <Label>Fecha</Label>
                  <Input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
                </div>
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
              <Button type="submit" className="w-full" disabled={insertGasto.isPending}>
                {insertGasto.isPending ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Registrando…</> : "Registrar gasto"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Mes</Label>
          <Input type="month" className="w-40" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Categoría</Label>
          <Select value={filterCategory} onValueChange={(v) => setFilterCategory(v as typeof filterCategory)}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Todas">Todas</SelectItem>
              {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl p-5 border border-border shadow-card sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="w-4 h-4 text-destructive" />
            <p className="text-sm text-muted-foreground">Total gastos</p>
          </div>
          <p className="text-2xl font-bold text-destructive">${totalFiltered.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground mt-1">{filtered.length} movimientos</p>
        </div>
        {byCategory.slice(0, 3).map(([cat, total]) => (
          <div key={cat} className="bg-card rounded-xl p-5 border border-border shadow-card">
            <p className="text-sm text-muted-foreground">{cat}</p>
            <p className="text-xl font-bold">${total.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {((total / totalFiltered) * 100).toFixed(0)}% del total
            </p>
          </div>
        ))}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
          <Loader2 className="w-5 h-5 animate-spin" /> Cargando gastos…
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Receipt className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No hay gastos registrados para este período.</p>
        </div>
      ) : (
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
              {filtered.map((e) => (
                <tr key={e.id} className="hover:bg-muted/20 transition-colors">
                  <td className="p-3 text-muted-foreground">{e.date}</td>
                  <td className="p-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[e.category ?? "Otro"] ?? CATEGORY_COLORS["Otro"]}`}>
                      {e.category ?? "Otro"}
                    </span>
                  </td>
                  <td className="p-3">{e.description}</td>
                  <td className="p-3 hidden md:table-cell text-muted-foreground capitalize">{e.method ?? "—"}</td>
                  <td className="p-3 text-right font-semibold text-destructive">-${e.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Gastos;
