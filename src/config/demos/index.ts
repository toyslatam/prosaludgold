/**
 * Configs por vertical (industria). Para agregar una nueva demo: crear config y añadir a DEMO_VERTICALS y getDemoConfig.
 */
import type { VerticalKey, VerticalConfig } from "./types";
import { dentalConfig } from "./dental";
import { medicalConfig } from "./medical";
import { spaConfig } from "./spa";

export type { VerticalKey, VerticalConfig, HeroConfig, ProblemItem, ModuleItem, HowItWorksStep, NavItemConfig } from "./types";

export const DEMO_VERTICALS: { key: VerticalKey; name: string }[] = [
  { key: "dental", name: "Odontología" },
  { key: "medical", name: "Medicina General" },
  { key: "spa", name: "Spa" },
];

const configs: Record<VerticalKey, VerticalConfig> = {
  dental: dentalConfig,
  medical: medicalConfig,
  spa: spaConfig,
};

export function getDemoConfig(vertical: string): VerticalConfig {
  const key = vertical as VerticalKey;
  if (key in configs) return configs[key];
  return dentalConfig;
}

export function isValidVertical(vertical: string): vertical is VerticalKey {
  return vertical === "dental" || vertical === "medical" || vertical === "spa";
}

export { dentalConfig, medicalConfig, spaConfig };
