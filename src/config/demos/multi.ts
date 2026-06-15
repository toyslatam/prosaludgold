import type { VerticalConfig, NavItemConfig } from "./types";
import { dentalConfig } from "./dental";
import { medicalConfig } from "./medical";
import { spaConfig } from "./spa";

const BASE_CONFIGS: Record<string, VerticalConfig> = {
  dental: dentalConfig,
  medical: medicalConfig,
  spa: spaConfig,
};

/**
 * Builds a combined VerticalConfig for multi-module organizations.
 * Nav items from all enabled modules are merged (deduped by pathKey).
 * Shared items (inicio, configuracion, ia, etc.) appear only once.
 */
export function buildMultiConfig(enabledModules: string[]): VerticalConfig {
  const modules = enabledModules.filter((m) => m in BASE_CONFIGS);
  if (modules.length === 0) return dentalConfig;
  if (modules.length === 1) return BASE_CONFIGS[modules[0]];

  // Merge nav items: shared pathKeys appear once (first occurrence wins)
  const seen = new Set<string>();
  const mergedNav: NavItemConfig[] = [];
  for (const module of modules) {
    for (const item of BASE_CONFIGS[module].navItems) {
      if (!seen.has(item.pathKey)) {
        seen.add(item.pathKey);
        mergedNav.push(item);
      }
    }
  }

  // Always ensure configuracion and ia appear at the end
  const PINNED_LAST = ["ia", "configuracion"];
  const pinned = mergedNav.filter((n) => PINNED_LAST.includes(n.pathKey));
  const rest = mergedNav.filter((n) => !PINNED_LAST.includes(n.pathKey));
  const orderedNav = [...rest, ...pinned];

  const names = modules.map((m) => BASE_CONFIGS[m].name).join(" · ");

  return {
    key: "multi",
    name: names,
    hero: dentalConfig.hero,
    problems: [],
    problemsTitle: "",
    problemsSubtitle: "",
    modules: [],
    modulesTitle: "",
    modulesSubtitle: "",
    howItWorksSteps: [],
    howItWorksTitle: "",
    howItWorksSubtitle: "",
    navItems: orderedNav,
  };
}
