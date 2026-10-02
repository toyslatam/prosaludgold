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

export interface FilterComboboxOption {
  value: string;
  label: string;
  sublabel?: string;
  /** Texto adicional usado solo para la búsqueda (ej. especialidad, dirección completa) */
  searchText?: string;
}

interface FilterComboboxProps {
  options: FilterComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  allLabel: string;
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
}

export function FilterCombobox({
  options,
  value,
  onChange,
  allLabel,
  placeholder,
  searchPlaceholder = "Buscar…",
  className,
}: FilterComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const selected = value && value !== "all" ? options.find((o) => o.value === value) : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between font-normal gap-2", className)}
        >
          <span className="truncate">{selected ? selected.label : (placeholder ?? allLabel)}</span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] min-w-[260px] p-0" align="start">
        <Command shouldFilter>
          <CommandInput placeholder={searchPlaceholder} autoFocus />
          <CommandList>
            <CommandEmpty>No se encontraron resultados.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value={allLabel}
                onSelect={() => {
                  onChange("all");
                  setOpen(false);
                }}
              >
                <Check className={cn("mr-2 h-4 w-4 shrink-0", !selected ? "opacity-100" : "opacity-0")} />
                {allLabel}
              </CommandItem>
              {options.map((o) => (
                <CommandItem
                  key={o.value}
                  value={`${o.label} ${o.searchText ?? ""}`}
                  onSelect={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4 shrink-0", value === o.value ? "opacity-100" : "opacity-0")} />
                  <div className="flex flex-col items-start min-w-0">
                    <span className="truncate">{o.label}</span>
                    {o.sublabel && <span className="text-xs text-muted-foreground truncate">{o.sublabel}</span>}
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
