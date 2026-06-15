import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { DemoProvider } from "./contexts/DemoContext";
import { AppConfigProvider } from "./contexts/AppConfigContext";
import { OnboardingWizard } from "./components/onboarding/OnboardingWizard";
import { useAppConfig } from "./contexts/AppConfigContext";
import DashboardLayout from "./pages/dashboard/DashboardLayout";
import DashboardHome from "./pages/dashboard/DashboardHome";
import Agenda from "./pages/dashboard/Agenda";
import Procedimientos from "./pages/dashboard/Procedimientos";
import Pacientes from "./pages/dashboard/Pacientes";
import PatientLayout from "./pages/dashboard/PatientLayout";
import PatientData from "./pages/dashboard/patient/PatientData";
import PatientFicha from "./pages/dashboard/patient/PatientFicha";
import PatientPlanes from "./pages/dashboard/patient/PatientPlanes";
import PatientPlanDetail from "./pages/dashboard/patient/PatientPlanDetail";
import PatientFacturacion from "./pages/dashboard/patient/PatientFacturacion";
import PatientRecibirPago from "./pages/dashboard/patient/PatientRecibirPago";
import AtencionClinica from "./pages/dashboard/AtencionClinica";
import Doctores from "./pages/dashboard/Doctores";
import Caja from "./pages/dashboard/Caja";
import Remuneraciones from "./pages/dashboard/Remuneraciones";
import Inventario from "./pages/dashboard/Inventario";
import Laboratorios from "./pages/dashboard/Laboratorios";
import Gastos from "./pages/dashboard/Gastos";
import Reportes from "./pages/dashboard/Reportes";
import ExperienciaPaciente from "./pages/dashboard/ExperienciaPaciente";
import IAHub from "./pages/dashboard/IAHub";
import Configuracion from "./pages/dashboard/Configuracion";

const queryClient = new QueryClient();

const RequireAuth = ({ session, children }: { session: Session | null | "loading"; children: React.ReactNode }) => {
  if (session === "loading") return null;
  if (!session) return <Navigate to="/" replace />;
  return <>{children}</>;
};

/** Shows OnboardingWizard overlay until onboarding_complete = true */
const OnboardingGate = ({ children }: { children: React.ReactNode }) => {
  const { isOnboardingComplete, isLoading } = useAppConfig();
  if (isLoading) return null;
  return (
    <>
      {!isOnboardingComplete && <OnboardingWizard />}
      {children}
    </>
  );
};

const App = () => {
  const [session, setSession] = useState<Session | null | "loading">("loading");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/demo" element={<Navigate to="/demo/multi" replace />} />
            <Route
              path="/demo/:vertical"
              element={
                <RequireAuth session={session}>
                  <AppConfigProvider>
                    <OnboardingGate>
                      <DemoProvider><DashboardLayout /></DemoProvider>
                    </OnboardingGate>
                  </AppConfigProvider>
                </RequireAuth>
              }
            >
              <Route index element={<DashboardHome />} />
              <Route path="agenda" element={<Agenda />} />
              <Route path="procedimientos" element={<Procedimientos />} />
              <Route path="pacientes">
                <Route index element={<Pacientes />} />
                <Route path=":patientId" element={<PatientLayout />}>
                  <Route index element={<Navigate to="datos" replace />} />
                  <Route path="datos" element={<PatientData />} />
                  <Route path="ficha" element={<PatientFicha />} />
                  <Route path="planes">
                    <Route index element={<PatientPlanes />} />
                    <Route path=":planId" element={<PatientPlanDetail />} />
                  </Route>
                  <Route path="facturacion" element={<PatientFacturacion />} />
                  <Route path="recibir-pago" element={<PatientRecibirPago />} />
                </Route>
              </Route>
              <Route path="atencion" element={<AtencionClinica />} />
              <Route path="doctores" element={<Doctores />} />
              <Route path="caja" element={<Caja />} />
              <Route path="remuneraciones" element={<Remuneraciones />} />
              <Route path="inventario" element={<Inventario />} />
              <Route path="laboratorios" element={<Laboratorios />} />
              <Route path="gastos" element={<Gastos />} />
              <Route path="reportes" element={<Reportes />} />
              <Route path="experiencia" element={<ExperienciaPaciente />} />
              <Route path="ia" element={<IAHub />} />
              <Route path="configuracion" element={<Configuracion />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
