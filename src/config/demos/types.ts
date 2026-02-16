/**
 * Tipos para demos multi-vertical (Odontología, Medicina General, Spa).
 * Escalable: agregar nueva industria = nuevo config + key en VerticalKey.
 */

export type VerticalKey = "dental" | "medical" | "spa";

export interface HeroConfig {
  badge: string;
  title: string;
  /** Parte destacada del título (ej. "organizada e inteligente"). Si no se define, se usa solo title. */
  titleHighlight?: string;
  subtitle: string;
  ctaText: string;
  ctaSecondaryText: string;
  bullets: string[];
}

export interface ProblemItem {
  title: string;
  desc: string;
}

export interface ModuleItem {
  title: string;
  features: string[];
}

export interface HowItWorksStep {
  title: string;
  desc: string;
}

export interface NavItemConfig {
  pathKey: string;
  label: string;
}

export interface VerticalConfig {
  key: VerticalKey;
  name: string;
  hero: HeroConfig;
  problems: ProblemItem[];
  modules: ModuleItem[];
  howItWorksSteps: HowItWorksStep[];
  howItWorksTitle: string;
  howItWorksSubtitle: string;
  problemsTitle: string;
  problemsSubtitle: string;
  modulesTitle: string;
  modulesSubtitle: string;
  navItems: NavItemConfig[];
}
