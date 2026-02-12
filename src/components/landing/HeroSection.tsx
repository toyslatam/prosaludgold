import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { motion } from "framer-motion";

const HeroSection = () => {
  return (
    <section className="gradient-hero relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-28">
      {/* Decorative elements */}
      <div className="absolute top-20 right-10 w-72 h-72 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-primary/3 blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 mb-6">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm text-primary-foreground/80">Software de gestión clínica odontológica</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-primary-foreground leading-tight mb-6">
            Tu clínica dental,{" "}
            <span className="text-gradient">organizada e inteligente</span>
          </h1>

          <p className="text-lg md:text-xl text-primary-foreground/70 mb-8 max-w-2xl mx-auto leading-relaxed">
            Agenda, ficha clínica, caja, reportes, inventario y herramientas con IA. Todo lo que necesitas para gestionar tu consultorio o clínica dental en Panamá, en una sola plataforma.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#contacto">
              <Button size="lg" className="gap-2 text-base px-8">
                Solicitar demo <ArrowRight className="w-4 h-4" />
              </Button>
            </a>
            <a href="#modulos">
              <Button variant="outline" size="lg" className="gap-2 text-base px-8 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
                <Play className="w-4 h-4" /> Ver módulos
              </Button>
            </a>
          </div>

          <div className="mt-12 flex items-center justify-center gap-8 text-primary-foreground/50 text-sm">
            <span>✓ Sin instalaciones</span>
            <span>✓ Soporte local</span>
            <span>✓ Datos seguros</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
