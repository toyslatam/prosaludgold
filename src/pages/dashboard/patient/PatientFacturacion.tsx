import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import type { Patient } from "@/data/mockData";
import { getPaymentsByPatient } from "@/lib/patients/payments";
import { getPlansByPatient, type TreatmentPlan } from "@/lib/patients/treatmentPlans";
import {
  getInvoicesByPatient,
  issueInvoice,
  computeInvoiceTotals,
  type Invoice,
  type InvoiceItem,
} from "@/lib/patients/invoices";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Plus, Download } from "lucide-react";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

const EMPTY_ITEM: InvoiceItem = { description: "", quantity: 1, unitPrice: 0, taxRate: 7 };

const INVOICE_STATUS_LABELS: Record<Invoice["status"], string> = {
  draft: "Borrador",
  pending: "Pendiente",
  issued: "Emitida",
  error: "Error",
  cancelled: "Anulada",
};

export default function PatientFacturacion() {
  const { patient } = useOutletContext<{ patient: Patient }>();
  const payments = useMemo(() => getPaymentsByPatient(patient.id), [patient.id]);

  const [plans, setPlans] = useState<TreatmentPlan[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(true);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    getPlansByPatient(patient.id).then(setPlans).catch(() => {});
  }, [patient.id]);

  useEffect(() => {
    let cancelled = false;
    setLoadingInvoices(true);
    getInvoicesByPatient(patient.id)
      .then((data) => {
        if (!cancelled) setInvoices(data);
      })
      .catch(() => {
        if (!cancelled) toast.error("No se pudieron cargar las facturas.");
      })
      .finally(() => {
        if (!cancelled) setLoadingInvoices(false);
      });
    return () => {
      cancelled = true;
    };
  }, [patient.id, refresh]);

  const [modalOpen, setModalOpen] = useState(false);
  const [planId, setPlanId] = useState<string>("");
  const [buyerName, setBuyerName] = useState(patient.name);
  const [buyerRuc, setBuyerRuc] = useState(patient.cedula ?? "");
  const [buyerEmail, setBuyerEmail] = useState(patient.email ?? "");
  const [items, setItems] = useState<InvoiceItem[]>([{ ...EMPTY_ITEM }]);
  const [issuing, setIssuing] = useState(false);

  const totals = useMemo(() => computeInvoiceTotals(items), [items]);

  const openCreate = () => {
    setPlanId("");
    setBuyerName(patient.name);
    setBuyerRuc(patient.cedula ?? "");
    setBuyerEmail(patient.email ?? "");
    setItems([{ ...EMPTY_ITEM }]);
    setModalOpen(true);
  };

  const applyPlan = (id: string) => {
    setPlanId(id);
    const plan = plans.find((p) => p.id === id);
    if (!plan) return;
    setItems(
      plan.prestaciones.length
        ? plan.prestaciones.map((pr) => ({
            description: pr.name,
            quantity: 1,
            unitPrice: pr.price,
            taxRate: 7,
          }))
        : [{ ...EMPTY_ITEM }]
    );
  };

  const addItem = () => setItems((prev) => [...prev, { ...EMPTY_ITEM }]);
  const updateItem = (index: number, patch: Partial<InvoiceItem>) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  };
  const removeItem = (index: number) => {
    setItems((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  };

  const handleIssue = async () => {
    if (!buyerName.trim()) {
      toast.error("Ingrese el nombre del comprador");
      return;
    }
    const validItems = items.filter((i) => i.description.trim() && i.unitPrice > 0);
    if (validItems.length === 0) {
      toast.error("Agregue al menos un renglón con descripción y precio");
      return;
    }
    setIssuing(true);
    try {
      await issueInvoice({
        patientId: patient.id,
        treatmentPlanId: planId || undefined,
        buyerName: buyerName.trim(),
        buyerRuc: buyerRuc || undefined,
        buyerEmail: buyerEmail || undefined,
        items: validItems,
      });
      toast.success("Factura emitida");
      setModalOpen(false);
      setRefresh((r) => r + 1);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo emitir la factura.");
      setRefresh((r) => r + 1); // el intento fallido igual queda registrado
    } finally {
      setIssuing(false);
    }
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="pagos" className="w-full">
        <TabsList>
          <TabsTrigger value="pagos">Pagos</TabsTrigger>
          <TabsTrigger value="documentos">Documentos emitidos</TabsTrigger>
          <TabsTrigger value="devoluciones">Devoluciones</TabsTrigger>
          <TabsTrigger value="eliminados">Pagos eliminados</TabsTrigger>
          <TabsTrigger value="balance">Balance</TabsTrigger>
        </TabsList>
        <TabsContent value="pagos" className="mt-4">
          {payments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground/50" />
                <p className="mt-2 text-center text-muted-foreground text-sm">
                  El paciente no cuenta con pagos en el sistema
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Monto</TableHead>
                      <TableHead>Medio</TableHead>
                      <TableHead>Referencia</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Descripción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>
                          {format(parseISO(p.date), "d MMM yyyy", { locale: es })}
                        </TableCell>
                        <TableCell className="font-medium">
                          ${p.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>{p.method}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {p.reference ?? "—"}
                        </TableCell>
                        <TableCell>
                          <span
                            className={
                              p.status === "completado"
                                ? "text-success"
                                : p.status === "anulado"
                                  ? "text-muted-foreground"
                                  : "text-warning"
                            }
                          >
                            {p.status === "completado"
                              ? "Completado"
                              : p.status === "anulado"
                                ? "Anulado"
                                : "Pendiente"}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {p.description ?? "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="documentos" className="mt-4 space-y-3">
          <div className="flex justify-end">
            <Button size="sm" className="gap-2" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Emitir factura
            </Button>
          </div>
          {loadingInvoices ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Cargando…</p>
          ) : invoices.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground/50" />
                <p className="mt-2 text-center text-muted-foreground text-sm">
                  No hay documentos emitidos para este paciente
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Comprador</TableHead>
                      <TableHead>Folio / CUFE</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((inv) => (
                      <TableRow key={inv.id}>
                        <TableCell>
                          {format(parseISO(inv.createdAt), "d MMM yyyy", { locale: es })}
                        </TableCell>
                        <TableCell>{inv.buyerName}</TableCell>
                        <TableCell className="text-muted-foreground text-xs">
                          {inv.externalId ?? inv.cufe ?? "—"}
                        </TableCell>
                        <TableCell className="font-medium">
                          ${inv.total.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              inv.status === "issued"
                                ? "default"
                                : inv.status === "error"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {INVOICE_STATUS_LABELS[inv.status]}
                          </Badge>
                          {inv.status === "error" && inv.errorMessage && (
                            <p className="text-xs text-destructive mt-1">{inv.errorMessage}</p>
                          )}
                        </TableCell>
                        <TableCell>
                          {inv.pdfUrl && (
                            <Button variant="outline" size="sm" className="gap-1" asChild>
                              <a href={inv.pdfUrl} target="_blank" rel="noreferrer">
                                <Download className="h-3 w-3" /> PDF
                              </a>
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="devoluciones" className="mt-4">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-2 text-center text-muted-foreground text-sm">
                No hay devoluciones registradas
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="eliminados" className="mt-4">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-2 text-center text-muted-foreground text-sm">
                No hay pagos eliminados
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="balance" className="mt-4">
          <Card>
            <CardContent className="py-8">
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Saldo del paciente (mock)</span>
                  <span className="font-medium">
                    ${patient.balance?.toLocaleString() ?? "0"}
                  </span>
                </div>
                <p className="text-muted-foreground text-xs mt-2">
                  El balance detallado se calcula a partir de presupuestos y pagos (integración completa en backend).
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Emitir factura</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {plans.length > 0 && (
              <div className="space-y-2">
                <Label>Basar en plan / paquete (opcional)</Label>
                <Select value={planId} onValueChange={applyPlan}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sin plan asociado" />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        #{p.number} — {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2 sm:col-span-2">
                <Label>Nombre del comprador *</Label>
                <Input value={buyerName} onChange={(e) => setBuyerName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>RUC / Cédula</Label>
                <Input value={buyerRuc} onChange={(e) => setBuyerRuc(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email (para envío del comprobante)</Label>
              <Input type="email" value={buyerEmail} onChange={(e) => setBuyerEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Renglones</Label>
              {items.map((item, i) => (
                <div key={i} className="grid grid-cols-[1fr_70px_100px_70px_auto] gap-2 items-center">
                  <Input
                    placeholder="Descripción"
                    value={item.description}
                    onChange={(e) => updateItem(i, { description: e.target.value })}
                  />
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="Cant."
                    value={item.quantity}
                    onChange={(e) => updateItem(i, { quantity: parseFloat(e.target.value) || 0 })}
                  />
                  <Input
                    type="text"
                    inputMode="decimal"
                    placeholder="Precio"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(i, { unitPrice: parseFloat(e.target.value) || 0 })}
                  />
                  <Input
                    type="text"
                    inputMode="decimal"
                    placeholder="ITBMS %"
                    value={item.taxRate ?? 0}
                    onChange={(e) => updateItem(i, { taxRate: parseFloat(e.target.value) || 0 })}
                  />
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(i)}>
                    Quitar
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                + Añadir renglón
              </Button>
            </div>
            <div className="flex justify-end gap-6 text-sm border-t pt-3">
              <span>Subtotal: <strong>${totals.subtotal.toFixed(2)}</strong></span>
              <span>ITBMS: <strong>${totals.taxTotal.toFixed(2)}</strong></span>
              <span>Total: <strong>${totals.total.toFixed(2)}</strong></span>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)} disabled={issuing}>
                Cancelar
              </Button>
              <Button onClick={handleIssue} disabled={issuing}>
                {issuing ? "Emitiendo…" : "Emitir factura"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
