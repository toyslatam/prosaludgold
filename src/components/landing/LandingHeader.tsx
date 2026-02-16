import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import { DEMO_VERTICALS } from "@/config/demos";

const navItems = [
  { label: "Módulos", href: "#modulos" },
  { label: "Experiencia del Paciente", href: "#experiencia" },
  { label: "Administración", href: "#administracion" },
  { label: "Reportes", href: "#reportes" },
  { label: "IA", href: "#ia" },
  { label: "Precios", href: "#precios" },
  { label: "FAQ", href: "#faq" },
  { label: "Contacto", href: "#contacto" },
];

const LandingHeader = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logoprosaludgold.ico" alt="ProSalud Gold" className="w-8 h-8 rounded-lg object-contain" />
          <span className="font-bold text-lg text-foreground">ProSalud <span className="text-primary">Gold</span></span>
        </Link>

        <nav className="hidden lg:flex items-center gap-6">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                Ver demo <ChevronDown className="h-4 w-4 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <span className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Elige una demo</span>
              {DEMO_VERTICALS.map((v) => (
                <DropdownMenuItem key={v.key} asChild>
                  <Link to={`/demo/${v.key}`}>{v.name}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <a href="#contacto">
            <Button size="sm">Solicitar demo</Button>
          </a>
        </div>

        <button className="lg:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-background border-b border-border"
          >
            <nav className="flex flex-col p-4 gap-3">
              {navItems.map((item) => (
                <a key={item.href} href={item.href} className="text-sm text-muted-foreground hover:text-foreground py-2" onClick={() => setMobileOpen(false)}>
                  {item.label}
                </a>
              ))}
              <div className="flex flex-col gap-2 pt-2">
                <p className="text-xs font-medium text-muted-foreground px-1">Ver demo</p>
                {DEMO_VERTICALS.map((v) => (
                  <Link key={v.key} to={`/demo/${v.key}`} onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" className="w-full" size="sm">{v.name}</Button>
                  </Link>
                ))}
                <a href="#contacto" className="mt-1" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full" size="sm">Solicitar demo</Button>
                </a>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default LandingHeader;
