/**
 * Profesionales y especialidades por vertical (dental | medical | spa).
 */

import type { VerticalKey } from "@/config/demos";

export interface Specialty {
  id: string;
  vertical: VerticalKey;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CommissionType = "PERCENT" | "FIXED";

export interface Professional {
  id: string;
  vertical: VerticalKey;
  fullName: string;
  specialtyId: string;
  siteIds: string[];
  isAvailable: boolean;
  isActive: boolean;
  commissionDefault: { type: CommissionType; value: number };
  phone?: string;
  email?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
