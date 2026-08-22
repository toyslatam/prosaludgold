"use client";

import { useState, useMemo } from "react";
import {
  getLookups,
  createLookup,
  updateLookup,
  deleteLookup,
  getLookupLabel,
  type InventoryLookup,
  type LookupKind,
} from "@/lib/inventory/lookups";
import type { VerticalKey } from "@/config/demos";
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
import { Pencil, Trash2, Check, X, Archive, ArchiveRestore } from "lucide-react";
import { toast } from "sonner";

export interface LookupManagerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vertical: VerticalKey;
  kind: LookupKind;
  onChanged?: () => void;
}

export function LookupManagerModal({ open, onOpenChange, vertical, kind, onChanged }: LookupManagerModalProps) {
  const label = getLookupLabel(kind);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const items = useMemo(
    () => getLookups(vertical, kind, true),
    [vertical, kind, open, refreshKey]
  );

  const refresh = () => {
    setRefreshKey((k) => k + 1);
    onChanged?.();
  };

  const handleAdd = () => {
    const name = newName.trim();
    if (!name) {
      toast.error(`Escriba el nombre de la ${label.toLowerCase()}`);
      return;
    }
    if (items.some((i) => i.name.toLowerCase() === name.toLowerCase())) {
      toast.error(`Ya existe una ${label.toLowerCase()} con ese nombre`);
      return;
    }
    setAdding(true);
    try {
      createLookup(vertical, kind, name);
      refresh();
      setNewName("");
      toast.success(`${label} agregada`);
    } finally {
      setAdding(false);
    }
  };

  const startEdit = (item: InventoryLookup) => {
    setEditingId(item.id);
    setEditName(item.name);
  };

  const saveEdit = () => {
    if (!editingId) return;
    const name = editName.trim();
    if (!name) {
      toast.error("El nombre es obligatorio");
      return;
    }
    updateLookup(editingId, { name });
    refresh();
    setEditingId(null);
    toast.success(`${label} actualizada`);
  };

  const cancelEdit = () => setEditingId(null);

  const toggleActive = (item: InventoryLookup) => {
    updateLookup(item.id, { isActive: !item.isActive });
    refresh();
  };

  const requestDelete = (id: string) => setDeletingId(id);
  const confirmDelete = () => {
    if (!deletingId) return;
    deleteLookup(deletingId);
    refresh();
    setDeletingId(null);
    toast.success(`${label} eliminada`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90vh] flex flex-col w-[calc(100vw-2rem)] max-w-[520px] p-0 gap-0 rounded-none sm:rounded-lg"
        aria-modal="true"
        role="dialog"
        aria-labelledby="lookup-manager-title"
      >
        <DialogHeader className="p-6 pb-4">
          <DialogTitle id="lookup-manager-title">{label}s</DialogTitle>
        </DialogHeader>

        <div className="px-6 space-y-4 flex-shrink-0">
          <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
            <p className="text-sm font-medium">Nueva {label.toLowerCase()}</p>
            <div className="flex gap-2">
              <Input
                placeholder={`Nombre de la ${label.toLowerCase()}`}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAdd())}
              />
              <Button onClick={handleAdd} disabled={adding || !newName.trim()}>
                {adding ? "Agregando…" : "Agregar"}
              </Button>
            </div>
          </div>
        </div>

        <div className="px-6 pb-2 text-sm text-muted-foreground">Listado ({items.length})</div>
        <ScrollArea className="flex-1 min-h-0 px-6" style={{ height: "min(320px, 40vh)" }}>
          <ul className="space-y-1 pb-4 pr-2" role="list">
            {items.length === 0 ? (
              <li className="py-6 text-center text-muted-foreground text-sm">
                No hay {label.toLowerCase()}s. Agregue una arriba.
              </li>
            ) : (
              items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-3 rounded-md border bg-background px-3 py-2 group"
                >
                  {editingId === item.id ? (
                    <>
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 h-9"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEdit();
                          if (e.key === "Escape") cancelEdit();
                        }}
                      />
                      <Button size="icon" variant="ghost" onClick={saveEdit} aria-label="Guardar">
                        <Check className="h-4 w-4 text-green-600" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={cancelEdit} aria-label="Cancelar">
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 font-medium">{item.name}</span>
                      {!item.isActive && <span className="text-xs text-muted-foreground">Archivada</span>}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => toggleActive(item)}
                          aria-label={item.isActive ? "Archivar" : "Activar"}
                        >
                          {item.isActive ? <Archive className="h-4 w-4" /> : <ArchiveRestore className="h-4 w-4" />}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => startEdit(item)}
                          aria-label={`Editar ${item.name}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => requestDelete(item.id)}
                          aria-label={`Eliminar ${item.name}`}
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

        {deletingId && (
          <div className="p-4 border-t bg-muted/30 flex items-center justify-between gap-3">
            <p className="text-sm">¿Eliminar esta {label.toLowerCase()}?</p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setDeletingId(null)}>
                Cancelar
              </Button>
              <Button size="sm" variant="destructive" onClick={confirmDelete}>
                Eliminar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
