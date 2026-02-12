import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

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
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">D1</span>
          </div>
          <span className="font-bold text-lg text-foreground">Dental One <span className="text-primary">Panamá</span></span>
        </Link>

        <nav className="hidden lg:flex items-center gap-6">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <Link to="/demo">
            <Button variant="outline" size="sm">Ver demo</Button>
          </Link>
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
              <div className="flex gap-2 pt-2">
                <Link to="/demo" className="flex-1"><Button variant="outline" className="w-full" size="sm">Ver demo</Button></Link>
                <a href="#contacto" className="flex-1"><Button className="w-full" size="sm">Solicitar demo</Button></a>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default LandingHeader;
