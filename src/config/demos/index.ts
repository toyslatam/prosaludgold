/**
 * Configs por vertical (industria). Para agregar una nueva demo: crear config y añadir a DEMO_VERTICALS y getDemoConfig.
 */
import type { VerticalKey, VerticalConfig } from "./types";
import { dentalConfig } from "./dental";
import { medicalConfig } from "./medical";
import { spaConfig } from "./spa";
import { buildMultiConfig } from "./multi";

export type { VerticalKey, VerticalConfig, HeroConfig, ProblemItem, ModuleItem, HowItWorksStep, NavItemConfig } from "./types";
export { buildMultiConfig };

export const DEMO_VERTICALS: { key: VerticalKey; name: string }[] = [
  { key: "dental", name: "Odontología" },
  { key: "medical", name: "Medicina General" },
  { key: "spa", name: "Spa" },
];

const configs: Record<string, VerticalConfig> = {
  dental: dentalConfig,
  medical: medicalConfig,
  spa: spaConfig,
};

export function getDemoConfig(vertical: string, enabledModules?: string[]): VerticalConfig {
  if (vertical === "multi" && enabledModules?.length) {
    return buildMultiConfig(enabledModules);
  }
  if (vertical in configs) return configs[vertical];
  return dentalConfig;
}

export function isValidVertical(vertical: string): vertical is VerticalKey {
  return ["dental", "medical", "spa", "multi"].includes(vertical);
}

export { dentalConfig, medicalConfig, spaConfig };
