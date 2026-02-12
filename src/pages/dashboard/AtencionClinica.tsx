import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const AtencionClinica = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold">Atención Clínica</h1>
      <p className="text-muted-foreground text-sm">Odontograma, evoluciones y seguimiento clínico</p>
    </div>

    {/* Odontograma mock */}
    <div className="bg-card rounded-xl border border-border shadow-card p-6">
      <h2 className="font-semibold mb-4">Odontograma</h2>
      <p className="text-sm text-muted-foreground mb-4">Selecciona un diente para registrar hallazgos o tratamientos</p>
      <div className="space-y-4">
        <div className="flex justify-center gap-1 flex-wrap">
          {[18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28].map((tooth) => (
            <button key={tooth} className="w-8 h-10 rounded border border-border bg-muted/50 flex items-center justify-center text-xs text-muted-foreground hover:bg-primary/10 hover:border-primary transition-colors cursor-pointer" onClick={() => toast.info(`Pieza ${tooth} seleccionada (demo)`)}>
              {tooth}
            </button>
          ))}
        </div>
        <div className="flex justify-center gap-1 flex-wrap">
          {[48,47,46,45,44,43,42,41,31,32,33,34,35,36,37,38].map((tooth) => (
            <button key={tooth} className="w-8 h-10 rounded border border-border bg-muted/50 flex items-center justify-center text-xs text-muted-foreground hover:bg-primary/10 hover:border-primary transition-colors cursor-pointer" onClick={() => toast.info(`Pieza ${tooth} seleccionada (demo)`)}>
              {tooth}
            </button>
          ))}
        </div>
      </div>
    </div>

    {/* Evoluciones */}
    <div className="bg-card rounded-xl border border-border shadow-card p-6">
      <h2 className="font-semibold mb-4">Evoluciones clínicas recientes</h2>
      <div className="space-y-3">
        {[
          { date: "12/02/2026", doctor: "Dr. Carlos Mendoza", patient: "Juan Pérez", note: "Se realiza acceso endodóntico en pieza #36. Se identifican 3 conductos. Irrigación con NaOCl 2.5%. Se coloca medicación intraconducto." },
          { date: "10/02/2026", doctor: "Dr. Roberto Díaz", patient: "Pedro Morales", note: "Cirugía de implante en pieza #14 exitosa. Se coloca implante titanio 4x13mm. Buen torque de inserción (35 Ncm). Control en 7 días." },
          { date: "28/01/2026", doctor: "Dra. María González", patient: "Sofía Ramírez", note: "Control de ortodoncia. Se realiza ajuste de arcos superior e inferior. Buena evolución. Próximo control en 4 semanas." },
        ].map((evo, i) => (
          <div key={i} className="p-4 border border-border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-sm">{evo.patient}</span>
              <span className="text-xs text-muted-foreground">{evo.date}</span>
            </div>
            <p className="text-xs text-muted-foreground mb-1">{evo.doctor}</p>
            <p className="text-sm">{evo.note}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default AtencionClinica;
