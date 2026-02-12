import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "datos", label: "Datos personales" },
  { to: "ficha", label: "Ficha clínica" },
  { to: "planes", label: "Planes de tratamiento" },
  { to: "facturacion", label: "Facturación y pagos" },
  { to: "recibir-pago", label: "Recibir pago" },
] as const;

interface PatientTabsProps {
  basePath: string;
  className?: string;
}

export function PatientTabs({ basePath, className }: PatientTabsProps) {
  return (
    <nav
      className={cn(
        "border-b border-border bg-background",
        className
      )}
      aria-label="Tabs del paciente"
    >
      <div className="flex gap-1 overflow-x-auto px-4 md:px-6">
        {tabs.map(({ to, label }) => {
          const path = `${basePath}/${to}`;
          return (
            <NavLink
              key={to}
              to={path}
              end={to === "datos"}
              className={({ isActive }) =>
                cn(
                  "whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:border-muted-foreground/30 hover:text-foreground"
                )
              }
            >
              {label}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
