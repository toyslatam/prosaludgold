import { useLocation, useNavigate } from "react-router-dom";
import { Layers } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDemo } from "@/contexts/DemoContext";
import { useAppConfig } from "@/contexts/AppConfigContext";
import { DEMO_VERTICALS, type VerticalKey } from "@/config/demos";

/**
 * Selector de módulo activo, visible solo cuando la clínica tiene 2+
 * módulos habilitados. Cambia entre vistas dedicadas por vertical
 * (Odontología / Medicina General / Spa) manteniendo la misma sub-ruta.
 */
export function ModuleSwitcher() {
  const { vertical } = useDemo();
  const { enabledModules } = useAppConfig();
  const navigate = useNavigate();
  const location = useLocation();

  if (enabledModules.length <= 1) return null;

  const options = DEMO_VERTICALS.filter((v) => enabledModules.includes(v.key));

  const handleChange = (next: VerticalKey) => {
    const newPath = location.pathname.replace(/^\/demo\/[^/]+/, `/demo/${next}`);
    navigate(newPath);
  };

  return (
    <div className="px-3 pt-3">
      <Select value={vertical} onValueChange={handleChange}>
        <SelectTrigger className="h-9 bg-sidebar-accent/40 border-sidebar-border text-sidebar-foreground text-sm gap-2">
          <Layers className="w-3.5 h-3.5 shrink-0 text-sidebar-foreground/60" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="multi">Todos los módulos</SelectItem>
          {options.map((v) => (
            <SelectItem key={v.key} value={v.key}>
              {v.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
