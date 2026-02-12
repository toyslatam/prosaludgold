import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import type { Patient } from "@/data/mockData";
import {
  getPlansWithBalanceByPatient,
  applyPaymentToPlan,
  type TreatmentPlan,
} from "@/lib/patients/treatmentPlans";
import { addPayment } from "@/lib/patients/payments";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

/** Mock: cuotas de financiamiento (por plan con saldo) */
interface MockCuota {
  id: string;
  planId: string;
  planNumber: string;
  monto: number;
  pagado: number;
}

function buildMockCuotas(plans: TreatmentPlan[]): MockCuota[] {
  return plans
    .filter((p) => p.paid < p.totalBudget * (1 - p.discountPercent / 100))
    .map((p) => {
      const total = p.totalBudget * (1 - p.discountPercent / 100);
      const saldo = total - p.paid;
      return {
        id: `cuota-${p.id}`,
        planId: p.id,
        planNumber: p.number,
        monto: saldo,
        pagado: 0,
      };
    });
}

export default function PatientRecibirPago() {
  const { patient } = useOutletContext<{ patient: Patient }>();
  const [refresh, setRefresh] = useState(0);
  const [payPlanOpen, setPayPlanOpen] = useState(false);
  const [payCuotaOpen, setPayCuotaOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [amount, setAmount] = useState("");

  const plansWithBalance = useMemo(
    () => getPlansWithBalanceByPatient(patient.id),
    [patient.id, refresh]
  );
  const cuotas = useMemo(() => buildMockCuotas(plansWithBalance), [plansWithBalance]);

  const totalAfterDiscount = (p: TreatmentPlan) =>
    p.totalBudget * (1 - p.discountPercent / 100);
  const saldo = (p: TreatmentPlan) => totalAfterDiscount(p) - p.paid;

  const handleOpenPayPlan = (planId: string) => {
    setSelectedPlanId(planId);
    const plan = plansWithBalance.find((x) => x.id === planId);
    setAmount(plan ? String(saldo(plan)) : "");
    setPayPlanOpen(true);
  };

  const handleConfirmPayPlan = () => {
    if (!selectedPlanId || !amount) return;
    const num = parseFloat(amount.replace(",", "."));
    if (Number.isNaN(num) || num <= 0) {
      toast.error("Ingrese un monto válido");
      return;
    }
    applyPaymentToPlan(selectedPlanId, num);
    addPayment({
      patientId: patient.id,
      date: new Date().toISOString().slice(0, 10),
      amount: num,
      method: "Efectivo (mock)",
      reference: `PLAN-${selectedPlanId}`,
      status: "completado",
      description: "Abono a plan de tratamiento",
    });
    toast.success(`Pago de $${num.toLocaleString()} registrado`);
    setPayPlanOpen(false);
    setSelectedPlanId(null);
    setAmount("");
    setRefresh((r) => r + 1);
  };

  const handleOpenPayCuota = () => {
    if (cuotas.length > 0) {
      setSelectedPlanId(cuotas[0].planId);
      setAmount(String(cuotas[0].monto));
    }
    setPayCuotaOpen(true);
  };

  const handleConfirmPayCuota = () => {
    if (!selectedPlanId || !amount) return;
    const num = parseFloat(amount.replace(",", "."));
    if (Number.isNaN(num) || num <= 0) {
      toast.error("Ingrese un monto válido");
      return;
    }
    applyPaymentToPlan(selectedPlanId, num);
    addPayment({
      patientId: patient.id,
      date: new Date().toISOString().slice(0, 10),
      amount: num,
      method: "Cuota (mock)",
      reference: `CUOTA-${selectedPlanId}`,
      status: "completado",
      description: "Pago de cuota",
    });
    toast.success(`Cuota de $${num.toLocaleString()} registrada`);
    setPayCuotaOpen(false);
    setSelectedPlanId(null);
    setAmount("");
    setRefresh((r) => r + 1);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Ingresar un pago</h2>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Planes de tratamiento</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Presupuestos</TableHead>
                <TableHead>Total presupuesto</TableHead>
                <TableHead>Realizado</TableHead>
                <TableHead>Pagado</TableHead>
                <TableHead>Saldo por abonar</TableHead>
                <TableHead className="w-[140px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {plansWithBalance.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground text-sm py-8">
                    No hay planes con saldo pendiente
                  </TableCell>
                </TableRow>
              ) : (
                plansWithBalance.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">
                      #{plan.number} {plan.name}
                    </TableCell>
                    <TableCell>${plan.totalBudget.toLocaleString()}</TableCell>
                    <TableCell>${plan.realizado.toLocaleString()}</TableCell>
                    <TableCell>${plan.paid.toLocaleString()}</TableCell>
                    <TableCell>${saldo(plan).toLocaleString()}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleOpenPayPlan(plan.id)}
                      >
                        Pagar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <Button
            className="mt-4 gap-2 bg-green-600 hover:bg-green-700"
            disabled={plansWithBalance.length === 0}
            onClick={() =>
              plansWithBalance.length > 0 && handleOpenPayPlan(plansWithBalance[0].id)
            }
          >
            Pagar tratamiento(s)
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Por cuotas de financiamiento</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cuotas de crédito</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Pagado</TableHead>
                <TableHead>Saldo por abonar</TableHead>
                <TableHead className="w-[100px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {cuotas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground text-sm py-8">
                    No hay cuotas pendientes
                  </TableCell>
                </TableRow>
              ) : (
                cuotas.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>Plan #{c.planNumber}</TableCell>
                    <TableCell>${c.monto.toLocaleString()}</TableCell>
                    <TableCell>${c.pagado.toLocaleString()}</TableCell>
                    <TableCell>${(c.monto - c.pagado).toLocaleString()}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedPlanId(c.planId);
                          setAmount(String(c.monto));
                          setPayCuotaOpen(true);
                        }}
                      >
                        Pagar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <Button
            variant="outline"
            className="mt-4"
            disabled={cuotas.length === 0}
            onClick={handleOpenPayCuota}
          >
            Pagar cuotas
          </Button>
        </CardContent>
      </Card>

      <Dialog open={payPlanOpen} onOpenChange={setPayPlanOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pagar tratamiento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Monto a abonar</Label>
              <Input
                type="text"
                inputMode="decimal"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setPayPlanOpen(false)}>
                Cancelar
              </Button>
              <Button className="bg-green-600 hover:bg-green-700" onClick={handleConfirmPayPlan}>
                Registrar pago
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={payCuotaOpen} onOpenChange={setPayCuotaOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pagar cuota</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Monto</Label>
              <Input
                type="text"
                inputMode="decimal"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setPayCuotaOpen(false)}>
                Cancelar
              </Button>
              <Button className="bg-green-600 hover:bg-green-700" onClick={handleConfirmPayCuota}>
                Registrar pago
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
