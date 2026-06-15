import { useState } from "react";
import { useLabOrders, useInsertLabOrder, useUpdateLabOrderStatus, useDoctors, usePatients } from "@/hooks/useSupabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Loader2, FlaskConical } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const STATUS_COLORS: Record<string, string> = {
  solicitado:  "bg-warning/10 text-warning border-warning/20",
  en_proceso:  "bg-blue-500/10 text-blue-500 border-blue-500/20",
  recibido:    "bg-primary/10 text-primary border-primary/20",
  entregado:   "bg-success/10 text-success border-success/20",
};
const STATUS_LABELS: Record<string, string> = {
  solicitado: "Solicitado",
  en_proceso: "En proceso",
  recibido:   "Recibido",
  entregado:  "Entregado",
};
const STATUS_OPTIONS = ["solicitado", "en_proceso", "recibido", "entregado"] as const;

type LabForm = {
  patient_id: string;
  doctor_id: string;
  lab: string;
  work: string;
  cost: string;
  date: string;
};
const EMPTY: LabForm = {
  patient_id: "", doctor_id: "", lab: "", work: "", cost: "0",
  date: format(new Date(), "yyyy-MM-dd"),
};

const Laboratorios = () => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<LabForm>(EMPTY);

  const { data: orders = [], isLoading } = useLabOrders();
  const { data: doctors = [] } = useDoctors();
  const { data: patients = [] } = usePatients();
  const insert = useInsertLabOrder();
  const updateStatus = useUpdateLabOrderStatus();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patient_id || !form.doctor_id || !form.lab || !form.work) {
      return toast.error("Completa todos los campos obligatorios");
    }
    insert.mutate(
      {
        patient_id: form.patient_id,
        doctor_id: form.doctor_id,
        lab: form.lab.trim(),
        work: form.work.trim(),
        cost: parseFloat(form.cost) || 0,
        date: form.date,
      },
      {
        onSuccess: () => { toast.success("Solicitud registrada"); setOpen(false); setForm(EMPTY); },
        onError: (err) => toast.error(err.message),
      }
    );
  };

  const handleStatusChange = (id: string, status: typeof STATUS_OPTIONS[number]) => {
    updateStatus.mutate(
      { id, status },
      {
        onSuccess: () => toast.success(`Estado actualizado: ${STATUS_LABELS[status]}`),
        onError: (err) => toast.error(err.message),
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Laboratorios</h1>
          <p className="text-muted-foreground text-sm">
            {isLoading ? "Cargando…" : `${orders.length} solicitudes`}
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={() => setForm(EMPTY)}>
              <Plus className="w-4 h-4" /> Nueva solicitud
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nueva solicitud de laboratorio</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Paciente *</Label>
                <Select value={form.patient_id} onValueChange={(v) => setForm((f) => ({ ...f, patient_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar paciente" /></SelectTrigger>
                  <SelectContent>
                    {patients.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Doctor *</Label>
                <Select value={form.doctor_id} onValueChange={(v) => setForm((f) => ({ ...f, doctor_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar doctor" /></SelectTrigger>
                  <SelectContent>
                    {doctors.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Laboratorio *</Label>
                <Input value={form.lab} onChange={(e) => setForm((f) => ({ ...f, lab: e.target.value }))} placeholder="Nombre del laboratorio" required />
              </div>
              <div className="space-y-1.5">
                <Label>Trabajo *</Label>
                <Input value={form.work} onChange={(e) => setForm((f) => ({ ...f, work: e.target.value }))} placeholder="Descripción del trabajo" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Costo</Label>
                  <Input type="number" min="0" step="0.01" value={form.cost} onChange={(e) => setForm((f) => ({ ...f, cost: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Fecha</Label>
                  <Input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={insert.isPending}>
                {insert.isPending ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Registrando…</> : "Registrar solicitud"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
          <Loader2 className="w-5 h-5 animate-spin" /> Cargando laboratorios…
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <FlaskConical className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No hay solicitudes de laboratorio registradas.</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border shadow-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left p-3 font-medium">Paciente</th>
                <th className="text-left p-3 font-medium">Trabajo</th>
                <th className="text-left p-3 font-medium hidden md:table-cell">Laboratorio</th>
                <th className="text-left p-3 font-medium hidden md:table-cell">Doctor</th>
                <th className="text-left p-3 font-medium hidden sm:table-cell">Fecha</th>
                <th className="text-right p-3 font-medium hidden sm:table-cell">Costo</th>
                <th className="text-left p-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-muted/20 transition-colors">
                  <td className="p-3 font-medium">{order.patients?.name ?? "—"}</td>
                  <td className="p-3">{order.work}</td>
                  <td className="p-3 hidden md:table-cell text-muted-foreground">{order.lab}</td>
                  <td className="p-3 hidden md:table-cell text-muted-foreground">{order.doctors?.name ?? "—"}</td>
                  <td className="p-3 hidden sm:table-cell text-muted-foreground">{order.date}</td>
                  <td className="p-3 text-right hidden sm:table-cell">${order.cost.toFixed(2)}</td>
                  <td className="p-3">
                    <Select
                      value={order.status}
                      onValueChange={(v) => handleStatusChange(order.id, v as typeof STATUS_OPTIONS[number])}
                    >
                      <SelectTrigger className={`h-7 text-xs w-32 border ${STATUS_COLORS[order.status] ?? ""}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((s) => (
                          <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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

export default Laboratorios;
