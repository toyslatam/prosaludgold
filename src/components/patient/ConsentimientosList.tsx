import { useState, useMemo } from "react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Plus, Check, Circle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  getConsentimientosByPatient,
  addConsentimiento,
  setConsentimientoSigned,
  type Consentimiento,
} from "@/lib/patients/consentimientos";
import { toast } from "sonner";

const PLANTILLAS = [
  { id: "extraccion", label: "Consentimiento para Extracción dental" },
  { id: "endodoncia", label: "Consentimiento para Endodoncia" },
  { id: "implante", label: "Consentimiento para Implante dental" },
] as const;

interface ConsentimientosListProps {
  patientId: string;
}

export function ConsentimientosList({ patientId }: ConsentimientosListProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [templateId, setTemplateId] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [signModalOpen, setSignModalOpen] = useState(false);
  const [signingId, setSigningId] = useState<string | null>(null);
  const [signedByName, setSignedByName] = useState("");
  const [signedCheck, setSignedCheck] = useState(false);
  const [refresh, setRefresh] = useState(0);

  const list = useMemo(
    () => getConsentimientosByPatient(patientId),
    [patientId, refresh]
  );

  const openCreate = () => {
    setTemplateId("");
    setDate(new Date().toISOString().slice(0, 10));
    setModalOpen(true);
  };

  const handleCreate = () => {
    const plantilla = PLANTILLAS.find((p) => p.id === templateId);
    if (!plantilla) {
      toast.error("Seleccione una plantilla");
      return;
    }
    addConsentimiento({
      patientId,
      type: plantilla.label,
      date,
      signed: false,
    });
    setRefresh((r) => r + 1);
    setModalOpen(false);
    toast.success("Consentimiento creado");
  };

  const openSign = (c: Consentimiento) => {
    setSigningId(c.id);
    setSignedByName("");
    setSignedCheck(false);
    setSignModalOpen(true);
  };

  const handleSign = () => {
    if (!signingId || !signedByName.trim()) {
      toast.error("Indique el nombre del paciente/firmante");
      return;
    }
    if (!signedCheck) {
      toast.error("Debe confirmar que el paciente firmó");
      return;
    }
    setConsentimientoSigned(signingId, signedByName.trim());
    setRefresh((r) => r + 1);
    setSignModalOpen(false);
    setSigningId(null);
    toast.success("Consentimiento firmado");
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Crear consentimiento desde plantilla
        </Button>
      </div>

      {list.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground text-sm">
            No hay consentimientos. Cree uno desde una plantilla.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {list.map((c) => (
            <Card key={c.id}>
              <CardContent className="p-4 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {c.signed ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground" />
                  )}
                  <div>
                    <p className="text-sm font-medium">{c.type}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(parseISO(c.date), "d MMM yyyy", { locale: es })}
                      {c.signed && c.signedByName && ` · Firmado por: ${c.signedByName}`}
                    </p>
                  </div>
                  <Badge variant={c.signed ? "default" : "secondary"}>
                    {c.signed ? "Firmado" : "Pendiente"}
                  </Badge>
                </div>
                {!c.signed && (
                  <Button variant="outline" size="sm" onClick={() => openSign(c)}>
                    Marcar firmado
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Crear consentimiento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Plantilla</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value)}
              >
                <option value="">Seleccionar</option>
                {PLANTILLAS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Fecha</Label>
              <input
                type="date"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreate}>Crear</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={signModalOpen} onOpenChange={setSignModalOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Registrar firma</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">
              Para demo: confirme que el paciente firmó e indique el nombre del firmante.
            </p>
            <div className="space-y-2">
              <Label>Nombre del firmante (paciente o responsable)</Label>
              <Input
                value={signedByName}
                onChange={(e) => setSignedByName(e.target.value)}
                placeholder="Nombre completo"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={signedCheck}
                onCheckedChange={(c) => setSignedCheck(!!c)}
              />
              <span className="text-sm">Firmado por el paciente</span>
            </label>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setSignModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSign} disabled={!signedCheck || !signedByName.trim()}>
                Registrar firma
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
