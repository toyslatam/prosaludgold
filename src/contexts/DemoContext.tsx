/**
 * Contexto del demo por vertical. Proporciona basePath para que todos los links/navigate usen /demo/:vertical.
 */
import { createContext, useContext, useMemo } from "react";
import { useParams, Navigate } from "react-router-dom";
import { getDemoConfig, isValidVertical } from "@/config/demos";

type DemoContextValue = {
  vertical: string;
  basePath: string;
  isDental: boolean;
};

const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const { vertical: param } = useParams<{ vertical: string }>();
  if (param && !isValidVertical(param)) {
    return <Navigate to="/demo/dental" replace />;
  }
  const vertical = param && isValidVertical(param) ? param : "dental";
  const basePath = `/demo/${vertical}`;
  const value = useMemo(
    () => ({
      vertical,
      basePath,
      isDental: vertical === "dental",
    }),
    [vertical, basePath],
  );
  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const ctx = useContext(DemoContext);
  if (!ctx) {
    return {
      vertical: "dental",
      basePath: "/demo/dental",
      isDental: true,
    };
  }
  return ctx;
}

export function useDemoConfig() {
  const { vertical } = useDemo();
  return getDemoConfig(vertical);
}
