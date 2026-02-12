import { useMemo, useState, useCallback } from "react";
import {
  getDentalChart,
  addConditionToTooth,
  removeConditionFromTooth,
  type DentalCondition,
  type ToothData,
  DENTAL_CONDITION_LABELS,
  DENTAL_CONDITION_COLORS,
  PERMANENT_UPPER_RIGHT,
  PERMANENT_UPPER_LEFT,
  PERMANENT_LOWER_LEFT,
  PERMANENT_LOWER_RIGHT,
  TEMPORARY_UPPER_RIGHT,
  TEMPORARY_UPPER_LEFT,
  TEMPORARY_LOWER_LEFT,
  TEMPORARY_LOWER_RIGHT,
} from "@/lib/patients/dentalChart";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

const CONDITION_OPTIONS: DentalCondition[] = [
  "caries",
  "obturacion",
  "corona",
  "endodoncia",
  "extraccion",
  "ausente",
  "sellante",
  "implante",
];

interface DentalChartFDIProps {
  patientId: string;
  className?: string;
}

export function DentalChartFDI({ patientId, className }: DentalChartFDIProps) {
  const [permanent, setPermanent] = useState(true);
  const [selectedCondition, setSelectedCondition] = useState<DentalCondition | null>(null);
  const [selectedTooth, setSelectedTooth] = useState<{ id: string; data: ToothData } | null>(null);
  const [refresh, setRefresh] = useState(0);

  const chart = useMemo(
    () => getDentalChart(patientId, permanent),
    [patientId, permanent, refresh]
  );

  const upperRight = permanent ? PERMANENT_UPPER_RIGHT : TEMPORARY_UPPER_RIGHT;
  const upperLeft = permanent ? PERMANENT_UPPER_LEFT : TEMPORARY_UPPER_LEFT;
  const lowerLeft = permanent ? PERMANENT_LOWER_LEFT : TEMPORARY_LOWER_LEFT;
  const lowerRight = permanent ? PERMANENT_LOWER_RIGHT : TEMPORARY_LOWER_RIGHT;

  const handleToothClick = useCallback(
    (toothId: string) => {
      const data = chart.teeth[toothId] ?? { conditions: [] };
      if (selectedCondition) {
        addConditionToTooth(patientId, permanent, toothId, selectedCondition);
        setRefresh((r) => r + 1);
        const nextChart = getDentalChart(patientId, permanent);
        setSelectedTooth({ id: toothId, data: nextChart.teeth[toothId] ?? { conditions: [] } });
      } else {
        setSelectedTooth({ id: toothId, data });
      }
    },
    [chart.teeth, patientId, permanent, selectedCondition]
  );

  const openPanel = useCallback((toothId: string) => {
    const data = chart.teeth[toothId] ?? { conditions: [] };
    setSelectedTooth({ id: toothId, data });
  }, [chart.teeth]);

  const closePanel = useCallback(() => {
    setSelectedTooth(null);
  }, []);

  const removeCondition = useCallback(
    (conditionId: string) => {
      if (!selectedTooth) return;
      removeConditionFromTooth(patientId, permanent, selectedTooth.id, conditionId);
      setRefresh((r) => r + 1);
      const nextData = getDentalChart(patientId, permanent).teeth[selectedTooth.id] ?? { conditions: [] };
      setSelectedTooth((prev) => (prev ? { ...prev, data: nextData } : null));
    },
    [patientId, permanent, selectedTooth]
  );

  const getToothFill = (toothId: string): string => {
    const data = chart.teeth[toothId];
    if (!data?.conditions.length) return "transparent";
    const last = data.conditions[data.conditions.length - 1];
    return DENTAL_CONDITION_COLORS[last.type] ?? "transparent";
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-wrap items-center gap-4">
        <ToggleGroup
          type="single"
          value={permanent ? "permanente" : "temporal"}
          onValueChange={(v) => {
            if (v) setPermanent(v === "permanente");
          }}
        >
          <ToggleGroupItem value="permanente" aria-label="Dentición permanente">
            Permanente
          </ToggleGroupItem>
          <ToggleGroupItem value="temporal" aria-label="Dentición temporal">
            Temporal
          </ToggleGroupItem>
        </ToggleGroup>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Condición:</span>
          {CONDITION_OPTIONS.map((cond) => (
            <Button
              key={cond}
              variant={selectedCondition === cond ? "default" : "outline"}
              size="sm"
              className="text-xs"
              style={selectedCondition === cond ? { backgroundColor: DENTAL_CONDITION_COLORS[cond], borderColor: DENTAL_CONDITION_COLORS[cond] } : undefined}
              onClick={() => setSelectedCondition(selectedCondition === cond ? null : cond)}
            >
              {DENTAL_CONDITION_LABELS[cond]}
            </Button>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="p-4 md:p-6 overflow-x-auto">
          <div className="inline-block min-w-[320px]">
            {/* Arco superior: derecha (18-11) luego izquierda (21-28) */}
            <div className="flex justify-center gap-0.5 mb-1">
              {upperRight.map((id) => (
                <ToothSlot
                  key={id}
                  toothId={id}
                  fill={getToothFill(id)}
                  onClick={() => handleToothClick(id)}
                  onDoubleClick={() => openPanel(id)}
                />
              ))}
              {upperLeft.map((id) => (
                <ToothSlot
                  key={id}
                  toothId={id}
                  fill={getToothFill(id)}
                  onClick={() => handleToothClick(id)}
                  onDoubleClick={() => openPanel(id)}
                />
              ))}
            </div>
            <p className="text-center text-[10px] text-muted-foreground mb-2">Maxilar</p>
            <p className="text-center text-[10px] text-muted-foreground mt-4">Mandíbula</p>
            <div className="flex justify-center gap-0.5 mt-1">
              {lowerLeft.map((id) => (
                <ToothSlot
                  key={id}
                  toothId={id}
                  fill={getToothFill(id)}
                  onClick={() => handleToothClick(id)}
                  onDoubleClick={() => openPanel(id)}
                />
              ))}
              {lowerRight.map((id) => (
                <ToothSlot
                  key={id}
                  toothId={id}
                  fill={getToothFill(id)}
                  onClick={() => handleToothClick(id)}
                  onDoubleClick={() => openPanel(id)}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Sheet open={!!selectedTooth} onOpenChange={(open) => !open && closePanel()}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Diente {selectedTooth?.id ?? ""}</SheetTitle>
          </SheetHeader>
          {selectedTooth && (
            <div className="mt-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                Número FDI: <strong>{selectedTooth.id}</strong>
              </p>
              <p className="text-xs text-muted-foreground">Superficies: O (oclusal), M (mesial), D (distal), V (vestibular), L (lingual)</p>
              <div>
                <p className="text-sm font-medium mb-2">Condiciones</p>
                {selectedTooth.data.conditions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Ninguna. Seleccione una condición en la barra y haga clic en el diente para agregar.</p>
                ) : (
                  <ul className="space-y-2">
                    {selectedTooth.data.conditions.map((c) => (
                      <li
                        key={c.id}
                        className="flex items-center justify-between gap-2 rounded border p-2 text-sm"
                        style={{ borderLeftColor: DENTAL_CONDITION_COLORS[c.type], borderLeftWidth: 4 }}
                      >
                        <span>{DENTAL_CONDITION_LABELS[c.type]}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => removeCondition(c.id)}
                        >
                          Quitar condición
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function ToothSlot({
  toothId,
  fill,
  onClick,
  onDoubleClick,
}: {
  toothId: string;
  fill: string;
  onClick: () => void;
  onDoubleClick: () => void;
}) {
  return (
    <button
      type="button"
      className={cn(
        "w-8 h-10 rounded border-2 flex items-center justify-center text-[10px] font-medium transition-colors",
        "border-border hover:border-primary hover:bg-primary/5"
      )}
      style={{ backgroundColor: fill ? `${fill}20` : undefined, borderColor: fill || undefined }}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      title={`Diente ${toothId} (doble clic para ver detalle)`}
    >
      {toothId}
    </button>
  );
}
