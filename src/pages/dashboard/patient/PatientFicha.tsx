import { useOutletContext } from "react-router-dom";
import type { Patient } from "@/data/mockData";
import { permissions } from "@/lib/patients/permissions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ClinicalTimeline } from "@/components/patient/ClinicalTimeline";
import { DentalChartFDI } from "@/components/patient/DentalChartFDI";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PatientFicha() {
  const { patient } = useOutletContext<{ patient: Patient }>();
  const canViewMedical = permissions.canViewMedicalHistory;

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
          <Card><CardContent className="py-8 text-center text-muted-foreground text-sm">Evoluciones (próximamente)</CardContent></Card>
        </TabsContent>
        <TabsContent value="antecedentes" className="mt-4">
          <Card><CardContent className="py-8 text-center text-muted-foreground text-sm">Antecedentes médicos (próximamente)</CardContent></Card>
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
          <Card><CardContent className="py-8 text-center text-muted-foreground text-sm">Recetas (próximamente)</CardContent></Card>
        </TabsContent>
        <TabsContent value="documentos" className="mt-4">
          <Card><CardContent className="py-8 text-center text-muted-foreground text-sm">Documentos Clínicos (próximamente)</CardContent></Card>
        </TabsContent>
        <TabsContent value="consentimientos" className="mt-4">
          <Card><CardContent className="py-8 text-center text-muted-foreground text-sm">Consentimientos (próximamente)</CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
