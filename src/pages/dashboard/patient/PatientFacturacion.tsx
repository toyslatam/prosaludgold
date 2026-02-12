import { useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import type { Patient } from "@/data/mockData";
import { getPaymentsByPatient } from "@/lib/patients/payments";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export default function PatientFacturacion() {
  const { patient } = useOutletContext<{ patient: Patient }>();
  const payments = useMemo(() => getPaymentsByPatient(patient.id), [patient.id]);

  return (
    <div className="space-y-4">
      <Tabs defaultValue="pagos" className="w-full">
        <TabsList>
          <TabsTrigger value="pagos">Pagos</TabsTrigger>
          <TabsTrigger value="documentos">Documentos emitidos</TabsTrigger>
          <TabsTrigger value="devoluciones">Devoluciones</TabsTrigger>
          <TabsTrigger value="eliminados">Pagos eliminados</TabsTrigger>
          <TabsTrigger value="balance">Balance</TabsTrigger>
        </TabsList>
        <TabsContent value="pagos" className="mt-4">
          {payments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground/50" />
                <p className="mt-2 text-center text-muted-foreground text-sm">
                  El paciente no cuenta con pagos en el sistema
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Monto</TableHead>
                      <TableHead>Medio</TableHead>
                      <TableHead>Referencia</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Descripción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>
                          {format(parseISO(p.date), "d MMM yyyy", { locale: es })}
                        </TableCell>
                        <TableCell className="font-medium">
                          ${p.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>{p.method}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {p.reference ?? "—"}
                        </TableCell>
                        <TableCell>
                          <span
                            className={
                              p.status === "completado"
                                ? "text-success"
                                : p.status === "anulado"
                                  ? "text-muted-foreground"
                                  : "text-warning"
                            }
                          >
                            {p.status === "completado"
                              ? "Completado"
                              : p.status === "anulado"
                                ? "Anulado"
                                : "Pendiente"}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {p.description ?? "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="documentos" className="mt-4">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-2 text-center text-muted-foreground text-sm">
                No hay documentos emitidos para este paciente
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="devoluciones" className="mt-4">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-2 text-center text-muted-foreground text-sm">
                No hay devoluciones registradas
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="eliminados" className="mt-4">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-2 text-center text-muted-foreground text-sm">
                No hay pagos eliminados
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="balance" className="mt-4">
          <Card>
            <CardContent className="py-8">
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Saldo del paciente (mock)</span>
                  <span className="font-medium">
                    ${patient.balance?.toLocaleString() ?? "0"}
                  </span>
                </div>
                <p className="text-muted-foreground text-xs mt-2">
                  El balance detallado se calcula a partir de presupuestos y pagos (integración completa en backend).
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
