import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin } from "lucide-react";

const FooterSection = () => {
  return (
    <>
      <section id="contacto" className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="text-3xl font-bold mb-4">Solicita tu demo gratuita</h2>
              <p className="text-muted-foreground mb-8">
                Déjanos tus datos y un especialista te contactará para mostrarte cómo ProSalud Gold puede transformar la gestión de tu clínica.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-primary" />
                  <span>info@prosaludgold.com</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-primary" />
                  <span>+507 300-0000</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>Ciudad de Panamá, Panamá</span>
                </div>
              </div>
            </motion.div>

            <motion.form initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <Input placeholder="Nombre completo" />
              <Input placeholder="Email" type="email" />
              <Input placeholder="Teléfono" type="tel" />
              <Input placeholder="Nombre de la clínica" />
              <Textarea placeholder="¿Cómo podemos ayudarte?" rows={3} />
              <Button className="w-full" size="lg">Solicitar demo</Button>
            </motion.form>
          </div>
        </div>
      </section>

      <footer className="gradient-hero py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img src="/logoprosaludgold.ico" alt="ProSalud Gold" className="w-8 h-8 rounded-lg object-contain" />
              <span className="font-bold text-primary-foreground">ProSalud Gold</span>
            </div>
            <p className="text-primary-foreground/50 text-sm">
              © 2026 ProSalud Gold. Todos los derechos reservados.
            </p>
            <a href="#contacto">
              <Button size="sm" variant="outline" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
                Solicitar demo
              </Button>
            </a>
          </div>
        </div>
      </footer>
    </>
  );
};

export default FooterSection;
