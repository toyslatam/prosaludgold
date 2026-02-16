"use client";

import { useState } from "react";
import {
  getSites,
  addSite,
  updateSite,
  deleteSite,
  type Site,
} from "@/lib/agenda/sites";
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

export interface SiteManagerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSitesChange: () => void;
  locationCountBySiteId: (siteId: string) => number;
}

export function SiteManagerModal({
  open,
  onOpenChange,
  onSitesChange,
  locationCountBySiteId,
}: SiteManagerModalProps) {
  const [sites, setSites] = useState<Site[]>(() => getSites());
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const refreshSites = () => {
    setSites(getSites());
  };

  const handleAdd = () => {
    const name = newName.trim();
    if (!name) {
      toast.error("Escriba el nombre de la sede");
      return;
    }
    if (sites.some((s) => s.name.toLowerCase() === name.toLowerCase())) {
      toast.error("Ya existe una sede con ese nombre");
      return;
    }
    setAdding(true);
    try {
      addSite(name);
      refreshSites();
      onSitesChange();
      setNewName("");
      toast.success("Sede agregada");
    } finally {
      setAdding(false);
    }
  };

  const startEdit = (site: Site) => {
    setEditingId(site.id);
    setEditName(site.name);
  };

  const saveEdit = () => {
    if (!editingId) return;
    const name = editName.trim();
    if (!name) {
      toast.error("El nombre es obligatorio");
      return;
    }
    const other = sites.filter((s) => s.id !== editingId);
    if (other.some((s) => s.name.toLowerCase() === name.toLowerCase())) {
      toast.error("Ya existe una sede con ese nombre");
      return;
    }
    updateSite(editingId, { name });
    refreshSites();
    onSitesChange();
    setEditingId(null);
    toast.success("Sede actualizada");
  };

  const cancelEdit = () => setEditingId(null);

  const requestDelete = (id: string) => setDeletingId(id);
  const deletingSite = deletingId ? sites.find((s) => s.id === deletingId) : null;
  const countInUse = deletingId ? locationCountBySiteId(deletingId) : 0;

  const confirmDelete = () => {
    if (!deletingId) return;
    if (countInUse > 0) {
      toast.error(
        "Hay ubicaciones asignadas a esta sede. Cambie o elimine esas ubicaciones antes de eliminar la sede."
      );
      setDeletingId(null);
      return;
    }
    deleteSite(deletingId);
    refreshSites();
    onSitesChange();
    setDeletingId(null);
    toast.success("Sede eliminada");
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      refreshSites();
    }
    onOpenChange(next);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          className="max-h-[90vh] flex flex-col w-[calc(100vw-2rem)] max-w-[480px] p-0 gap-0 rounded-none sm:rounded-lg"
          aria-modal="true"
          role="dialog"
          aria-labelledby="site-manager-title"
        >
          <DialogHeader className="p-6 pb-4">
            <DialogTitle id="site-manager-title">Sedes</DialogTitle>
          </DialogHeader>

          <div className="px-6 space-y-4 flex-shrink-0">
            <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
              <p className="text-sm font-medium">Nueva sede</p>
              <div className="flex gap-2">
                <div className="flex-1 space-y-1.5">
                  <Label htmlFor="new-site-name" className="sr-only">
                    Nombre de la sede
                  </Label>
                  <Input
                    id="new-site-name"
                    placeholder="Ej. Sede Central, Sucursal Norte"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAdd())}
                  />
                </div>
                <Button onClick={handleAdd} disabled={adding || !newName.trim()}>
                  {adding ? "Agregando…" : "Agregar"}
                </Button>
              </div>
            </div>
          </div>

          <div className="px-6 pb-2 text-sm text-muted-foreground">
            Listado ({sites.length})
          </div>
          <ScrollArea className="flex-1 min-h-0 px-6" style={{ height: "min(280px, 40vh)" }}>
            <ul className="space-y-1 pb-4 pr-2" role="list" aria-label="Lista de sedes">
              {sites.length === 0 ? (
                <li className="py-6 text-center text-muted-foreground text-sm">
                  No hay sedes. Agregue una arriba.
                </li>
              ) : (
                sites.map((site) => (
                  <li
                    key={site.id}
                    className="flex items-center gap-3 rounded-md border bg-background px-3 py-2 group"
                  >
                    {editingId === site.id ? (
                      <>
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="flex-1 h-9"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveEdit();
                            if (e.key === "Escape") cancelEdit();
                          }}
                          aria-label="Nombre de la sede"
                        />
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
                      </>
                    ) : (
                      <>
                        <span className="flex-1 font-medium">{site.name}</span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100">
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => startEdit(site)}
                            aria-label={`Editar ${site.name}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => requestDelete(site.id)}
                            aria-label={`Eliminar ${site.name}`}
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
          aria-labelledby="delete-site-title"
        >
          <AlertDialogHeader>
            <AlertDialogTitle id="delete-site-title">
              ¿Eliminar sede {deletingSite?.name}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {countInUse > 0 ? (
                <>
                  Esta sede tiene <strong>{countInUse}</strong> ubicación(es) asignada(s). Debe
                  cambiar o eliminar esas ubicaciones antes de poder eliminar la sede.
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
              disabled={countInUse > 0}
              className={countInUse > 0 ? "opacity-50" : ""}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
