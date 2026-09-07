import { useMemo, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  useDoctors,
  usePayrollEntries,
  useInsertPayrollEntry,
  useUpdatePayrollEntry,
  useDeletePayrollEntry,
} from "@/hooks/useSupabase";
import { buildPayrollSplit } from "@/lib/payroll";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calculator, Plus, Loader2, CheckCircle2, Clock, Trash2 } from "lucide-react";
import { toast } from "sonner";

type LiqForm = {
  doctor_id: string;
  period: string;
  percentage: string;
  sessions: string;
  gross_amount: string;
  notes: string;
};

const DEFAULT_COMMISSION = "60";
const currentPeriod = format(new Date(), "yyyy-MM");
const EMPTY: LiqForm = {
  doctor_id: "", period: currentPeriod, percentage: DEFAULT_COMMISSION,
  sessions: "0", gross_amount: "0", notes: "",
};

const Remuneraciones = () => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<LiqForm>(EMPTY);
  const [period, setPeriod] = useState(currentPeriod);

  const { data: doctors = [] } = useDoctors();
  const { data: entries = [], isLoading } = usePayrollEntries(period);
  const insert = useInsertPayrollEntry();
  const update = useUpdatePayrollEntry();
  const remove = useDeletePayrollEntry();

  const periodLabel = useMemo(() => {
    const [y, m] = period.split("-");
    return format(new Date(parseInt(y), parseInt(m) - 1, 1), "MMMM yyyy", { locale: es });
  }, [period]);

  const doctorEntries = entries.filter((e) => e.party === "doctor");
  const clinicEntries = entries.filter((e) => e.party === "clinic");
  const totalPendiente = doctorEntries.filter((e) => e.status === "pendiente").reduce((s, e) => s + e.total_amount, 0);
  const totalLiquidado = doctorEntries.filter((e) => e.status === "liquidado").reduce((s, e) => s + e.total_amount, 0);
  const totalClinica = clinicEntries.reduce((s, e) => s + e.total_amount, 0);

  const selectedDoctor = doctors.find((d) => d.id === form.doctor_id);

  const handleSelectDoctor = (id: string) => {
    const doctor = doctors.find((d) => d.id === id);
    setForm((f) => ({
      ...f,
      doctor_id: id,
      percentage: doctor ? String(doctor.commission_percentage ?? DEFAULT_COMMISSION) : f.percentage,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.doctor_id) return toast.error("Selecciona un profesional");
    const percentage = parseFloat(form.percentage) || 0;
    const gross = parseFloat(form.gross_amount) || 0;
    const sessions = parseInt(form.sessions) || 0;

    const [doctorEntry, clinicEntry] = buildPayrollSplit({
      doctor_id: form.doctor_id,
      period: form.period,
      sessions,
      gross_amount: gross,
      doctorPercentage: percentage,
      notes: form.notes.trim() || null,
    });

    insert.mutate(doctorEntry, {
      onSuccess: () => {
        insert.mutate(clinicEntry, {
          onSuccess: () => { toast.success("Liquidación registrada (profesional + clínica)"); setOpen(false); setForm(EMPTY); },
          onError: (err) => toast.error(`Se registró la parte del profesional, pero no la de la clínica: ${err.message}`),
        });
      },
      onError: (err) => toast.error(err.message),
    });
  };

  const toggleStatus = (id: string, current: "pendiente" | "liquidado") => {
    const next = current === "pendiente" ? "liquidado" : "pendiente";
    update.mutate(
      { id, patch: { status: next } },
      {
        onSuccess: () => toast.success(next === "liquidado" ? "Marcada como liquidada" : "Revertida a pendiente"),
        onError: (err) => toast.error(err.message),
      }
    );
  };

  const handleDelete = (id: string) => {
    remove.mutate(id, {
      onSuccess: () => toast.success("Liquidación eliminada"),
      onError: (err) => toast.error(err.message),
    });
  };

  const totalAmount = parseFloat(((parseFloat(form.gross_amount || "0") * parseFloat(form.percentage || "0")) / 100).toFixed(2));
  const clinicShareAmount = parseFloat((parseFloat(form.gross_amount || "0") - totalAmount).toFixed(2));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Remuneraciones</h1>
          <p className="text-muted-foreground text-sm capitalize">{periodLabel}</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={() => setForm({ ...EMPTY, period })}>
              <Plus className="w-4 h-4" /> Nueva liquidación
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Registrar liquidación</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Profesional *</Label>
                <Select value={form.doctor_id} onValueChange={handleSelectDoctor}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar profesional" /></SelectTrigger>
                  <SelectContent>
                    {doctors.map((d) => (
                      <SelectItem key={d.id} value={d.id}>{d.name} · {d.specialty}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Período</Label>
                <Input type="month" className="w-full" value={form.period} onChange={(e) => setForm((f) => ({ ...f, period: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Sesiones atendidas</Label>
                  <Input type="number" min="0" value={form.sessions} onChange={(e) => setForm((f) => ({ ...f, sessions: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Monto bruto ($)</Label>
                  <Input type="number" min="0" step="0.01" value={form.gross_amount} onChange={(e) => setForm((f) => ({ ...f, gross_amount: e.target.value }))} placeholder="0.00" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Porcentaje del profesional (%)</Label>
                <Input
                  type="number" min="0" max="100" step="0.5"
                  value={form.percentage}
                  onChange={(e) => setForm((f) => ({ ...f, percentage: e.target.value }))}
                />
                {selectedDoctor && (
                  <p className="text-xs text-muted-foreground">
                    Precargado de la comisión configurada para {selectedDoctor.name} ({selectedDoctor.commission_percentage}%). Puedes ajustarlo para este período.
                  </p>
                )}
              </div>
              {parseFloat(form.gross_amount || "0") > 0 && (
                <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Profesional recibe:</span>
                    <span className="font-bold text-primary">${totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Clínica recibe:</span>
                    <span className="font-bold">${clinicShareAmount.toLocaleString()}</span>
                  </div>
                </div>
              )}
              <div className="space-y-1.5">
                <Label>Notas</Label>
                <Input value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Observaciones opcionales" />
              </div>
              <Button type="submit" className="w-full" disabled={insert.isPending}>
                {insert.isPending ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Registrando…</> : "Registrar liquidación"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Period filter */}
      <div className="flex items-center gap-3">
        <Label className="text-sm text-muted-foreground shrink-0">Período:</Label>
        <Input type="month" className="w-auto min-w-[220px]" value={period} onChange={(e) => setPeriod(e.target.value)} />
      </div>

      {/* Summary */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl p-5 border border-border shadow-card">
          <p className="text-sm text-muted-foreground">Pendiente de pago</p>
          <p className="text-2xl font-bold text-warning">${totalPendiente.toFixed(2)}</p>
        </div>
        <div className="bg-card rounded-xl p-5 border border-border shadow-card">
          <p className="text-sm text-muted-foreground">Liquidado</p>
          <p className="text-2xl font-bold text-success">${totalLiquidado.toFixed(2)}</p>
        </div>
        <div className="bg-card rounded-xl p-5 border border-border shadow-card">
          <p className="text-sm text-muted-foreground">Total profesionales</p>
          <p className="text-2xl font-bold">${(totalPendiente + totalLiquidado).toFixed(2)}</p>
        </div>
        <div className="bg-card rounded-xl p-5 border border-border shadow-card">
          <p className="text-sm text-muted-foreground">Comisión clínica</p>
          <p className="text-2xl font-bold text-primary">${totalClinica.toFixed(2)}</p>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
          <Loader2 className="w-5 h-5 animate-spin" /> Cargando remuneraciones…
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Calculator className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No hay liquidaciones para este período.</p>
          <p className="text-xs mt-1">Registra una nueva liquidación con el botón superior.</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border shadow-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left p-3 font-medium">Profesional</th>
                <th className="text-left p-3 font-medium hidden md:table-cell">Parte</th>
                <th className="text-center p-3 font-medium hidden sm:table-cell">Sesiones</th>
                <th className="text-right p-3 font-medium hidden lg:table-cell">Bruto</th>
                <th className="text-center p-3 font-medium hidden sm:table-cell">%</th>
                <th className="text-right p-3 font-medium">Total</th>
                <th className="text-center p-3 font-medium">Estado</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-muted/20 transition-colors">
                  <td className="p-3 font-medium">{entry.doctors?.name ?? "—"}</td>
                  <td className="p-3 hidden md:table-cell">
                    <Badge variant={entry.party === "clinic" ? "secondary" : "outline"} className="text-xs">
                      {entry.party === "clinic" ? "Clínica" : "Profesional"}
                    </Badge>
                  </td>
                  <td className="p-3 text-center hidden sm:table-cell">{entry.sessions}</td>
                  <td className="p-3 text-right hidden lg:table-cell text-muted-foreground">${entry.gross_amount.toFixed(2)}</td>
                  <td className="p-3 text-center hidden sm:table-cell text-muted-foreground">{entry.percentage}%</td>
                  <td className="p-3 text-right font-semibold">${entry.total_amount.toFixed(2)}</td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => toggleStatus(entry.id, entry.status)}
                      className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border transition-colors ${
                        entry.status === "liquidado"
                          ? "bg-success/10 text-success border-success/20 hover:bg-success/20"
                          : "bg-warning/10 text-warning border-warning/20 hover:bg-warning/20"
                      }`}
                    >
                      {entry.status === "liquidado"
                        ? <><CheckCircle2 className="w-3 h-3" /> Liquidado</>
                        : <><Clock className="w-3 h-3" /> Pendiente</>}
                    </button>
                  </td>
                  <td className="p-3 text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(entry.id)}>
                      <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Remuneraciones;
