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

export type PaymentMethod = "yappy" | "ach" | "tarjeta_credito" | "transferencia_internacional" | "efectivo";

export const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "yappy", label: "Yappy" },
  { value: "ach", label: "Transferencia bancaria ACH" },
  { value: "tarjeta_credito", label: "Tarjeta de crédito" },
  { value: "transferencia_internacional", label: "Transferencia internacional" },
  { value: "efectivo", label: "Efectivo" },
];

/** Métodos que llevan ITBMS; efectivo queda fuera (usa el check "Se factura" en su lugar). */
export const ITBMS_METHODS: PaymentMethod[] = ["yappy", "ach", "tarjeta_credito", "transferencia_internacional"];

interface PaymentMethodComboboxProps {
  value: PaymentMethod | "";
  onChange: (value: PaymentMethod) => void;
  placeholder?: string;
  className?: string;
}

export function PaymentMethodCombobox({
  value,
  onChange,
  placeholder = "Seleccionar método de pago",
  className,
}: PaymentMethodComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const selected = PAYMENT_METHODS.find((m) => m.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between font-normal", className)}
        >
          <span className="truncate">{selected ? selected.label : placeholder}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar método de pago…" />
          <CommandList>
            <CommandEmpty>No se encontró el método.</CommandEmpty>
            <CommandGroup>
              {PAYMENT_METHODS.map((m) => (
                <CommandItem
                  key={m.value}
                  value={m.label}
                  onSelect={() => {
                    onChange(m.value);
                    setOpen(false);
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value === m.value ? "opacity-100" : "opacity-0")} />
                  {m.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
