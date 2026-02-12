import { motion } from "framer-motion";
import { CalendarCheck, ClipboardList, DollarSign, BarChart3, Package, Brain, Users, ShieldCheck } from "lucide-react";

const problems = [
  { icon: CalendarCheck, title: "Orden en la agenda", desc: "Deja de perder citas y gestiona tu agenda de forma inteligente." },
  { icon: ClipboardList, title: "Ficha clínica completa", desc: "Historial centralizado con odontograma, documentos y consentimientos." },
  { icon: DollarSign, title: "Control de caja", desc: "Ingresos, egresos, cierres y múltiples medios de pago en un solo lugar." },
  { icon: BarChart3, title: "Reportes claros", desc: "KPIs de ocupación, ventas, productividad y más, listos para exportar." },
  { icon: Users, title: "Remuneraciones automáticas", desc: "Contratos configurables y liquidaciones sin errores." },
  { icon: Package, title: "Inventario controlado", desc: "Stock actualizado, alertas de bajo stock y registro de proveedores." },
  { icon: Brain, title: "Herramientas con IA", desc: "Análisis de RX, resúmenes clínicos, notas por voz y más." },
  { icon: ShieldCheck, title: "Seguridad y permisos", desc: "Roles personalizados para cada miembro de tu equipo." },
];

const ProblemSection = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">¿Qué resuelve Dental One?</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Una plataforma integral para que te enfoques en lo que importa: tus pacientes.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {problems.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="bg-card rounded-xl p-6 shadow-card hover:shadow-card-hover transition-shadow border border-border"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
