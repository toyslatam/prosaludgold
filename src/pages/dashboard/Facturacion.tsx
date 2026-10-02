import { useEffect, useMemo, useState } from "react";
import { useDemo } from "@/contexts/DemoContext";
import { getPatients } from "@/lib/patients/repository";
import {
  getAllInvoices,
  issueInvoice,
  computeInvoiceTotals,
  type Invoice,
  type InvoiceItem,
  type QbDocType,
} from "@/lib/patients/invoices";
import { useQuickbooksConnection, useSyncToQuickbooks } from "@/hooks/useSupabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Plus, Download, UploadCloud, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

const EMPTY_ITEM: InvoiceItem = { description: "", quantity: 1, unitPrice: 0, taxRate: 7 };

const STATUS_LABELS: Record<Invoice["status"], string> = {
  draft: "Borrador",
  pending: "Pendiente",
  issued: "Emitida",
  error: "Error",
  cancelled: "Anulada",
};

type InvoiceRow = Invoice & { patientName: string };

const Facturacion = () => {
  const { vertical } = useDemo();
  const [patients, setPatients] = useState<{ id: string; name: string; email?: string; cedula?: string }[]>([]);
  const [docs, setDocs] = useState<InvoiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);
  const { data: qbConnection } = useQuickbooksConnection();
  const syncToQuickbooks = useSyncToQuickbooks();
  const [syncingId, setSyncingId] = useState<string | null>(null);

  useEffect(() => {
    getPatients(vertical)
      .then((data) => setPatients(data.map((p) => ({ id: p.id, name: p.name, email: p.email, cedula: p.cedula }))))
      .catch(() => toast.error("No se pudieron cargar los pacientes."));
  }, [vertical]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getAllInvoices()
      .then((data) => { if (!cancelled) setDocs(data); })
      .catch(() => toast.error("No se pudieron cargar los documentos."))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [refresh]);

  const [open, setOpen] = useState(false);
  const [patientId, setPatientId] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [buyerRuc, setBuyerRuc] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [items, setItems] = useState<InvoiceItem[]>([{ ...EMPTY_ITEM }]);
  const [qbDocType, setQbDocType] = useState<QbDocType>("recibo");
  const [issuing, setIssuing] = useState(false);

  const totals = useMemo(() => computeInvoiceTotals(items), [items]);

  const openCreate = () => {
    setPatientId("");
    setBuyerName("");
    setBuyerRuc("");
    setBuyerEmail("");
    setItems([{ ...EMPTY_ITEM }]);
    setQbDocType("recibo");
    setOpen(true);
  };

  const selectPatient = (id: string) => {
    setPatientId(id);
    const p = patients.find((x) => x.id === id);
    if (p) {
      setBuyerName(p.name);
      setBuyerEmail(p.email ?? "");
      setBuyerRuc(p.cedula ?? "");
    }
  };

  const addItem = () => setItems((prev) => [...prev, { ...EMPTY_ITEM }]);
  const updateItem = (i: number, patch: Partial<InvoiceItem>) =>
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  const removeItem = (i: number) =>
    setItems((prev) => (prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev));

  const handleIssue = async () => {
    if (!patientId) return toast.error("Selecciona un paciente/cliente");
    if (!buyerName.trim()) return toast.error("Ingrese el nombre del comprador");
    const validItems = items.filter((i) => i.description.trim() && i.unitPrice > 0);
    if (validItems.length === 0) return toast.error("Agregue al menos un renglón con descripción y precio");

    setIssuing(true);
    try {
      await issueInvoice({
        patientId,
        buyerName: buyerName.trim(),
        buyerRuc: buyerRuc || undefined,
        buyerEmail: buyerEmail || undefined,
        items: validItems,
        qbDocType,
      });
      toast.success(qbDocType === "recibo" ? "Recibo emitido" : "Factura emitida");
      setOpen(false);
      setRefresh((r) => r + 1);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo emitir el documento.");
      setRefresh((r) => r + 1);
    } finally {
      setIssuing(false);
    }
  };

  const handleSync = (id: string) => {
    setSyncingId(id);
    syncToQuickbooks.mutate(
      { entity: "invoice", id },
      {
        onSuccess: (res) => { toast.success(res.skipped ? "Omitido" : "Enviado a QuickBooks"); setRefresh((r) => r + 1); },
        onError: (err) => toast.error(err.message || "No se pudo enviar a QuickBooks"),
        onSettled: () => setSyncingId(null),
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Facturación</h1>
          <p className="text-muted-foreground text-sm">Facturas y recibos de venta de todos los clientes</p>
        </div>
        <Button className="gap-2" onClick={openCreate}>
          <Plus className="w-4 h-4" /> Emitir factura
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
          <Loader2 className="w-5 h-5 animate-spin" /> Cargando documentos…
        </div>
      ) : docs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground/50" />
            <p className="mt-2 text-center text-muted-foreground text-sm">
              No hay documentos emitidos todavía.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Folio / CUFE</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Estado</TableHead>
                  {qbConnection && <TableHead>QuickBooks</TableHead>}
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {docs.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell>{format(parseISO(d.createdAt), "d MMM yyyy", { locale: es })}</TableCell>
                    <TableCell>{d.patientName}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{d.externalId ?? d.cufe ?? "—"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {d.qbDocType === "recibo" ? "Recibo de venta" : "Factura"}
                    </TableCell>
                    <TableCell className="font-medium">${d.total.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={d.status === "issued" ? "default" : d.status === "error" ? "destructive" : "secondary"}>
                        {STATUS_LABELS[d.status]}
                      </Badge>
                      {d.status === "error" && d.errorMessage && (
                        <p className="text-xs text-destructive mt-1">{d.errorMessage}</p>
                      )}
                    </TableCell>
                    {qbConnection && (
                      <TableCell>
                        {d.qbSyncStatus === "synced" ? (
                          <Badge variant="outline" className="text-xs gap-1 text-success border-success/30">
                            <Check className="h-3 w-3" /> Enviado
                          </Badge>
                        ) : (
                          <Button
                            variant="outline" size="sm" className="gap-1 text-xs h-7"
                            disabled={syncingId === d.id}
                            onClick={() => handleSync(d.id)}
                          >
                            <UploadCloud className="h-3 w-3" />
                            {syncingId === d.id ? "Enviando…" : d.qbDocType === "recibo" ? "Crear recibo en QuickBooks" : "Crear factura en QuickBooks"}
                          </Button>
                        )}
                      </TableCell>
                    )}
                    <TableCell>
                      {d.pdfUrl && (
                        <Button variant="outline" size="sm" className="gap-1" asChild>
                          <a href={d.pdfUrl} target="_blank" rel="noreferrer">
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{qbDocType === "recibo" ? "Emitir recibo" : "Emitir factura"}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Cliente / Paciente *</Label>
              <Select value={patientId} onValueChange={selectPatient}>
                <SelectTrigger><SelectValue placeholder="Seleccionar cliente" /></SelectTrigger>
                <SelectContent>
                  {patients.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tipo de documento</Label>
              <Select value={qbDocType} onValueChange={(v) => setQbDocType(v as QbDocType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="recibo">Recibo de venta (ya cobrado)</SelectItem>
                  <SelectItem value="factura">Factura (por cobrar / a crédito)</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
                  <Input placeholder="Descripción" value={item.description} onChange={(e) => updateItem(i, { description: e.target.value })} />
                  <Input type="text" inputMode="numeric" placeholder="Cant." value={item.quantity} onChange={(e) => updateItem(i, { quantity: parseFloat(e.target.value) || 0 })} />
                  <Input type="text" inputMode="decimal" placeholder="Precio" value={item.unitPrice} onChange={(e) => updateItem(i, { unitPrice: parseFloat(e.target.value) || 0 })} />
                  <Input type="text" inputMode="decimal" placeholder="ITBMS %" value={item.taxRate ?? 0} onChange={(e) => updateItem(i, { taxRate: parseFloat(e.target.value) || 0 })} />
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(i)}>Quitar</Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addItem}>+ Añadir renglón</Button>
            </div>
            <div className="flex justify-end gap-6 text-sm border-t pt-3">
              <span>Subtotal: <strong>${totals.subtotal.toFixed(2)}</strong></span>
              <span>ITBMS: <strong>${totals.taxTotal.toFixed(2)}</strong></span>
              <span>Total: <strong>${totals.total.toFixed(2)}</strong></span>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={issuing}>Cancelar</Button>
              <Button onClick={handleIssue} disabled={issuing}>
                {issuing ? "Emitiendo…" : qbDocType === "recibo" ? "Emitir recibo" : "Emitir factura"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Facturacion;
