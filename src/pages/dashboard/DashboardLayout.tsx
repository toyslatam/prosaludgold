import { useState } from "react";
import { NavLink, Outlet, Link } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Stethoscope,
  UserCog,
  CreditCard,
  Calculator,
  Package,
  FlaskConical,
  Receipt,
  BarChart3,
  Heart,
  Brain,
  Settings,
  Menu,
  X,
  LogOut,
  ClipboardList,
} from "lucide-react";
import { useDemo, useDemoConfig } from "@/contexts/DemoContext";
import { PATH_KEY_TO_PATH } from "@/config/demos/navSpec";

const PATH_KEY_TO_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  inicio: LayoutDashboard,
  agenda: CalendarDays,
  procedimientos: ClipboardList,
  pacientes: Users,
  atencion: Stethoscope,
  doctores: UserCog,
  caja: CreditCard,
  remuneraciones: Calculator,
  inventario: Package,
  laboratorios: FlaskConical,
  gastos: Receipt,
  reportes: BarChart3,
  experiencia: Heart,
  ia: Brain,
  configuracion: Settings,
};

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { basePath } = useDemo();
  const config = useDemoConfig();
  const sidebarItems = config.navItems.map((item) => {
    const pathSegment = PATH_KEY_TO_PATH[item.pathKey] ?? item.pathKey;
    const path = pathSegment ? `${basePath}/${pathSegment}` : basePath;
    const Icon = PATH_KEY_TO_ICON[item.pathKey];
    return {
      label: item.label,
      path,
      icon: Icon ?? LayoutDashboard,
    };
  });

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-foreground/30 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-sidebar text-sidebar-foreground flex flex-col transition-transform lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logoprosaludgold.ico" alt="ProSalud Gold" className="w-8 h-8 rounded-lg object-contain" />
            <span className="font-bold text-sm text-sidebar-foreground">ProSalud Gold</span>
          </Link>
          <button className="lg:hidden text-sidebar-foreground" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {sidebarItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === basePath}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary font-medium"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                }`
              }
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-sidebar-border">
          <Link to="/" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/50 transition-colors">
            <LogOut className="w-4 h-4" />
            Volver al sitio
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-0">
        <header className="h-14 border-b border-border bg-background flex items-center px-4 gap-4 shrink-0">
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xs font-semibold text-primary">AD</span>
            </div>
            <span className="text-sm font-medium hidden sm:block">Admin Demo</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-muted/20">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
