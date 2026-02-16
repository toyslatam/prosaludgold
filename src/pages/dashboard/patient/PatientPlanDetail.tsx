import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { useDemo } from "@/contexts/DemoContext";
import type { Patient } from "@/data/mockData";
import { getPlanById } from "@/lib/patients/treatmentPlans";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Maximize2, Pencil, Plus } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export default function PatientPlanDetail() {
  const { patient } = useOutletContext<{ patient: Patient }>();
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const { basePath } = useDemo();

  const plan =
    patient.id && planId ? getPlanById(patient.id, planId) : undefined;

  if (!plan) {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <p className="text-muted-foreground">Plan no encontrado</p>
        <Button variant="outline" onClick={() => navigate(`${basePath}/pacientes/${patient.id}/planes`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a planes
        </Button>
      </div>
    );
  }

  const totalAfterDiscount = plan.totalBudget * (1 - plan.discountPercent / 100);
  const saldo = totalAfterDiscount - plan.paid;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`${basePath}/pacientes/${patient.id}/planes`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* Columna izquierda: resumen financiero */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">
            Plan de tratamiento #{plan.number}
          </h2>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Resumen financiero</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Presupuesto total</span>
                <span className="font-medium">${plan.totalBudget.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Descuento comercial</span>
                <span className="font-medium">{plan.discountPercent}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Realizado</span>
                <span>${plan.realizado.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Abonado</span>
                <span>${plan.paid.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-muted-foreground">Saldo por abonar</span>
                <span className="font-medium">${saldo.toLocaleString()}</span>
              </div>
              {plan.paid === 0 && (
                <p className="text-xs text-muted-foreground pt-1">No hay abonos</p>
              )}
              <div className="pt-2 border-t space-y-1">
                <p className="text-muted-foreground text-xs">Profesional a cargo</p>
                <p className="font-medium">{plan.professionalName}</p>
              </div>
              {plan.collaborators.length > 0 && (
                <>
                  <p className="text-muted-foreground text-xs">Colaboradores</p>
                  <p className="text-sm">{plan.collaborators.join(", ")}</p>
                </>
              )}
              {plan.convenio && (
                <>
                  <p className="text-muted-foreground text-xs">Convenio</p>
                  <p className="text-sm">{plan.convenio}</p>
                </>
              )}
              {plan.branch && (
                <>
                  <p className="text-muted-foreground text-xs">Sucursal</p>
                  <p className="text-sm">{plan.branch}</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Citas del paciente</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {plan.lastAppointmentDate ? (
                <p>
                  Última:{" "}
                  {format(parseISO(plan.lastAppointmentDate), "d MMM yyyy", {
                    locale: es,
                  })}{" "}
                  {plan.lastAppointmentTime}
                </p>
              ) : (
                <p>Sin citas registradas para este plan</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Columna derecha: tabs y tabla prestaciones */}
        <div className="space-y-4">
          <Tabs defaultValue="ortodoncia" className="w-full">
            <TabsList>
              <TabsTrigger value="ortodoncia">Ortodoncia</TabsTrigger>
              <TabsTrigger value="odontograma">Odontograma</TabsTrigger>
              <TabsTrigger value="estetica">Estética facial</TabsTrigger>
            </TabsList>
            <TabsContent value="ortodoncia" className="mt-4 space-y-4">
              <Tabs defaultValue="resumen" className="w-full">
                <TabsList className="h-9">
                  <TabsTrigger value="resumen">Resumen</TabsTrigger>
                  <TabsTrigger value="plantilla">Plantilla fotográfica</TabsTrigger>
                  <TabsTrigger value="diagnostico">Diagnóstico</TabsTrigger>
                  <TabsTrigger value="plan">Plan de tratamiento</TabsTrigger>
                  <TabsTrigger value="rx">Rx y Cf</TabsTrigger>
                </TabsList>
                <TabsContent value="resumen" className="mt-4">
                  <p className="text-sm text-muted-foreground">
                    Contenido del plan: {plan.name}
                  </p>
                </TabsContent>
                <TabsContent value="plantilla" className="mt-4">
                  <p className="text-sm text-muted-foreground">Plantilla fotográfica (próximamente)</p>
                </TabsContent>
                <TabsContent value="diagnostico" className="mt-4">
                  <p className="text-sm text-muted-foreground">Diagnóstico (próximamente)</p>
                </TabsContent>
                <TabsContent value="plan" className="mt-4">
                  <p className="text-sm text-muted-foreground">Plan de tratamiento (próximamente)</p>
                </TabsContent>
                <TabsContent value="rx" className="mt-4">
                  <p className="text-sm text-muted-foreground">Rx y Cf (próximamente)</p>
                </TabsContent>
              </Tabs>
            </TabsContent>
            <TabsContent value="odontograma" className="mt-4">
              <p className="text-sm text-muted-foreground">Odontograma (Fase 4)</p>
            </TabsContent>
            <TabsContent value="estetica" className="mt-4">
              <p className="text-sm text-muted-foreground">Estética facial (próximamente)</p>
            </TabsContent>
          </Tabs>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="gap-1">
              <Maximize2 className="h-4 w-4" />
              Pantalla completa
            </Button>
            <Button variant="outline" size="sm" className="gap-1">
              <Pencil className="h-4 w-4" />
              Editar
            </Button>
            <Button variant="outline" size="sm">+ Nueva evolución</Button>
          </div>

          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle className="text-base">Prestaciones</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-1">
                    <Plus className="h-4 w-4" />
                    Sección
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Plus className="h-4 w-4" />
                    Prestación
                  </Button>
                  <Button variant="outline" size="sm">Acciones</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PRESTACIÓN</TableHead>
                    <TableHead>DSCTO</TableHead>
                    <TableHead>PRECIO</TableHead>
                    <TableHead>PAGO</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plan.prestaciones.map((pr) => (
                    <TableRow key={pr.id}>
                      <TableCell>{pr.name}</TableCell>
                      <TableCell>{pr.discountPercent ?? 0}%</TableCell>
                      <TableCell>${pr.price.toLocaleString()}</TableCell>
                      <TableCell>${(pr.paid ?? 0).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
