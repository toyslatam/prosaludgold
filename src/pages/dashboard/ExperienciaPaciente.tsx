import { useMemo, useState } from "react";
import { usePatientFeedback, useInsertPatientFeedback, usePatients } from "@/hooks/useSupabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Heart, Star, Send, BookOpen, Plus, Loader2, SmilePlus } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const RESOURCES = [
  "Cuidado de brackets", "Higiene dental infantil", "Post-operatorio implantes",
  "Blanqueamiento en casa", "Prevención de caries", "Cuidado de prótesis",
  "Recomendaciones post limpieza", "Alimentación y salud oral",
];

type FeedbackForm = {
  patient_id: string;
  patient_name: string;
  rating: string;
  nps_score: string;
  comment: string;
};

const EMPTY: FeedbackForm = { patient_id: "", patient_name: "", rating: "5", nps_score: "9", comment: "" };

const StarRating = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((n) => (
      <button key={n} type="button" onClick={() => onChange(n)} className="transition-transform hover:scale-110">
        <Star className={`w-7 h-7 ${n <= value ? "fill-warning text-warning" : "text-muted-foreground"}`} />
      </button>
    ))}
  </div>
);

const ExperienciaPaciente = () => {
  const [openForm, setOpenForm] = useState(false);
  const [form, setForm] = useState<FeedbackForm>(EMPTY);

  const { data: feedbacks = [], isLoading } = usePatientFeedback();
  const { data: patients = [] } = usePatients();
  const insertFeedback = useInsertPatientFeedback();

  // ── NPS Computation ────────────────────────────────────────
  const { npsScore, promoters, passives, detractors, avgRating } = useMemo(() => {
    if (!feedbacks.length) return { npsScore: 0, promoters: 0, passives: 0, detractors: 0, avgRating: 0 };
    const withNps = feedbacks.filter((f) => f.nps_score !== null);
    const p = withNps.filter((f) => (f.nps_score ?? 0) >= 9).length;
    const pa = withNps.filter((f) => (f.nps_score ?? 0) >= 7 && (f.nps_score ?? 0) <= 8).length;
    const d = withNps.filter((f) => (f.nps_score ?? 0) <= 6).length;
    const total = withNps.length || 1;
    const nps = Math.round(((p - d) / total) * 100);
    const avg = feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length;
    return {
      npsScore: nps,
      promoters: Math.round((p / total) * 100),
      passives: Math.round((pa / total) * 100),
      detractors: Math.round((d / total) * 100),
      avgRating: avg.toFixed(1),
    };
  }, [feedbacks]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find((p) => p.id === form.patient_id);
    insertFeedback.mutate(
      {
        patient_id: form.patient_id || null,
        patient_name: (patient?.name ?? form.patient_name.trim()) || null,
        rating: parseInt(form.rating),
        nps_score: form.nps_score ? parseInt(form.nps_score) : null,
        comment: form.comment.trim() || null,
        date: format(new Date(), "yyyy-MM-dd"),
      },
      {
        onSuccess: () => { toast.success("Encuesta registrada"); setOpenForm(false); setForm(EMPTY); },
        onError: (err) => toast.error(err.message),
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Experiencia del Paciente</h1>
          <p className="text-muted-foreground text-sm">Encuestas NPS, satisfacción y recursos educativos</p>
        </div>
        <Dialog open={openForm} onOpenChange={setOpenForm}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={() => setForm(EMPTY)}>
              <Plus className="w-4 h-4" /> Registrar encuesta
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nueva encuesta de satisfacción</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Paciente</Label>
                <Select value={form.patient_id} onValueChange={(v) => setForm((f) => ({ ...f, patient_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar paciente (opcional)" /></SelectTrigger>
                  <SelectContent>
                    {patients.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {!form.patient_id && (
                <div className="space-y-1.5">
                  <Label>Nombre (si no está registrado)</Label>
                  <Input value={form.patient_name} onChange={(e) => setForm((f) => ({ ...f, patient_name: e.target.value }))} placeholder="Nombre del paciente" />
                </div>
              )}
              <div className="space-y-2">
                <Label>Calificación general *</Label>
                <StarRating value={parseInt(form.rating)} onChange={(v) => setForm((f) => ({ ...f, rating: String(v) }))} />
              </div>
              <div className="space-y-1.5">
                <Label>NPS — ¿Nos recomendarías? (0–10)</Label>
                <div className="flex items-center gap-3">
                  <Input type="range" min="0" max="10" value={form.nps_score} onChange={(e) => setForm((f) => ({ ...f, nps_score: e.target.value }))} className="flex-1 h-2" />
                  <span className="text-2xl font-bold w-8 text-center">{form.nps_score}</span>
                </div>
                <p className="text-xs text-muted-foreground">0 = No recomendaría · 10 = Definitivamente sí</p>
              </div>
              <div className="space-y-1.5">
                <Label>Comentario</Label>
                <Textarea value={form.comment} onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))} placeholder="Comentarios adicionales…" rows={3} />
              </div>
              <Button type="submit" className="w-full" disabled={insertFeedback.isPending}>
                {insertFeedback.isPending ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Guardando…</> : "Registrar encuesta"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* NPS + Rating cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl p-6 border border-border shadow-card">
          <div className="flex items-center gap-2 mb-4"><Star className="w-5 h-5 text-warning" /><h3 className="font-semibold">NPS Score</h3></div>
          {isLoading ? (
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          ) : feedbacks.length === 0 ? (
            <p className="text-muted-foreground text-sm">Sin respuestas aún</p>
          ) : (
            <>
              <p className={`text-4xl font-bold mb-2 ${npsScore >= 50 ? "text-success" : npsScore >= 0 ? "text-warning" : "text-destructive"}`}>{npsScore}</p>
              <p className="text-sm text-muted-foreground">Basado en {feedbacks.length} respuestas</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="px-2 py-1 rounded bg-success/10 text-success">Promotores: {promoters}%</span>
                <span className="px-2 py-1 rounded bg-muted text-muted-foreground">Pasivos: {passives}%</span>
                <span className="px-2 py-1 rounded bg-destructive/10 text-destructive">Detractores: {detractors}%</span>
              </div>
            </>
          )}
        </div>

        <div className="bg-card rounded-xl p-6 border border-border shadow-card">
          <div className="flex items-center gap-2 mb-4"><Heart className="w-5 h-5 text-destructive" /><h3 className="font-semibold">Satisfacción</h3></div>
          {feedbacks.length === 0 ? (
            <p className="text-muted-foreground text-sm">Sin respuestas aún</p>
          ) : (
            <>
              <p className="text-4xl font-bold mb-2">{avgRating}<span className="text-lg text-muted-foreground">/5</span></p>
              <div className="flex gap-0.5 mt-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star key={n} className={`w-5 h-5 ${n <= Math.round(parseFloat(String(avgRating))) ? "fill-warning text-warning" : "text-muted-foreground"}`} />
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">Promedio de encuestas post-atención</p>
            </>
          )}
        </div>

        <div className="bg-card rounded-xl p-6 border border-border shadow-card">
          <div className="flex items-center gap-2 mb-4"><SmilePlus className="w-5 h-5 text-primary" /><h3 className="font-semibold">Últimas respuestas</h3></div>
          {feedbacks.length === 0 ? (
            <p className="text-muted-foreground text-sm">Sin encuestas registradas.</p>
          ) : (
            <div className="space-y-2">
              {feedbacks.slice(0, 3).map((fb) => (
                <div key={fb.id} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground truncate max-w-[120px]">{fb.patient_name ?? "Anónimo"}</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-warning text-warning" />
                    <span className="font-medium">{fb.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent feedback table */}
      {feedbacks.length > 0 && (
        <div className="bg-card rounded-xl border border-border shadow-card overflow-x-auto">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold">Historial de encuestas</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left p-3 font-medium">Fecha</th>
                <th className="text-left p-3 font-medium">Paciente</th>
                <th className="text-center p-3 font-medium">Calificación</th>
                <th className="text-center p-3 font-medium hidden sm:table-cell">NPS</th>
                <th className="text-left p-3 font-medium hidden md:table-cell">Comentario</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {feedbacks.map((fb) => (
                <tr key={fb.id} className="hover:bg-muted/20 transition-colors">
                  <td className="p-3 text-muted-foreground">{fb.date}</td>
                  <td className="p-3 font-medium">{fb.patient_name ?? "Anónimo"}</td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-warning text-warning" />
                      <span>{fb.rating}</span>
                    </div>
                  </td>
                  <td className="p-3 text-center hidden sm:table-cell">
                    {fb.nps_score !== null ? (
                      <span className={`font-semibold ${(fb.nps_score ?? 0) >= 9 ? "text-success" : (fb.nps_score ?? 0) >= 7 ? "text-warning" : "text-destructive"}`}>
                        {fb.nps_score}
                      </span>
                    ) : "—"}
                  </td>
                  <td className="p-3 hidden md:table-cell text-muted-foreground text-xs">{fb.comment ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Educational resources */}
      <div className="bg-card rounded-xl border border-border shadow-card p-6">
        <div className="flex items-center gap-2 mb-4"><BookOpen className="w-5 h-5 text-primary" /><h3 className="font-semibold">Recursos educativos</h3></div>
        <p className="text-sm text-muted-foreground mb-4">Contenido para compartir con tus pacientes</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {RESOURCES.map((r) => (
            <button
              key={r}
              onClick={() => toast.success(`"${r}" copiado al portapapeles (simulado)`)}
              className="p-3 border border-border rounded-lg text-sm text-left hover:bg-muted/30 hover:border-primary/40 transition-colors"
            >
              {r}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExperienciaPaciente;
