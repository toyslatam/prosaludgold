import React, { useMemo, useState, useCallback, useEffect, useRef } from "react";
import {
  DENTAL_CONDITION_LABELS,
  DENTAL_CONDITION_COLORS,
  type DentalCondition,
  type SurfaceCode,
} from "@/lib/patients/dentalChart";
import {
  PERMANENT_UPPER_RIGHT,
  PERMANENT_UPPER_LEFT,
  PERMANENT_LOWER_LEFT,
  PERMANENT_LOWER_RIGHT,
  TEMPORARY_UPPER_RIGHT,
  TEMPORARY_UPPER_LEFT,
  TEMPORARY_LOWER_LEFT,
  TEMPORARY_LOWER_RIGHT,
} from "@/lib/patients/dentalChart";
import {
  getAllRecords,
  addRecord,
  addConditionRecord,
  addProcedureRecord,
  annulRecord,
  getChartFromRecords,
  migrateLegacyChartsToRecords,
  SURFACE_LABELS,
  type OdontogramRecord,
  type ConditionKind,
} from "@/lib/patients/odontogramRecords";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { OdontogramSVG } from "@/components/patient/OdontogramSVG";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export type NomenclatureType = "FDI" | "ADA";

const CONDITION_OPTIONS: DentalCondition[] = [
  "caries",
  "obturacion",
  "corona",
  "endodoncia",
  "extraccion",
  "ausente",
  "sellante",
  "implante",
  "protesis",
];

const SURFACE_ORDER: SurfaceCode[] = ["V", "L", "M", "D", "O"];

/** Procedimientos demo (buscar por nombre) */
const PROCEDURE_OPTIONS = [
  { id: "obt-1", name: "Obturación 1 superficie" },
  { id: "obt-2", name: "Obturación 2 superficies" },
  { id: "obt-3", name: "Obturación 3+ superficies" },
  { id: "endo", name: "Endodoncia" },
  { id: "corona", name: "Corona" },
  { id: "limpieza", name: "Limpieza" },
  { id: "sellante", name: "Sellante" },
  { id: "extraccion", name: "Extracción" },
] as const;

type PanelType = "procedure" | "condition";

const TOUR_STORAGE_KEY = "psg_odontogram_tour_done";

/** Instrucciones para "Más info" (no siempre visibles) */
const ODONTOGRAM_INSTRUCTIONS = [
  "Click izquierdo: cargar procedimiento en la pieza o superficie seleccionada.",
  "Click derecho: definir lesión o preexistencia.",
  "Ctrl+click (o Cmd): selección múltiple de piezas o superficies.",
  "Esc: limpiar selección y cerrar panel.",
];

const ODONTOGRAM_TOUR_STEPS = [
  { title: "Odontograma FDI", content: "Aquí cargas prestaciones (procedimientos) y defines preexistencias o lesiones por pieza y superficie." },
  { title: "Click izquierdo", content: "Haz click izquierdo en una pieza o superficie para seleccionarla y abrir el panel de procedimiento. Puedes elegir el procedimiento, cantidad y doctor, y aplicar." },
  { title: "Click derecho", content: "Haz click derecho en una pieza o superficie para definir una lesión o preexistencia. Se abrirá el panel para elegir tipo (Lesión/Preexistencia) y condición clínica." },
  { title: "Selección múltiple", content: "Mantén Ctrl (o Cmd) y haz click en varias piezas o superficies para seleccionar varias a la vez. Pulsa Escape para limpiar la selección." },
  { title: "Leyenda y registros", content: "Los colores distinguen procedimientos (azul), lesiones (rojo) y preexistencias (amarillo). Abajo verás el historial de registros; puedes anular uno sin borrarlo." },
];

interface DentalOdontogramProps {
  patientId: string;
  verticalKey: "dental" | "medical" | "spa";
  className?: string;
}

export function DentalOdontogram({
  patientId,
  verticalKey,
  className,
}: DentalOdontogramProps) {
  if (verticalKey !== "dental") {
    return null;
  }

  const [permanent, setPermanent] = useState(true);
  const [migrated, setMigrated] = useState(false);
  useEffect(() => {
    if (!migrated) {
      migrateLegacyChartsToRecords();
      setMigrated(true);
    }
  }, [migrated]);

  useEffect(() => {
    try {
      if (localStorage.getItem(TOUR_STORAGE_KEY) !== "true") {
        setShowTour(true);
      }
    } catch {
      setShowTour(true);
    }
  }, []);

  const closeTour = useCallback(() => {
    setShowTour(false);
    try {
      localStorage.setItem(TOUR_STORAGE_KEY, "true");
    } catch {
      // ignore
    }
  }, []);
  const [nomenclature, setNomenclature] = useState<NomenclatureType>("FDI");
  const [selectedToothIds, setSelectedToothIds] = useState<Set<string>>(new Set());
  const [selectedSurfaces, setSelectedSurfaces] = useState<Set<SurfaceCode>>(new Set());
  const [selectedCondition, setSelectedCondition] = useState<DentalCondition | null>(null);
  const [refresh, setRefresh] = useState(0);
  const [hoveredToothId, setHoveredToothId] = useState<string | null>(null);
  const [panelAnchor, setPanelAnchor] = useState<{ x: number; y: number; type: PanelType } | null>(null);
  const [procedureName, setProcedureName] = useState(PROCEDURE_OPTIONS[0]?.name ?? "");
  const [procedureQuantity, setProcedureQuantity] = useState(1);
  const [procedureDoctor, setProcedureDoctor] = useState("Profesional a cargo");
  const [conditionKind, setConditionKind] = useState<ConditionKind>("PREEXISTENCE");
  const [conditionForPanel, setConditionForPanel] = useState<DentalCondition | null>(null);
  const [conditionNotes, setConditionNotes] = useState("");
  const [showTour, setShowTour] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const panelFirstInputRef = useRef<HTMLButtonElement | null>(null);

  const upperRight = permanent ? PERMANENT_UPPER_RIGHT : TEMPORARY_UPPER_RIGHT;
  const upperLeft = permanent ? PERMANENT_UPPER_LEFT : TEMPORARY_UPPER_LEFT;
  const lowerLeft = permanent ? PERMANENT_LOWER_LEFT : TEMPORARY_LOWER_LEFT;
  const lowerRight = permanent ? PERMANENT_LOWER_RIGHT : TEMPORARY_LOWER_RIGHT;

  const chart = useMemo(
    () => getChartFromRecords(patientId, permanent),
    [patientId, permanent, refresh]
  );
  const allRecords = useMemo(
    () => getAllRecords(patientId, permanent),
    [patientId, permanent, refresh]
  );
  const activeRecords = useMemo(
    () => allRecords.filter((r) => !r.annulledAt),
    [allRecords]
  );

  const toggleTooth = useCallback((toothId: string, multi: boolean) => {
    setSelectedToothIds((prev) => {
      const next = new Set(prev);
      if (next.has(toothId)) {
        next.delete(toothId);
      } else {
        if (!multi) next.clear();
        next.add(toothId);
      }
      return next;
    });
  }, []);

  const handleToothClick = useCallback(
    (e: React.MouseEvent, toothId: string) => {
      toggleTooth(toothId, e.ctrlKey || e.metaKey);
      if (e.button === 0) {
        setPanelAnchor({ x: e.clientX, y: e.clientY, type: "procedure" });
      }
    },
    [toggleTooth]
  );

  const toggleSurface = useCallback((code: SurfaceCode) => {
    setSelectedSurfaces((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  }, []);

  const handleSurfaceClick = useCallback(
    (toothId: string, surface: SurfaceCode, e: React.MouseEvent) => {
      toggleTooth(toothId, e.ctrlKey || e.metaKey);
      toggleSurface(surface);
      if (e.button === 0) {
        setPanelAnchor({ x: e.clientX, y: e.clientY, type: "procedure" });
      }
    },
    [toggleTooth, toggleSurface]
  );

  const handleToothContextMenu = useCallback((e: React.MouseEvent, toothId: string) => {
    e.preventDefault();
    toggleTooth(toothId, false);
    setPanelAnchor({ x: e.clientX, y: e.clientY, type: "condition" });
  }, [toggleTooth]);

  const handleSurfaceContextMenu = useCallback(
    (toothId: string, surface: SurfaceCode, e: React.MouseEvent) => {
      e.preventDefault();
      toggleTooth(toothId, false);
      setSelectedSurfaces((prev) => {
        const next = new Set(prev);
        next.add(surface);
        return next;
      });
      setPanelAnchor({ x: e.clientX, y: e.clientY, type: "condition" });
    },
    [toggleTooth]
  );

  const applyCondition = useCallback(() => {
    if (!selectedCondition || selectedToothIds.size === 0) return;
    const surfaces = Array.from(selectedSurfaces);
    selectedToothIds.forEach((toothId) => {
      addRecord(patientId, permanent, toothId, selectedCondition, surfaces);
    });
    setRefresh((r) => r + 1);
    setSelectedToothIds(new Set());
    setSelectedSurfaces(new Set());
  }, [
    patientId,
    permanent,
    selectedCondition,
    selectedToothIds,
    selectedSurfaces,
  ]);

  const applyProcedure = useCallback(() => {
    const name = procedureName.trim() || PROCEDURE_OPTIONS[0]?.name;
    if (!name || selectedToothIds.size === 0) return;
    const surfaces = Array.from(selectedSurfaces);
    selectedToothIds.forEach((toothId) => {
      addProcedureRecord(patientId, permanent, toothId, surfaces, {
        procedureName: name,
        quantity: procedureQuantity,
        doctorId: procedureDoctor || undefined,
        notes: undefined,
      });
    });
    setRefresh((r) => r + 1);
    setSelectedToothIds(new Set());
    setSelectedSurfaces(new Set());
    setPanelAnchor(null);
  }, [patientId, permanent, procedureName, procedureQuantity, procedureDoctor, selectedToothIds, selectedSurfaces]);

  const applyConditionFromPanel = useCallback(() => {
    if (!conditionForPanel || selectedToothIds.size === 0) return;
    const surfaces = Array.from(selectedSurfaces);
    selectedToothIds.forEach((toothId) => {
      addConditionRecord(
        patientId,
        permanent,
        toothId,
        conditionForPanel,
        surfaces,
        conditionKind,
        conditionNotes || undefined
      );
    });
    setRefresh((r) => r + 1);
    setSelectedToothIds(new Set());
    setSelectedSurfaces(new Set());
    setPanelAnchor(null);
  }, [patientId, permanent, conditionForPanel, conditionKind, conditionNotes, selectedToothIds, selectedSurfaces]);

  const handleAnnul = useCallback((recordId: string) => {
    annulRecord(recordId);
    setRefresh((r) => r + 1);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedToothIds(new Set());
        setSelectedSurfaces(new Set());
        setPanelAnchor(null);
        setInfoDialogOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const check = () => setIsMobile(typeof window !== "undefined" && window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (panelAnchor && !isMobile) {
      const t = setTimeout(() => panelFirstInputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [panelAnchor, isMobile]);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Barra: modo Procedimiento / Lesión-Preexistencia, nomenclatura, dentición, condición */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Modo:</span>
          <ToggleGroup type="single" value={panelAnchor?.type ?? "procedure"} className="gap-0">
            <ToggleGroupItem value="procedure" aria-label="Procedimiento" className="text-xs">
              Procedimiento
            </ToggleGroupItem>
            <ToggleGroupItem value="condition" aria-label="Lesión / Preexistencia" className="text-xs">
              Lesión / Preexistencia
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        <Select
          value={nomenclature}
          onValueChange={(v) => setNomenclature(v as NomenclatureType)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="FDI">FDI</SelectItem>
            <SelectItem value="ADA" disabled>
              ADA / Continuo (próximamente)
            </SelectItem>
          </SelectContent>
        </Select>
        <div className="flex gap-1">
          <Button
            variant={permanent ? "default" : "outline"}
            size="sm"
            onClick={() => setPermanent(true)}
          >
            Permanente
          </Button>
          <Button
            variant={!permanent ? "default" : "outline"}
            size="sm"
            onClick={() => setPermanent(false)}
          >
            Temporal
          </Button>
        </div>
        <span className="text-sm text-muted-foreground">Condición (panel):</span>
        <div className="flex flex-wrap gap-1">
          {CONDITION_OPTIONS.map((cond) => (
            <Button
              key={cond}
              variant={selectedCondition === cond ? "default" : "outline"}
              size="sm"
              className="text-xs"
              style={
                selectedCondition === cond
                  ? {
                      backgroundColor: DENTAL_CONDITION_COLORS[cond],
                      borderColor: DENTAL_CONDITION_COLORS[cond],
                    }
                  : undefined
              }
              onClick={() =>
                setSelectedCondition(selectedCondition === cond ? null : cond)
              }
            >
              {DENTAL_CONDITION_LABELS[cond]}
            </Button>
          ))}
        </div>
      </div>

      {/* Panel de selección: piezas + superficies + aplicar */}
      {(selectedToothIds.size > 0 || selectedCondition) && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="pt-4">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <span className="text-sm font-medium">Pieza(s): </span>
                <span className="text-sm text-muted-foreground">
                  {selectedToothIds.size > 0
                    ? Array.from(selectedToothIds).sort().join(", ")
                    : "—"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Superficies:</span>
                {SURFACE_ORDER.map((code) => (
                  <label
                    key={code}
                    className="flex items-center gap-1 text-xs cursor-pointer"
                  >
                    <Checkbox
                      checked={selectedSurfaces.has(code)}
                      onCheckedChange={() => toggleSurface(code)}
                    />
                    {code}
                  </label>
                ))}
              </div>
              <Button
                size="sm"
                disabled={
                  !selectedCondition ||
                  selectedToothIds.size === 0
                }
                onClick={applyCondition}
              >
                Aplicar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Odontograma visual tipo Dentalink (SVG con superficies) */}
      <Card>
        <CardContent className="p-4 md:p-6 overflow-x-auto relative">
          {hoveredToothId && (
            <p className="text-xs text-muted-foreground mb-2">
              Pieza FDI: <span className="font-medium">{hoveredToothId}</span>
            </p>
          )}
          <OdontogramSVG
            upperRight={upperRight}
            upperLeft={upperLeft}
            lowerLeft={lowerLeft}
            lowerRight={lowerRight}
            teeth={chart.teeth}
            selectedToothIds={selectedToothIds}
            selectedSurfaces={selectedSurfaces}
            onToothClick={handleToothClick}
            onSurfaceClick={handleSurfaceClick}
            onToothContextMenu={handleToothContextMenu}
            onSurfaceContextMenu={handleSurfaceContextMenu}
            hoveredToothId={hoveredToothId}
            onToothHover={setHoveredToothId}
          />
          {/* Leyenda + Más info */}
          <div className="flex flex-wrap items-center gap-3 mt-4 pt-3 border-t text-xs">
            <span className="text-muted-foreground">Leyenda:</span>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-sm shrink-0" style={{ backgroundColor: "#2563eb80" }} />
              <span>Procedimientos</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-sm shrink-0" style={{ backgroundColor: "#dc262680" }} />
              <span>Lesiones</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-sm shrink-0" style={{ backgroundColor: "#eab30880" }} />
              <span>Preexistencias</span>
            </div>
            <button
              type="button"
              onClick={() => setInfoDialogOpen(true)}
              className="ml-auto text-xs text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-ring rounded"
            >
              Más info
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Diálogo instrucciones (abierto desde "Más info") */}
      <Dialog open={infoDialogOpen} onOpenChange={setInfoDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Instrucciones del odontograma</DialogTitle>
          </DialogHeader>
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
            {ODONTOGRAM_INSTRUCTIONS.map((text, i) => (
              <li key={i}>{text}</li>
            ))}
          </ul>
          <DialogFooter>
            <Button type="button" size="sm" onClick={() => setInfoDialogOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Panel contextual: Procedimiento o Lesión/Preexistencia — desktop: popover; mobile: drawer */}
      {panelAnchor && isMobile ? (
        <Drawer open={!!panelAnchor} onOpenChange={(open) => !open && setPanelAnchor(null)}>
          <DrawerContent className="max-h-[90vh]">
            <DrawerHeader className="border-b border-border pb-4">
              <DrawerTitle className="text-base font-semibold">
                {panelAnchor.type === "procedure" ? "Cargar procedimiento" : "Lesión / Preexistencia"}
              </DrawerTitle>
            </DrawerHeader>
            <div className="p-4 space-y-4 overflow-y-auto">
              {panelAnchor.type === "procedure" ? (
                <>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Procedimiento</Label>
                    <Select value={procedureName} onValueChange={setProcedureName}>
                      <SelectTrigger ref={panelFirstInputRef} className="h-10" />
                      <SelectContent>
                        {PROCEDURE_OPTIONS.map((p) => (
                          <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Cantidad</Label>
                    <Input type="number" min={1} value={procedureQuantity} onChange={(e) => setProcedureQuantity(Number(e.target.value) || 1)} className="h-10" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Doctor</Label>
                    <Input value={procedureDoctor} onChange={(e) => setProcedureDoctor(e.target.value)} className="h-10" placeholder="Profesional a cargo" />
                  </div>
                  <p className="text-sm text-muted-foreground">Pieza(s): {Array.from(selectedToothIds).sort().join(", ")}{selectedSurfaces.size > 0 && ` · Superficies: ${Array.from(selectedSurfaces).sort().join(", ")}`}</p>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button size="sm" variant="outline" onClick={() => setPanelAnchor(null)}>Cancelar</Button>
                    <Button size="sm" onClick={applyProcedure}>Aplicar</Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Tipo</Label>
                    <ToggleGroup type="single" value={conditionKind} onValueChange={(v) => v && setConditionKind(v as ConditionKind)} className="gap-1">
                      <ToggleGroupItem value="LESION" className="text-xs">Lesión</ToggleGroupItem>
                      <ToggleGroupItem value="PREEXISTENCE" className="text-xs">Preexistencia</ToggleGroupItem>
                    </ToggleGroup>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Condición clínica</Label>
                    <Select value={conditionForPanel ?? ""} onValueChange={(v) => setConditionForPanel((v as DentalCondition) || null)}>
                      <SelectTrigger ref={panelFirstInputRef} className="h-10" />
                      <SelectContent>
                        {CONDITION_OPTIONS.map((c) => (
                          <SelectItem key={c} value={c}>{DENTAL_CONDITION_LABELS[c]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Notas (opcional)</Label>
                    <Input value={conditionNotes} onChange={(e) => setConditionNotes(e.target.value)} className="h-10" placeholder="Notas" />
                  </div>
                  <p className="text-sm text-muted-foreground">Pieza(s): {Array.from(selectedToothIds).sort().join(", ")}{selectedSurfaces.size > 0 && ` · Superficies: ${Array.from(selectedSurfaces).sort().join(", ")}`}</p>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button size="sm" variant="outline" onClick={() => setPanelAnchor(null)}>Cancelar</Button>
                    <Button size="sm" onClick={applyConditionFromPanel} disabled={!conditionForPanel}>Aplicar</Button>
                  </div>
                </>
              )}
            </div>
          </DrawerContent>
        </Drawer>
      ) : panelAnchor ? (
        <>
          <div className="fixed inset-0 z-[100] bg-transparent" aria-hidden onClick={() => setPanelAnchor(null)} />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="odontogram-panel-title"
            tabIndex={-1}
            className="fixed z-[101] w-[min(420px,calc(100vw-24px))] min-w-[360px] rounded-lg border border-border bg-white p-0 shadow-lg outline-none"
            style={{
              left: Math.min(panelAnchor.x, typeof window !== "undefined" ? window.innerWidth - 424 : panelAnchor.x),
              top: Math.min(panelAnchor.y + 12, typeof window !== "undefined" ? window.innerHeight - 400 : panelAnchor.y + 12),
            }}
          >
            {/* Flecha (punta superior, centrada) */}
            <div
              className="absolute left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-r-[8px] border-b-[8px] border-l-transparent border-r-transparent border-b-border -top-2"
              aria-hidden
            />
            <div className="border-b border-border bg-muted/30 px-5 py-3">
              <h2 id="odontogram-panel-title" className="text-base font-semibold text-foreground">
                {panelAnchor.type === "procedure" ? "Cargar procedimiento" : "Lesión / Preexistencia"}
              </h2>
            </div>
            <div className="p-5 space-y-4">
              {panelAnchor.type === "procedure" ? (
                <>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">Procedimiento</Label>
                    <Select value={procedureName} onValueChange={setProcedureName}>
                      <SelectTrigger ref={panelFirstInputRef} className="h-10" />
                      <SelectContent>
                        {PROCEDURE_OPTIONS.map((p) => (
                          <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">Cantidad</Label>
                    <Input type="number" min={1} value={procedureQuantity} onChange={(e) => setProcedureQuantity(Number(e.target.value) || 1)} className="h-10" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">Doctor</Label>
                    <Input value={procedureDoctor} onChange={(e) => setProcedureDoctor(e.target.value)} className="h-10" placeholder="Profesional a cargo" />
                  </div>
                  <p className="text-sm text-muted-foreground">Pieza(s): {Array.from(selectedToothIds).sort().join(", ")}{selectedSurfaces.size > 0 && ` · Superficies: ${Array.from(selectedSurfaces).sort().join(", ")}`}</p>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button size="sm" variant="outline" onClick={() => setPanelAnchor(null)}>Cancelar</Button>
                    <Button size="sm" onClick={applyProcedure}>Aplicar</Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">Tipo</Label>
                    <ToggleGroup type="single" value={conditionKind} onValueChange={(v) => v && setConditionKind(v as ConditionKind)} className="gap-1">
                      <ToggleGroupItem value="LESION" className="text-xs">Lesión</ToggleGroupItem>
                      <ToggleGroupItem value="PREEXISTENCE" className="text-xs">Preexistencia</ToggleGroupItem>
                    </ToggleGroup>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">Condición clínica</Label>
                    <Select value={conditionForPanel ?? ""} onValueChange={(v) => setConditionForPanel((v as DentalCondition) || null)}>
                      <SelectTrigger ref={panelFirstInputRef} className="h-10" />
                      <SelectContent>
                        {CONDITION_OPTIONS.map((c) => (
                          <SelectItem key={c} value={c}>{DENTAL_CONDITION_LABELS[c]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">Notas (opcional)</Label>
                    <Input value={conditionNotes} onChange={(e) => setConditionNotes(e.target.value)} className="h-10" placeholder="Notas" />
                  </div>
                  <p className="text-sm text-muted-foreground">Pieza(s): {Array.from(selectedToothIds).sort().join(", ")}{selectedSurfaces.size > 0 && ` · Superficies: ${Array.from(selectedSurfaces).sort().join(", ")}`}</p>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button size="sm" variant="outline" onClick={() => setPanelAnchor(null)}>Cancelar</Button>
                    <Button size="sm" onClick={applyConditionFromPanel} disabled={!conditionForPanel}>Aplicar</Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      ) : null}

      {/* Lista de registros con Anular */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Registros del odontograma</CardTitle>
        </CardHeader>
        <CardContent>
          {allRecords.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">
              No hay registros. Haz click en una pieza para cargar un procedimiento o click derecho para lesión/preexistencia.
            </p>
          ) : (
            <ul className="space-y-2 max-h-[280px] overflow-y-auto">
              {allRecords.map((r) => (
                <RecordRow
                  key={r.id}
                  record={r}
                  onAnnul={
                    !r.annulledAt ? () => handleAnnul(r.id) : undefined
                  }
                />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Tour guía (primera vez) */}
      <Dialog open={showTour} onOpenChange={(open) => !open && closeTour()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{ODONTOGRAM_TOUR_STEPS[tourStep].title}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {ODONTOGRAM_TOUR_STEPS[tourStep].content}
          </p>
          <p className="text-xs text-muted-foreground">
            Paso {tourStep + 1} de {ODONTOGRAM_TOUR_STEPS.length}
          </p>
          <DialogFooter className="flex-row justify-between sm:justify-between">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={tourStep === 0}
              onClick={() => setTourStep((s) => Math.max(0, s - 1))}
            >
              Anterior
            </Button>
            {tourStep < ODONTOGRAM_TOUR_STEPS.length - 1 ? (
              <Button
                type="button"
                size="sm"
                onClick={() => setTourStep((s) => s + 1)}
              >
                Siguiente
              </Button>
            ) : (
              <Button type="button" size="sm" onClick={closeTour}>
                Cerrar
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RecordRow({
  record,
  onAnnul,
}: {
  record: OdontogramRecord;
  onAnnul?: () => void;
}) {
  const surfacesText =
    record.surfaces.length > 0
      ? record.surfaces
          .map((s) => SURFACE_LABELS[s] ?? s)
          .join(", ")
      : "—";
  const isAnulled = !!record.annulledAt;

  return (
    <li
      className={cn(
        "flex flex-wrap items-center justify-between gap-2 rounded border p-2 text-sm",
        isAnulled && "opacity-60 bg-muted/30"
      )}
    >
      <div className="flex items-center gap-2">
        <span className="font-medium">Pieza {record.toothId}</span>
        {record.recordType === "PROCEDURE" ? (
          <Badge variant="secondary" className="text-xs bg-primary/20 border-primary">
            {record.procedureName ?? "Procedimiento"}
          </Badge>
        ) : (
          <>
            <Badge
              variant="secondary"
              className="text-xs"
              style={{
                backgroundColor: `${DENTAL_CONDITION_COLORS[record.condition]}20`,
                borderColor: DENTAL_CONDITION_COLORS[record.condition],
              }}
            >
              {DENTAL_CONDITION_LABELS[record.condition]}
            </Badge>
            {record.conditionKind && (
              <span className="text-xs text-muted-foreground">
                ({record.conditionKind === "LESION" ? "Lesión" : "Preexistencia"})
              </span>
            )}
          </>
        )}
        <span className="text-muted-foreground text-xs">
          {record.surfaces.length > 0 ? ` · ${surfacesText}` : ""}
        </span>
        <span className="text-muted-foreground text-xs">
          {format(parseISO(record.createdAt), "d MMM yyyy HH:mm", {
            locale: es,
          })}
        </span>
      </div>
      {onAnnul && (
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive"
          onClick={onAnnul}
        >
          Anular
        </Button>
      )}
      {isAnulled && (
        <span className="text-xs text-muted-foreground">
          Anulado{" "}
          {record.annulledAt &&
            format(parseISO(record.annulledAt), "d MMM yyyy", { locale: es })}
        </span>
      )}
    </li>
  );
}
