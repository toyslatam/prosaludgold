import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { AppointmentWithDetails } from "@/types/agenda";
import type { DoctorRow, ChairRow } from "@/lib/agenda/types";
import type { PatientRow } from "@/lib/agenda/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { PatientAutocomplete } from "./PatientAutocomplete";

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

const schema = z.object({
  patientId: z.string().min(1, "Seleccione un paciente"),
  doctorId: z.string().min(1, "Seleccione un doctor"),
  reason: z.string().min(1, "Indique el motivo"),
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
});

export type AppointmentFormValues = z.infer<typeof schema>;

interface AppointmentFormProps {
  initial?: Partial<AppointmentWithDetails> & { patient?: PatientRow | null };
  doctors: DoctorRow[];
  chairs: ChairRow[];
  patients: PatientRow[];
  defaultDate?: string;
  defaultTime?: string;
  nextAppointmentByPatientId?: Record<string, string>;
  onSubmit: (values: AppointmentFormValues, patient: PatientRow) => void;
  onCancel: () => void;
  onAnular?: (motivo?: string) => void;
  onNoAsiste?: () => void;
  onAtendida?: () => void;
  onEnviarConfirmacion?: () => void;
  isEdit?: boolean;
}

export function AppointmentForm({
  initial,
  doctors,
  chairs,
  patients,
  defaultDate,
  defaultTime,
  nextAppointmentByPatientId,
  onSubmit,
  onCancel,
  onAnular,
  onNoAsiste,
  onAtendida,
  onEnviarConfirmacion,
  isEdit = false,
}: AppointmentFormProps) {
  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      patientId: initial?.patientId ?? "",
      doctorId: initial?.doctorId ?? "",
      reason: initial?.reason ?? "",
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
  const selectedPatient = patientId ? patients.find((p) => p.id === patientId) ?? null : initial?.patient ?? null;

  const handleSubmit = form.handleSubmit((values) => {
    const patient = patients.find((p) => p.id === values.patientId);
    if (!patient) return;
    onSubmit(values, patient);
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
          name="doctorId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Doctor</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione doctor" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {doctors.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name} · {d.specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Motivo / Procedimiento</FormLabel>
              <FormControl>
                <Input placeholder="Ej. Control, limpieza..." {...field} />
              </FormControl>
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
              <FormLabel>Box / Sillón (opcional)</FormLabel>
              <Select
                onValueChange={(v) => field.onChange(v === "__none__" ? "" : v)}
                value={field.value && field.value.length > 0 ? field.value : "__none__"}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Ninguno" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="__none__">Ninguno</SelectItem>
                  {chairs.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} {c.branch ? `· ${c.branch}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
