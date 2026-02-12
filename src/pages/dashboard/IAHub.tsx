import { Brain, Scan, FileText, Phone, ClipboardList, Shield, Smile, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const aiTools = [
  {
    icon: Scan,
    title: "Análisis automático de RX",
    desc: "Detección asistida por IA de caries, lesiones periapicales y hallazgos en radiografías.",
    result: "✅ Análisis completado\n\nHallazgos detectados:\n• Posible caries interproximal entre piezas 15 y 16 (confianza: 87%)\n• Lesión periapical leve en pieza 36 (confianza: 72%)\n• Sin hallazgos patológicos en resto de piezas evaluadas.\n\nRecomendación: Evaluar clínicamente las piezas 15-16 y solicitar radiografía periapical de pieza 36.",
  },
  {
    icon: FileText,
    title: "Reportes con IA",
    desc: "Generación automática de resúmenes ejecutivos y análisis de tendencias de la clínica.",
    result: "📊 Resumen ejecutivo - Febrero 2026\n\n• Ingresos: $23,800 (+10.7% vs mes anterior)\n• Pacientes atendidos: 136 (24 nuevos)\n• Ocupación agenda: 78% (meta: 85%)\n• Tasa no show: 8% (dentro del rango)\n• Top especialidad: Ortodoncia (35%)\n\nÁreas de mejora: Aumentar captación de pacientes nuevos y reducir tiempos muertos los viernes.",
  },
  {
    icon: Phone,
    title: "Contact Center IA",
    desc: "Asistente virtual para WhatsApp y llamadas que agenda citas automáticamente.",
    result: "📱 Simulación de conversación:\n\nPaciente: Hola, quiero agendar una cita para limpieza\nIA: ¡Hola! Con gusto le agendo. Tenemos disponibilidad:\n• Jueves 14/02 a las 10:00 con Dra. Herrera\n• Viernes 15/02 a las 14:30 con Dra. Herrera\n¿Cuál prefiere?\n\nPaciente: El jueves\nIA: Perfecto, queda agendado para el jueves 14 de febrero a las 10:00. Le enviaré un recordatorio. ¡Hasta pronto!",
  },
  {
    icon: ClipboardList,
    title: "Resumen clínico del paciente",
    desc: "Genera un resumen inteligente del historial del paciente para consulta rápida.",
    result: "👤 Resumen: Sofía Ramírez\n\n• Paciente femenina, 35 años\n• En tratamiento de ortodoncia desde junio 2025\n• Progreso: 60% completado, brackets superiores e inferiores\n• Última visita: 28/01/2026 - Control rutinario sin novedades\n• Saldo pendiente: $1,400 (plan de pagos al día)\n• Próximo hito: Evaluación para retiro de brackets (est. agosto 2026)\n• Sin alergias ni condiciones sistémicas relevantes.",
  },
  {
    icon: Shield,
    title: "Contralor IA",
    desc: "Detecta inconsistencias en cobros, tratamientos y registros automáticamente.",
    result: "⚠️ Alertas detectadas:\n\n1. Paciente Pedro Morales tiene cita de implante hoy pero no tiene consentimiento firmado.\n2. Se registró un pago de $500 sin vincular a tratamiento específico.\n3. Pieza #14 de Pedro Morales tiene tratamiento de implante pero no se ha registrado la radiografía previa.\n\nSugerencia: Revisar estos casos antes de la atención del día.",
  },
  {
    icon: Smile,
    title: "Simulador de sonrisas",
    desc: "Muestra al paciente una proyección de su sonrisa después del tratamiento.",
    result: "😊 Simulación generada\n\nSe ha creado una vista previa de la sonrisa estimada post-tratamiento para el paciente.\n\n• Alineación dental mejorada\n• Cierre de diastema central\n• Corrección de mordida\n\nNota: Esta es una simulación de referencia. Los resultados reales pueden variar según el progreso del tratamiento.",
  },
  {
    icon: Mic,
    title: "Notas clínicas por voz",
    desc: "Dicta tus notas clínicas y la IA las transcribe y estructura automáticamente.",
    result: "🎤 Transcripción estructurada:\n\nFecha: 12/02/2026\nDoctor: Dr. Carlos Mendoza\nPaciente: Juan Pérez\nPieza: #36\n\nProcedimiento: Se realiza acceso endodóntico. Se identifican 3 conductos (MV, DV, P). Se instrumenta hasta lima 30. Irrigación con NaOCl 2.5%. Se coloca medicación intraconducto (Ca(OH)2). Se sella con IRM.\n\nPróximo paso: Obturación en 7 días.\nIndicaciones: Ibuprofeno 400mg c/8h por 3 días si hay dolor.",
  },
];

const IAHub = () => {
  const [activeResult, setActiveResult] = useState<typeof aiTools[0] | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Brain className="w-6 h-6 text-primary" /> Hub de IA — Tu clínica con IA</h1>
        <p className="text-muted-foreground text-sm">Herramientas inteligentes para potenciar la gestión de tu clínica</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {aiTools.map((tool) => (
          <div key={tool.title} className="bg-card rounded-xl p-6 border border-border shadow-card hover:shadow-card-hover transition-shadow">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <tool.icon className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">{tool.title}</h3>
            <p className="text-sm text-muted-foreground mb-4">{tool.desc}</p>
            <Button variant="outline" size="sm" onClick={() => setActiveResult(tool)}>
              Ejecutar (demo)
            </Button>
          </div>
        ))}
      </div>

      <Dialog open={!!activeResult} onOpenChange={() => setActiveResult(null)}>
        <DialogContent className="max-w-lg">
          {activeResult && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <activeResult.icon className="w-5 h-5 text-primary" />
                  {activeResult.title}
                </DialogTitle>
              </DialogHeader>
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <pre className="text-sm whitespace-pre-wrap font-sans">{activeResult.result}</pre>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IAHub;
