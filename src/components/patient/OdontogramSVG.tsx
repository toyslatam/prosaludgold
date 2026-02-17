import {
  DENTAL_CONDITION_COLORS,
  type DentalCondition,
  type SurfaceCode,
} from "@/lib/patients/dentalChart";
import type { ToothData, OdontogramRecordType, ConditionKind } from "@/lib/patients/dentalChart";
import { cn } from "@/lib/utils";

const SURFACE_ORDER: SurfaceCode[] = ["O", "V", "M", "D", "L"];

/** Colores fijos para SVG - estilo imagen 2 (blanco/gris, selección roja) */
const TOOTH_FILL = "#ffffff";
const TOOTH_STROKE = "#d1d5db";
const SURFACE_DIVIDER = "#e5e7eb";
const TEXT_FILL = "#374151";
const CIRCLE_STROKE = "#9ca3af";
const SELECTION_STROKE = "#dc2626";
const DESTRUCTIVE_STROKE = "#dc2626";
const CIRCLE_R = 7;
const CIRCLE_Y_OFFSET = 6;

/** Geometría: diente 24x28. O=oclusal arriba, L=lingual abajo, M=mesial izq, D=distal der, V=vestibular centro */
const TOOTH_W = 24;
const TOOTH_H = 28;
const PAD = 2;
const O_H = 6;
const L_H = 6;
const M_W = 5;
const D_W = 5;
const V_X = M_W;
const V_Y = O_H;
const V_W = TOOTH_W - M_W - D_W;
const V_H = TOOTH_H - O_H - L_H;

/** Polígonos por superficie (coords relativas 0..TOOTH_W, 0..TOOTH_H) */
const SURFACE_POLYS: Record<SurfaceCode, string> = {
  O: `${M_W},0 ${TOOTH_W - D_W},0 ${TOOTH_W - D_W},${O_H} ${M_W},${O_H}`,
  L: `${M_W},${TOOTH_H - L_H} ${TOOTH_W - D_W},${TOOTH_H - L_H} ${TOOTH_W - D_W},${TOOTH_H} ${M_W},${TOOTH_H}`,
  M: `0,0 ${M_W},0 ${M_W},${TOOTH_H} 0,${TOOTH_H}`,
  D: `${TOOTH_W - D_W},0 ${TOOTH_W},0 ${TOOTH_W},${TOOTH_H} ${TOOTH_W - D_W},${TOOTH_H}`,
  V: `${V_X},${V_Y} ${V_X + V_W},${V_Y} ${V_X + V_W},${V_Y + V_H} ${V_X},${V_Y + V_H}`,
};

/** Path con forma de corona dental (vista frontal): redondeado, algo más estrecho en zona gingival */
function getToothOutlinePath(): string {
  const w = TOOTH_W;
  const h = TOOTH_H;
  const r = 5;
  return `M ${r},0 L ${w - r},0 Q ${w},0 ${w},${r} L ${w},${h - r} Q ${w},${h} ${w - r},${h} L ${r},${h} Q 0,${h} 0,${h - r} L 0,${r} Q 0,0 ${r},0 Z`;
}

export interface ConditionForTooth {
  type: DentalCondition;
  surfaces: SurfaceCode[];
  recordType?: OdontogramRecordType;
  conditionKind?: ConditionKind;
}

interface OdontogramToothSVGProps {
  toothId: string;
  selected: boolean;
  selectedSurfacesForThisTooth: Set<SurfaceCode>;
  conditions: ConditionForTooth[];
  onToothClick: (e: React.MouseEvent) => void;
  onSurfaceClick: (surface: SurfaceCode, e: React.MouseEvent) => void;
  onToothContextMenu?: (e: React.MouseEvent) => void;
  onSurfaceContextMenu?: (surface: SurfaceCode, e: React.MouseEvent) => void;
  onToothMouseEnter?: () => void;
  onToothMouseLeave?: () => void;
  hovered?: boolean;
  /** Si es arcada inferior, el diente se dibuja "al revés" (O abajo) */
  lower?: boolean;
  className?: string;
}

/** Colores por capa: procedimientos (azul/verde) vs lesiones (rojo) / preexistencias (amarillo) */
const PROCEDURE_OVERLAY = "#2563eb";
const LESION_OVERLAY = "#dc2626";
const PREEXISTENCE_OVERLAY = "#eab308";

/** Color por superficie en una capa (último registro que afecta esa superficie en esa capa) */
function getSurfaceColorForLayer(
  conditions: ConditionForTooth[],
  surface: SurfaceCode,
  layer: "PROCEDURE" | "CONDITION"
): string | null {
  for (let i = conditions.length - 1; i >= 0; i--) {
    const c = conditions[i];
    if (c.recordType !== layer) continue;
    const applies = !c.surfaces?.length || c.surfaces.includes(surface);
    if (applies) {
      if (layer === "PROCEDURE") return PROCEDURE_OVERLAY;
      if (c.conditionKind === "LESION") return LESION_OVERLAY;
      return PREEXISTENCE_OVERLAY;
    }
  }
  return null;
}

/** Color combinado por superficie: procedimiento > condición > legacy */
function getSurfaceColor(
  conditions: ConditionForTooth[],
  surface: SurfaceCode
): string | null {
  const procedureColor = getSurfaceColorForLayer(conditions, surface, "PROCEDURE");
  if (procedureColor) return procedureColor;
  const conditionColor = getSurfaceColorForLayer(conditions, surface, "CONDITION");
  if (conditionColor) return conditionColor;
  for (let i = conditions.length - 1; i >= 0; i--) {
    const c = conditions[i];
    const applies = !c.surfaces?.length || c.surfaces.includes(surface);
    if (applies) return DENTAL_CONDITION_COLORS[c.type] ?? null;
  }
  return null;
}

/** Capa superior que afecta esta superficie (para estilo: dashed = lesión/preexistencia) */
function getSurfaceTopLayer(
  conditions: ConditionForTooth[],
  surface: SurfaceCode
): "PROCEDURE" | "CONDITION" | null {
  for (let i = conditions.length - 1; i >= 0; i--) {
    const c = conditions[i];
    const applies = !c.surfaces?.length || c.surfaces.includes(surface);
    if (applies) return c.recordType ?? "CONDITION";
  }
  return null;
}

function hasCondition(conditions: ConditionForTooth[], type: DentalCondition): boolean {
  return conditions.some((c) => c.type === type);
}

export function OdontogramToothSVG({
  toothId,
  selected,
  selectedSurfacesForThisTooth,
  conditions,
  onToothClick,
  onSurfaceClick,
  onToothContextMenu,
  onSurfaceContextMenu,
  onToothMouseEnter,
  onToothMouseLeave,
  hovered = false,
  lower = false,
  className,
}: OdontogramToothSVGProps) {
  const surfacesToRender = lower ? [...SURFACE_ORDER].reverse() : SURFACE_ORDER;
  const clipId = `tooth-clip-${toothId}-${lower ? "l" : "u"}`;
  const outlinePath = getToothOutlinePath();

  return (
    <g
      className={cn("cursor-pointer", className)}
      transform={lower ? `scale(1,-1) translate(0,${-TOOTH_H - PAD * 2})` : ""}
      onContextMenu={(e) => { e.preventDefault(); onToothContextMenu?.(e); }}
      onMouseEnter={onToothMouseEnter}
      onMouseLeave={onToothMouseLeave}
    >
      <defs>
        <clipPath id={clipId}>
          <path transform={`translate(${PAD},${PAD})`} d={outlinePath} />
        </clipPath>
      </defs>
      {/* Contenido recortado a forma de diente (las 5 superficies siguen clicables) */}
      <g clipPath={`url(#${clipId})`}>
        {/* Fondo del diente */}
        <rect
          x={PAD}
          y={PAD}
          width={TOOTH_W}
          height={TOOTH_H}
          rx={2}
          ry={2}
          fill={TOOTH_FILL}
          stroke="none"
          onClick={onToothClick}
        />
        {/* 5 superficies clicables con color por condición */}
      {surfacesToRender.map((code) => {
        const color = getSurfaceColor(conditions, code);
        const topLayer = getSurfaceTopLayer(conditions, code);
        const isConditionLayer = topLayer === "CONDITION";
        const isSelected = selectedSurfacesForThisTooth.has(code);
        const points = SURFACE_POLYS[code].split(" ").map((p) => {
          const [x, y] = p.split(",").map(Number);
          return `${x + PAD},${y + PAD}`;
        }).join(" ");
        return (
          <polygon
            key={code}
            points={points}
            fill={color ? `${color}99` : "transparent"}
            stroke={isSelected ? SELECTION_STROKE : isConditionLayer ? (color ?? SURFACE_DIVIDER) : SURFACE_DIVIDER}
            strokeWidth={isSelected ? 2 : isConditionLayer ? 1.5 : 0.5}
            strokeDasharray={isConditionLayer ? "4 2" : undefined}
            className="hover:opacity-80 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              onSurfaceClick(code, e);
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onSurfaceContextMenu?.(code, e);
            }}
          />
        );
      })}
        {/* Overlays según condición (ausente, extracción, corona, endodoncia) */}
        {hasCondition(conditions, "ausente") && (
          <g stroke={DESTRUCTIVE_STROKE} strokeWidth={2} strokeLinecap="round">
            <line x1={PAD + 4} y1={PAD + 4} x2={PAD + TOOTH_W - 4} y2={PAD + TOOTH_H - 4} />
            <line x1={PAD + TOOTH_W - 4} y1={PAD + 4} x2={PAD + 4} y2={PAD + TOOTH_H - 4} />
          </g>
        )}
        {hasCondition(conditions, "extraccion") && !hasCondition(conditions, "ausente") && (
          <g stroke="#737373" strokeWidth={1.5} fill="none">
            <path d={`M ${PAD + TOOTH_W/2} ${PAD + 2} L ${PAD + TOOTH_W/2} ${PAD + TOOTH_H - 2}`} />
            <path d={`M ${PAD + 4} ${PAD + TOOTH_H/2} Q ${PAD + TOOTH_W/2} ${PAD + TOOTH_H/2 - 6} ${PAD + TOOTH_W - 4} ${PAD + TOOTH_H/2}`} />
          </g>
        )}
        {hasCondition(conditions, "corona") && (
          <rect
            x={PAD + 1}
            y={PAD + 1}
            width={TOOTH_W - 2}
            height={TOOTH_H - 2}
            rx={2}
            fill="none"
            stroke={DENTAL_CONDITION_COLORS.corona}
            strokeWidth={2}
            pointerEvents="none"
          />
        )}
        {hasCondition(conditions, "endodoncia") && !hasCondition(conditions, "ausente") && (
          <line
            x1={PAD + TOOTH_W / 2}
            y1={PAD + O_H}
            x2={PAD + TOOTH_W / 2}
            y2={PAD + TOOTH_H - L_H}
            stroke={DENTAL_CONDITION_COLORS.endodoncia}
            strokeWidth={2}
            pointerEvents="none"
          />
        )}
      </g>
      {/* Contorno del diente por encima (señala la estructura tipo imagen) */}
      <path
        transform={`translate(${PAD},${PAD})`}
        d={outlinePath}
        fill="none"
        stroke={TOOTH_STROKE}
        strokeWidth={1.5}
        pointerEvents="none"
      />
      {/* Hover: resaltar contorno */}
      {hovered && !selected && (
        <path
          transform={`translate(${PAD},${PAD})`}
          d={outlinePath}
          fill="none"
          stroke={CIRCLE_STROKE}
          strokeWidth={2}
          pointerEvents="none"
          opacity={0.8}
        />
      )}
      {/* Borde de selección (misma forma que el diente) - estilo imagen 2: rojo */}
      {selected && (
        <path
          transform={`translate(${PAD},${PAD})`}
          d={outlinePath}
          fill="none"
          stroke={SELECTION_STROKE}
          strokeWidth={2}
          pointerEvents="none"
        />
      )}
      {/* Número FDI en círculo debajo del diente (estilo imagen 2); en arcada inferior el grupo está flipado, abajo = y negativo */}
      <g pointerEvents="none">
        <circle
          cx={PAD + TOOTH_W / 2}
          cy={lower ? -(PAD + TOOTH_H) - CIRCLE_Y_OFFSET - CIRCLE_R : PAD + TOOTH_H + CIRCLE_Y_OFFSET + CIRCLE_R}
          r={CIRCLE_R}
          fill={selected ? SELECTION_STROKE : "#ffffff"}
          stroke={selected ? SELECTION_STROKE : CIRCLE_STROKE}
          strokeWidth={1}
        />
        <text
          x={PAD + TOOTH_W / 2}
          y={lower ? -(PAD + TOOTH_H) - CIRCLE_Y_OFFSET - CIRCLE_R + 1 : PAD + TOOTH_H + CIRCLE_Y_OFFSET + CIRCLE_R + 1}
          textAnchor="middle"
          fontSize={9}
          fill={selected ? "#ffffff" : TEXT_FILL}
          fontWeight="500"
        >
          {toothId}
        </text>
      </g>
    </g>
  );
}

/** Convierte ToothData a ConditionForTooth[] */
export function toothDataToConditions(data: ToothData | undefined): ConditionForTooth[] {
  if (!data?.conditions?.length) return [];
  return data.conditions.map((c) => ({
    type: c.type,
    surfaces: c.surfaces ?? [],
    recordType: c.recordType,
    conditionKind: c.conditionKind,
  }));
}

interface OdontogramSVGProps {
  upperRight: string[];
  upperLeft: string[];
  lowerLeft: string[];
  lowerRight: string[];
  teeth: Record<string, ToothData>;
  selectedToothIds: Set<string>;
  selectedSurfaces: Set<SurfaceCode>;
  onToothClick: (e: React.MouseEvent, toothId: string) => void;
  onSurfaceClick: (toothId: string, surface: SurfaceCode, e: React.MouseEvent) => void;
  onToothContextMenu?: (e: React.MouseEvent, toothId: string) => void;
  onSurfaceContextMenu?: (toothId: string, surface: SurfaceCode, e: React.MouseEvent) => void;
  hoveredToothId: string | null;
  onToothHover?: (toothId: string | null) => void;
  className?: string;
}

const GAP = 1;
const SCALE = 1.2;
/** Altura de celda incluyendo círculo FDI debajo del diente (estilo imagen 2) */
const CELL_CONTENT_H = PAD + TOOTH_H + CIRCLE_Y_OFFSET + 2 * CIRCLE_R;

export function OdontogramSVG({
  upperRight,
  upperLeft,
  lowerLeft,
  lowerRight,
  teeth,
  selectedToothIds,
  selectedSurfaces,
  onToothClick,
  onSurfaceClick,
  onToothContextMenu,
  onSurfaceContextMenu,
  hoveredToothId,
  onToothHover,
  className,
}: OdontogramSVGProps) {
  const cellW = (TOOTH_W + PAD * 2 + GAP) * SCALE;
  const cellH = CELL_CONTENT_H * SCALE;

  const upperIds = [...upperRight, ...upperLeft];
  const lowerIds = [...lowerLeft, ...lowerRight];
  const width = upperIds.length * cellW;
  const height = 2 * cellH + 56;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn("w-full max-w-2xl h-auto", className)}
      style={{ maxHeight: 280 }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Arcada Superior */}
      <g transform={`scale(${SCALE})`}>
        {upperIds.map((id, i) => (
          <g key={id} transform={`translate(${i * (TOOTH_W + PAD * 2 + GAP)}, 0)`}>
            <OdontogramToothSVG
              toothId={id}
              selected={selectedToothIds.has(id)}
              selectedSurfacesForThisTooth={selectedSurfaces}
              conditions={toothDataToConditions(teeth[id])}
              onToothClick={(e) => onToothClick(e, id)}
              onSurfaceClick={(surface, e) => onSurfaceClick(id, surface, e)}
              onToothContextMenu={onToothContextMenu ? (e) => onToothContextMenu(e, id) : undefined}
              onSurfaceContextMenu={onSurfaceContextMenu ? (surface, e) => onSurfaceContextMenu(id, surface, e) : undefined}
              onToothMouseEnter={() => onToothHover?.(id)}
              onToothMouseLeave={() => onToothHover?.(null)}
              hovered={hoveredToothId === id}
            />
          </g>
        ))}
      </g>
      {/* Etiqueta Arcada Superior + arco */}
      <g transform={`translate(${width / 2}, ${cellH + 14})`}>
        <path d="M -32 -6 Q 0 -14 32 -6" fill="none" stroke={CIRCLE_STROKE} strokeWidth={1} />
        <text y={4} textAnchor="middle" fontSize={10} fill={TEXT_FILL}>Arcada Superior</text>
      </g>
      {/* Arcada Inferior */}
      <g transform={`scale(${SCALE}) translate(0, ${cellH + 20})`}>
        {lowerIds.map((id, i) => (
          <g key={id} transform={`translate(${i * (TOOTH_W + PAD * 2 + GAP)}, 0)`}>
            <OdontogramToothSVG
              toothId={id}
              selected={selectedToothIds.has(id)}
              selectedSurfacesForThisTooth={selectedSurfaces}
              conditions={toothDataToConditions(teeth[id])}
              onToothClick={(e) => onToothClick(e, id)}
              onSurfaceClick={(surface, e) => onSurfaceClick(id, surface, e)}
              onToothContextMenu={onToothContextMenu ? (e) => onToothContextMenu(e, id) : undefined}
              onSurfaceContextMenu={onSurfaceContextMenu ? (surface, e) => onSurfaceContextMenu(id, surface, e) : undefined}
              onToothMouseEnter={() => onToothHover?.(id)}
              onToothMouseLeave={() => onToothHover?.(null)}
              hovered={hoveredToothId === id}
              lower
            />
          </g>
        ))}
      </g>
      {/* Etiqueta Arcada Inferior + arco */}
      <g transform={`translate(${width / 2}, ${height - 18})`}>
        <path d="M -32 6 Q 0 14 32 6" fill="none" stroke={CIRCLE_STROKE} strokeWidth={1} />
        <text y={-2} textAnchor="middle" fontSize={10} fill={TEXT_FILL}>Arcada Inferior</text>
      </g>
      {/* Sextantes: 18-14=1, 13-23=2, 24-28=3, 38-34=4, 33-43=5, 44-48=6 */}
      {upperIds.length >= 16 && (() => {
        const seg = width / 6;
        const sextY = height - 2;
        return (
          <g fontSize={8} fill={TEXT_FILL}>
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <g key={n} transform={`translate(${seg * (n - 0.5)}, ${sextY})`}>
                <line y1={-8} y2={0} stroke={CIRCLE_STROKE} strokeWidth={0.5} />
                <text y={-10} textAnchor="middle">Sextante {n}</text>
              </g>
            ))}
          </g>
        );
      })()}
    </svg>
  );
}
