/**
 * Contexto del demo por vertical. Soporta modo multi-vertical cuando el admin
 * tiene más de un módulo habilitado en su clinic_config.
 */
import { createContext, useContext, useMemo } from "react";
import { useParams, Navigate } from "react-router-dom";
import { getDemoConfig, isValidVertical, buildMultiConfig } from "@/config/demos";
import type { VerticalConfig, VerticalKey } from "@/config/demos";

type DemoContextValue = {
  vertical: VerticalKey;
  basePath: string;
  isDental: boolean;
};

const DemoContext = createContext<DemoContextValue | null>(null);

interface DemoProviderProps {
  children: React.ReactNode;
  /** Módulos habilitados provenientes de AppConfigContext */
  enabledModules?: string[];
}

export function DemoProvider({ children, enabledModules }: DemoProviderProps) {
  const { vertical: param } = useParams<{ vertical: string }>();
  const vertical = param && isValidVertical(param) ? param : "multi";
  const basePath = `/demo/${vertical}`;
  const value = useMemo(
    () => ({
      vertical,
      basePath,
      isDental: vertical === "dental",
    }),
    [vertical, basePath],
  );

  if (param && !isValidVertical(param)) {
    return <Navigate to="/demo/multi" replace />;
  }
  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo(): DemoContextValue {
  const ctx = useContext(DemoContext);
  if (!ctx) {
    return {
      vertical: "multi",
      basePath: "/demo/multi",
      isDental: false,
    };
  }
  return ctx;
}

export function useDemoConfig(enabledModules?: string[]): VerticalConfig {
  const { vertical } = useDemo();
  if (vertical === "multi" && enabledModules?.length) {
    return buildMultiConfig(enabledModules);
  }
  return getDemoConfig(vertical, enabledModules);
}
