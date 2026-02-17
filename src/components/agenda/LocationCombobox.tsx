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
import { Check, ChevronsUpDown, Settings2 } from "lucide-react";
import type { LocationWithSiteName } from "@/lib/agenda/locations";

export interface LocationComboboxProps {
  locations: LocationWithSiteName[];
  value: string;
  onChange: (locationId: string) => void;
  placeholder?: string;
  disabled?: boolean;
  onOpenManage?: () => void;
  className?: string;
}

export function LocationCombobox({
  locations,
  value,
  onChange,
  placeholder = "Selecciona una ubicación…",
  disabled,
  onOpenManage,
  className,
}: LocationComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const selected = value ? locations.find((l) => l.id === value) : null;

  return (
    <div className={cn("flex gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className="flex-1 justify-between font-normal min-w-0"
          >
            <span className="truncate">
              {selected ? (
                <>
                  {selected.name}
                  <span className="text-muted-foreground font-normal ml-1">
                    · {selected.siteName} · {selected.type}
                  </span>
                </>
              ) : (
                placeholder
              )}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command>
            <CommandInput placeholder="Buscar ubicación…" />
            <CommandList>
              <CommandEmpty>No se encontró ubicación.</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  value="__ninguno__"
                  onSelect={() => {
                    onChange("");
                    setOpen(false);
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", !value ? "opacity-100" : "opacity-0")} />
                  Ninguno
                </CommandItem>
                {locations.map((loc) => (
                  <CommandItem
                    key={loc.id}
                    value={`${loc.name} ${loc.siteName} ${loc.type}`}
                    onSelect={() => {
                      onChange(loc.id);
                      setOpen(false);
                    }}
                  >
                    <Check className={cn("mr-2 h-4 w-4", value === loc.id ? "opacity-100" : "opacity-0")} />
                    <div className="flex flex-col items-start">
                      <span>{loc.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {loc.siteName} · {loc.type}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {onOpenManage && (
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={onOpenManage}
          title="Gestionar ubicaciones"
          aria-label="Gestionar ubicaciones"
        >
          <Settings2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
