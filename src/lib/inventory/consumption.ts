/**
 * Aplicar consumo de inventario al finalizar una atención (descuenta stock y registra movimientos).
 */

import type { VerticalKey } from "@/config/demos";
import type { InventoryUsedItem } from "@/types/careEncounter";
import { updateItemStock } from "./items";
import { addMovement } from "./movements";
import { getInventoryItemById } from "./items";

export function applyConsumptionFromEncounter(
  vertical: VerticalKey,
  params: {
    encounterId: string;
    refLabel: string;
    inventoryUsed: InventoryUsedItem[];
    patientId?: string;
    patientName?: string;
    professionalId?: string;
    professionalName?: string;
  }
): void {
  const { encounterId, refLabel, inventoryUsed, patientId, patientName, professionalId, professionalName } = params;
  for (const item of inventoryUsed) {
    if (!item.productId || item.quantity <= 0) continue;
    const invItem = getInventoryItemById(vertical, item.productId);
    if (!invItem) continue;
    updateItemStock(vertical, item.productId, -item.quantity);
    addMovement(vertical, {
      itemId: item.productId,
      type: "OUT",
      quantity: item.quantity,
      unitLabel: item.unit ?? invItem.unit,
      reason: "CARE_ENCOUNTER",
      refId: encounterId,
      refLabel,
      patientId,
      patientName,
      professionalId,
      professionalName,
    });
  }
}
