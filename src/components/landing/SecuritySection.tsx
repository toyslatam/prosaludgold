import { motion } from "framer-motion";
import { ShieldCheck, MessageCircle, Globe, CreditCard } from "lucide-react";

const SecuritySection = () => (
  <section id="administracion" className="py-20">
    <div className="container mx-auto px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Seguridad, Permisos e Integraciones</h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Control total sobre quién accede a qué, y conecta tus herramientas favoritas.</p>
      </motion.div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
        {[
          { icon: ShieldCheck, title: "Roles y permisos", desc: "Admin, Recepción, Doctor, Caja, Inventario — cada uno ve solo lo que necesita, por módulo y sucursal." },
          { icon: MessageCircle, title: "WhatsApp y email", desc: "Recordatorios, confirmaciones y campañas de marketing directamente desde la plataforma." },
          { icon: Globe, title: "Agendamiento online", desc: "Link de agendamiento 24/7 para compartir en redes, WhatsApp, Instagram y tu sitio web." },
          { icon: CreditCard, title: "Pagos online", desc: "Genera enlaces de pago para pacientes pendientes y cobra de forma fácil y segura." },
        ].map((item, i) => (
          <motion.div key={item.title} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="bg-card rounded-xl p-6 border border-border shadow-card">
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

export default SecuritySection;
