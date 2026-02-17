import {
  DENTAL_CONDITION_COLORS,
  type DentalCondition,
  type SurfaceCode,
} from "@/lib/patients/dentalChart";
import type { ToothData } from "@/lib/patients/dentalChart";
import { cn } from "@/lib/utils";

const SURFACE_ORDER: SurfaceCode[] = ["O", "V", "M", "D", "L"];

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

export interface ConditionForTooth {
  type: DentalCondition;
  surfaces: SurfaceCode[];
}

interface OdontogramToothSVGProps {
  toothId: string;
  selected: boolean;
  selectedSurfacesForThisTooth: Set<SurfaceCode>;
  conditions: ConditionForTooth[];
  onToothClick: (e: React.MouseEvent) => void;
  onSurfaceClick: (surface: SurfaceCode, e: React.MouseEvent) => void;
  /** Si es arcada inferior, el diente se dibuja "al revés" (O abajo) */
  lower?: boolean;
  className?: string;
}

/** Color por superficie: última condición que afecta esa superficie (o toda la pieza) */
function getSurfaceColor(
  conditions: ConditionForTooth[],
  surface: SurfaceCode
): string | null {
  for (let i = conditions.length - 1; i >= 0; i--) {
    const c = conditions[i];
    const applies = !c.surfaces?.length || c.surfaces.includes(surface);
    if (applies) return DENTAL_CONDITION_COLORS[c.type] ?? null;
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
  lower = false,
  className,
}: OdontogramToothSVGProps) {
  const surfacesToRender = lower ? [...SURFACE_ORDER].reverse() : SURFACE_ORDER;

  return (
    <g
      className={cn("cursor-pointer", className)}
      transform={lower ? `scale(1,-1) translate(0,${-TOOTH_H - PAD * 2})` : ""}
    >
      {/* Fondo del diente */}
      <rect
        x={PAD}
        y={PAD}
        width={TOOTH_W}
        height={TOOTH_H}
        rx={2}
        ry={2}
        fill="var(--muted)"
        stroke="var(--border)"
        strokeWidth={1.5}
        onClick={onToothClick}
      />
      {/* 5 superficies clicables con color por condición */}
      {surfacesToRender.map((code) => {
        const color = getSurfaceColor(conditions, code);
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
            stroke={isSelected ? "var(--primary)" : "transparent"}
            strokeWidth={2}
            className="hover:opacity-80 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              onSurfaceClick(code, e);
            }}
          />
        );
      })}
      {/* Overlays según condición (ausente, extracción, corona, endodoncia) */}
      {hasCondition(conditions, "ausente") && (
        <g stroke="var(--destructive)" strokeWidth={2} strokeLinecap="round">
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
      {/* Borde de selección */}
      {selected && (
        <rect
          x={PAD - 1}
          y={PAD - 1}
          width={TOOTH_W + 2}
          height={TOOTH_H + 2}
          rx={3}
          fill="none"
          stroke="var(--primary)"
          strokeWidth={2}
          pointerEvents="none"
        />
      )}
      {/* Número FDI (en arcada inferior se deshace el flip para que se lea bien) */}
      {lower ? (
        <g transform={`translate(${PAD + TOOTH_W/2},${PAD + TOOTH_H/2 + 4}) scale(1,-1) translate(${-(PAD + TOOTH_W/2)},${-(PAD + TOOTH_H/2 + 4)})`}>
          <text
            x={PAD + TOOTH_W / 2}
            y={PAD + TOOTH_H / 2 + 4}
            textAnchor="middle"
            fontSize={10}
            fill="var(--muted-foreground)"
            pointerEvents="none"
          >
            {toothId}
          </text>
        </g>
      ) : (
        <text
          x={PAD + TOOTH_W / 2}
          y={PAD + TOOTH_H / 2 + 4}
          textAnchor="middle"
          fontSize={10}
          fill="var(--muted-foreground)"
          pointerEvents="none"
        >
          {toothId}
        </text>
      )}
    </g>
  );
}

/** Convierte ToothData a ConditionForTooth[] */
export function toothDataToConditions(data: ToothData | undefined): ConditionForTooth[] {
  if (!data?.conditions?.length) return [];
  return data.conditions.map((c) => ({
    type: c.type,
    surfaces: c.surfaces ?? [],
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
  className?: string;
}

const GAP = 1;
const SCALE = 1.2;

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
  className,
}: OdontogramSVGProps) {
  const cellW = (TOOTH_W + PAD * 2 + GAP) * SCALE;
  const cellH = (TOOTH_H + PAD * 2 + GAP) * SCALE;

  const upperIds = [...upperRight, ...upperLeft];
  const lowerIds = [...lowerLeft, ...lowerRight];
  const width = upperIds.length * cellW;
  const height = 2 * cellH + 32;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn("w-full max-w-2xl h-auto", className)}
      style={{ maxHeight: 220 }}
    >
      {/* Maxilar */}
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
            />
          </g>
        ))}
      </g>
      {/* Etiqueta Maxilar */}
      <text
        x={width / 2}
        y={cellH + 12}
        textAnchor="middle"
        fontSize={10}
        fill="var(--muted-foreground)"
      >
        Maxilar
      </text>
      {/* Mandíbula */}
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
              lower
            />
          </g>
        ))}
      </g>
      <text
        x={width / 2}
        y={height - 4}
        textAnchor="middle"
        fontSize={10}
        fill="var(--muted-foreground)"
      >
        Mandíbula
      </text>
    </svg>
  );
}
