import { differenceInYears, parseISO } from "date-fns";
import { Calendar, FileDown, Lock } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Patient } from "@/data/mockData";
import { permissions } from "@/lib/patients/permissions";
import { cn } from "@/lib/utils";

interface PatientHeaderProps {
  patient: Patient;
  basePath: string;
  onAgendar?: () => void;
  onHistoriaClinica?: () => void;
  className?: string;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function getAge(birthDate: string): number | null {
  try {
    const d = parseISO(birthDate);
    return differenceInYears(new Date(), d);
  } catch {
    return null;
  }
}

function getGenderLabel(gender?: string): string {
  if (!gender) return "";
  if (gender === "M") return "Masculino";
  if (gender === "F") return "Femenino";
  return gender;
}

export function PatientHeader({
  patient,
  basePath,
  onAgendar,
  onHistoriaClinica,
  className,
}: PatientHeaderProps) {
  const age = getAge(patient.birthDate);

  return (
    <header
      className={cn(
        "sticky top-0 z-10 bg-primary text-primary-foreground shadow-md",
        className
      )}
    >
      <div className="px-4 py-4 md:px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-4">
            <Avatar className="h-14 w-14 border-2 border-primary-foreground/30">
              <AvatarFallback className="text-lg font-semibold">
                {getInitials(patient.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm opacity-90">ID {patient.id.toUpperCase()}</p>
              <h1 className="text-xl font-bold tracking-tight md:text-2xl">
                {patient.name}
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm opacity-90">
                <span>{patient.cedula}</span>
                {patient.gender && (
                  <>
                    <span aria-hidden>·</span>
                    <span>{getGenderLabel(patient.gender)}</span>
                  </>
                )}
                {age != null && (
                  <>
                    <span aria-hidden>·</span>
                    <span>{age} años</span>
                  </>
                )}
                {patient.benefits && (
                  <Badge
                    variant="secondary"
                    className="bg-primary-foreground/20 text-primary-foreground border-0"
                  >
                    {patient.benefits}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {!permissions.canViewMedicalHistory && (
              <div className="flex items-center gap-2 rounded-lg bg-primary-foreground/15 px-3 py-2 text-sm">
                <Lock className="h-4 w-4 shrink-0" />
                <span>
                  No posee los permisos para ver los antecedentes médicos del
                  paciente
                </span>
              </div>
            )}
            {onAgendar && (
              <Button
                variant="secondary"
                size="sm"
                className="gap-2 bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                onClick={onAgendar}
              >
                <Calendar className="h-4 w-4" />
                Agendar
              </Button>
            )}
            {onHistoriaClinica && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10"
                onClick={onHistoriaClinica}
              >
                <FileDown className="h-4 w-4" />
                Historia clínica
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
