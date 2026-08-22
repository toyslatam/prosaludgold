"use client";

import { useState, useMemo } from "react";
import {
  getSpecialties,
  createSpecialty,
  updateSpecialty,
  deleteSpecialty,
} from "@/lib/professionals/specialties";
import { getProfessionals } from "@/lib/professionals/repository";
import type { Specialty } from "@/types/professionals";
type CountUsageFn = (specialty: Specialty) => number;
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
import { Pencil, Trash2, Check, X, Archive, ArchiveRestore } from "lucide-react";
import { toast } from "sonner";

export interface SpecialtyManagerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vertical: VerticalKey;
  onChanged?: () => void;
  /** Cuenta profesionales usando una especialidad; por defecto usa el módulo local (legacy) de profesionales. */
  countUsage?: CountUsageFn;
}

function countProfessionalsBySpecialty(vertical: VerticalKey, specialtyId: string): number {
  return getProfessionals(vertical, true).filter((p) => p.specialtyId === specialtyId).length;
}

export function SpecialtyManagerModal({
  open,
  onOpenChange,
  vertical,
  onChanged,
  countUsage,
}: SpecialtyManagerModalProps) {
  const [search, setSearch] = useState("");
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const specialties = useMemo(
    () => getSpecialties(vertical, true),
    [vertical, open, refreshKey]
  );

  const refresh = () => {
    setRefreshKey((k) => k + 1);
    onChanged?.();
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [...specialties].sort((a, b) => a.name.localeCompare(b.name));
    return [...specialties]
      .filter((s) => s.name.toLowerCase().includes(q))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [specialties, search]);

  const handleAdd = () => {
    const name = newName.trim();
    if (!name) {
      toast.error("Escriba el nombre de la especialidad");
      return;
    }
    if (specialties.some((s) => s.name.toLowerCase() === name.toLowerCase())) {
      toast.error("Ya existe una especialidad con ese nombre");
      return;
    }
    setAdding(true);
    try {
      createSpecialty({ vertical, name, isActive: true });
      refresh();
      setNewName("");
      toast.success("Especialidad agregada");
    } finally {
      setAdding(false);
    }
  };

  const startEdit = (s: Specialty) => {
    setEditingId(s.id);
    setEditName(s.name);
  };

  const saveEdit = () => {
    if (!editingId) return;
    const name = editName.trim();
    if (!name) {
      toast.error("El nombre es obligatorio");
      return;
    }
    const other = specialties.filter((x) => x.id !== editingId);
    if (other.some((s) => s.name.toLowerCase() === name.toLowerCase())) {
      toast.error("Ya existe una especialidad con ese nombre");
      return;
    }
    updateSpecialty(editingId, { name });
    refresh();
    setEditingId(null);
    toast.success("Especialidad actualizada");
  };

  const cancelEdit = () => setEditingId(null);

  const toggleActive = (s: Specialty) => {
    updateSpecialty(s.id, { isActive: !s.isActive });
    refresh();
    toast.success(s.isActive ? "Especialidad archivada" : "Especialidad activada");
  };

  const requestDelete = (id: string) => setDeletingId(id);

  const confirmDelete = () => {
    if (!deletingId) return;
    const deletingSpecialty = specialties.find((s) => s.id === deletingId);
    const count = countUsage && deletingSpecialty
      ? countUsage(deletingSpecialty)
      : countProfessionalsBySpecialty(vertical, deletingId);
    if (count > 0) {
      toast.error("Hay profesionales con esta especialidad. Archívela en lugar de eliminar.");
      setDeletingId(null);
      return;
    }
    deleteSpecialty(deletingId);
    refresh();
    setDeletingId(null);
    toast.success("Especialidad eliminada");
  };

  const deletingSpec = deletingId ? specialties.find((s) => s.id === deletingId) : null;
  const professionalsUsing = deletingSpec
    ? (countUsage ? countUsage(deletingSpec) : countProfessionalsBySpecialty(vertical, deletingSpec.id))
    : 0;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="max-h-[90vh] flex flex-col w-[calc(100vw-2rem)] max-w-[720px] p-0 gap-0 rounded-none sm:rounded-lg"
          aria-modal="true"
          role="dialog"
          aria-labelledby="specialty-manager-title"
        >
          <DialogHeader className="p-6 pb-4">
            <DialogTitle id="specialty-manager-title">Especialidades</DialogTitle>
          </DialogHeader>

          <div className="px-6 space-y-4 flex-shrink-0">
            <div>
              <Label htmlFor="specialty-search" className="sr-only">
                Buscar especialidad
              </Label>
              <Input
                id="specialty-search"
                placeholder="Buscar especialidad…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full"
                aria-label="Buscar especialidad"
              />
            </div>

            <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
              <p className="text-sm font-medium">Nueva especialidad</p>
              <div className="flex flex-wrap gap-3 items-end">
                <div className="flex-1 min-w-[160px] space-y-1.5">
                  <Label htmlFor="new-specialty-name">Nombre</Label>
                  <Input
                    id="new-specialty-name"
                    placeholder="Nombre de la especialidad"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAdd())}
                    aria-required="true"
                  />
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
            <ul className="space-y-1 pb-4 pr-2" role="list" aria-label="Lista de especialidades">
              {filtered.length === 0 ? (
                <li className="py-8 text-center text-muted-foreground text-sm">
                  {search.trim()
                    ? "No hay especialidades que coincidan con la búsqueda."
                    : "No hay especialidades."}
                </li>
              ) : (
                filtered.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center gap-3 rounded-md border bg-background px-3 py-2 group"
                  >
                    {editingId === s.id ? (
                      <>
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="flex-1 h-9"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveEdit();
                            if (e.key === "Escape") cancelEdit();
                          }}
                          aria-label="Nombre de la especialidad"
                        />
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={saveEdit}
                            aria-label="Guardar"
                          >
                            <Check className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={cancelEdit}
                            aria-label="Cancelar"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 font-medium">{s.name}</span>
                        {!s.isActive && (
                          <span className="text-xs text-muted-foreground">Archivada</span>
                        )}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100">
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => toggleActive(s)}
                            aria-label={s.isActive ? "Archivar" : "Activar"}
                          >
                            {s.isActive ? (
                              <Archive className="h-4 w-4" />
                            ) : (
                              <ArchiveRestore className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => startEdit(s)}
                            aria-label={`Editar ${s.name}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => requestDelete(s.id)}
                            aria-label={`Eliminar ${s.name}`}
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
        <AlertDialogContent
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="delete-specialty-title"
        >
          <AlertDialogHeader>
            <AlertDialogTitle id="delete-specialty-title">
              ¿Eliminar especialidad {deletingSpec?.name}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {professionalsUsing > 0 ? (
                <>
                  Esta especialidad está asignada a <strong>{professionalsUsing}</strong>{" "}
                  profesional(es). No se puede eliminar. Sugerencia: archívela en lugar de
                  eliminarla.
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
              disabled={professionalsUsing > 0}
              className={professionalsUsing > 0 ? "opacity-50" : ""}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
