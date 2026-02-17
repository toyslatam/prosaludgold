import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  getAntecedentesByPatient,
  saveAntecedentes,
  getEmptyAntecedentes,
} from "@/lib/patients/antecedentes";
import { toast } from "sonner";

interface AntecedentesFormProps {
  patientId: string;
}

const SECTIONS = [
  { key: "alergias", label: "Alergias" },
  { key: "enfermedadesSistemicas", label: "Enfermedades sistémicas" },
  { key: "medicacionActual", label: "Medicación actual" },
  { key: "embarazo", label: "Embarazo (si aplica)" },
  { key: "habitosTabaco", label: "Hábitos: tabaco" },
  { key: "habitosAlcohol", label: "Hábitos: alcohol" },
  { key: "observaciones", label: "Observaciones" },
] as const;

export function AntecedentesForm({ patientId }: AntecedentesFormProps) {
  const [editing, setEditing] = useState(false);
  const [refresh, setRefresh] = useState(0);

  const data = useMemo(() => {
    const a = getAntecedentesByPatient(patientId);
    return a ?? getEmptyAntecedentes(patientId);
  }, [patientId, refresh]);

  const [form, setForm] = useState(data);

  const startEdit = () => {
    setForm({ ...data });
    setEditing(true);
  };

  const handleSave = () => {
    saveAntecedentes({ ...form, patientId });
    setRefresh((r) => r + 1);
    setEditing(false);
    toast.success("Antecedentes guardados");
  };

  const handleCancel = () => {
    setForm({ ...data });
    setEditing(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg">Antecedentes médicos</CardTitle>
        {!editing ? (
          <Button variant="outline" size="sm" onClick={startEdit}>
            Editar
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button size="sm" onClick={handleSave}>
              Guardar
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {SECTIONS.map(({ key, label }) => (
          <div key={key} className="space-y-2">
            <Label className="text-muted-foreground">{label}</Label>
            {editing ? (
              key === "observaciones" || key === "enfermedadesSistemicas" || key === "medicacionActual" ? (
                <Textarea
                  value={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  placeholder="—"
                  rows={2}
                  className="resize-none"
                />
              ) : (
                <Input
                  value={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  placeholder="—"
                />
              )
            ) : (
              <p className="text-sm font-medium whitespace-pre-wrap">
                {data[key as keyof typeof data] || "—"}
              </p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
