"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import type { DoctorRow } from "@/lib/agenda/types";

export interface DoctorComboboxProps {
  doctors: DoctorRow[];
  value: string;
  onChange: (doctorId: string) => void;
  searchPlaceholder?: string;
  selectPlaceholder?: string;
  disabled?: boolean;
  className?: string;
}

export function DoctorCombobox({
  doctors,
  value,
  onChange,
  searchPlaceholder = "Buscar por nombre o especialidad…",
  selectPlaceholder = "Seleccione doctor",
  disabled,
  className,
}: DoctorComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const selected = value ? doctors.find((d) => d.id === value) : null;

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
          <span className="truncate">
            {selected ? (
              <>
                {selected.name}
                <span className="text-muted-foreground font-normal ml-1">
                  · {selected.specialty}
                </span>
              </>
            ) : (
              selectPlaceholder
            )}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command shouldFilter>
          <CommandInput placeholder={searchPlaceholder} autoFocus />
          <CommandList>
            <CommandEmpty>No se encontraron resultados.</CommandEmpty>
            <CommandGroup>
              {doctors.map((d) => (
                <CommandItem
                  key={d.id}
                  value={`${d.name} ${d.specialty} ${d.branch}`}
                  onSelect={() => {
                    onChange(d.id);
                    setOpen(false);
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4 shrink-0", value === d.id ? "opacity-100" : "opacity-0")} />
                  <div className="flex flex-col items-start">
                    <span>{d.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {d.specialty}
                      {d.branch ? ` · ${d.branch}` : ""}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
