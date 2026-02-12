import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CalendarDays, UserRound, Heart, Stethoscope, CreditCard, Calculator, Warehouse, FlaskConical, BarChart3, Brain } from "lucide-react";

const modules = [
  {
    icon: CalendarDays,
    title: "Agenda / Citas",
    features: [
      "Vistas diaria, semanal y mensual con control de ocupación",
      "Estados de cita: pendiente, confirmada, en sala de espera, atendida, no asistió",
      "Reprogramación rápida y gestión de sobreagenda",
      "Tiempos configurables por odontólogo",
      "Recordatorios automáticos por WhatsApp y email",
      "Agendamiento online 24/7 con link para redes sociales y sitio web",
      "Reglas por profesional, especialidad y/o sucursal con disponibilidad en tiempo real",
    ],
  },
  {
    icon: UserRound,
    title: "Pacientes / Ficha Clínica",
    features: [
      "Registro completo del paciente con datos requeridos configurables",
      "Historia clínica centralizada: citas, antecedentes, evolución, documentos y planes",
      "Gestión de documentos e imágenes clínicas",
      "Plantillas de documentos (recetas, evoluciones, formularios)",
      "Consentimientos informados con firma electrónica",
      "Odontograma y periodontograma con seguimiento",
      "Soporte para ortodoncia: seguimiento por etapas, controles y avances",
    ],
  },
  {
    icon: Heart,
    title: "Experiencia del Paciente",
    features: [
      "Confirmación y recordatorios para reducir ausentismo",
      "Sala de espera con avisos y estado del paciente",
      "Encuestas de satisfacción y NPS",
      "Email marketing para comunicación con pacientes",
      "Recursos educativos: biblioteca de videos y animaciones 3D",
    ],
  },
  {
    icon: Stethoscope,
    title: "Doctores / Usuarios / Permisos",
    features: [
      "Gestión de doctores: disponibilidad, especialidades, sucursal, tiempos por atención",
      "Usuarios y roles: Administrador, Recepción, Doctor, Caja, Inventario",
      "Permisos por módulo y por sucursal",
    ],
  },
  {
    icon: CreditCard,
    title: "Cobros / Caja / Finanzas",
    features: [
      "Pagos presenciales y online",
      "Enlaces de pago a pacientes pendientes o morosos",
      "Control de caja: múltiples cajas, ingresos/egresos, cierres imprimibles",
      "Medios de pago, devoluciones y reembolsos",
      "Cuotas y financiamiento para tratamientos",
    ],
  },
  {
    icon: Calculator,
    title: "Remuneraciones Automáticas",
    features: [
      "Contratos configurables por prestación o esquema",
      "Liquidaciones por acción pagada o al final del plan",
      "Vista por odontólogo con detalle y exportación",
    ],
  },
  {
    icon: Warehouse,
    title: "Operación / Administración",
    features: [
      "Inventario: stock, entradas/salidas, alertas de bajo stock",
      "Laboratorios: solicitudes, estados y pagos",
      "Control de gastos: registro y clasificación",
      "Carga masiva de pacientes",
    ],
  },
  {
    icon: FlaskConical,
    title: "Laboratorios",
    features: [
      "Solicitudes de trabajo a laboratorios",
      "Seguimiento de estados y entregas",
      "Control de pagos a proveedores",
    ],
  },
  {
    icon: BarChart3,
    title: "Reportería y Métricas",
    features: [
      "Reportes gráficos con KPIs y exportables tipo Excel",
      "Indicadores: ocupación agenda, no show, ventas, ticket promedio",
      "Productividad por doctor, pacientes nuevos, cartera pendiente",
      "Rotación de inventario y análisis financiero",
    ],
  },
  {
    icon: Brain,
    title: 'Hub de IA — "Tu clínica con IA"',
    features: [
      "Análisis automático de radiografías",
      "Reportes automáticos con IA",
      "Contact center inteligente (WhatsApp/llamadas + agenda)",
      "Resumen clínico del paciente",
      "Contralor IA: alertas de inconsistencias",
      "Simulador de sonrisas",
      "Notas clínicas por voz (transcripción automática)",
    ],
  },
];

const ModulesSection = () => {
  return (
    <section id="modulos" className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Módulos de ProSalud Gold</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Cada módulo fue diseñado para resolver las necesidades reales de clínicas dentales en Panamá.
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="multiple" className="space-y-3">
            {modules.map((mod, i) => (
              <motion.div
                key={mod.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03 }}
              >
                <AccordionItem value={mod.title} className="border border-border rounded-xl px-6 bg-card shadow-card">
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <mod.icon className="w-4 h-4 text-primary" />
                      </div>
                      <span className="font-semibold text-left">{mod.title}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-2 pb-2">
                      {mod.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default ModulesSection;
