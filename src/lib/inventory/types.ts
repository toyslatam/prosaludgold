/**
 * Tipos para inventario y movimientos (kardex). Multi-vertical.
 */

import type { VerticalKey } from "@/config/demos";

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  stock: number;
  minStock: number;
  unit: string;
  supplier: string;
}

export type MovementType = "IN" | "OUT";
export type MovementReason = "CARE_ENCOUNTER" | "MANUAL_ADJUST" | "PURCHASE_ENTRY";

export interface InventoryMovement {
  id: string;
  vertical: VerticalKey;
  itemId: string;
  type: MovementType;
  quantity: number;
  unitLabel?: string;
  reason: MovementReason;
  refId?: string;
  refLabel?: string;
  patientId?: string;
  patientName?: string;
  professionalId?: string;
  professionalName?: string;
  createdAt: string;
}
