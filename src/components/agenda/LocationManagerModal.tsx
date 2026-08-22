"use client";

import { useState, useEffect } from "react";
import { getSites, type Site } from "@/lib/agenda/sites";
import {
  getLocationsWithSiteNames,
  createLocation,
  updateLocation,
  archiveLocation,
  unarchiveLocation,
  deleteLocation,
  LOCATION_TYPES,
  type LocationWithSiteName,
} from "@/lib/agenda/locations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Pencil, Trash2, Check, X, Archive, ArchiveRestore, Building2 } from "lucide-react";
import { toast } from "sonner";
import { SiteManagerModal } from "./SiteManagerModal";

const CUSTOM_TYPE = "__custom__";

export interface LocationManagerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locations: LocationWithSiteName[];
  onLocationsChange: () => void;
  appointmentCountByLocationId: (locationId: string) => number;
}

export function LocationManagerModal({
  open,
  onOpenChange,
  locations,
  onLocationsChange,
  appointmentCountByLocationId,
}: LocationManagerModalProps) {
  const [sitesKey, setSitesKey] = useState(0);
  const [sites, setSites] = useState<Site[]>([]);
  const [siteManagerOpen, setSiteManagerOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filterSiteId, setFilterSiteId] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [showArchived, setShowArchived] = useState(false);

  const [newSiteId, setNewSiteId] = useState("");
  const [newType, setNewType] = useState<string>(LOCATION_TYPES[0]);
  const [newTypeCustom, setNewTypeCustom] = useState("");
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [adding, setAdding] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState("");
  const [editTypeCustom, setEditTypeCustom] = useState("");
  const [editSiteId, setEditSiteId] = useState("");
  const [editDescription, setEditDescription] = useState<string | undefined>(undefined);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filtered, setFiltered] = useState<LocationWithSiteName[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!open) return;
    getSites()
      .then(setSites)
      .catch(() => toast.error("No se pudieron cargar las sedes."));
  }, [open, sitesKey]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    getLocationsWithSiteNames({
      q: search.trim() || undefined,
      siteId: filterSiteId === "all" ? undefined : filterSiteId,
      type: filterType === "all" ? undefined : filterType,
      includeInactive: showArchived,
    })
      .then((data) => {
        if (!cancelled) setFiltered(data);
      })
      .catch(() => {
        if (!cancelled) toast.error("No se pudieron cargar las ubicaciones.");
      });
    return () => {
      cancelled = true;
    };
  }, [open, locations, search, filterSiteId, filterType, showArchived, refreshKey]);

  const refresh = () => {
    setRefreshKey((k) => k + 1);
    onLocationsChange();
  };

  const resolveType = (type: string, custom: string) =>
    type === CUSTOM_TYPE ? custom.trim() || "Otro" : type;

  const handleAdd = () => {
    const siteId = newSiteId.trim();
    const name = newName.trim();
    const typeVal = resolveType(newType, newTypeCustom);
    if (!siteId) {
      toast.error("Seleccione una sede");
      return;
    }
    if (!name) {
      toast.error("Escriba el nombre de la ubicación");
      return;
    }
    if (!typeVal) {
      toast.error("Indique el tipo de ubicación");
      return;
    }
    setAdding(true);
    try {
      createLocation({
        name,
        type: typeVal,
        siteId,
        description: newDescription.trim() || undefined,
        isActive: true,
      });
      refresh();
      setNewName("");
      setNewDescription("");
      setNewType(LOCATION_TYPES[0]);
      setNewTypeCustom("");
      toast.success("Ubicación creada");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al crear");
    } finally {
      setAdding(false);
    }
  };

  const startEdit = (loc: LocationWithSiteName) => {
    setEditingId(loc.id);
    setEditName(loc.name);
    setEditType(LOCATION_TYPES.includes(loc.type as typeof LOCATION_TYPES[number]) ? loc.type : CUSTOM_TYPE);
    setEditTypeCustom(LOCATION_TYPES.includes(loc.type as typeof LOCATION_TYPES[number]) ? "" : loc.type);
    setEditSiteId(loc.siteId);
    setEditDescription(loc.description);
  };

  const saveEdit = () => {
    if (!editingId) return;
    const name = editName.trim();
    const typeVal = resolveType(editType, editTypeCustom);
    if (!name) {
      toast.error("El nombre es obligatorio");
      return;
    }
    if (!typeVal) {
      toast.error("El tipo es obligatorio");
      return;
    }
    try {
      updateLocation(editingId, {
        name,
        type: typeVal,
        siteId: editSiteId,
        description: editDescription,
      });
      refresh();
      setEditingId(null);
      toast.success("Ubicación actualizada");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al actualizar");
    }
  };

  const cancelEdit = () => setEditingId(null);

  const handleArchive = (id: string, isActive: boolean) => {
    if (isActive) archiveLocation(id);
    else unarchiveLocation(id);
    refresh();
    toast.success(isActive ? "Ubicación archivada" : "Ubicación activada");
  };

  const requestDelete = (id: string) => setDeletingId(id);
  const deletingLoc = deletingId ? locations.find((l) => l.id === deletingId) : null;
  const countInUse = deletingId ? appointmentCountByLocationId(deletingId) : 0;

  const confirmDelete = () => {
    if (!deletingId) return;
    if (countInUse > 0) {
      toast.error("No se puede eliminar: hay citas asignadas. Archive la ubicación en su lugar.");
      setDeletingId(null);
      return;
    }
    deleteLocation(deletingId);
    refresh();
    setDeletingId(null);
    toast.success("Ubicación eliminada");
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="max-h-[90vh] flex flex-col w-[calc(100vw-2rem)] max-w-[720px] p-0 gap-0 rounded-none sm:rounded-lg max-sm:left-0 max-sm:right-0 max-sm:bottom-0 max-sm:top-auto max-sm:translate-x-0 max-sm:translate-y-0 max-sm:w-full max-sm:max-h-[85vh]"
          aria-modal="true"
          role="dialog"
          aria-labelledby="location-manager-title"
        >
          <DialogHeader className="p-6 pb-4">
            <DialogTitle id="location-manager-title">Ubicaciones</DialogTitle>
          </DialogHeader>

          <div className="px-6 space-y-4 flex-shrink-0">
            <div className="flex flex-wrap gap-2 items-center">
              <Input
                placeholder="Buscar por nombre…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 min-w-[180px]"
                aria-label="Buscar ubicación"
              />
              <Select value={filterSiteId} onValueChange={setFilterSiteId}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Sede" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las sedes</SelectItem>
                  {sites.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => setSiteManagerOpen(true)}
                aria-label="Gestionar sedes"
              >
                <Building2 className="h-4 w-4" />
                Gestionar sedes
              </Button>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {LOCATION_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <label className="flex items-center gap-2 text-sm whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={showArchived}
                  onChange={(e) => setShowArchived(e.target.checked)}
                  className="rounded border-input"
                />
                Mostrar archivadas
              </label>
            </div>

            <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
              <p className="text-sm font-medium">Nueva ubicación</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Sede (requerido)</Label>
                  <Select value={newSiteId} onValueChange={setNewSiteId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione sede" />
                    </SelectTrigger>
                    <SelectContent>
                      {sites.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Tipo</Label>
                  <Select
                    value={newType}
                    onValueChange={(v) => {
                      setNewType(v);
                      if (v !== CUSTOM_TYPE) setNewTypeCustom("");
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LOCATION_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                      <SelectItem value={CUSTOM_TYPE}>Personalizado…</SelectItem>
                    </SelectContent>
                  </Select>
                  {newType === CUSTOM_TYPE && (
                    <Input
                      placeholder="Escriba el tipo"
                      value={newTypeCustom}
                      onChange={(e) => setNewTypeCustom(e.target.value)}
                      className="mt-1"
                    />
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 items-end">
                <div className="flex-1 min-w-[160px] space-y-1.5">
                  <Label>Nombre (requerido)</Label>
                  <Input
                    placeholder="Ej. Consultorio 3, Camilla A"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAdd())}
                  />
                </div>
                <div className="flex-1 min-w-[160px] space-y-1.5">
                  <Label>Descripción (opcional)</Label>
                  <Input
                    placeholder="Opcional"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                  />
                </div>
                <Button onClick={handleAdd} disabled={adding || !newName.trim() || !newSiteId}>
                  {adding ? "Agregando…" : "Agregar"}
                </Button>
              </div>
            </div>
          </div>

          <div className="px-6 pb-2 text-sm text-muted-foreground">
            Listado ({filtered.length})
          </div>
          <div className="px-6 flex-1 min-h-0 overflow-hidden">
            <ScrollArea className="h-[min(400px,42vh)] max-h-[420px] w-full">
              <div className="pb-4 pr-2">
                {filtered.length === 0 ? (
                  <p className="py-8 text-center text-muted-foreground text-sm">
                    No hay ubicaciones que coincidan.
                  </p>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 z-10 bg-background border-b">
                      <tr className="text-left text-muted-foreground">
                      <th className="py-2 font-medium">Nombre</th>
                      <th className="py-2 font-medium">Tipo</th>
                      <th className="py-2 font-medium">Sede</th>
                      <th className="py-2 font-medium">Estado</th>
                      <th className="py-2 font-medium w-[120px]">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((loc) => (
                      <tr key={loc.id} className="border-b">
                        {editingId === loc.id ? (
                          <>
                            <td className="py-2">
                              <Input
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="h-8"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") saveEdit();
                                  if (e.key === "Escape") cancelEdit();
                                }}
                              />
                            </td>
                            <td className="py-2">
                              <Select
                                value={editType}
                                onValueChange={(v) => {
                                  setEditType(v);
                                  if (v !== CUSTOM_TYPE) setEditTypeCustom("");
                                }}
                              >
                                <SelectTrigger className="h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {LOCATION_TYPES.map((t) => (
                                    <SelectItem key={t} value={t}>
                                      {t}
                                    </SelectItem>
                                  ))}
                                  <SelectItem value={CUSTOM_TYPE}>Otro</SelectItem>
                                </SelectContent>
                              </Select>
                              {editType === CUSTOM_TYPE && (
                                <Input
                                  value={editTypeCustom}
                                  onChange={(e) => setEditTypeCustom(e.target.value)}
                                  className="h-8 mt-1"
                                />
                              )}
                            </td>
                            <td className="py-2">
                              <Select value={editSiteId} onValueChange={setEditSiteId}>
                                <SelectTrigger className="h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {sites.map((s) => (
                                    <SelectItem key={s.id} value={s.id}>
                                      {s.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="py-2" />
                            <td className="py-2">
                              <Button size="icon" variant="ghost" onClick={saveEdit} aria-label="Guardar">
                                <Check className="h-4 w-4 text-green-600" />
                              </Button>
                              <Button size="icon" variant="ghost" onClick={cancelEdit} aria-label="Cancelar">
                                <X className="h-4 w-4" />
                              </Button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="py-2 font-medium">{loc.name}</td>
                            <td className="py-2">{loc.type}</td>
                            <td className="py-2">{loc.siteName}</td>
                            <td className="py-2">
                              <span
                                className={
                                  loc.isActive
                                    ? "text-green-600"
                                    : "text-muted-foreground"
                                }
                              >
                                {loc.isActive ? "Activa" : "Archivada"}
                              </span>
                            </td>
                            <td className="py-2">
                              <div className="flex items-center gap-1">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8"
                                  onClick={() => handleArchive(loc.id, loc.isActive)}
                                  aria-label={loc.isActive ? "Archivar" : "Activar"}
                                  title={loc.isActive ? "Archivar" : "Activar"}
                                >
                                  {loc.isActive ? (
                                    <Archive className="h-4 w-4" />
                                  ) : (
                                    <ArchiveRestore className="h-4 w-4" />
                                  )}
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8"
                                  onClick={() => startEdit(loc)}
                                  aria-label="Editar"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                  onClick={() => requestDelete(loc.id)}
                                  aria-label="Eliminar"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingId} onOpenChange={(o) => !o && setDeletingId(null)}>
        <AlertDialogContent role="alertdialog" aria-modal="true" aria-labelledby="delete-location-title">
          <AlertDialogHeader>
            <AlertDialogTitle id="delete-location-title">
              ¿Eliminar ubicación {deletingLoc?.name}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {countInUse > 0 ? (
                <>
                  Esta ubicación está asignada a <strong>{countInUse}</strong> cita(s). No se puede eliminar.
                  Use &quot;Archivar&quot; para ocultarla sin borrarla.
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

      <SiteManagerModal
        open={siteManagerOpen}
        onOpenChange={setSiteManagerOpen}
        onSitesChange={() => setSitesKey((k) => k + 1)}
      />
    </>
  );
}
