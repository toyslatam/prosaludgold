import { useMemo, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useDemo } from "@/contexts/DemoContext";
import type { Patient } from "@/data/mockData";
import { getPlansByPatient } from "@/lib/patients/treatmentPlans";
import type { TreatmentPlan, PlanFinancialStatus } from "@/lib/patients/treatmentPlans";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<PlanFinancialStatus, string> = {
  diagnostico: "Diagnóstico",
  en_curso: "En curso",
  finalizado: "Finalizado",
};

export default function PatientPlanes() {
  const { patient } = useOutletContext<{ patient: Patient }>();
  const navigate = useNavigate();
  const { basePath } = useDemo();
  const [filter, setFilter] = useState<"activos" | "todos">("activos");

  const allPlans = useMemo(() => getPlansByPatient(patient.id), [patient.id]);
  const plans = useMemo(() => {
    if (filter === "activos") {
      return allPlans.filter((p) => p.status !== "finalizado");
    }
    return allPlans;
  }, [allPlans, filter]);

  const handleNewPlan = () => {
    toast.info("Crear nuevo plan (próximamente)");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-lg font-semibold">Planes de tratamiento</h2>
          <Select value={filter} onValueChange={(v) => setFilter(v as "activos" | "todos")}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="activos">Tratamientos activos</SelectItem>
              <SelectItem value="todos">Todos</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button className="gap-2 bg-green-600 hover:bg-green-700" onClick={handleNewPlan}>
          <Plus className="h-4 w-4" />
          Nuevo plan de tratamiento
        </Button>
      </div>

      {plans.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground text-sm">
            {filter === "activos"
              ? "No hay planes de tratamiento activos"
              : "No hay planes de tratamiento para este paciente"}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onClick={() => navigate(`${basePath}/pacientes/${patient.id}/planes/${plan.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PlanCard({
  plan,
  onClick,
}: {
  plan: TreatmentPlan;
  onClick: () => void;
}) {
  const totalAfterDiscount = plan.totalBudget * (1 - plan.discountPercent / 100);
  const progressPercent =
    totalAfterDiscount > 0 ? Math.round((plan.paid / totalAfterDiscount) * 100) : 0;
  const lastAppointment =
    plan.lastAppointmentDate && plan.lastAppointmentTime
      ? format(
          parseISO(`${plan.lastAppointmentDate}T${plan.lastAppointmentTime}`),
          "d MMM yyyy, HH:mm",
          { locale: es }
        )
      : "—";

  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-md"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold text-primary">
              #{plan.number}: {plan.name}
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">
              {plan.professionalName}
              {plan.specialty && ` · ${plan.specialty}`}
            </p>
          </div>
          <span
            className={cn(
              "shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium",
              plan.status === "finalizado" && "bg-success/10 text-success border-success/20",
              plan.status === "en_curso" && "bg-info/10 text-info border-info/20",
              plan.status === "diagnostico" && "bg-muted text-muted-foreground border-border"
            )}
          >
            {STATUS_LABELS[plan.status]}
          </span>
        </div>
        {plan.collaborators.length > 0 && (
          <p className="text-xs text-muted-foreground mt-1">
            Colaboradores: {plan.collaborators.join(", ")}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          Última cita: {lastAppointment}
        </p>
        <div className="mt-3">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Progreso</span>
            <span>{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Presupuesto: ${plan.totalBudget.toLocaleString()} · Abonado: $
          {plan.paid.toLocaleString()} · Saldo: $
          {(totalAfterDiscount - plan.paid).toLocaleString()}
        </p>
      </CardContent>
    </Card>
  );
}
