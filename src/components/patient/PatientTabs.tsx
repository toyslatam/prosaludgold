import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const allTabs = [
  { to: "datos", label: "Datos personales", dentalOnly: false },
  { to: "ficha", label: "Ficha clínica", dentalOnly: true },
  { to: "planes", label: "Planes de tratamiento", dentalOnly: false },
  { to: "facturacion", label: "Facturación y pagos", dentalOnly: false },
  { to: "recibir-pago", label: "Recibir pago", dentalOnly: false },
] as const;

interface PatientTabsProps {
  basePath: string;
  isDental?: boolean;
  className?: string;
}

export function PatientTabs({ basePath, isDental = true, className }: PatientTabsProps) {
  const tabs = isDental ? allTabs : allTabs.filter((t) => !t.dentalOnly);
  return (
    <nav
      className={cn(
        "border-b border-border bg-background shrink-0",
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
