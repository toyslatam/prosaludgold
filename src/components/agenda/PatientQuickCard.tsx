import { SITUATION_LABELS } from "@/types/agenda";
import type { SituationFinancial } from "@/types/agenda";
import type { PatientRow } from "@/lib/agenda/types";
import { Mail, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

const situationClass: Record<SituationFinancial, string> = {
  deuda: "bg-destructive/10 text-destructive border-destructive/20",
  sin_saldo: "bg-warning/10 text-warning border-warning/20",
  saldada: "bg-success/10 text-success border-success/20",
};

interface PatientQuickCardProps {
  patient: PatientRow;
  nextAppointment?: string | null;
  onViewPatient?: () => void;
  className?: string;
}

export function PatientQuickCard({ patient, nextAppointment, onViewPatient, className }: PatientQuickCardProps) {
  return (
    <div className={cn("space-y-3 min-w-[240px]", className)}>
      <div>
        <p className="font-semibold text-sm">{patient.name}</p>
        {patient.phone && (
          <a href={`tel:${patient.phone}`} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground mt-1">
            <Phone className="h-3 w-3" />
            {patient.phone}
          </a>
        )}
        {patient.email && (
          <a href={`mailto:${patient.email}`} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground mt-0.5">
            <Mail className="h-3 w-3" />
            {patient.email}
          </a>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        <span className={cn("text-xs px-2 py-0.5 rounded-full border", situationClass[patient.situation])}>
          {SITUATION_LABELS[patient.situation]}
        </span>
        {patient.balance !== 0 && (
          <span className="text-xs text-muted-foreground">Saldo: ${patient.balance}</span>
        )}
      </div>
      {nextAppointment && (
        <p className="text-xs text-muted-foreground">Próxima cita: {nextAppointment}</p>
      )}
      {onViewPatient && (
        <button
          type="button"
          onClick={onViewPatient}
          className="text-xs text-primary hover:underline font-medium"
        >
          Ver ficha del paciente →
        </button>
      )}
    </div>
  );
}
