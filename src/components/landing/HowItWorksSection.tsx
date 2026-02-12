import { motion } from "framer-motion";
import { Settings, UserPlus, CalendarPlus, Stethoscope, CreditCard, BarChart3, Sparkles } from "lucide-react";

const steps = [
  { icon: Settings, title: "Configuras", desc: "Sedes, doctores, servicios, horarios y permisos." },
  { icon: UserPlus, title: "Registras pacientes", desc: "Ficha clínica completa con datos configurables." },
  { icon: CalendarPlus, title: "Agendas", desc: "Online o presencial, con recordatorios automáticos." },
  { icon: Stethoscope, title: "Atiendes", desc: "Odontograma, evoluciones, documentos y consentimientos." },
  { icon: CreditCard, title: "Cobras", desc: "Pagos presenciales, online y enlaces a pacientes." },
  { icon: BarChart3, title: "Mides", desc: "Reportes, KPIs y métricas de productividad." },
  { icon: Sparkles, title: "Automatizas", desc: "IA, remuneraciones, recordatorios y más." },
];

const HowItWorksSection = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">¿Cómo funciona?</h2>
          <p className="text-muted-foreground text-lg">7 pasos simples para transformar tu clínica.</p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-7 gap-4">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex flex-col items-center text-center"
              >
                <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mb-3 shadow-glow">
                  <step.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <span className="text-xs font-bold text-primary mb-1">Paso {i + 1}</span>
                <h3 className="font-semibold text-sm mb-1">{step.title}</h3>
                <p className="text-xs text-muted-foreground">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
