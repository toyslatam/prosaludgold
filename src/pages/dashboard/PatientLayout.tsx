import { useCallback } from "react";
import { Navigate, Outlet, useNavigate, useParams } from "react-router-dom";
import { useDemo } from "@/contexts/DemoContext";
import { getPatientById } from "@/lib/patients/repository";
import { generateClinicalHistoryPdf } from "@/lib/patients/generateClinicalHistoryPdf";
import { PatientHeader } from "@/components/patient/PatientHeader";
import { PatientTabs } from "@/components/patient/PatientTabs";
import { toast } from "sonner";

export default function PatientLayout() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const { basePath: demoBasePath, vertical } = useDemo();
  const patient = patientId ? getPatientById(patientId) : undefined;

  const basePath = `${demoBasePath}/pacientes/${patientId}`;
  const isDental = vertical === "dental";

  const handleAgendar = useCallback(() => {
    navigate(`${demoBasePath}/agenda?patientId=${patientId}`);
    toast.info("Redirigiendo a Agenda para agendar cita con este paciente");
  }, [navigate, patientId, demoBasePath]);

  const handleHistoriaClinica = useCallback(async () => {
    if (!patient) return;
    try {
      await generateClinicalHistoryPdf(patient);
      toast.success("Historia clínica descargada");
    } catch (err) {
      console.error(err);
      toast.error("Error al generar el PDF");
    }
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
      <div className="sticky top-0 z-20 shrink-0 bg-background shadow-sm">
        <PatientHeader
          patient={patient}
          basePath={basePath}
          onAgendar={handleAgendar}
          onHistoriaClinica={isDental ? handleHistoriaClinica : undefined}
        />
        <PatientTabs basePath={basePath} isDental={isDental} />
      </div>
      <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-muted/20 min-h-0">
        <Outlet context={{ patient }} />
      </div>
    </div>
  );
}
