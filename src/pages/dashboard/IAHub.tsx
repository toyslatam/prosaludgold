import { useMemo, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Brain, Scan, FileText, Phone, ClipboardList,
  Shield, Smile, Mic, Loader2, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { usePatients, useAppointments, useCashEntries, useInventoryItems } from "@/hooks/useSupabase";

// ── Simulated AI delay ─────────────────────────────────────────
function useAISimulator() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const run = (output: string, delay = 1400) => {
    setLoading(true);
    setResult(null);
    setTimeout(() => { setLoading(false); setResult(output); }, delay);
  };
  const reset = () => { setLoading(false); setResult(null); };
  return { loading, result, run, reset };
}

// ── Tool registry ─────────────────────────────────────────────
type ToolKey = "rx" | "reportes" | "contact" | "resumen" | "contralor" | "sonrisa" | "voz";

interface Tool {
  key: ToolKey;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  badge?: string;
}

const TOOLS: Tool[] = [
  { key: "rx",       icon: Scan,          title: "Análisis de RX",              desc: "Detección asistida de caries y hallazgos en radiografías.",          badge: "IA Visual" },
  { key: "reportes", icon: FileText,       title: "Reportes con IA",             desc: "Resumen ejecutivo de la clínica generado de tus datos reales.",      badge: "Datos reales" },
  { key: "contact",  icon: Phone,          title: "Contact Center IA",           desc: "Asistente virtual para WhatsApp que agenda citas automáticamente.",   badge: "WhatsApp" },
  { key: "resumen",  icon: ClipboardList,  title: "Resumen clínico del paciente",desc: "Resumen inteligente del historial desde tu base de datos.",          badge: "Datos reales" },
  { key: "contralor",icon: Shield,         title: "Contralor IA",                desc: "Detecta inconsistencias en cobros, tratamientos y registros.",       badge: "Auditoría" },
  { key: "sonrisa",  icon: Smile,          title: "Simulador de sonrisas",       desc: "Muestra al paciente la proyección de su sonrisa post-tratamiento.",  badge: "Visual" },
  { key: "voz",      icon: Mic,            title: "Notas clínicas por voz",      desc: "Dicta tus notas y la IA las transcribe y estructura.",              badge: "Voz" },
];

// ── Sub-components per tool ────────────────────────────────────

function ToolRX({ ai }: { ai: ReturnType<typeof useAISimulator> }) {
  return ai.result ? null : (
    <Button onClick={() => ai.run(
      "✅ Análisis completado\n\nHallazgos detectados:\n• Posible caries interproximal entre piezas 15 y 16 (confianza: 87%)\n• Lesión periapical leve en pieza 36 (confianza: 72%)\n• Sin hallazgos patológicos en resto de piezas evaluadas.\n\nRecomendación: Evaluar clínicamente piezas 15-16 y solicitar Rx periapical de pieza 36."
    )} className="w-full gap-2" disabled={ai.loading}>
      {ai.loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Analizando…</> : <>Simular análisis de RX <ChevronRight className="w-4 h-4" /></>}
    </Button>
  );
}

function ToolReportes({
  ai, patients, appointments, cashEntries, inventory,
}: {
  ai: ReturnType<typeof useAISimulator>;
  patients: ReturnType<typeof usePatients>["data"];
  appointments: ReturnType<typeof useAppointments>["data"];
  cashEntries: ReturnType<typeof useCashEntries>["data"];
  inventory: ReturnType<typeof useInventoryItems>["data"];
}) {
  const generate = () => {
    const month = format(new Date(), "MMMM yyyy", { locale: es });
    const thisMonth = format(new Date(), "yyyy-MM");
    const totalPx = (patients ?? []).length;
    const newPx = (patients ?? []).filter((p) => p.created_at.startsWith(thisMonth)).length;
    const aptsMonth = (appointments ?? []).filter((a) => a.date.startsWith(thisMonth));
    const atendidas = aptsMonth.filter((a) => a.status === "atendida").length;
    const noShow = aptsMonth.filter((a) => a.status === "no_asistio").length;
    const income = (cashEntries ?? []).filter((e) => e.type === "ingreso" && e.date.startsWith(thisMonth)).reduce((s, e) => s + e.amount, 0);
    const expenses = (cashEntries ?? []).filter((e) => e.type === "egreso" && e.date.startsWith(thisMonth)).reduce((s, e) => s + e.amount, 0);
    const lowStock = (inventory ?? []).filter((i) => i.stock <= i.min_stock).length;
    ai.run(
      `📊 Resumen ejecutivo — ${month}\n\n` +
      `• Ingresos: $${income.toFixed(0)} | Gastos: $${expenses.toFixed(0)} | Balance: $${(income - expenses).toFixed(0)}\n` +
      `• Total pacientes: ${totalPx} (${newPx} nuevos este mes)\n` +
      `• Citas totales: ${aptsMonth.length} | Atendidas: ${atendidas} | No asistieron: ${noShow}\n` +
      `• Tasa no-show: ${aptsMonth.length ? Math.round((noShow / aptsMonth.length) * 100) : 0}%\n` +
      `• Ítems bajo stock mínimo: ${lowStock}\n\n` +
      `${income > expenses ? "✅ Balance positivo este mes." : "⚠️ Los gastos superan los ingresos — revisar."}` +
      `${lowStock > 0 ? `\n⚠️ ${lowStock} ítem(s) de inventario requieren reposición.` : ""}`,
      900,
    );
  };
  return ai.result ? null : (
    <Button onClick={generate} className="w-full gap-2" disabled={ai.loading}>
      {ai.loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generando…</> : <>Generar reporte real <ChevronRight className="w-4 h-4" /></>}
    </Button>
  );
}

function ToolResumen({
  ai, patients, appointments,
}: {
  ai: ReturnType<typeof useAISimulator>;
  patients: ReturnType<typeof usePatients>["data"];
  appointments: ReturnType<typeof useAppointments>["data"];
}) {
  const [selectedId, setSelectedId] = useState("");
  const px = useMemo(() => (patients ?? []).find((p) => p.id === selectedId), [patients, selectedId]);

  const generate = () => {
    if (!px) return;
    const today = format(new Date(), "yyyy-MM-dd");
    const pxApts = (appointments ?? []).filter((a) => a.patientId === px.id);
    const lastApt = pxApts.filter((a) => a.date <= today).sort((a, b) => b.date.localeCompare(a.date))[0];
    const nextApt = pxApts.filter((a) => a.date > today).sort((a, b) => a.date.localeCompare(b.date))[0];
    const age = px.birth_date ? new Date().getFullYear() - new Date(px.birth_date).getFullYear() : null;

    ai.run(
      `👤 Resumen: ${px.name}\n\n` +
      (age ? `• ${age} años\n` : "") +
      (px.cedula ? `• Cédula: ${px.cedula}\n` : "") +
      (px.phone ? `• Teléfono: ${px.phone}\n` : "") +
      (px.email ? `• Email: ${px.email}\n` : "") +
      `• Saldo en cuenta: $${(px.balance ?? 0).toFixed(2)}\n` +
      `• Citas registradas: ${pxApts.length}\n` +
      (lastApt ? `• Última visita: ${lastApt.date} — ${lastApt.reason || lastApt.doctorName}\n` : "") +
      (nextApt ? `• Próxima cita: ${nextApt.date} ${nextApt.time} con ${nextApt.doctorName}\n` : "• Sin citas próximas agendadas\n"),
      800,
    );
  };

  return ai.result ? null : (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label>Seleccionar paciente</Label>
        <Select value={selectedId} onValueChange={setSelectedId}>
          <SelectTrigger><SelectValue placeholder="Buscar paciente…" /></SelectTrigger>
          <SelectContent>
            {(patients ?? []).map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <Button onClick={generate} className="w-full gap-2" disabled={!selectedId || ai.loading}>
        {ai.loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generando…</> : <>Ver resumen clínico <ChevronRight className="w-4 h-4" /></>}
      </Button>
    </div>
  );
}

function ToolVoz({ ai }: { ai: ReturnType<typeof useAISimulator> }) {
  const [notes, setNotes] = useState("");
  const transcribe = () => {
    if (!notes.trim()) return;
    ai.run(
      `🎤 Nota clínica estructurada\n\nFecha: ${format(new Date(), "dd/MM/yyyy")}\n\n` +
      notes.trim() + "\n\n[Procesado por IA — revisar antes de guardar en ficha]",
      1200,
    );
  };
  return ai.result ? null : (
    <div className="space-y-3">
      <Textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Escribe o dicta la nota clínica aquí…"
        rows={4}
      />
      <Button onClick={transcribe} className="w-full gap-2" disabled={!notes.trim() || ai.loading}>
        {ai.loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Procesando…</> : <>Estructurar nota <ChevronRight className="w-4 h-4" /></>}
      </Button>
    </div>
  );
}

function ToolSimple({ toolKey, ai }: { toolKey: ToolKey; ai: ReturnType<typeof useAISimulator> }) {
  const OUTPUTS: Record<string, string> = {
    contact:
      "📱 Simulación conversación WhatsApp:\n\nPaciente: Hola, quiero agendar una cita para limpieza\nIA: ¡Hola! Tenemos disponibilidad:\n• Jueves a las 10:00 con Dra. Herrera\n• Viernes a las 14:30 con Dr. Mendoza\n¿Cuál prefiere?\n\nPaciente: El jueves\nIA: Perfecto, queda agendado. Le enviaré un recordatorio. ¡Hasta pronto! 😊",
    contralor:
      "⚠️ Alertas detectadas en el sistema:\n\n1. Hay citas sin confirmar para hoy\n2. Existen movimientos de caja sin método de pago registrado\n3. Ítems de inventario bajo stock mínimo requieren reposición\n\nSugerencia: Revisar estos casos antes de iniciar la jornada.",
    sonrisa:
      "😊 Simulación generada\n\nSe ha creado una vista previa post-tratamiento:\n• Alineación mejorada\n• Cierre de diastema central\n• Corrección de mordida\n\nNota: Simulación de referencia. Resultados reales pueden variar.",
  };
  return ai.result ? null : (
    <Button onClick={() => ai.run(OUTPUTS[toolKey] ?? "Simulación completada.")} className="w-full gap-2" disabled={ai.loading}>
      {ai.loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Procesando…</> : <>Ejecutar <ChevronRight className="w-4 h-4" /></>}
    </Button>
  );
}

// ── Main component ─────────────────────────────────────────────
const IAHub = () => {
  const [activeKey, setActiveKey] = useState<ToolKey | null>(null);
  const ai = useAISimulator();

  const { data: patients } = usePatients();
  const { data: appointments } = useAppointments();
  const { data: cashEntries } = useCashEntries();
  const { data: inventory } = useInventoryItems();

  const openTool = (key: ToolKey) => {
    setActiveKey(key);
    ai.reset();
  };

  const activeTool = TOOLS.find((t) => t.key === activeKey);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Brain className="w-6 h-6 text-primary" /> Hub de IA — Tu clínica inteligente
        </h1>
        <p className="text-muted-foreground text-sm">Herramientas de inteligencia artificial para potenciar tu clínica</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {TOOLS.map((tool) => (
          <div
            key={tool.key}
            className="bg-card rounded-xl p-5 border border-border shadow-card hover:shadow-card-hover hover:border-primary/30 transition-all cursor-pointer group"
            onClick={() => openTool(tool.key)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <tool.icon className="w-5 h-5 text-primary" />
              </div>
              {tool.badge && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {tool.badge}
                </span>
              )}
            </div>
            <h3 className="font-semibold text-sm mb-1">{tool.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{tool.desc}</p>
            <div className="mt-4 flex items-center gap-1 text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              Abrir herramienta <ChevronRight className="w-3 h-3" />
            </div>
          </div>
        ))}
      </div>

      {/* Info banner */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">Próximamente:</span> Integración completa con modelos de IA para análisis de imágenes RX, transcripción de voz en tiempo real y contact center automatizado por WhatsApp.
      </div>

      {/* Tool dialog */}
      <Dialog open={!!activeKey} onOpenChange={(open) => { if (!open) { setActiveKey(null); ai.reset(); } }}>
        <DialogContent className="max-w-lg">
          {activeTool && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <activeTool.icon className="w-5 h-5 text-primary" />
                  {activeTool.title}
                </DialogTitle>
              </DialogHeader>

              <div className="mt-2 space-y-4">
                {/* Tool-specific input */}
                {!ai.result && (
                  <>
                    {activeKey === "rx"       && <ToolRX ai={ai} />}
                    {activeKey === "reportes" && <ToolReportes ai={ai} patients={patients} appointments={appointments} cashEntries={cashEntries} inventory={inventory} />}
                    {activeKey === "resumen"  && <ToolResumen ai={ai} patients={patients} appointments={appointments} />}
                    {activeKey === "voz"      && <ToolVoz ai={ai} />}
                    {(activeKey === "contact" || activeKey === "contralor" || activeKey === "sonrisa") && (
                      <ToolSimple toolKey={activeKey} ai={ai} />
                    )}
                  </>
                )}

                {/* Loading state */}
                {ai.loading && (
                  <div className="flex items-center gap-3 text-sm text-muted-foreground py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    <span>Procesando con IA…</span>
                  </div>
                )}

                {/* Result */}
                {ai.result && (
                  <div className="rounded-lg bg-muted/60 border border-border p-4">
                    <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed">{ai.result}</pre>
                  </div>
                )}

                {/* Actions */}
                {ai.result && (
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={ai.reset}>Nueva consulta</Button>
                    <Button className="flex-1" onClick={() => { setActiveKey(null); ai.reset(); }}>Cerrar</Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IAHub;
