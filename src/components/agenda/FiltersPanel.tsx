import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { FilterCombobox } from "./FilterCombobox";
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
  branch: string;
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
  branch: "all",
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

  const branches = Array.from(new Set(doctors.map((d) => d.branch).filter(Boolean))).sort();
  // Algunas sedes se guardaron como "Nombre; dirección completa" — mostramos solo el nombre, buscamos por ambos.
  const shortBranchLabel = (b: string) => b.split(";")[0].trim();

  return (
    <div className={className}>
      <div className="flex flex-wrap gap-3 items-center">
        <Input
          placeholder="Buscar paciente..."
          value={filters.searchPatient}
          onChange={(e) => update({ searchPatient: e.target.value })}
          className="max-w-[220px]"
        />
        <FilterCombobox
          className="w-[190px]"
          value={filters.branch || "all"}
          onChange={(v) => update({ branch: v })}
          allLabel="Todas las sucursales"
          searchPlaceholder="Buscar sucursal…"
          options={branches.map((b) => ({ value: b, label: shortBranchLabel(b), searchText: b }))}
        />
        <FilterCombobox
          className="w-[190px]"
          value={filters.chairId || "all"}
          onChange={(v) => update({ chairId: v })}
          allLabel="Todas las cabinas"
          searchPlaceholder="Buscar cabina…"
          options={chairs.map((c) => ({ value: c.id, label: c.name, searchText: c.branch }))}
        />
        <FilterCombobox
          className="w-[200px]"
          value={filters.doctorId}
          onChange={(v) => update({ doctorId: v })}
          allLabel="Todos los doctores"
          searchPlaceholder="Buscar doctor…"
          options={doctors.map((d) => ({ value: d.id, label: d.name, sublabel: d.specialty, searchText: d.specialty }))}
        />
        <FilterCombobox
          className="w-[180px]"
          value={filters.status || "all"}
          onChange={(v) => update({ status: v === "all" ? "" : (v as AppointmentStatus) })}
          allLabel="Todos los estados"
          searchPlaceholder="Buscar estado…"
          options={ALL_STATUSES.map((s) => ({ value: s, label: statusLabels[s] }))}
        />
        <FilterCombobox
          className="w-[160px]"
          value={filters.situation || "all"}
          onChange={(v) => update({ situation: v === "all" ? "" : (v as SituationFinancial) })}
          allLabel="Todas"
          searchPlaceholder="Buscar situación…"
          options={ALL_SITUATIONS.map((s) => ({ value: s, label: SITUATION_LABELS[s] }))}
        />
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
