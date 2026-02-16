import { useMemo, useState } from "react";
import {
  getProcedures,
  saveProcedure,
  createProcedure,
  type Procedure,
} from "@/lib/agenda/procedures";
import {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  type ProcedureCategory,
} from "@/lib/agenda/procedureCategories";
import { getDoctors } from "@/lib/agenda/repository";
import { DoctorsMultiSelect } from "@/components/procedimientos/DoctorsMultiSelect";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

const emptyProcedure: Omit<Procedure, "id"> = {
  code: "",
  category: "",
  name: "",
  description: "",
  color: "#6b7280",
  price: 0,
  doctorIds: [],
};

export default function Procedimientos() {
  const [procedures, setProcedures] = useState<Procedure[]>(() => getProcedures());
  const [categories, setCategories] = useState<ProcedureCategory[]>(() => getCategories());
  const [editing, setEditing] = useState<Procedure | null>(null);
  const [creating, setCreating] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const doctors = useMemo(() => getDoctors(), []);

  const refresh = () => {
    setProcedures(getProcedures());
    setCategories(getCategories());
  };

  const handleSaveProcedure = (data: Procedure) => {
    if (data.id) {
      saveProcedure(data);
      toast.success("Procedimiento actualizado");
    } else {
      createProcedure({
        code: data.code,
        category: data.category,
        name: data.name,
        description: data.description,
        color: data.color,
        price: data.price,
        priceNew: data.priceNew ?? undefined,
        doctorIds: data.doctorIds,
      });
      toast.success("Procedimiento creado");
    }
    refresh();
    setEditing(null);
    setCreating(false);
  };

  const handleAddCategory = () => {
    const name = newCategoryName.trim();
    if (!name) {
      toast.error("Escriba el nombre de la categoría");
      return;
    }
    if (categories.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      toast.error("Ya existe una categoría con ese nombre");
      return;
    }
    addCategory(name);
    setNewCategoryName("");
    refresh();
    toast.success("Categoría agregada");
  };

  const handleDeleteCategory = (id: string) => {
    const cat = categories.find((c) => c.id === id);
    if (procedures.some((p) => p.category === cat?.name)) {
      toast.error("Hay procedimientos con esta categoría. Cámbielos antes de eliminar.");
      return;
    }
    deleteCategory(id);
    refresh();
    toast.success("Categoría eliminada");
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Procedimientos de la cita</h1>
        <p className="text-muted-foreground text-sm">
          Catálogo de procedimientos y categorías. Asigne uno o más doctores por procedimiento para filtrar en la agenda.
        </p>
      </div>

      {/* Categorías */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Categorías</CardTitle>
          <p className="text-sm text-muted-foreground">
            Agregue categorías para organizar los procedimientos. Escalable.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Input
              placeholder="Nueva categoría"
              className="max-w-[200px]"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCategory())}
            />
            <Button type="button" onClick={handleAddCategory} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Agregar
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm"
              >
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: c.color }}
                />
                <span>{c.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-destructive"
                  onClick={() => handleDeleteCategory(c.id)}
                  title="Eliminar categoría"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Listado procedimientos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Procedimientos</CardTitle>
          <Button onClick={() => setCreating(true)} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Nuevo procedimiento
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">Color</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Doctores asignados</TableHead>
                <TableHead className="w-[80px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {procedures.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <span
                      className="inline-block w-4 h-4 rounded-full border"
                      style={{ backgroundColor: p.color }}
                    />
                  </TableCell>
                  <TableCell className="font-mono text-sm">{p.code}</TableCell>
                  <TableCell>{p.category}</TableCell>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm max-w-[200px] truncate">
                    {p.description}
                  </TableCell>
                  <TableCell>${p.price}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {p.doctorIds.length === 0
                      ? "Todos"
                      : p.doctorIds
                          .map((id) => doctors.find((d) => d.id === id)?.name ?? id)
                          .join(", ")}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => setEditing(p)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {(editing || creating) && (
        <ProcedureFormDialog
          procedure={editing ?? ({ ...emptyProcedure, id: "" } as Procedure)}
          isNew={creating}
          doctors={doctors}
          onSave={handleSaveProcedure}
          onClose={() => {
            setEditing(null);
            setCreating(false);
          }}
        />
      )}
    </div>
  );
}

function ProcedureFormDialog({
  procedure,
  isNew,
  doctors,
  onSave,
  onClose,
}: {
  procedure: Procedure;
  isNew: boolean;
  doctors: { id: string; name: string }[];
  onSave: (p: Procedure) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Procedure>({ ...procedure });
  const [newCategoryName, setNewCategoryName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Nombre requerido");
      return;
    }
    if (!form.category.trim()) {
      toast.error("Seleccione o agregue una categoría");
      return;
    }
    if (isNew) {
      const { id: _, ...rest } = form;
      onSave({ ...rest, id: "" } as Procedure);
    } else {
      onSave(form);
    }
  };

  const [categoryOptions, setCategoryOptions] = useState<ProcedureCategory[]>(() => getCategories());

  const handleAddCategoryAndSelect = () => {
    const name = newCategoryName.trim();
    if (!name) return;
    const newCat = addCategory(name);
    setCategoryOptions(getCategories());
    setForm((p) => ({ ...p, category: newCat.name }));
    setNewCategoryName("");
    toast.success("Categoría agregada");
  };

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isNew ? "Nuevo procedimiento" : "Editar procedimiento"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Código</Label>
              <Input
                value={form.code}
                onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
                placeholder="Ej. CONS"
              />
            </div>
            <div className="space-y-2">
              <Label>Categoría</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((c) => (
                    <SelectItem key={c.id} value={c.name}>
                      <span className="inline-block w-3 h-3 rounded-full mr-2 align-middle" style={{ backgroundColor: c.color }} />
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-2 mt-1">
                <Input
                  placeholder="＋ Nueva categoría"
                  className="text-sm"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddCategoryAndSelect}
                  disabled={!newCategoryName.trim()}
                >
                  Agregar
                </Button>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Nombre</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Nombre del procedimiento"
            />
          </div>
          <div className="space-y-2">
            <Label>Descripción</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              rows={2}
              placeholder="Descripción opcional"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Color (hex)</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  className="w-10 h-10 rounded border cursor-pointer"
                  value={form.color}
                  onChange={(e) => setForm((p) => ({ ...p, color: e.target.value }))}
                />
                <Input
                  value={form.color}
                  onChange={(e) => setForm((p) => ({ ...p, color: e.target.value }))}
                  className="font-mono"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Precio</Label>
              <Input
                type="number"
                min={0}
                step={0.01}
                value={form.price}
                onChange={(e) => setForm((p) => ({ ...p, price: Number(e.target.value) || 0 }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Precio nuevo (opc.)</Label>
              <Input
                type="number"
                min={0}
                step={0.01}
                value={form.priceNew ?? ""}
                onChange={(e) =>
                  setForm((p) => ({ ...p, priceNew: e.target.value ? Number(e.target.value) : undefined }))
                }
                placeholder="—"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Doctores asignados (varios)</Label>
            <p className="text-xs text-muted-foreground">
              Solo estos doctores aparecerán al elegir este procedimiento en una cita. Ninguno = todos.
            </p>
            <DoctorsMultiSelect
              doctors={doctors}
              value={form.doctorIds}
              onChange={(ids) => setForm((p) => ({ ...p, doctorIds: ids }))}
              placeholder="Seleccionar doctores"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">{isNew ? "Crear" : "Guardar"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
