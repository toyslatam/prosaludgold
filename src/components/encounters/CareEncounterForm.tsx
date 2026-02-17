"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, ChevronsUpDown } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { VerticalKey } from "@/config/demos";
import type { EncounterFormConfig } from "@/config/encounters";
import { getEncounterFormConfig } from "@/config/encounters";
import type {
  CareEncounter,
  ProcedureItem,
  InventoryUsedItem,
  CareEncounterVerticalData,
  MedicalVerticalData,
} from "@/types/careEncounter";
import { getProcedures, getProcedureById } from "@/lib/agenda/procedures";
import { getSites } from "@/lib/agenda/sites";
import { getLocationsWithSiteNames } from "@/lib/agenda/locations";
import { getInventoryItems } from "@/lib/inventory/items";
import { PrescriptionSection } from "./PrescriptionSection";

type PatientOption = { id: string; name: string };
type DoctorOption = { id: string; name: string };

type CareEncounterPayload = Omit<CareEncounter, "id" | "createdAt" | "updatedAt">;

interface CareEncounterFormProps {
  vertical: VerticalKey;
  patients: PatientOption[];
  doctors: DoctorOption[];
  sites: { id: string; name: string }[];
  locations: { id: string; name: string; siteName: string; type: string }[];
  onSave: (payload: CareEncounterPayload) => void;
  onCancel: () => void;
}

function nextProcId(): string {
  return `p-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
function nextInvId(): string {
  return `i-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function CareEncounterForm({
  vertical,
  patients,
  doctors,
  sites,
  locations,
  onSave,
  onCancel,
}: CareEncounterFormProps) {
  const config = getEncounterFormConfig(vertical);
  const proceduresCatalog = getProcedures(vertical);
  const inventoryItems = useMemo(() => getInventoryItems(vertical), [vertical]);

  const [patientId, setPatientId] = useState("");
  const [professionalId, setProfessionalId] = useState("");
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState("09:00");
  const [siteId, setSiteId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [procedures, setProcedures] = useState<ProcedureItem[]>([]);
  const [inventoryUsed, setInventoryUsed] = useState<InventoryUsedItem[]>([]);
  const [clinicalNotes, setClinicalNotes] = useState("");
  const [verticalData, setVerticalData] = useState<CareEncounterVerticalData>({});
  const [saving, setSaving] = useState(false);
  const [openInvPopoverId, setOpenInvPopoverId] = useState<string | null>(null);

  const addProcedure = () => {
    setProcedures((prev) => [
      ...prev,
      { id: nextProcId(), procedureId: "", name: "", zone: undefined },
    ]);
  };
  const updateProcedure = (id: string, patch: Partial<ProcedureItem>) => {
    setProcedures((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };
  const removeProcedure = (id: string) => {
    setProcedures((prev) => prev.filter((p) => p.id !== id));
  };
  const addInventory = () => {
    setInventoryUsed((prev) => [...prev, { id: nextInvId(), name: "", quantity: 1, productId: undefined, unit: undefined }]);
  };
  const updateInventory = (id: string, patch: Partial<InventoryUsedItem>) => {
    setInventoryUsed((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  };
  const removeInventory = (id: string) => {
    setInventoryUsed((prev) => prev.filter((i) => i.id !== id));
  };

  const setMedicalData = (patch: Partial<MedicalVerticalData>) => {
    setVerticalData((prev) => ({
      ...prev,
      medical: { ...prev.medical, ...patch },
    }));
  };

  const validate = (asCompleted: boolean): boolean => {
    if (!patientId) {
      toast.error("Seleccione un paciente");
      return false;
    }
    if (!professionalId) {
      toast.error("Seleccione un profesional");
      return false;
    }
    const invList = getInventoryItems(vertical);
    for (const inv of inventoryUsed) {
      if (!inv.name?.trim()) continue;
      if (inv.quantity <= 0) {
        toast.error("La cantidad debe ser mayor a 0");
        return false;
      }
      if (inv.productId) {
        const item = invList.find((i) => i.id === inv.productId);
        if (item && inv.quantity > item.stock) {
          toast.error(`Stock insuficiente de "${inv.name}". Disponible: ${item.stock} ${item.unit}`);
          return false;
        }
      }
    }
    if (config.showPrescription && verticalData.medical?.prescription?.items?.length) {
      for (const item of verticalData.medical.prescription.items) {
        if (!item.medicationName?.trim()) {
          toast.error("Complete el nombre del medicamento en la receta");
          return false;
        }
        if (!item.frequency?.trim() && !item.instructions?.trim()) {
          toast.error("Indique frecuencia o indicaciones para cada medicamento");
          return false;
        }
      }
    }
    return true;
  };

  const hasInventoryOverStock = (): boolean => {
    const invList = getInventoryItems(vertical);
    return inventoryUsed.some((inv) => {
      if (!inv.productId || inv.quantity <= 0) return false;
      const item = invList.find((i) => i.id === inv.productId);
      return item ? inv.quantity > item.stock : false;
    });
  };

  const buildEncounter = (status: "DRAFT" | "COMPLETED"): CareEncounterPayload => {
    const startAt = `${startDate}T${startTime}:00`;
    const proceduresNormalized = procedures
      .filter((p) => p.procedureId || p.name)
      .map((p) => {
        const proc = p.procedureId ? getProcedureById(vertical, p.procedureId) : null;
        return {
          ...p,
          name: proc?.name ?? p.name,
        };
      });
    const inventoryNormalized = inventoryUsed
      .filter((i) => i.name.trim())
      .map((i) => ({
        ...i,
        productId: i.productId,
        name: i.name,
        quantity: i.quantity,
        unit: i.unit,
      }));

    return {
      vertical,
      patientId,
      professionalId,
      startAt,
      status,
      siteId: siteId || undefined,
      locationId: locationId || undefined,
      procedures: proceduresNormalized,
      inventoryUsed: inventoryNormalized,
      clinicalNotes: clinicalNotes.trim() || undefined,
      verticalData: Object.keys(verticalData).length ? verticalData : undefined,
    };
  };

  const handleSaveDraft = () => {
    if (!validate(false)) return;
    setSaving(true);
    try {
      const payload = buildEncounter("DRAFT");
      onSave(payload);
      toast.success("Borrador guardado");
    } finally {
      setSaving(false);
    }
  };

  const handleFinalize = () => {
    if (!validate(true)) return;
    setSaving(true);
    try {
      const payload = buildEncounter("COMPLETED");
      onSave(payload);
      toast.success("Atención finalizada");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">{config.title}</h1>
        <p className="text-muted-foreground text-sm">
          Complete los datos de la atención. Guarde como borrador o finalice.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Datos de la atención</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Paciente</Label>
              <Select value={patientId} onValueChange={setPatientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione paciente" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Profesional</Label>
              <Select value={professionalId} onValueChange={setProfessionalId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione profesional" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Fecha</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Hora</Label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
          </div>
          {sites.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Sede</Label>
                <Select value={siteId} onValueChange={setSiteId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Opcional" />
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
              <div className="space-y-2">
                <Label>Ubicación</Label>
                <Select value={locationId} onValueChange={setLocationId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Opcional" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((l) => (
                      <SelectItem key={l.id} value={l.id}>
                        {l.name} · {l.siteName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {config.showReasonForVisit && (
            <div className="space-y-2">
              <Label>Motivo de consulta</Label>
              <Input
                value={verticalData.medical?.reasonForVisit ?? ""}
                onChange={(e) => setMedicalData({ reasonForVisit: e.target.value })}
                placeholder="Ej. Control, dolor de cabeza"
              />
            </div>
          )}

          {config.showDiagnosis && (
            <div className="space-y-2">
              <Label>Diagnóstico</Label>
              <Input
                value={verticalData.medical?.diagnoses?.[0]?.text ?? ""}
                onChange={(e) =>
                  setMedicalData({
                    diagnoses: [{ id: "d1", text: e.target.value }],
                  })
                }
                placeholder="Diagnóstico principal (texto libre)"
              />
            </div>
          )}

          {config.showVitals && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <div className="space-y-2">
                <Label className="text-xs">PA</Label>
                <Input
                  placeholder="120/80"
                  value={verticalData.medical?.vitals?.bp ?? ""}
                  onChange={(e) =>
                    setMedicalData({
                      vitals: { ...verticalData.medical?.vitals, bp: e.target.value },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">FC</Label>
                <Input
                  type="number"
                  placeholder="72"
                  value={verticalData.medical?.vitals?.hr ?? ""}
                  onChange={(e) =>
                    setMedicalData({
                      vitals: {
                        ...verticalData.medical?.vitals,
                        hr: e.target.value ? Number(e.target.value) : undefined,
                      },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Temp °C</Label>
                <Input
                  type="number"
                  step={0.1}
                  placeholder="36.5"
                  value={verticalData.medical?.vitals?.temp ?? ""}
                  onChange={(e) =>
                    setMedicalData({
                      vitals: {
                        ...verticalData.medical?.vitals,
                        temp: e.target.value ? Number(e.target.value) : undefined,
                      },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Peso kg</Label>
                <Input
                  type="number"
                  step={0.1}
                  placeholder="70"
                  value={verticalData.medical?.vitals?.weight ?? ""}
                  onChange={(e) =>
                    setMedicalData({
                      vitals: {
                        ...verticalData.medical?.vitals,
                        weight: e.target.value ? Number(e.target.value) : undefined,
                      },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Talla cm</Label>
                <Input
                  type="number"
                  placeholder="170"
                  value={verticalData.medical?.vitals?.height ?? ""}
                  onChange={(e) =>
                    setMedicalData({
                      vitals: {
                        ...verticalData.medical?.vitals,
                        height: e.target.value ? Number(e.target.value) : undefined,
                      },
                    })
                  }
                />
              </div>
            </div>
          )}

          {config.showTherapist && (
            <div className="space-y-2">
              <Label>Terapeuta</Label>
              <Select
                value={verticalData.spa?.therapistId ?? ""}
                onValueChange={(v) =>
                  setVerticalData((prev) => ({
                    ...prev,
                    spa: { ...prev.spa, therapistId: v },
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione terapeuta" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {config.showCabin && (
            <div className="space-y-2">
              <Label>Cabina / Sala</Label>
              <Select
                value={verticalData.spa?.cabinLocationId ?? ""}
                onValueChange={(v) =>
                  setVerticalData((prev) => ({
                    ...prev,
                    spa: { ...prev.spa, cabinLocationId: v },
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione cabina" />
                </SelectTrigger>
                <SelectContent>
                  {locations.filter((l) => l.type.toLowerCase().includes("salón") || l.type.toLowerCase().includes("cabina")).length > 0
                    ? locations
                        .filter((l) => l.type.toLowerCase().includes("salón") || l.type.toLowerCase().includes("cabina"))
                        .map((l) => (
                          <SelectItem key={l.id} value={l.id}>
                            {l.name} · {l.siteName}
                          </SelectItem>
                        ))
                    : locations.map((l) => (
                        <SelectItem key={l.id} value={l.id}>
                          {l.name} · {l.siteName}
                        </SelectItem>
                      ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{config.proceduresLabel}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {procedures.map((proc) => (
            <div key={proc.id} className="flex gap-2 items-start flex-wrap">
              <Select
                value={proc.procedureId}
                onValueChange={(v) => {
                  const p = getProcedureById(vertical, v);
                  updateProcedure(proc.id, { procedureId: v, name: p?.name ?? "" });
                }}
              >
                <SelectTrigger className="flex-1 min-w-[180px]">
                  <SelectValue placeholder="Procedimiento / servicio" />
                </SelectTrigger>
                <SelectContent>
                  {proceduresCatalog.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {config.showProcedureZone && (
                <Input
                  placeholder="Pieza/zona (opc.)"
                  className="w-32"
                  value={proc.zone ?? ""}
                  onChange={(e) => updateProcedure(proc.id, { zone: e.target.value })}
                />
              )}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeProcedure(proc.id)}
                aria-label="Quitar"
              >
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addProcedure}>
            <Plus className="h-4 w-4 mr-1" />
            {config.proceduresAddLabel}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Inventario consumido</CardTitle>
          <p className="text-xs text-muted-foreground">Seleccione producto del inventario del vertical. El stock se descuenta al finalizar la atención.</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {inventoryUsed.map((inv) => {
            const selectedItem = inv.productId ? inventoryItems.find((i) => i.id === inv.productId) : null;
            const stockStatus = selectedItem
              ? selectedItem.stock <= selectedItem.minStock
                ? "Bajo stock"
                : "OK"
              : null;
            return (
              <div key={inv.id} className="flex gap-2 items-center flex-wrap">
                <Popover open={openInvPopoverId === inv.id} onOpenChange={(open) => setOpenInvPopoverId(open ? inv.id : null)}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "flex-1 min-w-[200px] justify-between font-normal",
                        !inv.name && "text-muted-foreground"
                      )}
                    >
                      {inv.name || "Buscar producto..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[360px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Buscar por nombre, categoría o proveedor..." />
                      <CommandList>
                        <CommandEmpty>Sin resultados.</CommandEmpty>
                        <CommandGroup>
                          {inventoryItems.map((item) => (
                            <CommandItem
                              key={item.id}
                              value={`${item.name} ${item.category} ${item.supplier}`}
                              onSelect={() => {
                                updateInventory(inv.id, {
                                  productId: item.id,
                                  name: item.name,
                                  unit: item.unit,
                                  quantity: 1,
                                });
                                setOpenInvPopoverId(null);
                              }}
                            >
                              <div className="flex flex-col gap-0.5 w-full">
                                <span className="font-medium">{item.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  Stock: {item.stock} {item.unit}
                                  {item.stock <= item.minStock ? (
                                    <span className="text-destructive ml-1">· Bajo stock</span>
                                  ) : (
                                    <span className="text-success ml-1">· OK</span>
                                  )}
                                </span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    min={1}
                    className="w-24"
                    value={inv.quantity}
                    onChange={(e) =>
                      updateInventory(inv.id, { quantity: Number(e.target.value) || 0 })
                    }
                  />
                  {selectedItem && (
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      / {selectedItem.stock} {selectedItem.unit}
                    </span>
                  )}
                </div>
                {stockStatus && (
                  <span className={cn(
                    "text-xs",
                    stockStatus === "Bajo stock" ? "text-destructive" : "text-muted-foreground"
                  )}>
                    {stockStatus}
                  </span>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeInventory(inv.id)}
                  aria-label="Quitar"
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            );
          })}
          <Button type="button" variant="outline" size="sm" onClick={addInventory}>
            <Plus className="h-4 w-4 mr-1" />
            Agregar producto
          </Button>
          {hasInventoryOverStock() && (
            <p className="text-sm text-destructive">La cantidad supera el stock en al menos un producto. Reduzca la cantidad o quite el ítem para poder finalizar.</p>
          )}
        </CardContent>
      </Card>

      {config.showPrescription && (
        <PrescriptionSection
          value={verticalData.medical?.prescription}
          onChange={(prescription) => setMedicalData({ prescription })}
          disabled={saving}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{config.notesLabel}</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Notas de la atención..."
            rows={4}
            value={clinicalNotes}
            onChange={(e) => setClinicalNotes(e.target.value)}
            className="resize-none"
          />
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={onCancel} disabled={saving}>
          Cancelar
        </Button>
        <Button variant="secondary" onClick={handleSaveDraft} disabled={saving}>
          Guardar borrador
        </Button>
        <Button onClick={handleFinalize} disabled={saving || hasInventoryOverStock()}>
          Finalizar
        </Button>
      </div>
    </div>
  );
}
