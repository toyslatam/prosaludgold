import { useOutletContext } from "react-router-dom";
import type { Patient } from "@/data/mockData";
import { useDemo } from "@/contexts/DemoContext";
import { permissions } from "@/lib/patients/permissions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ClinicalTimeline } from "@/components/patient/ClinicalTimeline";
import { DentalChartFDI } from "@/components/patient/DentalChartFDI";
import { EvolucionesList } from "@/components/patient/EvolucionesList";
import { AntecedentesForm } from "@/components/patient/AntecedentesForm";
import { RecetasList } from "@/components/patient/RecetasList";
import { DocumentosClinicosList } from "@/components/patient/DocumentosClinicosList";
import { ConsentimientosList } from "@/components/patient/ConsentimientosList";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PatientFicha() {
  const { patient } = useOutletContext<{ patient: Patient }>();
  const { isDental } = useDemo();
  const canViewMedical = permissions.canViewMedicalHistory;

  if (!isDental) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          La ficha clínica con odontograma, evoluciones y consentimientos está disponible solo en el vertical dental.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="historial" className="w-full">
        <TabsList className="flex flex-wrap gap-1">
          <TabsTrigger value="historial">Historial</TabsTrigger>
          <TabsTrigger value="evoluciones">Evoluciones</TabsTrigger>
          <TabsTrigger value="antecedentes" disabled={!canViewMedical} className={cn(!canViewMedical && "opacity-60")}>
            Antecedentes médicos
          </TabsTrigger>
          <TabsTrigger value="odontograma">Odontograma</TabsTrigger>
          <TabsTrigger value="periodontograma">Periodontograma</TabsTrigger>
          <TabsTrigger value="rx">Rx y Documentos</TabsTrigger>
          <TabsTrigger value="recetas">Recetas</TabsTrigger>
          <TabsTrigger value="documentos">Documentos Clínicos</TabsTrigger>
          <TabsTrigger value="consentimientos">Consentimientos</TabsTrigger>
        </TabsList>
        <TabsContent value="historial" className="mt-4">
          <ClinicalTimeline patientId={patient.id} />
        </TabsContent>
        <TabsContent value="evoluciones" className="mt-4">
          <EvolucionesList patientId={patient.id} />
        </TabsContent>
        <TabsContent value="antecedentes" className="mt-4">
          <AntecedentesForm patientId={patient.id} />
        </TabsContent>
        <TabsContent value="odontograma" className="mt-4">
          <DentalChartFDI patientId={patient.id} />
        </TabsContent>
        <TabsContent value="periodontograma" className="mt-4">
          <Card><CardContent className="py-8 text-center text-muted-foreground text-sm">Periodontograma (próximamente)</CardContent></Card>
        </TabsContent>
        <TabsContent value="rx" className="mt-4">
          <Card><CardContent className="py-8 text-center text-muted-foreground text-sm">Rx y Documentos (próximamente)</CardContent></Card>
        </TabsContent>
        <TabsContent value="recetas" className="mt-4">
          <RecetasList patientId={patient.id} />
        </TabsContent>
        <TabsContent value="documentos" className="mt-4">
          <DocumentosClinicosList patientId={patient.id} />
        </TabsContent>
        <TabsContent value="consentimientos" className="mt-4">
          <ConsentimientosList patientId={patient.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
