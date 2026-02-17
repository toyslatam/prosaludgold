import { useMemo, useState } from "react";
import { useDemo } from "@/contexts/DemoContext";
import { getInventoryItems } from "@/lib/inventory/items";
import { getMovements } from "@/lib/inventory/movements";
import { addMovement } from "@/lib/inventory/movements";
import { updateItemStock } from "@/lib/inventory/items";
import type { InventoryItem } from "@/lib/inventory/types";
import type { InventoryMovement } from "@/lib/inventory/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Link } from "react-router-dom";
import { useDemoConfig } from "@/contexts/DemoContext";

const reasonLabels: Record<string, string> = {
  CARE_ENCOUNTER: "Atención",
  PURCHASE_ENTRY: "Compra",
  MANUAL_ADJUST: "Ajuste",
};

const Inventario = () => {
  const { vertical, basePath } = useDemo();
  const config = useDemoConfig();
  const [refresh, setRefresh] = useState(0);
  const items = useMemo(() => getInventoryItems(vertical), [vertical, refresh]);

  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [entryOpen, setEntryOpen] = useState(false);
  const [entryItemId, setEntryItemId] = useState("");
  const [entryQty, setEntryQty] = useState(1);

  const movements = useMemo(
    () => (selectedItem ? getMovements(vertical, selectedItem.id) : []),
    [vertical, selectedItem?.id, refresh]
  );

  const handleRegistrarEntrada = () => {
    if (!entryItemId || entryQty <= 0) {
      toast.error("Seleccione producto e ingrese cantidad mayor a 0");
      return;
    }
    const item = items.find((i) => i.id === entryItemId);
    if (!item) return;
    updateItemStock(vertical, entryItemId, entryQty);
    addMovement(vertical, {
      itemId: entryItemId,
      type: "IN",
      quantity: entryQty,
      unitLabel: item.unit,
      reason: "PURCHASE_ENTRY",
    });
    toast.success(`Entrada registrada: +${entryQty} ${item.unit}`);
    setEntryOpen(false);
    setEntryItemId("");
    setEntryQty(1);
    setRefresh((r) => r + 1);
  };

  const atencionPath = config.navItems.find((n) => n.pathKey === "atencion")
    ? `${basePath}/atencion`
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Inventario</h1>
          <p className="text-muted-foreground text-sm">Stock, entradas/salidas y alertas · {vertical}</p>
        </div>
        <Button className="gap-2" onClick={() => setEntryOpen(true)}>
          <Plus className="w-4 h-4" /> Registrar entrada
        </Button>
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
            {items.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-muted/20 transition-colors cursor-pointer"
                onClick={() => setSelectedItem(item)}
              >
                <td className="p-3 font-medium">{item.name}</td>
                <td className="p-3 text-muted-foreground">{item.category}</td>
                <td className="p-3">{item.stock} {item.unit}</td>
                <td className="p-3 hidden md:table-cell text-muted-foreground">{item.minStock}</td>
                <td className="p-3 hidden md:table-cell text-muted-foreground">{item.supplier}</td>
                <td className="p-3">
                  {item.stock <= item.minStock ? (
                    <span className="flex items-center gap-1 text-xs text-destructive">
                      <AlertTriangle className="w-3 h-3" /> Bajo stock
                    </span>
                  ) : (
                    <span className="text-xs text-success">OK</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detalle producto + Kardex */}
      <Sheet open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selectedItem && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedItem.name}</SheetTitle>
                <SheetDescription>
                  {selectedItem.category} · {selectedItem.supplier}
                </SheetDescription>
              </SheetHeader>
              <div className="mt-4 space-y-2 text-sm">
                <p>
                  <span className="text-muted-foreground">Stock actual:</span>{" "}
                  <strong>{selectedItem.stock} {selectedItem.unit}</strong>
                </p>
                <p>
                  <span className="text-muted-foreground">Mínimo:</span> {selectedItem.minStock} {selectedItem.unit}
                </p>
                <p>
                  Estado:{" "}
                  {selectedItem.stock <= selectedItem.minStock ? (
                    <span className="text-destructive">Bajo stock</span>
                  ) : (
                    <span className="text-success">OK</span>
                  )}
                </p>
              </div>
              <Tabs defaultValue="kardex" className="mt-6">
                <TabsList>
                  <TabsTrigger value="kardex">Historial (Kardex)</TabsTrigger>
                </TabsList>
                <TabsContent value="kardex" className="mt-4">
                  <KardexTable
                    movements={movements}
                    atencionPath={atencionPath}
                    unit={selectedItem.unit}
                    currentStock={selectedItem.stock}
                  />
                </TabsContent>
              </Tabs>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Registrar entrada */}
      <Dialog open={entryOpen} onOpenChange={setEntryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar entrada</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Producto</Label>
              <Select value={entryItemId} onValueChange={setEntryItemId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  {items.map((i) => (
                    <SelectItem key={i.id} value={i.id}>
                      {i.name} · Stock: {i.stock} {i.unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Cantidad</Label>
              <Input
                type="number"
                min={1}
                value={entryQty}
                onChange={(e) => setEntryQty(Number(e.target.value) || 0)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEntryOpen(false)}>Cancelar</Button>
            <Button onClick={handleRegistrarEntrada}>Registrar entrada</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

function KardexTable({
  movements,
  atencionPath,
  unit,
  currentStock,
}: {
  movements: InventoryMovement[];
  atencionPath: string | null;
  unit: string;
  currentStock: number;
}) {
  const balances = useMemo(() => {
    const b: number[] = [];
    let prev = currentStock;
    for (let i = 0; i < movements.length; i++) {
      b.push(prev);
      const m = movements[i];
      prev = prev + (m.type === "OUT" ? m.quantity : -m.quantity);
    }
    return b;
  }, [movements, currentStock]);

  if (movements.length === 0) {
    return <p className="text-sm text-muted-foreground py-4">Sin movimientos.</p>;
  }
  return (
    <div className="border rounded-md overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted/50 border-b">
            <th className="text-left p-2 font-medium">Fecha</th>
            <th className="text-left p-2 font-medium">Tipo</th>
            <th className="text-right p-2 font-medium">Cantidad</th>
            <th className="text-right p-2 font-medium">Saldo</th>
            <th className="text-left p-2 font-medium">Motivo</th>
            <th className="text-left p-2 font-medium">Referencia</th>
          </tr>
        </thead>
        <tbody>
          {movements.map((m, i) => (
            <tr key={m.id} className="border-b last:border-0">
              <td className="p-2 text-muted-foreground">
                {format(parseISO(m.createdAt), "dd/MM/yyyy HH:mm", { locale: es })}
              </td>
              <td className="p-2">
                {m.type === "IN" ? (
                  <span className="text-success">Entrada</span>
                ) : (
                  <span className="text-destructive">Salida</span>
                )}
              </td>
              <td className="p-2 text-right">
                {m.type === "OUT" ? "-" : "+"}{m.quantity} {m.unitLabel ?? unit}
              </td>
              <td className="p-2 text-right text-muted-foreground">{balances[i]} {unit}</td>
              <td className="p-2">{reasonLabels[m.reason] ?? m.reason}</td>
              <td className="p-2 text-muted-foreground">
                {m.reason === "CARE_ENCOUNTER" && m.refLabel && (
                  <>
                    {m.patientName && `${m.patientName}`}
                    {m.professionalName && ` · ${m.professionalName}`}
                    {atencionPath && m.refId ? (
                      <Link to={atencionPath} className="text-primary hover:underline ml-1">
                        {m.refLabel}
                      </Link>
                    ) : (
                      <span className="ml-1">{m.refLabel}</span>
                    )}
                  </>
                )}
                {m.reason === "PURCHASE_ENTRY" && "Entrada de compra"}
                {m.reason === "MANUAL_ADJUST" && "Ajuste manual"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Inventario;
