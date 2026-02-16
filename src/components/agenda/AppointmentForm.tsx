import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { AppointmentWithDetails } from "@/types/agenda";
import type { DoctorRow } from "@/lib/agenda/types";
import type { LocationWithSiteName } from "@/lib/agenda/locations";
import type { PatientRow } from "@/lib/agenda/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { PatientAutocomplete } from "./PatientAutocomplete";
import { LocationCombobox } from "./LocationCombobox";
import { getProcedures, getProcedureById } from "@/lib/agenda/procedures";

const PROCEDURE_OTHER = "__other__";

const STATUS_OPTIONS = [
  { value: "pendiente", label: "Pendiente" },
  { value: "confirmada", label: "Confirmada" },
  { value: "en_sala", label: "En sala de espera" },
  { value: "atendida", label: "Atendida" },
  { value: "no_asistio", label: "No asistió" },
  { value: "anulada", label: "Anulada" },
] as const;

const SITUATION_OPTIONS = [
  { value: "deuda", label: "Deudas" },
  { value: "sin_saldo", label: "No hay saldo" },
  { value: "saldada", label: "Saldada" },
] as const;

const schema = z
  .object({
    patientId: z.string().min(1, "Seleccione un paciente"),
    doctorId: z.string().min(1, "Seleccione un doctor"),
    procedureId: z.string().min(1, "Seleccione un procedimiento"),
    reason: z.string().optional(),
    date: z.string().min(1),
    time: z.string().min(1),
    duration: z.coerce.number().min(15).max(240),
    chairId: z.string().optional(),
    status: z.enum(["pendiente", "confirmada", "en_sala", "atendida", "no_asistio", "anulada"]),
    situation: z.enum(["deuda", "sin_saldo", "saldada"]).optional(),
    confirmWhatsapp: z.boolean(),
    confirmEmail: z.boolean(),
    confirmPhone: z.boolean(),
    autoWhatsapp: z.boolean(),
    notes: z.string().optional(),
  })
  .refine(
    (data) => data.procedureId !== PROCEDURE_OTHER || (data.reason && data.reason.trim().length > 0),
    { message: "Indique el motivo o procedimiento", path: ["reason"] }
  );

export type AppointmentFormValues = z.infer<typeof schema>;

interface AppointmentFormProps {
  initial?: Partial<AppointmentWithDetails> & { patient?: PatientRow | null };
  doctors: DoctorRow[];
  locations: LocationWithSiteName[];
  patients: PatientRow[];
  defaultDate?: string;
  defaultTime?: string;
  nextAppointmentByPatientId?: Record<string, string>;
  onSubmit: (values: AppointmentFormValues, patient: PatientRow) => void;
  onCancel: () => void;
  onOpenLocationManager?: () => void;
  onAnular?: (motivo?: string) => void;
  onNoAsiste?: () => void;
  onAtendida?: () => void;
  onEnviarConfirmacion?: () => void;
  isEdit?: boolean;
}

export function AppointmentForm({
  initial,
  doctors,
  locations,
  patients,
  defaultDate,
  defaultTime,
  nextAppointmentByPatientId,
  onSubmit,
  onCancel,
  onOpenLocationManager,
  onAnular,
  onNoAsiste,
  onAtendida,
  onEnviarConfirmacion,
  isEdit = false,
}: AppointmentFormProps) {
  const procedures = getProcedures();
  const procedureIdToReason = (id: string, customReason?: string) => {
    if (id === PROCEDURE_OTHER) return customReason ?? "";
    return getProcedureById(id)?.name ?? customReason ?? "";
  };
  const initialProcedureId =
    initial?.procedureId && procedures.some((p) => p.id === initial.procedureId)
      ? initial.procedureId
      : initial?.reason && procedures.some((p) => p.name === initial.reason)
        ? procedures.find((p) => p.name === initial.reason)!.id
        : initial?.reason
          ? PROCEDURE_OTHER
          : "";
  const initialProc = initialProcedureId && initialProcedureId !== PROCEDURE_OTHER ? getProcedureById(initialProcedureId) : null;
  const defaultDoctorId =
    initial?.doctorId &&
    (!initialProc?.doctorIds?.length || initialProc.doctorIds.includes(initial.doctorId))
      ? initial.doctorId
      : initialProc?.doctorIds?.length
        ? initialProc.doctorIds[0]
        : "";

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      patientId: initial?.patientId ?? "",
      doctorId: defaultDoctorId || (initial?.doctorId ?? ""),
      procedureId: initialProcedureId || (procedures[0]?.id ?? PROCEDURE_OTHER),
      reason: initial?.reason && initialProcedureId === PROCEDURE_OTHER ? initial.reason : "",
      date: initial?.date ?? defaultDate ?? new Date().toISOString().slice(0, 10),
      time: initial?.time ?? defaultTime ?? "09:00",
      duration: initial?.duration ?? 30,
      chairId: initial?.chairId ?? "",
      status: initial?.status ?? "pendiente",
      situation: initial?.situation ?? undefined,
      confirmWhatsapp: initial?.confirmations?.whatsapp ?? false,
      confirmEmail: initial?.confirmations?.email ?? false,
      confirmPhone: initial?.confirmations?.phone ?? false,
      autoWhatsapp: initial?.confirmations?.auto_whatsapp ?? false,
      notes: initial?.notes ?? "",
    },
  });

  const patientId = form.watch("patientId");
  const procedureId = form.watch("procedureId");
  const selectedPatient = patientId ? patients.find((p) => p.id === patientId) ?? null : initial?.patient ?? null;
  const selectedProcedure = procedureId && procedureId !== PROCEDURE_OTHER ? getProcedureById(procedureId) : null;
  const doctorsForProcedure =
    selectedProcedure?.doctorIds?.length
      ? doctors.filter((d) => selectedProcedure.doctorIds.includes(d.id))
      : doctors;

  const handleSubmit = form.handleSubmit((values) => {
    const patient = patients.find((p) => p.id === values.patientId);
    if (!patient) return;
    const reason = procedureIdToReason(values.procedureId, values.reason);
    onSubmit({ ...values, reason }, patient);
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          control={form.control}
          name="patientId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Paciente</FormLabel>
              <FormControl>
                <PatientAutocomplete
                  patients={patients}
                  value={selectedPatient}
                  onChange={(p) => {
                    field.onChange(p?.id ?? "");
                    if (p) form.setValue("situation", p.situation);
                  }}
                  nextAppointmentByPatientId={nextAppointmentByPatientId}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="procedureId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Procedimiento</FormLabel>
              <Select
                onValueChange={(v) => {
                  field.onChange(v);
                  const proc = v && v !== PROCEDURE_OTHER ? getProcedureById(v) : null;
                  if (proc?.doctorIds?.length && form.getValues("doctorId") && !proc.doctorIds.includes(form.getValues("doctorId"))) {
                    form.setValue("doctorId", proc.doctorIds[0]);
                  }
                }}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione procedimiento" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Array.from(
                    procedures.reduce((acc, p) => {
                      if (!acc.has(p.category)) acc.set(p.category, []);
                      acc.get(p.category)!.push(p);
                      return acc;
                    }, new Map<string, typeof procedures>() as Map<string, typeof procedures>)
                  ).map(([category, list]) => (
                    <SelectGroup key={category}>
                      <SelectLabel>{category}</SelectLabel>
                      {list.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          <span className="inline-block w-3 h-3 rounded-full mr-2 align-middle" style={{ backgroundColor: p.color }} />
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                  <SelectItem value={PROCEDURE_OTHER}>Otro (especificar)</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        {procedureId === PROCEDURE_OTHER && (
          <FormField
            control={form.control}
            name="reason"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Motivo / Procedimiento (texto)</FormLabel>
                <FormControl>
                  <Input placeholder="Ej. Control, limpieza..." {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="doctorId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Doctor</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={doctorsForProcedure.length === 0}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={selectedProcedure?.doctorIds?.length ? "Doctores asignados al procedimiento" : "Seleccione doctor"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {doctorsForProcedure.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name} · {d.specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedProcedure?.doctorIds?.length && (
                <p className="text-xs text-muted-foreground">Solo doctores asignados a este procedimiento</p>
              )}
            </FormItem>
          )}
        />

        <div className="grid grid-cols-3 gap-3">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hora</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duración (min)</FormLabel>
                <FormControl>
                  <Input type="number" min={15} step={15} {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="chairId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ubicación (opcional)</FormLabel>
              <FormControl>
                <LocationCombobox
                  locations={locations}
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  placeholder="Selecciona una ubicación…"
                  onOpenManage={onOpenLocationManager}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estado de la cita</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {STATUS_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="situation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Situación financiera</FormLabel>
              <Select
                onValueChange={(v) => field.onChange(v === "__default__" ? undefined : v)}
                value={field.value && field.value.length > 0 ? field.value : "__default__"}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Igual al paciente" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="__default__">Igual al paciente</SelectItem>
                  {SITUATION_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <FormLabel>Confirmaciones</FormLabel>
          <div className="flex flex-wrap gap-4">
            <FormField
              control={form.control}
              name="confirmWhatsapp"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="font-normal">WhatsApp</FormLabel>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmEmail"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="font-normal">Email</FormLabel>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPhone"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="font-normal">Teléfono</FormLabel>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="autoWhatsapp"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="font-normal">Auto WhatsApp</FormLabel>
                </FormItem>
              )}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas internas</FormLabel>
              <FormControl>
                <Textarea placeholder="Notas..." className="resize-none" rows={2} {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex flex-wrap gap-2 pt-4 border-t">
          <Button type="submit">Guardar</Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          {isEdit && (
            <>
              {onAtendida && (
                <Button type="button" variant="outline" size="sm" onClick={onAtendida}>
                  Marcar Atendida
                </Button>
              )}
              {onNoAsiste && (
                <Button type="button" variant="outline" size="sm" onClick={onNoAsiste}>
                  No asiste
                </Button>
              )}
              {onEnviarConfirmacion && (
                <Button type="button" variant="outline" size="sm" onClick={onEnviarConfirmacion}>
                  Enviar confirmación
                </Button>
              )}
              {onAnular && (
                <Button type="button" variant="destructive" size="sm" onClick={() => onAnular()}>
                  Anular cita
                </Button>
              )}
            </>
          )}
        </div>
      </form>
    </Form>
  );
}
