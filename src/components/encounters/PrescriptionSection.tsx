"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Plus, Trash2, ChevronsUpDown, FileText } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { MedicalPrescription, MedicalPrescriptionItem } from "@/types/careEncounter";
import { getMedications } from "@/lib/encounters/medications";

function nextItemId(): string {
  return `rx-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

interface PrescriptionSectionProps {
  value: MedicalPrescription | undefined;
  onChange: (v: MedicalPrescription) => void;
  disabled?: boolean;
}

export function PrescriptionSection({ value, onChange, disabled }: PrescriptionSectionProps) {
  const medications = useMemo(() => getMedications(), []);
  const items = value?.items ?? [];
  const generalInstructions = value?.generalInstructions ?? "";

  const addItem = () => {
    onChange({
      items: [...items, { id: nextItemId(), medicationName: "" }],
      generalInstructions,
    });
  };

  const updateItem = (id: string, patch: Partial<MedicalPrescriptionItem>) => {
    onChange({
      items: items.map((i) => (i.id === id ? { ...i, ...patch } : i)),
      generalInstructions,
    });
  };

  const removeItem = (id: string) => {
    onChange({
      items: items.filter((i) => i.id !== id),
      generalInstructions,
    });
  };

  const setGeneralInstructions = (v: string) => {
    onChange({ items, generalInstructions: v });
  };

  return (
    <Accordion type="single" collapsible defaultValue="receta" className="w-full">
      <AccordionItem value="receta" className="border rounded-xl px-4">
        <AccordionTrigger className="hover:no-underline py-4">
          <span className="font-semibold">Receta</span>
          {items.length > 0 && (
            <span className="text-muted-foreground font-normal text-sm ml-2">
              ({items.length} medicamento{items.length !== 1 ? "s" : ""})
            </span>
          )}
        </AccordionTrigger>
        <AccordionContent className="pb-4 space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Opcional. Agregue medicamentos e indicaciones.
            </p>
            <Button type="button" variant="outline" size="sm" onClick={addItem} disabled={disabled}>
              <Plus className="h-4 w-4 mr-1" />
              Agregar medicamento
            </Button>
          </div>

          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 border border-dashed rounded-lg text-center">
              Sin medicamentos. Use el botón para agregar.
            </p>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <MedicationRow
                  key={item.id}
                  item={item}
                  medications={medications}
                  onUpdate={(patch) => updateItem(item.id, patch)}
                  onRemove={() => removeItem(item.id)}
                  disabled={disabled}
                />
              ))}
            </div>
          )}

          <div className="space-y-2">
            <Label>Indicaciones generales</Label>
            <Textarea
              placeholder="Ej. Tomar con alimentos. Evitar alcohol."
              value={generalInstructions}
              onChange={(e) => setGeneralInstructions(e.target.value)}
              rows={2}
              disabled={disabled}
              className="resize-none"
            />
          </div>

          <div className="pt-2 border-t">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-block">
                    <Button type="button" variant="outline" size="sm" disabled>
                      <FileText className="h-4 w-4 mr-1" />
                      Imprimir / Generar PDF
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Próximamente</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

function MedicationRow({
  item,
  medications,
  onUpdate,
  onRemove,
  disabled,
}: {
  item: MedicalPrescriptionItem;
  medications: { id: string; name: string; presentation?: string }[];
  onUpdate: (patch: Partial<MedicalPrescriptionItem>) => void;
  onRemove: () => void;
  disabled?: boolean;
}) {
  const [catalogOpen, setCatalogOpen] = useState(false);

  return (
    <div className="p-4 border border-border rounded-lg bg-muted/20 space-y-3">
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 grid gap-2 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Medicamento</Label>
            <div className="flex gap-2">
              <Input
                value={item.medicationName}
                onChange={(e) => onUpdate({ medicationName: e.target.value })}
                placeholder="Nombre del medicamento (libre o catálogo)"
                disabled={disabled}
                className="flex-1"
              />
              <Popover open={catalogOpen} onOpenChange={setCatalogOpen}>
                <PopoverTrigger asChild>
                  <Button type="button" variant="outline" size="icon" disabled={disabled} title="Buscar en catálogo">
                    <ChevronsUpDown className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[280px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Buscar..." />
                    <CommandList>
                      <CommandEmpty>No hay coincidencias.</CommandEmpty>
                      <CommandGroup>
                        {medications.map((m) => (
                          <CommandItem
                            key={m.id}
                            value={`${m.name} ${m.presentation ?? ""}`}
                            onSelect={() => {
                              onUpdate({ medicationName: m.name, presentation: m.presentation });
                              setCatalogOpen(false);
                            }}
                          >
                            <div>
                              <p className="font-medium">{m.name}</p>
                              {m.presentation && (
                                <p className="text-xs text-muted-foreground">{m.presentation}</p>
                              )}
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Presentación (opc.)</Label>
            <Input
              value={item.presentation ?? ""}
              onChange={(e) => onUpdate({ presentation: e.target.value })}
              placeholder="Tabletas, jarabe..."
              disabled={disabled}
            />
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-destructive shrink-0"
          onClick={onRemove}
          disabled={disabled}
          aria-label="Quitar medicamento"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1.5">
          <Label className="text-xs">Dosis</Label>
          <Input
            value={item.dose ?? ""}
            onChange={(e) => onUpdate({ dose: e.target.value })}
            placeholder="500mg"
            disabled={disabled}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Frecuencia</Label>
          <Input
            value={item.frequency ?? ""}
            onChange={(e) => onUpdate({ frequency: e.target.value })}
            placeholder="Cada 8h"
            disabled={disabled}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Duración</Label>
          <Input
            value={item.duration ?? ""}
            onChange={(e) => onUpdate({ duration: e.target.value })}
            placeholder="7 días"
            disabled={disabled}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Cantidad (opc.)</Label>
          <Input
            type="number"
            min={0}
            value={item.quantity ?? ""}
            onChange={(e) =>
              onUpdate({ quantity: e.target.value ? Number(e.target.value) : undefined })
            }
            placeholder="21"
            disabled={disabled}
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Indicaciones</Label>
        <Input
          value={item.instructions ?? ""}
          onChange={(e) => onUpdate({ instructions: e.target.value })}
          placeholder="Tomar después de las comidas"
          disabled={disabled}
        />
      </div>
    </div>
  );
}
