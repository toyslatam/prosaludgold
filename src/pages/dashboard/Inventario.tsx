import { useState } from "react";
import { useInventoryItems, useInsertInventoryItem, useUpdateInventoryItem } from "@/hooks/useSupabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, AlertTriangle, Search, Package, Loader2, Pencil } from "lucide-react";
import { toast } from "sonner";

type ItemForm = {
  name: string;
  category: string;
  unit: string;
  stock: string;
  min_stock: string;
  supplier: string;
};
const EMPTY: ItemForm = { name: "", category: "", unit: "unidad", stock: "0", min_stock: "5", supplier: "" };

type StockForm = { delta: string; type: "entrada" | "salida" };

const Inventario = () => {
  const [search, setSearch] = useState("");
  const [filterAlert, setFilterAlert] = useState(false);
  const [openNew, setOpenNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [stockItemId, setStockItemId] = useState<string | null>(null);
  const [itemForm, setItemForm] = useState<ItemForm>(EMPTY);
  const [stockForm, setStockForm] = useState<StockForm>({ delta: "", type: "entrada" });

  const { data: items = [], isLoading } = useInventoryItems();
  const insertItem = useInsertInventoryItem();
  const updateItem = useUpdateInventoryItem();

  const filtered = items.filter((i) => {
    const matchSearch =
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.category.toLowerCase().includes(search.toLowerCase());
    const matchAlert = !filterAlert || i.stock <= i.min_stock;
    return matchSearch && matchAlert;
  });

  const lowStockCount = items.filter((i) => i.stock <= i.min_stock).length;

  const openEdit = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    setItemForm({
      name: item.name,
      category: item.category,
      unit: item.unit,
      stock: String(item.stock),
      min_stock: String(item.min_stock),
      supplier: item.supplier ?? "",
    });
    setEditingId(id);
  };

  const handleItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: itemForm.name.trim(),
      category: itemForm.category.trim(),
      unit: itemForm.unit.trim() || "unidad",
      stock: parseInt(itemForm.stock) || 0,
      min_stock: parseInt(itemForm.min_stock) || 5,
      supplier: itemForm.supplier.trim() || null,
    };
    if (!payload.name || !payload.category) return toast.error("Nombre y categoría son obligatorios");

    if (editingId) {
      updateItem.mutate(
        { id: editingId, patch: payload },
        {
          onSuccess: () => { toast.success("Ítem actualizado"); setEditingId(null); setItemForm(EMPTY); },
          onError: (err) => toast.error(err.message),
        }
      );
    } else {
      insertItem.mutate(payload, {
        onSuccess: () => { toast.success("Ítem registrado"); setOpenNew(false); setItemForm(EMPTY); },
        onError: (err) => toast.error(err.message),
      });
    }
  };

  const handleStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const item = items.find((i) => i.id === stockItemId);
    if (!item) return;
    const delta = parseInt(stockForm.delta);
    if (isNaN(delta) || delta <= 0) return toast.error("Ingresa una cantidad válida");
    const newStock = stockForm.type === "entrada" ? item.stock + delta : Math.max(0, item.stock - delta);
    updateItem.mutate(
      { id: item.id, patch: { stock: newStock } },
      {
        onSuccess: () => { toast.success(`Stock actualizado: ${newStock} ${item.unit}`); setStockItemId(null); setStockForm({ delta: "", type: "entrada" }); },
        onError: (err) => toast.error(err.message),
      }
    );
  };

  const isPending = insertItem.isPending || updateItem.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Inventario</h1>
          <p className="text-muted-foreground text-sm">
            {isLoading ? "Cargando…" : `${items.length} ítems · ${lowStockCount} bajo mínimo`}
          </p>
        </div>
        <Dialog open={openNew} onOpenChange={setOpenNew}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={() => setItemForm(EMPTY)}>
              <Plus className="w-4 h-4" /> Nuevo ítem
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Agregar ítem</DialogTitle></DialogHeader>
            <form onSubmit={handleItemSubmit} className="space-y-4">
              <div className="space-y-1.5"><Label>Nombre *</Label>
                <Input value={itemForm.name} onChange={(e) => setItemForm((f) => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="space-y-1.5"><Label>Categoría *</Label>
                <Input value={itemForm.category} onChange={(e) => setItemForm((f) => ({ ...f, category: e.target.value }))} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>Unidad</Label>
                  <Input value={itemForm.unit} onChange={(e) => setItemForm((f) => ({ ...f, unit: e.target.value }))} placeholder="unidad" />
                </div>
                <div className="space-y-1.5"><Label>Stock inicial</Label>
                  <Input type="number" min="0" value={itemForm.stock} onChange={(e) => setItemForm((f) => ({ ...f, stock: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>Stock mínimo</Label>
                  <Input type="number" min="0" value={itemForm.min_stock} onChange={(e) => setItemForm((f) => ({ ...f, min_stock: e.target.value }))} />
                </div>
                <div className="space-y-1.5"><Label>Proveedor</Label>
                  <Input value={itemForm.supplier} onChange={(e) => setItemForm((f) => ({ ...f, supplier: e.target.value }))} />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Guardando…</> : "Agregar"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar ítem o categoría…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Button
          variant={filterAlert ? "destructive" : "outline"}
          size="sm"
          className="gap-2"
          onClick={() => setFilterAlert((v) => !v)}
        >
          <AlertTriangle className="w-4 h-4" />
          {filterAlert ? "Mostrando alertas" : `Alertas (${lowStockCount})`}
        </Button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
          <Loader2 className="w-5 h-5 animate-spin" /> Cargando inventario…
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>{search || filterAlert ? "No se encontraron ítems." : "El inventario está vacío."}</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border shadow-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left p-3 font-medium">Ítem</th>
                <th className="text-left p-3 font-medium hidden md:table-cell">Categoría</th>
                <th className="text-left p-3 font-medium hidden md:table-cell">Proveedor</th>
                <th className="text-center p-3 font-medium">Stock</th>
                <th className="text-center p-3 font-medium hidden sm:table-cell">Mínimo</th>
                <th className="text-right p-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((item) => {
                const isLow = item.stock <= item.min_stock;
                return (
                  <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {isLow && <AlertTriangle className="w-3.5 h-3.5 text-warning shrink-0" />}
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.unit}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 hidden md:table-cell text-muted-foreground">{item.category}</td>
                    <td className="p-3 hidden md:table-cell text-muted-foreground">{item.supplier ?? "—"}</td>
                    <td className={`p-3 text-center font-semibold ${isLow ? "text-destructive" : "text-success"}`}>{item.stock}</td>
                    <td className="p-3 text-center hidden sm:table-cell text-muted-foreground">{item.min_stock}</td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => setStockItemId(item.id)}>
                          Stock
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openEdit(item.id)}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit dialog */}
      <Dialog open={!!editingId} onOpenChange={(o) => { if (!o) { setEditingId(null); setItemForm(EMPTY); } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar ítem</DialogTitle></DialogHeader>
          <form onSubmit={handleItemSubmit} className="space-y-4">
            <div className="space-y-1.5"><Label>Nombre *</Label>
              <Input value={itemForm.name} onChange={(e) => setItemForm((f) => ({ ...f, name: e.target.value }))} required />
            </div>
            <div className="space-y-1.5"><Label>Categoría *</Label>
              <Input value={itemForm.category} onChange={(e) => setItemForm((f) => ({ ...f, category: e.target.value }))} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Unidad</Label>
                <Input value={itemForm.unit} onChange={(e) => setItemForm((f) => ({ ...f, unit: e.target.value }))} />
              </div>
              <div className="space-y-1.5"><Label>Stock mínimo</Label>
                <Input type="number" min="0" value={itemForm.min_stock} onChange={(e) => setItemForm((f) => ({ ...f, min_stock: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1.5"><Label>Proveedor</Label>
              <Input value={itemForm.supplier} onChange={(e) => setItemForm((f) => ({ ...f, supplier: e.target.value }))} />
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Guardando…</> : "Guardar cambios"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Stock movement dialog */}
      <Dialog open={!!stockItemId} onOpenChange={(o) => { if (!o) { setStockItemId(null); setStockForm({ delta: "", type: "entrada" }); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Movimiento de stock</DialogTitle>
          </DialogHeader>
          {stockItemId && (() => {
            const item = items.find((i) => i.id === stockItemId);
            return item ? (
              <form onSubmit={handleStockSubmit} className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{item.name}</span> · Stock actual: <strong>{item.stock} {item.unit}</strong>
                </p>
                <div className="space-y-1.5">
                  <Label>Tipo de movimiento</Label>
                  <Select value={stockForm.type} onValueChange={(v) => setStockForm((f) => ({ ...f, type: v as "entrada" | "salida" }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entrada">Entrada (compra / devolución)</SelectItem>
                      <SelectItem value="salida">Salida (consumo / pérdida)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Cantidad *</Label>
                  <Input
                    type="number" min="1"
                    placeholder="Cantidad"
                    value={stockForm.delta}
                    onChange={(e) => setStockForm((f) => ({ ...f, delta: e.target.value }))}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={updateItem.isPending}>
                  {updateItem.isPending ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Actualizando…</> : "Registrar movimiento"}
                </Button>
              </form>
            ) : null;
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Inventario;
