import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, UserPlus } from "lucide-react";
import * as React from "react";
import type { PatientRow } from "@/lib/agenda/types";
import { PatientQuickCard } from "./PatientQuickCard";

interface PatientAutocompleteProps {
  patients: PatientRow[];
  value: PatientRow | null;
  onChange: (patient: PatientRow | null) => void;
  placeholder?: string;
  disabled?: boolean;
  onCreatePatient?: () => void;
  nextAppointmentByPatientId?: Record<string, string>;
  className?: string;
}

export function PatientAutocomplete({
  patients,
  value,
  onChange,
  placeholder = "Buscar paciente por nombre o teléfono...",
  disabled,
  onCreatePatient,
  nextAppointmentByPatientId,
  className,
}: PatientAutocompleteProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn("w-full justify-between font-normal", className)}
        >
          {value ? value.name : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[360px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Nombre, teléfono..." />
          <CommandList>
            <CommandEmpty>No se encontró paciente.</CommandEmpty>
            <CommandGroup>
              {patients.map((p) => (
                <CommandItem
                  key={p.id}
                  value={`${p.name} ${p.phone} ${p.email}`}
                  onSelect={() => {
                    onChange(p);
                    setOpen(false);
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value?.id === p.id ? "opacity-100" : "opacity-0")} />
                  <div className="flex flex-col items-start">
                    <span>{p.name}</span>
                    {p.phone && <span className="text-xs text-muted-foreground">{p.phone}</span>}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
            {onCreatePatient && (
              <CommandGroup>
                <CommandItem onSelect={() => { onCreatePatient(); setOpen(false); }}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Crear paciente rápido
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
        {value && (
          <div className="border-t p-3 bg-muted/30">
            <PatientQuickCard
              patient={value}
              nextAppointment={nextAppointmentByPatientId?.[value.id]}
              onViewPatient={() => setOpen(false)}
            />
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
