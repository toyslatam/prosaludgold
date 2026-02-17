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
import type { Procedure } from "@/lib/agenda/procedures";

const PROCEDURE_OTHER = "__other__";

export interface ProcedureComboboxProps {
  procedures: Procedure[];
  value: string;
  onChange: (procedureId: string) => void;
  searchPlaceholder?: string;
  selectPlaceholder?: string;
  disabled?: boolean;
  className?: string;
}

export function ProcedureCombobox({
  procedures,
  value,
  onChange,
  searchPlaceholder = "Buscar procedimiento…",
  selectPlaceholder = "Seleccione procedimiento",
  disabled,
  className,
}: ProcedureComboboxProps) {
  const [open, setOpen] = React.useState(false);

  const selected = value && value !== PROCEDURE_OTHER
    ? procedures.find((p) => p.id === value)
    : value === PROCEDURE_OTHER
      ? { id: PROCEDURE_OTHER, name: "Otro (especificar)", category: "", color: "#94a3b8" }
      : null;

  const byCategory = React.useMemo(() => {
    const map = new Map<string, Procedure[]>();
    for (const p of procedures) {
      const list = map.get(p.category) ?? [];
      list.push(p);
      map.set(p.category, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [procedures]);

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
          <span className="truncate flex items-center gap-2">
            {selected ? (
              <>
                <span
                  className="inline-block w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: selected.color }}
                />
                {selected.name}
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
            {byCategory.map(([category, list]) => (
              <CommandGroup key={category} heading={category}>
                {list.map((p) => (
                  <CommandItem
                    key={p.id}
                    value={`${p.name} ${p.category} ${p.code}`}
                    onSelect={() => {
                      onChange(p.id);
                      setOpen(false);
                    }}
                  >
                    <Check className={cn("mr-2 h-4 w-4 shrink-0", value === p.id ? "opacity-100" : "opacity-0")} />
                    <span
                      className="inline-block w-3 h-3 rounded-full mr-2 shrink-0"
                      style={{ backgroundColor: p.color }}
                    />
                    <div className="flex flex-col items-start min-w-0">
                      <span>{p.name}</span>
                      <span className="text-xs text-muted-foreground">{p.category}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
            <CommandGroup>
              <CommandItem
                value="Otro especificar otro"
                onSelect={() => {
                  onChange(PROCEDURE_OTHER);
                  setOpen(false);
                }}
              >
                <Check className={cn("mr-2 h-4 w-4 shrink-0", value === PROCEDURE_OTHER ? "opacity-100" : "opacity-0")} />
                <span className="text-muted-foreground">Otro (especificar)</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export { PROCEDURE_OTHER };
