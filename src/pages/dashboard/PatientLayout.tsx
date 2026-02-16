import { useCallback } from "react";
import { Navigate, Outlet, useNavigate, useParams } from "react-router-dom";
import { useDemo } from "@/contexts/DemoContext";
import { getPatientById } from "@/lib/patients/repository";
import { PatientHeader } from "@/components/patient/PatientHeader";
import { PatientTabs } from "@/components/patient/PatientTabs";
import { toast } from "sonner";

export default function PatientLayout() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const { basePath: demoBasePath } = useDemo();
  const patient = patientId ? getPatientById(patientId) : undefined;

  const basePath = `${demoBasePath}/pacientes/${patientId}`;

  const handleAgendar = useCallback(() => {
    navigate(`${demoBasePath}/agenda?patientId=${patientId}`);
    toast.info("Redirigiendo a Agenda para agendar cita con este paciente");
  }, [navigate, patientId, demoBasePath]);

  const handleHistoriaClinica = useCallback(() => {
    const content = `HISTORIA CLÍNICA - ${patient.name}\nID: ${patient.id}\nCédula: ${patient.cedula}\nGenerado: ${new Date().toLocaleString("es")}\n\n(Export mock - integrar con PDF real según backend)`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `historia-clinica-${patient.id}-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Historia clínica descargada");
  }, [patient]);

  if (!patientId) {
    return <Navigate to={`${demoBasePath}/pacientes`} replace />;
  }

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <p className="text-muted-foreground">Paciente no encontrado</p>
        <button
          type="button"
          className="text-primary hover:underline"
          onClick={() => navigate(`${demoBasePath}/pacientes`)}
        >
          Volver a la lista
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-0">
      <PatientHeader
        patient={patient}
        basePath={basePath}
        onAgendar={handleAgendar}
        onHistoriaClinica={handleHistoriaClinica}
      />
      <PatientTabs basePath={basePath} />
      <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-muted/20">
        <Outlet context={{ patient }} />
      </div>
    </div>
  );
}
