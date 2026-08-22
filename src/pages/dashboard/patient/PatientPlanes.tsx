import { useMemo, useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useDemo } from "@/contexts/DemoContext";
import type { Patient } from "@/data/mockData";
import { getPlansByPatient, addTreatmentPlan } from "@/lib/patients/treatmentPlans";
import type { TreatmentPlan, PlanFinancialStatus, Prestacion } from "@/lib/patients/treatmentPlans";
import { getDoctors } from "@/lib/agenda/repository";
import { getTreatmentPlanLabels } from "@/config/treatmentPlanLabels";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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

const EMPTY_PRESTACION = { name: "", price: "" };

export default function PatientPlanes() {
  const { patient } = useOutletContext<{ patient: Patient }>();
  const navigate = useNavigate();
  const { basePath, vertical } = useDemo();
  const labels = getTreatmentPlanLabels(vertical);
  const [filter, setFilter] = useState<"activos" | "todos">("activos");
  const [refresh, setRefresh] = useState(0);

  const [allPlans, setAllPlans] = useState<TreatmentPlan[]>([]);

  useEffect(() => {
    let cancelled = false;
    getPlansByPatient(patient.id)
      .then((data) => {
        if (!cancelled) setAllPlans(data);
      })
      .catch(() => {
        if (!cancelled) toast.error("No se pudieron cargar los planes de tratamiento.");
      });
    return () => {
      cancelled = true;
    };
  }, [patient.id, refresh]);

  const plans = useMemo(() => {
    if (filter === "activos") {
      return allPlans.filter((p) => p.status !== "finalizado");
    }
    return allPlans;
  }, [allPlans, filter]);

  const doctors = useMemo(() => getDoctors(), []);

  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [professionalId, setProfessionalId] = useState("");
  const [discountPercent, setDiscountPercent] = useState("0");
  const [prestaciones, setPrestaciones] = useState([{ ...EMPTY_PRESTACION }]);
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setName("");
    setProfessionalId(doctors[0]?.id ?? "");
    setDiscountPercent("0");
    setPrestaciones([{ ...EMPTY_PRESTACION }]);
    setModalOpen(true);
  };

  const addPrestacion = () => setPrestaciones((prev) => [...prev, { ...EMPTY_PRESTACION }]);
  const updatePrestacion = (index: number, field: "name" | "price", value: string) => {
    setPrestaciones((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };
  const removePrestacion = (index: number) => {
    setPrestaciones((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Ingrese un nombre");
      return;
    }
    const doctor = doctors.find((d) => d.id === professionalId);
    if (!doctor) {
      toast.error(`Seleccione ${labels.professionalLabel.toLowerCase()}`);
      return;
    }
    const validPrestaciones: Prestacion[] = prestaciones
      .filter((p) => p.name.trim() && parseFloat(p.price) > 0)
      .map((p, i) => ({
        id: `pr-${Date.now()}-${i}`,
        name: p.name.trim(),
        price: parseFloat(p.price),
        paid: 0,
      }));
    if (validPrestaciones.length === 0) {
      toast.error(labels.itemRequiredError);
      return;
    }
    const totalBudget = validPrestaciones.reduce((sum, p) => sum + p.price, 0);
    const discount = parseFloat(discountPercent) || 0;

    setSaving(true);
    try {
      await addTreatmentPlan({
        patientId: patient.id,
        name: name.trim(),
        professionalId: doctor.id,
        professionalName: doctor.name,
        specialty: doctor.specialty,
        collaborators: [],
        branch: doctor.branch,
        totalBudget,
        discountPercent: discount,
        prestaciones: validPrestaciones,
      });
      toast.success(labels.createdToast);
      setModalOpen(false);
      setRefresh((r) => r + 1);
    } catch {
      toast.error(labels.createErrorToast);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-lg font-semibold">{labels.sectionTitle}</h2>
          <Select value={filter} onValueChange={(v) => setFilter(v as "activos" | "todos")}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="activos">Activos</SelectItem>
              <SelectItem value="todos">Todos</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button className="gap-2 bg-green-600 hover:bg-green-700" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          {labels.newButtonLabel}
        </Button>
      </div>

      {plans.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground text-sm">
            {filter === "activos"
              ? `No hay ${labels.sectionTitle.toLowerCase()} activos`
              : `No hay ${labels.sectionTitle.toLowerCase()} para este paciente`}
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

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{labels.newDialogTitle}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={labels.namePlaceholder}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{labels.professionalLabel}</Label>
                <Select value={professionalId} onValueChange={setProfessionalId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Descuento comercial (%)</Label>
                <Input
                  type="text"
                  inputMode="decimal"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{labels.itemsLabel}</Label>
              {prestaciones.map((p, i) => (
                <div key={i} className="grid grid-cols-[1fr_140px_auto] gap-2 items-center">
                  <Input
                    placeholder={labels.itemNamePlaceholder}
                    value={p.name}
                    onChange={(e) => updatePrestacion(i, "name", e.target.value)}
                  />
                  <Input
                    type="text"
                    inputMode="decimal"
                    placeholder="Precio"
                    value={p.price}
                    onChange={(e) => updatePrestacion(i, "price", e.target.value)}
                  />
                  <Button type="button" variant="ghost" size="sm" onClick={() => removePrestacion(i)}>
                    Quitar
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addPrestacion}>
                {labels.addItemLabel}
              </Button>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)} disabled={saving}>
                Cancelar
              </Button>
              <Button onClick={handleCreate} disabled={saving}>
                {saving ? "Creando…" : "Crear"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
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
