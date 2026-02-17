/**
 * Inventario por vertical. Persistencia en localStorage.
 */

import type { VerticalKey } from "@/config/demos";
import type { InventoryItem } from "./types";
import { mockInventory } from "@/data/mockData";

const STORAGE_PREFIX = "psg_inventory_";

function storageKey(vertical: VerticalKey): string {
  return `${STORAGE_PREFIX}${vertical}`;
}

function load(vertical: VerticalKey): InventoryItem[] {
  try {
    const raw = localStorage.getItem(storageKey(vertical));
    if (!raw) return [];
    return JSON.parse(raw) as InventoryItem[];
  } catch {
    return [];
  }
}

function save(vertical: VerticalKey, items: InventoryItem[]): void {
  localStorage.setItem(storageKey(vertical), JSON.stringify(items));
}

/** Obtiene items del inventario del vertical. Si está vacío, inicializa con copia del mock. */
export function getInventoryItems(vertical: VerticalKey): InventoryItem[] {
  let items = load(vertical);
  if (items.length === 0) {
    items = mockInventory.map((i) => ({ ...i, id: `${i.id}-${vertical}`, stock: i.stock, minStock: i.minStock }));
    save(vertical, items);
  }
  return items;
}

export function getInventoryItemById(vertical: VerticalKey, itemId: string): InventoryItem | undefined {
  return getInventoryItems(vertical).find((i) => i.id === itemId);
}

/** Actualiza el stock de un item (delta positivo = suma, negativo = resta). */
export function updateItemStock(
  vertical: VerticalKey,
  itemId: string,
  delta: number
): InventoryItem | null {
  const items = getInventoryItems(vertical);
  const idx = items.findIndex((i) => i.id === itemId);
  if (idx === -1) return null;
  items[idx] = { ...items[idx], stock: Math.max(0, items[idx].stock + delta) };
  save(vertical, items);
  return items[idx];
}

/** Fija el stock de un item (para entradas). */
export function setItemStock(
  vertical: VerticalKey,
  itemId: string,
  newStock: number
): InventoryItem | null {
  const items = getInventoryItems(vertical);
  const idx = items.findIndex((i) => i.id === itemId);
  if (idx === -1) return null;
  items[idx] = { ...items[idx], stock: Math.max(0, newStock) };
  save(vertical, items);
  return items[idx];
}
