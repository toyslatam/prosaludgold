/**
 * Movimientos de inventario (kardex) por vertical.
 */

import type { VerticalKey } from "@/config/demos";
import type { InventoryMovement, MovementReason, MovementType } from "./types";

const STORAGE_PREFIX = "psg_inventory_movements_";

function storageKey(vertical: VerticalKey): string {
  return `${STORAGE_PREFIX}${vertical}`;
}

function load(vertical: VerticalKey): InventoryMovement[] {
  try {
    const raw = localStorage.getItem(storageKey(vertical));
    if (!raw) return [];
    return JSON.parse(raw) as InventoryMovement[];
  } catch {
    return [];
  }
}

function save(vertical: VerticalKey, list: InventoryMovement[]): void {
  localStorage.setItem(storageKey(vertical), JSON.stringify(list));
}

function nextId(): string {
  return `mov-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function getMovements(vertical: VerticalKey, itemId?: string): InventoryMovement[] {
  const list = load(vertical);
  const filtered = itemId ? list.filter((m) => m.itemId === itemId) : list;
  return filtered.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function addMovement(
  vertical: VerticalKey,
  params: {
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
  }
): InventoryMovement {
  const list = load(vertical);
  const movement: InventoryMovement = {
    id: nextId(),
    vertical,
    itemId: params.itemId,
    type: params.type,
    quantity: params.quantity,
    unitLabel: params.unitLabel,
    reason: params.reason,
    refId: params.refId,
    refLabel: params.refLabel,
    patientId: params.patientId,
    patientName: params.patientName,
    professionalId: params.professionalId,
    professionalName: params.professionalName,
    createdAt: new Date().toISOString(),
  };
  list.push(movement);
  save(vertical, list);
  return movement;
}
