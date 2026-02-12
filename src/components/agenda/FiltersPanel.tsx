import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { statusLabels } from "@/data/mockData";
import { SITUATION_LABELS } from "@/types/agenda";
import type { AppointmentStatus, SituationFinancial } from "@/types/agenda";
import type { DoctorRow, ChairRow } from "@/lib/agenda/types";
import { Filter, X } from "lucide-react";

export interface AgendaFiltersState {
  searchPatient: string;
  doctorId: string;
  status: AppointmentStatus | "";
  situation: SituationFinancial | "";
  chairId: string;
  /** Estados seleccionados (avanzado) */
  statuses: AppointmentStatus[];
  situations: SituationFinancial[];
  confirmWhatsapp: boolean | null;
  confirmEmail: boolean | null;
  noConfirm: boolean | null;
}

const DEFAULT_FILTERS: AgendaFiltersState = {
  searchPatient: "",
  doctorId: "all",
  status: "",
  situation: "",
  chairId: "all",
  statuses: [],
  situations: [],
  confirmWhatsapp: null,
  confirmEmail: null,
  noConfirm: null,
};

export function getDefaultAgendaFilters(): AgendaFiltersState {
  return { ...DEFAULT_FILTERS };
}

interface FiltersPanelProps {
  filters: AgendaFiltersState;
  onFiltersChange: (f: AgendaFiltersState) => void;
  doctors: DoctorRow[];
  chairs: ChairRow[];
  className?: string;
}

const ALL_STATUSES: AppointmentStatus[] = ["pendiente", "confirmada", "en_sala", "atendida", "no_asistio", "anulada"];
const ALL_SITUATIONS: SituationFinancial[] = ["deuda", "sin_saldo", "saldada"];

export function FiltersPanel({ filters, onFiltersChange, doctors, chairs, className }: FiltersPanelProps) {
  const update = (patch: Partial<AgendaFiltersState>) => onFiltersChange({ ...filters, ...patch });

  const toggleStatus = (s: AppointmentStatus) => {
    const next = filters.statuses.includes(s) ? filters.statuses.filter((x) => x !== s) : [...filters.statuses, s];
    update({ statuses: next });
  };

  const toggleSituation = (s: SituationFinancial) => {
    const next = filters.situations.includes(s) ? filters.situations.filter((x) => x !== s) : [...filters.situations, s];
    update({ situations: next });
  };

  const clearFilters = () => onFiltersChange(getDefaultAgendaFilters());

  return (
    <div className={className}>
      <div className="flex flex-wrap gap-3 items-center">
        <Input
          placeholder="Buscar paciente..."
          value={filters.searchPatient}
          onChange={(e) => update({ searchPatient: e.target.value })}
          className="max-w-[220px]"
        />
        <Select value={filters.doctorId} onValueChange={(v) => update({ doctorId: v })}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Doctor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los doctores</SelectItem>
            {doctors.map((d) => (
              <SelectItem key={d.id} value={d.id}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filters.status || "all"} onValueChange={(v) => update({ status: v === "all" ? "" : (v as AppointmentStatus) })}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            {ALL_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {statusLabels[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filters.situation || "all"} onValueChange={(v) => update({ situation: v === "all" ? "" : (v as SituationFinancial) })}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Situación" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {ALL_SITUATIONS.map((s) => (
              <SelectItem key={s} value={s}>
                {SITUATION_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Filtros avanzados
            </Button>
          </SheetTrigger>
          <SheetContent className="overflow-y-auto sm:max-w-sm">
            <SheetHeader>
              <SheetTitle>Filtros avanzados</SheetTitle>
            </SheetHeader>
            <div className="space-y-6 mt-6">
              <div>
                <Label className="text-sm font-medium">Estados de cita</Label>
                <div className="grid grid-cols-1 gap-2 mt-2">
                  {ALL_STATUSES.map((s) => (
                    <div key={s} className="flex items-center space-x-2">
                      <Checkbox
                        id={`st-${s}`}
                        checked={filters.statuses.includes(s)}
                        onCheckedChange={() => toggleStatus(s)}
                      />
                      <label htmlFor={`st-${s}`} className="text-sm font-normal cursor-pointer">
                        {statusLabels[s]}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Situación financiera</Label>
                <div className="grid grid-cols-1 gap-2 mt-2">
                  {ALL_SITUATIONS.map((s) => (
                    <div key={s} className="flex items-center space-x-2">
                      <Checkbox
                        id={`si-${s}`}
                        checked={filters.situations.includes(s)}
                        onCheckedChange={() => toggleSituation(s)}
                      />
                      <label htmlFor={`si-${s}`} className="text-sm font-normal cursor-pointer">
                        {SITUATION_LABELS[s]}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Box / Sillón</Label>
                <Select value={filters.chairId} onValueChange={(v) => update({ chairId: v })}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {chairs.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} {c.branch ? `· ${c.branch}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" className="w-full gap-2" onClick={clearFilters}>
                <X className="h-4 w-4" />
                Limpiar filtros
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
