"use client";

import { useState, useEffect } from "react";
import type { Professional, Specialty } from "@/types/professionals";
import type { VerticalKey } from "@/config/demos";
import type { Site } from "@/lib/agenda/sites";
import { createProfessional, updateProfessional } from "@/lib/professionals/repository";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

export interface ProfessionalFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vertical: VerticalKey;
  professional: Professional | null;
  specialties: Specialty[];
  sites: Site[];
  onSave: () => void;
  onOpenSpecialties?: () => void;
}

export function ProfessionalFormModal({
  open,
  onOpenChange,
  vertical,
  professional,
  specialties,
  sites,
  onSave,
  onOpenSpecialties,
}: ProfessionalFormModalProps) {
  const [fullName, setFullName] = useState("");
  const [specialtyId, setSpecialtyId] = useState("");
  const [siteIds, setSiteIds] = useState<string[]>([]);
  const [commissionType, setCommissionType] = useState<"PERCENT" | "FIXED">("PERCENT");
  const [commissionValue, setCommissionValue] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (professional) {
      setFullName(professional.fullName);
      setSpecialtyId(professional.specialtyId);
      setSiteIds(professional.siteIds ?? []);
      setCommissionType(professional.commissionDefault.type);
      setCommissionValue(String(professional.commissionDefault.value));
      setPhone(professional.phone ?? "");
      setEmail(professional.email ?? "");
      setNotes(professional.notes ?? "");
      setIsAvailable(professional.isAvailable);
    } else {
      setFullName("");
      setSpecialtyId("");
      setSiteIds([]);
      setCommissionType("PERCENT");
      setCommissionValue("10");
      setPhone("");
      setEmail("");
      setNotes("");
      setIsAvailable(true);
    }
  }, [open, professional]);

  const toggleSite = (id: string) => {
    setSiteIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    const nameTrim = fullName.trim();
    if (!nameTrim) {
      toast.error("Nombre completo es obligatorio");
      return;
    }
    if (!specialtyId) {
      toast.error("Seleccione una especialidad");
      return;
    }
    const value = Number(commissionValue);
    if (Number.isNaN(value)) {
      toast.error("Comisión: valor numérico requerido");
      return;
    }
    if (commissionType === "PERCENT") {
      if (value < 0 || value > 100) {
        toast.error("Comisión en % debe estar entre 0 y 100");
        return;
      }
    } else {
      if (value <= 0) {
        toast.error("Comisión fija debe ser mayor que 0");
        return;
      }
    }

    setSaving(true);
    try {
      const payload = {
        vertical,
        fullName: nameTrim,
        specialtyId,
        siteIds,
        isAvailable,
        isActive: true,
        commissionDefault: { type: commissionType, value },
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        notes: notes.trim() || undefined,
      };

      if (professional) {
        updateProfessional(professional.id, payload);
        toast.success("Profesional actualizado");
      } else {
        createProfessional(payload);
        toast.success("Profesional creado");
      }
      onSave();
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  const noSpecialties = specialties.length === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90vh] flex flex-col max-w-lg p-0 gap-0"
        aria-modal="true"
        aria-labelledby="professional-form-title"
      >
        <DialogHeader className="p-6 pb-4">
          <DialogTitle id="professional-form-title">
            {professional ? "Editar profesional" : "Nuevo profesional"}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6" style={{ maxHeight: "calc(90vh - 120px)" }}>
          <div className="space-y-4 pb-6 pr-4">
            <div className="space-y-2">
              <Label htmlFor="pro-fullName">Nombre completo *</Label>
              <Input
                id="pro-fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nombre completo"
                aria-required="true"
              />
            </div>

            <div className="space-y-2">
              <Label>Especialidad *</Label>
              {noSpecialties ? (
                <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
                  <p className="text-sm text-muted-foreground">
                    No hay especialidades. Cree al menos una para asignar al profesional.
                  </p>
                  {onOpenSpecialties && (
                    <Button type="button" variant="secondary" size="sm" onClick={onOpenSpecialties}>
                      Crear especialidad
                    </Button>
                  )}
                </div>
              ) : (
                <Select value={specialtyId} onValueChange={setSpecialtyId}>
                  <SelectTrigger id="pro-specialty">
                    <SelectValue placeholder="Seleccionar especialidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {specialties.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {sites.length > 0 && (
              <div className="space-y-2">
                <Label>Sede(s) asignadas</Label>
                <div className="rounded-md border p-3 space-y-2">
                  {sites.map((site) => (
                    <label
                      key={site.id}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Checkbox
                        checked={siteIds.includes(site.id)}
                        onCheckedChange={() => toggleSite(site.id)}
                      />
                      <span className="text-sm">{site.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>{commissionType === "PERCENT" ? "Comisión (%)" : "Comisión (monto fijo)"}</Label>
              <div className="flex gap-2">
                <Select
                  value={commissionType}
                  onValueChange={(v) => setCommissionType(v as "PERCENT" | "FIXED")}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENT">Porcentaje %</SelectItem>
                    <SelectItem value="FIXED">Monto fijo</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  min={commissionType === "PERCENT" ? 0 : 0.01}
                  max={commissionType === "PERCENT" ? 100 : undefined}
                  step={commissionType === "PERCENT" ? 1 : 0.01}
                  value={commissionValue}
                  onChange={(e) => setCommissionValue(e.target.value)}
                  placeholder={commissionType === "PERCENT" ? "0-100" : "0.00"}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="pro-available">Disponible</Label>
              <Switch
                id="pro-available"
                checked={isAvailable}
                onCheckedChange={setIsAvailable}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pro-phone">Teléfono</Label>
                <Input
                  id="pro-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Opcional"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pro-email">Email</Label>
                <Input
                  id="pro-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Opcional"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pro-notes">Nota interna</Label>
              <Textarea
                id="pro-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Opcional"
                rows={2}
              />
            </div>
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 p-6 pt-4 border-t">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={saving || noSpecialties}>
            {saving ? "Guardando…" : "Guardar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
