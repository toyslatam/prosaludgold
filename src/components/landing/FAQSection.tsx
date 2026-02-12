import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  { q: "¿Necesito instalar algo en mi computadora?", a: "No. Dental One funciona 100% en la nube. Solo necesitas un navegador web y conexión a Internet." },
  { q: "¿Puedo usar Dental One desde mi celular?", a: "Sí. La plataforma es completamente responsive y funciona desde cualquier dispositivo: computadora, tablet o celular." },
  { q: "¿Mis datos están seguros?", a: "Tus datos se almacenan en servidores seguros con encriptación de extremo a extremo y respaldos automáticos diarios. Cumplimos con estándares de seguridad internacionales." },
  { q: "¿Puedo migrar mis datos desde otro sistema?", a: "Sí. Ofrecemos herramientas de carga masiva y acompañamiento para migrar tus pacientes, historiales y datos financieros desde otros sistemas." },
  { q: "¿Qué incluye el soporte?", a: "Todos los planes incluyen soporte técnico. Los planes Pro y Clínica cuentan con soporte prioritario y acompañamiento en la implementación." },
  { q: "¿Puedo empezar con un plan básico y crecer después?", a: "¡Por supuesto! Puedes cambiar de plan en cualquier momento sin perder tus datos." },
  { q: "¿Dental One funciona para múltiples sucursales?", a: "Sí. Los planes Pro y Clínica permiten gestionar múltiples sedes con reportes consolidados y permisos por sucursal." },
  { q: "¿Puedo personalizar los roles y permisos?", a: "Sí. Puedes crear roles personalizados (Admin, Recepción, Doctor, Caja, Inventario) y asignar permisos específicos por módulo y sucursal." },
];

const FAQSection = () => {
  return (
    <section id="faq" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Preguntas Frecuentes</h2>
        </motion.div>

        <div className="max-w-2xl mx-auto">
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border border-border rounded-xl px-6 bg-card">
                <AccordionTrigger className="hover:no-underline text-left text-sm font-semibold">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
