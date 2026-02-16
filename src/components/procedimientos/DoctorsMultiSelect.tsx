import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Doctor {
  id: string;
  name: string;
}

interface DoctorsMultiSelectProps {
  doctors: Doctor[];
  value: string[];
  onChange: (ids: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function DoctorsMultiSelect({
  doctors,
  value,
  onChange,
  placeholder = "Seleccionar doctores",
  className,
}: DoctorsMultiSelectProps) {
  const [open, setOpen] = useState(false);

  const toggle = (id: string) => {
    if (value.includes(id)) {
      onChange(value.filter((x) => x !== id));
    } else {
      onChange([...value, id]);
    }
  };

  const label =
    value.length === 0
      ? placeholder
      : value.length === doctors.length
        ? "Todos"
        : value.length === 1
          ? doctors.find((d) => d.id === value[0])?.name ?? "1 doctor"
          : `${value.length} doctores`;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between font-normal", className)}
        >
          <span className="truncate">{label}</span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <ScrollArea className="h-[240px]">
          <div className="p-2 space-y-1">
            {doctors.map((d) => (
              <label
                key={d.id}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-2 text-sm cursor-pointer hover:bg-accent"
                )}
              >
                <Checkbox
                  checked={value.includes(d.id)}
                  onCheckedChange={() => toggle(d.id)}
                />
                <span>{d.name}</span>
              </label>
            ))}
          </div>
        </ScrollArea>
        <div className="border-t p-2 flex justify-between items-center text-xs text-muted-foreground">
          <span>{value.length} de {doctors.length} seleccionados</span>
          <button
            type="button"
            className="text-primary hover:underline"
            onClick={() => {
              if (value.length === doctors.length) onChange([]);
              else onChange(doctors.map((d) => d.id));
            }}
          >
            {value.length === doctors.length ? "Ninguno" : "Todos"}
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
