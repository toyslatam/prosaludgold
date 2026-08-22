import { useState, useMemo, useRef, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Plus, FileText, Upload } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getClinicalDocumentsByPatient,
  addClinicalDocument,
} from "@/lib/patients/clinicalDocuments";
import { mockDoctors } from "@/data/mockData";
import { getPatientById } from "@/lib/patients/repository";
import { toast } from "sonner";

const DOC_TYPES = [
  { id: "plan_tratamiento", label: "Plan de tratamiento" },
  { id: "presupuesto", label: "Presupuesto / Proforma dental" },
  { id: "informe_clinico", label: "Informe clínico" },
] as const;

interface DocumentosClinicosListProps {
  patientId: string;
}

export function DocumentosClinicosList({ patientId }: DocumentosClinicosListProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"template" | "file">("template");
  const [typeId, setTypeId] = useState("");
  const [name, setName] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [doctorId, setDoctorId] = useState("");
  const [status, setStatus] = useState<"borrador" | "final">("borrador");
  const [content, setContent] = useState("");
  const [refresh, setRefresh] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [defaultDoctorId, setDefaultDoctorId] = useState<string | undefined>(mockDoctors[0]?.id);
  const documents = useMemo(
    () => getClinicalDocumentsByPatient(patientId),
    [patientId, refresh]
  );

  useEffect(() => {
    getPatientById(patientId)
      .then((patient) => setDefaultDoctorId(patient?.assignedDoctorId ?? mockDoctors[0]?.id))
      .catch(() => {});
  }, [patientId]);

  const openFromTemplate = () => {
    setModalMode("template");
    setTypeId("");
    setName("");
    setDate(new Date().toISOString().slice(0, 10));
    setDoctorId(defaultDoctorId ?? "");
    setStatus("borrador");
    setContent("");
    setModalOpen(true);
  };

  const openFromFile = () => {
    setModalMode("file");
    setTypeId("adjunto");
    setName("");
    setDate(new Date().toISOString().slice(0, 10));
    setDoctorId(defaultDoctorId ?? "");
    setStatus("final");
    setContent("");
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
    if (!allowed.includes(file.type)) {
      toast.error("Solo se permiten PDF, JPG o PNG");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const doctor = mockDoctors.find((d) => d.id === (doctorId || defaultDoctorId));
      addClinicalDocument({
        patientId,
        type: "Adjunto",
        name: file.name,
        date: new Date().toISOString().slice(0, 10),
        doctorId: doctorId || defaultDoctorId,
        doctorName: doctor?.name,
        fileRef: reader.result as string,
        status: "final",
      });
      setRefresh((r) => r + 1);
      toast.success("Documento adjuntado");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleSaveTemplate = () => {
    const typeLabel = DOC_TYPES.find((t) => t.id === typeId)?.label ?? typeId;
    const docName = name.trim() || typeLabel;
    const doctor = mockDoctors.find((d) => d.id === (doctorId || defaultDoctorId));
    addClinicalDocument({
      patientId,
      type: typeLabel,
      name: docName,
      date,
      doctorId: doctorId || defaultDoctorId,
      doctorName: doctor?.name,
      status,
      fileRef: content ? `data:text/plain;base64,${btoa(unescape(encodeURIComponent(content)))}` : undefined,
    });
    setRefresh((r) => r + 1);
    setModalOpen(false);
    toast.success("Documento creado");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={openFromTemplate} className="gap-2">
          <Plus className="h-4 w-4" />
          Crear desde plantilla
        </Button>
        <Button size="sm" variant="outline" onClick={openFromFile} className="gap-2">
          <Upload className="h-4 w-4" />
          Adjuntar archivo (PDF/JPG/PNG)
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      {documents.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground text-sm">
            No hay documentos clínicos. Cree uno desde plantilla o adjunte un archivo.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {documents.map((d) => (
            <Card key={d.id}>
              <CardContent className="p-4 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{d.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(parseISO(d.date), "d MMM yyyy", { locale: es })}
                      {d.doctorName && ` · ${d.doctorName}`}
                    </p>
                  </div>
                  <Badge variant={d.status === "final" ? "default" : "secondary"}>
                    {d.status === "final" ? "Final" : "Borrador"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear documento desde plantilla</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Tipo de documento</Label>
              <Select value={typeId} onValueChange={setTypeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {DOC_TYPES.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Nombre (opcional)</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Plan de tratamiento - Ortodoncia"
              />
            </div>
            <div className="space-y-2">
              <Label>Doctor</Label>
              <Select value={doctorId || defaultDoctorId} onValueChange={setDoctorId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {mockDoctors.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Fecha</Label>
                <input
                  type="date"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Estado</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as "borrador" | "final")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="borrador">Borrador</SelectItem>
                    <SelectItem value="final">Final</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Contenido / Notas (exportable)</Label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Texto del documento..."
                rows={6}
                className="resize-none"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveTemplate}>Crear documento</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
