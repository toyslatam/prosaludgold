"use client";

import { useState, useMemo } from "react";
import { useDemo } from "@/contexts/DemoContext";
import type { VerticalKey } from "@/config/demos";
import { getProfessionalsConfig } from "@/config/professionals";
import { getProfessionals, updateProfessional } from "@/lib/professionals/repository";
import { getSpecialties } from "@/lib/professionals/specialties";
import { getSites, getSiteById } from "@/lib/agenda/sites";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SpecialtyManagerModal } from "@/components/professionals/SpecialtyManagerModal";
import { ProfessionalFormModal } from "@/components/professionals/ProfessionalFormModal";
import { Pencil, Archive, ArchiveRestore, Stethoscope } from "lucide-react";

const Doctores = () => {
  const { vertical } = useDemo();
  const v = vertical as VerticalKey;
  const config = getProfessionalsConfig(v);

  const [showNewModal, setShowNewModal] = useState(false);
  const [showSpecialtiesModal, setShowSpecialtiesModal] = useState(false);
  const [editingProfessional, setEditingProfessional] = useState<{ id: string } | null>(null);
  const [searchName, setSearchName] = useState("");
  const [filterSiteId, setFilterSiteId] = useState<string>("all");
  const [filterSpecialtyId, setFilterSpecialtyId] = useState<string>("all");
  const [filterActive, setFilterActive] = useState<string>("active");

  const [listKey, setListKey] = useState(0);
  const refreshList = () => {
    setEditingProfessional(null);
    setShowNewModal(false);
    setListKey((k) => k + 1);
  };

  const professionals = useMemo(
    () => getProfessionals(v, true),
    [v, listKey]
  );
  const specialties = useMemo(
    () => getSpecialties(v),
    [v, listKey, showSpecialtiesModal]
  );
  const sites = useMemo(() => getSites(), []);

  const filtered = useMemo(() => {
    let list = [...professionals];
    if (searchName.trim()) {
      const q = searchName.trim().toLowerCase();
      list = list.filter((p) => p.fullName.toLowerCase().includes(q));
    }
    if (filterSiteId !== "all") {
      list = list.filter((p) => p.siteIds?.includes(filterSiteId));
    }
    if (filterSpecialtyId !== "all") {
      list = list.filter((p) => p.specialtyId === filterSpecialtyId);
    }
    if (filterActive === "active") list = list.filter((p) => p.isActive);
    if (filterActive === "archived") list = list.filter((p) => !p.isActive);
    return list;
  }, [professionals, searchName, filterSiteId, filterSpecialtyId, filterActive]);

  const editing = editingProfessional
    ? professionals.find((p) => p.id === editingProfessional.id) ?? null
    : null;

  const handleToggleActive = (id: string) => {
    const p = professionals.find((x) => x.id === id);
    if (!p) return;
    updateProfessional(id, { isActive: !p.isActive });
    refreshList();
  };

  const getSpecialtyName = (specialtyId: string) =>
    specialties.find((s) => s.id === specialtyId)?.name ?? "—";
  const getSiteNames = (siteIds: string[]) =>
    siteIds.map((id) => getSiteById(id)?.name ?? id).join(", ") || "—";

  return (
    <div className="space-y-8">
      {/* Sección A: Profesionales */}
      <section aria-labelledby="professionals-heading">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <h1 id="professionals-heading" className="text-2xl font-bold">
              {config.sectionTitle}
            </h1>
            <p className="text-muted-foreground text-sm">
              Gestión de profesionales y especialidades
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setShowNewModal(true)}>
              {config.newButtonLabel}
            </Button>
            <Button variant="secondary" onClick={() => setShowSpecialtiesModal(true)}>
              {config.specialtiesButtonLabel}
            </Button>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[180px] space-y-1.5">
              <Label htmlFor="search-name" className="sr-only">
                Buscar por nombre
              </Label>
              <Input
                id="search-name"
                placeholder="Buscar por nombre…"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
              />
            </div>
            <div className="w-[160px] space-y-1.5">
              <Label htmlFor="filter-site" className="sr-only">
                Sede
              </Label>
              <Select value={filterSiteId} onValueChange={setFilterSiteId}>
                <SelectTrigger id="filter-site">
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
            </div>
            <div className="w-[180px] space-y-1.5">
              <Label htmlFor="filter-specialty" className="sr-only">
                Especialidad
              </Label>
              <Select value={filterSpecialtyId} onValueChange={setFilterSpecialtyId}>
                <SelectTrigger id="filter-specialty">
                  <SelectValue placeholder="Especialidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {specialties.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-[140px] space-y-1.5">
              <Label htmlFor="filter-active" className="sr-only">
                Estado
              </Label>
              <Select value={filterActive} onValueChange={setFilterActive}>
                <SelectTrigger id="filter-active">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Activos</SelectItem>
                  <SelectItem value="archived">Archivados</SelectItem>
                  <SelectItem value="all">Todos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((doc) => (
            <div
              key={doc.id}
              className="bg-card rounded-xl p-5 border border-border shadow-card flex flex-col"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Stethoscope className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-sm truncate">{doc.fullName}</h3>
                  <p className="text-xs text-muted-foreground truncate">
                    {getSpecialtyName(doc.specialtyId)}
                  </p>
                </div>
              </div>
              <div className="text-xs text-muted-foreground mb-2">
                {getSiteNames(doc.siteIds ?? [])}
              </div>
              <div className="flex items-center justify-between mt-auto flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant={doc.isAvailable ? "default" : "secondary"} className="text-xs">
                    {doc.isAvailable ? config.availableLabel : config.unavailableLabel}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {config.commissionLabel}:{" "}
                    {doc.commissionDefault.type === "PERCENT"
                      ? `${doc.commissionDefault.value}%`
                      : `$${doc.commissionDefault.value}`}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => setEditingProfessional({ id: doc.id })}
                    aria-label="Editar"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => handleToggleActive(doc.id)}
                    aria-label={doc.isActive ? "Archivar" : "Activar"}
                  >
                    {doc.isActive ? (
                      <Archive className="h-4 w-4" />
                    ) : (
                      <ArchiveRestore className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-8 text-sm">
            No hay profesionales que coincidan con los filtros.
          </p>
        )}
      </section>

      {/* Sección B: Roles y usuarios */}
      <section aria-labelledby="roles-heading" className="border-t pt-8">
        <h2 id="roles-heading" className="font-semibold mb-1">
          Roles y usuarios
        </h2>
        <p className="text-muted-foreground text-sm mb-4">
          Gestión de accesos y permisos
        </p>
        <div className="bg-card rounded-xl border border-border shadow-card p-5">
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {["Administrador", "Recepción", "Doctor", "Caja", "Inventario"].map((role) => (
              <div key={role} className="p-3 border border-border rounded-lg text-center">
                <p className="font-medium text-sm">{role}</p>
                <p className="text-xs text-muted-foreground mt-1">Permisos configurables</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SpecialtyManagerModal
        open={showSpecialtiesModal}
        onOpenChange={setShowSpecialtiesModal}
        vertical={v}
        onChanged={refreshList}
      />

      <ProfessionalFormModal
        open={showNewModal || !!editingProfessional}
        onOpenChange={(open) => {
          if (!open) {
            setShowNewModal(false);
            setEditingProfessional(null);
          }
        }}
        vertical={v}
        professional={editing}
        specialties={specialties}
        sites={sites}
        onSave={refreshList}
        onOpenSpecialties={() => {
          setShowNewModal(false);
          setEditingProfessional(null);
          setShowSpecialtiesModal(true);
        }}
      />
    </div>
  );
};

export default Doctores;
