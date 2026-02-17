import { useMemo, useState, useCallback, useEffect } from "react";
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
  annulRecord,
  getChartFromRecords,
  migrateLegacyChartsToRecords,
  SURFACE_LABELS,
  type OdontogramRecord,
} from "@/lib/patients/odontogramRecords";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
  const [nomenclature, setNomenclature] = useState<NomenclatureType>("FDI");
  const [selectedToothIds, setSelectedToothIds] = useState<Set<string>>(new Set());
  const [selectedSurfaces, setSelectedSurfaces] = useState<Set<SurfaceCode>>(new Set());
  const [selectedCondition, setSelectedCondition] = useState<DentalCondition | null>(null);
  const [refresh, setRefresh] = useState(0);

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

  const handleAnnul = useCallback((recordId: string) => {
    annulRecord(recordId);
    setRefresh((r) => r + 1);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedToothIds(new Set());
        setSelectedSurfaces(new Set());
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const getToothColor = (toothId: string): string => {
    const data = chart.teeth[toothId];
    if (!data?.conditions.length) return "transparent";
    const last = data.conditions[data.conditions.length - 1];
    return DENTAL_CONDITION_COLORS[last.type] ?? "transparent";
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Barra: nomenclatura, dentición, condición, superficies, aplicar */}
      <div className="flex flex-wrap items-center gap-4">
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
        <span className="text-sm text-muted-foreground">Condición:</span>
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
            <p className="text-xs text-muted-foreground mb-2">
              Ctrl+clic para selección múltiple · Escape para limpiar
            </p>
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

      {/* Grilla FDI SVG */}
      <Card>
        <CardContent className="p-4 md:p-6 overflow-x-auto">
          <div className="inline-block min-w-[320px]">
            <div className="flex justify-center gap-0.5 mb-1">
              {upperRight.map((id) => (
                <ToothSlot
                  key={id}
                  toothId={id}
                  fill={getToothColor(id)}
                  selected={selectedToothIds.has(id)}
                  onClick={(e) => handleToothClick(e, id)}
                />
              ))}
              {upperLeft.map((id) => (
                <ToothSlot
                  key={id}
                  toothId={id}
                  fill={getToothColor(id)}
                  selected={selectedToothIds.has(id)}
                  onClick={(e) => handleToothClick(e, id)}
                />
              ))}
            </div>
            <p className="text-center text-[10px] text-muted-foreground mb-2">
              Maxilar
            </p>
            <p className="text-center text-[10px] text-muted-foreground mt-4">
              Mandíbula
            </p>
            <div className="flex justify-center gap-0.5 mt-1">
              {lowerLeft.map((id) => (
                <ToothSlot
                  key={id}
                  toothId={id}
                  fill={getToothColor(id)}
                  selected={selectedToothIds.has(id)}
                  onClick={(e) => handleToothClick(e, id)}
                />
              ))}
              {lowerRight.map((id) => (
                <ToothSlot
                  key={id}
                  toothId={id}
                  fill={getToothColor(id)}
                  selected={selectedToothIds.has(id)}
                  onClick={(e) => handleToothClick(e, id)}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de registros con Anular */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Registros del odontograma</CardTitle>
        </CardHeader>
        <CardContent>
          {allRecords.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">
              No hay registros. Seleccione pieza(s), superficies (opcional) y
              condición, luego Aplicar.
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
    </div>
  );
}

function ToothSlot({
  toothId,
  fill,
  selected,
  onClick,
}: {
  toothId: string;
  fill: string;
  selected: boolean;
  onClick: (e: React.MouseEvent) => void;
}) {
  return (
    <button
      type="button"
      className={cn(
        "w-8 h-10 rounded border-2 flex items-center justify-center text-[10px] font-medium transition-colors",
        "border-border hover:border-primary hover:bg-primary/5",
        selected && "ring-2 ring-primary ring-offset-2 border-primary"
      )}
      style={{
        backgroundColor: fill ? `${fill}30` : undefined,
        borderColor: fill || undefined,
      }}
      onClick={onClick}
      title={`Pieza ${toothId} (Ctrl+clic para multi)`}
    >
      {toothId}
    </button>
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
