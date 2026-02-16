import { useMemo, useState } from "react";
import { getProcedures, saveProcedure, type Procedure } from "@/lib/agenda/procedures";
import { getDoctors } from "@/lib/agenda/repository";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Pencil } from "lucide-react";
import { toast } from "sonner";

export default function Procedimientos() {
  const [procedures, setProcedures] = useState<Procedure[]>(() => getProcedures());
  const [editing, setEditing] = useState<Procedure | null>(null);
  const doctors = useMemo(() => getDoctors(), []);

  const refresh = () => setProcedures(getProcedures());

  const handleSave = (data: Procedure) => {
    saveProcedure(data);
    toast.success("Procedimiento guardado");
    refresh();
    setEditing(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Procedimientos de la cita</h1>
        <p className="text-muted-foreground text-sm">
          Catálogo de procedimientos. Cada uno puede tener uno o más doctores asignados para filtrar en la agenda.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Listado</CardTitle>
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

      {editing && (
        <ProcedureEditDialog
          procedure={editing}
          doctors={doctors}
          onSave={handleSave}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function ProcedureEditDialog({
  procedure,
  doctors,
  onSave,
  onClose,
}: {
  procedure: Procedure;
  doctors: { id: string; name: string }[];
  onSave: (p: Procedure) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Procedure>({ ...procedure });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  const toggleDoctor = (id: string) => {
    setForm((prev) => ({
      ...prev,
      doctorIds: prev.doctorIds.includes(id)
        ? prev.doctorIds.filter((x) => x !== id)
        : [...prev.doctorIds, id],
    }));
  }

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar procedimiento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Código</Label>
              <Input
                value={form.code}
                onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Categoría</Label>
              <Input
                value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Nombre</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>Descripción</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              rows={2}
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
            <Label>Doctores asignados (uno o más)</Label>
            <p className="text-xs text-muted-foreground">
              Solo estos doctores aparecerán al elegir este procedimiento en una cita. Vacío = todos.
            </p>
            <div className="flex flex-wrap gap-3 border rounded-md p-3 max-h-40 overflow-y-auto">
              {doctors.map((d) => (
                <label key={d.id} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={form.doctorIds.includes(d.id)}
                    onCheckedChange={() => toggleDoctor(d.id)}
                  />
                  <span className="text-sm">{d.name}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">Guardar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
