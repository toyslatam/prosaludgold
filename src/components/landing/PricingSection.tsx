import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Básico",
    desc: "Para consultorios individuales",
    highlight: false,
    features: [
      "1 sede, 1 doctor",
      "Agenda con recordatorios",
      "Ficha clínica y odontograma",
      "Control de caja básico",
      "Reportes esenciales",
      "Soporte por email",
    ],
  },
  {
    name: "Pro",
    desc: "Para clínicas en crecimiento",
    highlight: true,
    features: [
      "Hasta 3 sedes, doctores ilimitados",
      "Todo lo del plan Básico",
      "Agendamiento online 24/7",
      "Pagos online y enlaces de cobro",
      "Remuneraciones automáticas",
      "Inventario y laboratorios",
      "Reportes avanzados y KPIs",
      "Email marketing",
      "Soporte prioritario",
    ],
  },
  {
    name: "Clínica",
    desc: "Para clínicas grandes y redes",
    highlight: false,
    features: [
      "Sedes ilimitadas",
      "Todo lo del plan Pro",
      "Hub de IA completo",
      "Roles y permisos avanzados",
      "API e integraciones",
      "Carga masiva de datos",
      "Gerente de cuenta dedicado",
      "Onboarding personalizado",
    ],
  },
];

const PricingSection = () => {
  return (
    <section id="precios" className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Planes y Precios</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Elige el plan que mejor se adapte a tu clínica. Todos incluyen soporte y actualizaciones.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`rounded-2xl p-8 border ${
                plan.highlight
                  ? "border-primary bg-primary/5 shadow-glow relative"
                  : "border-border bg-card shadow-card"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                  Más popular
                </div>
              )}
              <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{plan.desc}</p>
              <div className="mb-6">
                <span className="text-3xl font-bold">Consultar</span>
                <span className="text-muted-foreground text-sm"> / precio</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <a href="#contacto">
                <Button className="w-full" variant={plan.highlight ? "default" : "outline"}>
                  Solicitar demo
                </Button>
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
