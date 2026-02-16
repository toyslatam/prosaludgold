"use client";

import { useState, useMemo } from "react";
import {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  type ProcedureCategory,
} from "@/lib/agenda/procedureCategories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { toast } from "sonner";

function hexIsLight(hex: string): boolean {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 0xff;
  const g = (n >> 8) & 0xff;
  const b = n & 0xff;
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq > 180;
}

export interface CategoryManagerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: ProcedureCategory[];
  onCategoriesChange: () => void;
  procedureCountByCategory: (categoryName: string) => number;
}

export function CategoryManagerModal({
  open,
  onOpenChange,
  categories,
  onCategoriesChange,
  procedureCountByCategory,
}: CategoryManagerModalProps) {
  const [search, setSearch] = useState("");
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("#6b7280");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [...categories].sort((a, b) => a.name.localeCompare(b.name));
    return [...categories]
      .filter((c) => c.name.toLowerCase().includes(q))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [categories, search]);

  const handleAdd = () => {
    const name = newName.trim();
    if (!name) {
      toast.error("Escriba el nombre de la categoría");
      return;
    }
    if (categories.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      toast.error("Ya existe una categoría con ese nombre");
      return;
    }
    setAdding(true);
    try {
      addCategory(name, newColor);
      onCategoriesChange();
      setNewName("");
      setNewColor("#6b7280");
      toast.success("Categoría agregada");
    } finally {
      setAdding(false);
    }
  };

  const startEdit = (c: ProcedureCategory) => {
    setEditingId(c.id);
    setEditName(c.name);
    setEditColor(c.color);
  };

  const saveEdit = () => {
    if (!editingId) return;
    const name = editName.trim();
    if (!name) {
      toast.error("El nombre es obligatorio");
      return;
    }
    const other = categories.filter((x) => x.id !== editingId);
    if (other.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      toast.error("Ya existe una categoría con ese nombre");
      return;
    }
    updateCategory(editingId, { name, color: editColor });
    onCategoriesChange();
    setEditingId(null);
    toast.success("Categoría actualizada");
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const requestDelete = (id: string) => setDeletingId(id);

  const confirmDelete = () => {
    if (!deletingId) return;
    const cat = categories.find((c) => c.id === deletingId);
    if (cat && procedureCountByCategory(cat.name) > 0) {
      toast.error("Hay procedimientos con esta categoría. Cámbielos antes de eliminar.");
      setDeletingId(null);
      return;
    }
    deleteCategory(deletingId);
    onCategoriesChange();
    setDeletingId(null);
    toast.success("Categoría eliminada");
  };

  const deletingCategory = deletingId ? categories.find((c) => c.id === deletingId) : null;
  const proceduresUsing = deletingCategory ? procedureCountByCategory(deletingCategory.name) : 0;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="max-h-[90vh] flex flex-col w-[calc(100vw-2rem)] max-w-[720px] p-0 gap-0 rounded-none sm:rounded-lg max-sm:left-0 max-sm:right-0 max-sm:bottom-0 max-sm:top-auto max-sm:translate-x-0 max-sm:translate-y-0 max-sm:w-full max-sm:max-h-[85vh] data-[state=open]:slide-in-from-bottom-[48%] sm:data-[state=open]:slide-in-from-top-[48%]"
          aria-modal="true"
          role="dialog"
          aria-labelledby="category-manager-title"
        >
          <DialogHeader className="p-6 pb-4">
            <DialogTitle id="category-manager-title">Categorías</DialogTitle>
          </DialogHeader>

          <div className="px-6 space-y-4 flex-shrink-0">
            <div>
              <Label htmlFor="category-search" className="sr-only">
                Buscar categoría
              </Label>
              <Input
                id="category-search"
                placeholder="Buscar categoría…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full"
                aria-label="Buscar categoría"
              />
            </div>

            <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
              <p className="text-sm font-medium">Nueva categoría</p>
              <div className="flex flex-wrap gap-3 items-end">
                <div className="flex-1 min-w-[160px] space-y-1.5">
                  <Label htmlFor="new-category-name">Nombre</Label>
                  <Input
                    id="new-category-name"
                    placeholder="Nombre de la categoría"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAdd())}
                    aria-required="true"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      className="w-10 h-10 rounded border border-border cursor-pointer bg-background"
                      value={newColor}
                      onChange={(e) => setNewColor(e.target.value)}
                      aria-label="Color de la categoría"
                    />
                    <Input
                      type="text"
                      className="w-24 font-mono text-sm"
                      value={newColor}
                      onChange={(e) => setNewColor(e.target.value)}
                      aria-label="Código de color"
                    />
                  </div>
                </div>
                <Button type="button" onClick={handleAdd} disabled={adding || !newName.trim()}>
                  {adding ? "Agregando…" : "Agregar"}
                </Button>
              </div>
            </div>
          </div>

          <div className="px-6 pb-2 text-sm text-muted-foreground">
            Listado ({filtered.length})
          </div>
          <ScrollArea className="flex-1 min-h-0 px-6" style={{ height: "min(450px, 40vh)" }}>
            <ul
              className="space-y-1 pb-4 pr-2"
              role="list"
              aria-label="Lista de categorías"
            >
              {filtered.length === 0 ? (
                <li className="py-8 text-center text-muted-foreground text-sm">
                  {search.trim() ? "No hay categorías que coincidan con la búsqueda." : "No hay categorías."}
                </li>
              ) : (
                filtered.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-center gap-3 rounded-md border bg-background px-3 py-2 group"
                  >
                    {editingId === c.id ? (
                      <>
                        <span
                          className="w-6 h-6 rounded-full shrink-0 border border-border"
                          style={{ backgroundColor: editColor }}
                          aria-hidden
                        />
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="flex-1 h-9"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveEdit();
                            if (e.key === "Escape") cancelEdit();
                          }}
                          aria-label="Nombre de la categoría"
                        />
                        <div className="flex items-center gap-1">
                          <input
                            type="color"
                            className="w-8 h-8 rounded border border-border cursor-pointer"
                            value={editColor}
                            onChange={(e) => setEditColor(e.target.value)}
                            aria-label="Color"
                          />
                          <Button type="button" size="icon" variant="ghost" onClick={saveEdit} aria-label="Guardar">
                            <Check className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button type="button" size="icon" variant="ghost" onClick={cancelEdit} aria-label="Cancelar">
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <span
                          className="w-5 h-5 rounded-full shrink-0 border border-border"
                          style={{
                            backgroundColor: c.color,
                            borderColor: hexIsLight(c.color) ? "var(--border)" : "transparent",
                          }}
                          aria-hidden
                        />
                        <span className="flex-1 font-medium">{c.name}</span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100">
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => startEdit(c)}
                            aria-label={`Editar ${c.name}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => requestDelete(c.id)}
                            aria-label={`Eliminar ${c.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </>
                    )}
                  </li>
                ))
              )}
            </ul>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingId} onOpenChange={(o) => !o && setDeletingId(null)}>
        <AlertDialogContent role="alertdialog" aria-modal="true" aria-labelledby="delete-category-title">
          <AlertDialogHeader>
            <AlertDialogTitle id="delete-category-title">
              ¿Eliminar categoría {deletingCategory?.name}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {proceduresUsing > 0 ? (
                <>
                  Esta categoría está asignada a <strong>{proceduresUsing}</strong> procedimiento(s). Debe cambiar
                  la categoría de esos procedimientos antes de poder eliminar esta categoría.
                </>
              ) : (
                "Esta acción no se puede deshacer."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={proceduresUsing > 0}
              className={proceduresUsing > 0 ? "opacity-50" : ""}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
