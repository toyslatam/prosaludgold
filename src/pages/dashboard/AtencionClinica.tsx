import { useEffect, useMemo, useState } from "react";
import { useDemo } from "@/contexts/DemoContext";
import { getEncounterFormConfig } from "@/config/encounters";
import { getEncounters, saveEncounter } from "@/lib/encounters/repository";
import { getPatients, getPatientById } from "@/lib/patients/repository";
import { useDoctors } from "@/hooks/useSupabase";
import { toast } from "sonner";
import { applyConsumptionFromEncounter } from "@/lib/inventory/consumption";
import { getSites } from "@/lib/agenda/sites";
import { getLocationsWithSiteNames, type LocationWithSiteName } from "@/lib/agenda/locations";
import { CareEncounterForm } from "@/components/encounters/CareEncounterForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

const AtencionClinica = () => {
  const { vertical } = useDemo();
  const config = useMemo(() => getEncounterFormConfig(vertical), [vertical]);
  const [showForm, setShowForm] = useState(false);

  const encounters = getEncounters(vertical);
  const [patients, setPatients] = useState<{ id: string; name: string }[]>([]);
  const { data: doctorsData = [] } = useDoctors(vertical);
  const doctors = useMemo(
    () => doctorsData.map((d) => ({ id: d.id, name: d.name })),
    [doctorsData]
  );

  useEffect(() => {
    getPatients(vertical)
      .then((data) => setPatients(data.map((p) => ({ id: p.id, name: p.name }))))
      .catch(() => toast.error("No se pudieron cargar los pacientes."));
  }, [vertical]);

  const patientNameById = useMemo(() => {
    const map = new Map<string, string>();
    patients.forEach((p) => map.set(p.id, p.name));
    return map;
  }, [patients]);

  const [sites, setSites] = useState<{ id: string; name: string }[]>([]);
  const [locations, setLocations] = useState<LocationWithSiteName[]>([]);

  useEffect(() => {
    getSites(vertical)
      .then(setSites)
      .catch(() => toast.error("No se pudieron cargar las sedes."));
    getLocationsWithSiteNames({ includeInactive: false }, vertical)
      .then(setLocations)
      .catch(() => toast.error("No se pudieron cargar las ubicaciones."));
  }, [vertical]);

  const handleSave = async (payload: Omit<import("@/types/careEncounter").CareEncounter, "id" | "createdAt" | "updatedAt">) => {
    const encounter = saveEncounter(payload);
    if (payload.status === "COMPLETED" && payload.inventoryUsed?.length) {
      const patient = await getPatientById(encounter.patientId).catch(() => undefined);
      const professional = doctorsData.find((d) => d.id === encounter.professionalId);
      applyConsumptionFromEncounter(vertical, {
        encounterId: encounter.id,
        refLabel: `Atención #${encounter.id.slice(-6)}`,
        inventoryUsed: encounter.inventoryUsed,
        patientId: encounter.patientId,
        patientName: patient?.name,
        professionalId: encounter.professionalId,
        professionalName: professional?.name,
      });
    }
    setShowForm(false);
  };

  if (showForm) {
    return (
      <div className="space-y-6">
        <CareEncounterForm
          vertical={vertical}
          patients={patients}
          doctors={doctors}
          sites={sites}
          locations={locations}
          onSave={handleSave}
          onCancel={() => setShowForm(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{config.title}</h1>
          <p className="text-muted-foreground text-sm">
            {vertical === "dental"
              ? "Odontograma, evoluciones y seguimiento clínico"
              : vertical === "medical"
                ? "Consultas, diagnósticos y recetas"
                : "Sesiones, servicios y notas"}
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva atención
        </Button>
      </div>

      {vertical === "dental" && (
        <Card>
          <CardContent className="pt-6">
            <h2 className="font-semibold mb-4">Odontograma</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Selecciona un diente para registrar hallazgos o tratamientos (integrar con módulo odontograma).
            </p>
            <div className="flex justify-center gap-1 flex-wrap">
              {[18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28].map((tooth) => (
                <button
                  key={tooth}
                  className="w-8 h-10 rounded border border-border bg-muted/50 flex items-center justify-center text-xs text-muted-foreground hover:bg-primary/10 hover:border-primary transition-colors cursor-pointer"
                >
                  {tooth}
                </button>
              ))}
            </div>
            <div className="flex justify-center gap-1 flex-wrap mt-2">
              {[48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38].map((tooth) => (
                <button
                  key={tooth}
                  className="w-8 h-10 rounded border border-border bg-muted/50 flex items-center justify-center text-xs text-muted-foreground hover:bg-primary/10 hover:border-primary transition-colors cursor-pointer"
                >
                  {tooth}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          <h2 className="font-semibold mb-4">
            {vertical === "dental" ? "Evoluciones clínicas recientes" : "Atenciones recientes"}
          </h2>
          {encounters.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">
              No hay atenciones registradas. Use &quot;Nueva atención&quot; para crear una.
            </p>
          ) : (
            <div className="space-y-3">
              {encounters.slice(0, 10).map((enc) => {
                const patientName = patientNameById.get(enc.patientId);
                return (
                <div key={enc.id} className="p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">
                      {patientName ?? `Paciente #${enc.patientId}`} · {enc.status === "COMPLETED" ? "Finalizada" : "Borrador"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(parseISO(enc.startAt), "dd/MM/yyyy HH:mm", { locale: es })}
                    </span>
                  </div>
                  {enc.procedures.length > 0 && (
                    <p className="text-xs text-muted-foreground mb-1">
                      {enc.procedures.map((p) => p.name).join(", ")}
                    </p>
                  )}
                  {enc.clinicalNotes && <p className="text-sm">{enc.clinicalNotes}</p>}
                  {enc.verticalData?.medical?.prescription?.items?.length ? (
                    <p className="text-xs text-muted-foreground mt-1">
                      Receta: {enc.verticalData.medical.prescription.items.length} medicamento(s)
                    </p>
                  ) : null}
                </div>
              );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AtencionClinica;
