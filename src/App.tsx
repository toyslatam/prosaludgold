import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import DashboardLayout from "./pages/dashboard/DashboardLayout";
import DashboardHome from "./pages/dashboard/DashboardHome";
import Agenda from "./pages/dashboard/Agenda";
import Pacientes from "./pages/dashboard/Pacientes";
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/demo" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="agenda" element={<Agenda />} />
            <Route path="pacientes" element={<Pacientes />} />
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

export default App;
