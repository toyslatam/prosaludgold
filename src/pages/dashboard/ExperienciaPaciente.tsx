import { Button } from "@/components/ui/button";
import { Heart, Mail, Star, BarChart3, Send, BookOpen } from "lucide-react";
import { toast } from "sonner";

const ExperienciaPaciente = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold">Experiencia del Paciente</h1>
      <p className="text-muted-foreground text-sm">Encuestas, email marketing, recordatorios y recursos educativos</p>
    </div>

    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* NPS */}
      <div className="bg-card rounded-xl p-6 border border-border shadow-card">
        <div className="flex items-center gap-2 mb-4"><Star className="w-5 h-5 text-warning" /><h3 className="font-semibold">NPS Score</h3></div>
        <p className="text-4xl font-bold text-primary mb-2">72</p>
        <p className="text-sm text-muted-foreground">Basado en 48 respuestas este mes</p>
        <div className="mt-3 flex gap-2 text-xs">
          <span className="px-2 py-1 rounded bg-success/10 text-success">Promotores: 65%</span>
          <span className="px-2 py-1 rounded bg-muted text-muted-foreground">Pasivos: 22%</span>
          <span className="px-2 py-1 rounded bg-destructive/10 text-destructive">Detractores: 13%</span>
        </div>
      </div>

      {/* Satisfacción */}
      <div className="bg-card rounded-xl p-6 border border-border shadow-card">
        <div className="flex items-center gap-2 mb-4"><Heart className="w-5 h-5 text-destructive" /><h3 className="font-semibold">Satisfacción</h3></div>
        <p className="text-4xl font-bold mb-2">4.6<span className="text-lg text-muted-foreground">/5</span></p>
        <p className="text-sm text-muted-foreground">Promedio de encuestas post-atención</p>
        <Button variant="outline" size="sm" className="mt-3" onClick={() => toast.success("Encuesta enviada (demo)")}>Enviar encuesta</Button>
      </div>

      {/* Email marketing */}
      <div className="bg-card rounded-xl p-6 border border-border shadow-card">
        <div className="flex items-center gap-2 mb-4"><Mail className="w-5 h-5 text-info" /><h3 className="font-semibold">Campañas Email</h3></div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span>Recordatorio limpieza</span><span className="text-success text-xs">Enviada</span></div>
          <div className="flex justify-between"><span>Promo blanqueamiento</span><span className="text-warning text-xs">Programada</span></div>
          <div className="flex justify-between"><span>Feliz cumpleaños</span><span className="text-success text-xs">Activa</span></div>
        </div>
        <Button variant="outline" size="sm" className="mt-3 w-full gap-1" onClick={() => toast.success("Funcionalidad demo")}><Send className="w-3 h-3" /> Nueva campaña</Button>
      </div>
    </div>

    {/* Recursos educativos */}
    <div className="bg-card rounded-xl border border-border shadow-card p-6">
      <div className="flex items-center gap-2 mb-4"><BookOpen className="w-5 h-5 text-primary" /><h3 className="font-semibold">Recursos educativos</h3></div>
      <p className="text-sm text-muted-foreground mb-4">Biblioteca de contenido para compartir con tus pacientes</p>
      <div className="grid sm:grid-cols-3 gap-3">
        {["Cuidado de brackets", "Higiene dental infantil", "Post-operatorio implantes", "Blanqueamiento en casa", "Prevención de caries", "Cuidado de prótesis"].map(r => (
          <div key={r} className="p-3 border border-border rounded-lg text-sm hover:bg-muted/30 transition-colors cursor-pointer">
            {r}
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default ExperienciaPaciente;
