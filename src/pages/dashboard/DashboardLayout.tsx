import { useState, useEffect } from "react";
import { NavLink, Outlet, Link, useNavigate, useLocation, Navigate } from "react-router-dom";
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
  FileText,
  ShieldCheck,
} from "lucide-react";
import { useDemo, useDemoConfig } from "@/contexts/DemoContext";
import { useAppConfig } from "@/contexts/AppConfigContext";
import { PATH_KEY_TO_PATH } from "@/config/demos/navSpec";
import { supabase } from "@/integrations/supabase/client";
import { initials } from "@/lib/utils";
import ProSaludLogo from "@/components/ProSaludLogo";
import { ModuleSwitcher } from "@/components/ModuleSwitcher";

const PATH_KEY_TO_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  inicio: LayoutDashboard,
  agenda: CalendarDays,
  procedimientos: ClipboardList,
  pacientes: Users,
  atencion: Stethoscope,
  doctores: UserCog,
  caja: CreditCard,
  facturacion: FileText,
  remuneraciones: Calculator,
  inventario: Package,
  laboratorios: FlaskConical,
  gastos: Receipt,
  reportes: BarChart3,
  experiencia: Heart,
  ia: Brain,
  configuracion: Settings,
  usuarios: ShieldCheck,
};

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const { basePath } = useDemo();
  const { enabledModules, membership, canAccessPathKey } = useAppConfig();
  const config = useDemoConfig(enabledModules);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? "");
    });
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const userInitials = membership
    ? initials(membership.displayName)
    : userEmail
      ? userEmail.slice(0, 2).toUpperCase()
      : "AD";

  const sidebarItems = config.navItems
    .filter((item) => item.pathKey !== "usuarios" || !membership) // solo el dueño administra usuarios
    .filter((item) => canAccessPathKey(item.pathKey))
    .map((item) => {
      const pathSegment = PATH_KEY_TO_PATH[item.pathKey] ?? item.pathKey;
      const path = pathSegment ? `${basePath}/${pathSegment}` : basePath;
      const Icon = PATH_KEY_TO_ICON[item.pathKey];
      return { label: item.label, path, icon: Icon ?? LayoutDashboard };
    });

  // Si un miembro restringido entra directo a una URL que no tiene permitida,
  // lo mandamos al primer módulo que sí puede ver (o al inicio).
  if (membership) {
    const currentSegment = location.pathname.slice(basePath.length).replace(/^\//, "").split("/")[0];
    const currentPathKey =
      Object.entries(PATH_KEY_TO_PATH).find(([, seg]) => seg === currentSegment)?.[0] ??
      (currentSegment || "inicio");
    if (!canAccessPathKey(currentPathKey)) {
      const fallback = sidebarItems[0]?.path ?? basePath;
      return <Navigate to={fallback} replace />;
    }
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-foreground/30 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-sidebar text-sidebar-foreground flex flex-col transition-transform lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-2">
            <ProSaludLogo size={32} />
            <span className="font-bold text-sm text-sidebar-foreground">ProSalud Gold</span>
          </Link>
          <button className="lg:hidden text-sidebar-foreground" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <ModuleSwitcher />

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
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
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
              <span className="text-xs font-semibold text-primary">{userInitials}</span>
            </div>
            <span className="text-sm font-medium hidden sm:block max-w-[180px] truncate">
              {membership?.displayName ?? userEmail}
            </span>
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
