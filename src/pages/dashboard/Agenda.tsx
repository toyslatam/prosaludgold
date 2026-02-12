import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import {
  getAppointmentsWithDetails,
  getDoctors,
  getChairs,
  getPatients,
  createAppointment,
  updateAppointment,
} from "@/lib/agenda/repository";
import { filterAppointmentsByDate, applyAgendaFilters } from "@/lib/agenda/filterAppointments";
import { AgendaToolbar } from "@/components/agenda/AgendaToolbar";
import { AgendaViewSwitcher } from "@/components/agenda/AgendaViewSwitcher";
import { FiltersPanel, getDefaultAgendaFilters, type AgendaFiltersState } from "@/components/agenda/FiltersPanel";
import { AppointmentDrawer } from "@/components/agenda/AppointmentDrawer";
import { AgendaDailyListTable } from "@/components/agenda/AgendaDailyListTable";
import { CalendarDailyGrid } from "@/components/agenda/CalendarDailyGrid";
import type { AppointmentWithDetails } from "@/types/agenda";
import type { AppointmentFormValues } from "@/components/agenda/AppointmentForm";
import type { AgendaViewMode } from "@/types/agenda";
import { NotificationsCenter, type NotificationItem } from "@/components/agenda/NotificationsCenter";

const DEFAULT_VIEW: AgendaViewMode = "daily_grid";

function useAgendaNotifications() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const add = useCallback((item: Omit<NotificationItem, "id" | "read" | "createdAt">) => {
    setItems((prev) => [
      { ...item, id: `n-${Date.now()}`, read: false, createdAt: new Date().toISOString() },
      ...prev.slice(0, 49),
    ]);
  }, []);
  const markRead = useCallback((id: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, read: true } : i)));
  }, []);
  const clearAll = useCallback(() => setItems([]), []);
  return { items, add, markRead, clearAll };
}

export default function Agenda() {
  const [searchParams] = useSearchParams();
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [viewMode, setViewMode] = useState<AgendaViewMode>(DEFAULT_VIEW);
  const [filters, setFilters] = useState<AgendaFiltersState>(getDefaultAgendaFilters);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithDetails | null>(null);
  const [newSlotDefault, setNewSlotDefault] = useState<{ date: string; time: string } | null>(null);
  const [defaultPatientId, setDefaultPatientId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const notifications = useAgendaNotifications();

  useEffect(() => {
    const patientId = searchParams.get("patientId");
    if (patientId) {
      setDefaultPatientId(patientId);
      setNewSlotDefault({ date: format(new Date(), "yyyy-MM-dd"), time: "09:00" });
      setDrawerOpen(true);
    }
  }, [searchParams]);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  const doctors = useMemo(() => getDoctors(), [refreshKey]);
  const chairs = useMemo(() => getChairs(), [refreshKey]);
  const patients = useMemo(() => getPatients(), [refreshKey]);
  const allAppointments = useMemo(() => getAppointmentsWithDetails(), [refreshKey]);

  const filteredByDate = useMemo(
    () => filterAppointmentsByDate(allAppointments, selectedDate, viewMode),
    [allAppointments, selectedDate, viewMode],
  );
  const filtered = useMemo(() => applyAgendaFilters(filteredByDate, filters), [filteredByDate, filters]);

  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
  const nextAppointmentByPatientId = useMemo(() => {
    const map: Record<string, string> = {};
    allAppointments
      .filter((a) => a.date >= selectedDateStr)
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
      .forEach((a) => {
        if (!map[a.patientId]) map[a.patientId] = `${a.date} ${a.time}`;
      });
    return map;
  }, [allAppointments, selectedDateStr]);

  const handleSave = useCallback(
    (values: AppointmentFormValues, patient: { id: string }) => {
      const doctor = doctors.find((d) => d.id === values.doctorId);
      const payload = {
        patientId: values.patientId,
        doctorId: values.doctorId,
        date: values.date,
        time: values.time,
        duration: values.duration,
        status: values.status,
        branch: doctor?.branch ?? "Sede Central",
        reason: values.reason,
        chairId: values.chairId || null,
        situation: values.situation ?? null,
        confirmations: {
          whatsapp: values.confirmWhatsapp,
          email: values.confirmEmail,
          phone: values.confirmPhone,
          auto_whatsapp: values.autoWhatsapp,
          agenda_online: false,
        },
        notes: values.notes || null,
      };

      if (selectedAppointment) {
        updateAppointment(selectedAppointment.id, payload);
        toast.success("Cita actualizada");
        notifications.add({ type: "cita_reprogramada", title: "Cita actualizada", body: `${patient.name} · ${values.date} ${values.time}` });
      } else {
        createAppointment(payload);
        toast.success("Cita creada");
        notifications.add({ type: "cita_creada", title: "Cita creada", body: `${patient.name} · ${values.date} ${values.time}` });
      }
      refresh();
      setDrawerOpen(false);
      setSelectedAppointment(null);
      setNewSlotDefault(null);
      setDefaultPatientId(null);
    },
    [doctors, selectedAppointment, refresh, notifications.add],
  );

  const handleAnular = useCallback(
    (id: string) => {
      updateAppointment(id, { status: "anulada" });
      toast.success("Cita anulada");
      notifications.add({ type: "cita_reprogramada", title: "Cita anulada", body: "Se anuló la cita seleccionada." });
      refresh();
      setDrawerOpen(false);
      setSelectedAppointment(null);
    },
    [refresh, notifications.add],
  );

  const handleNoAsiste = useCallback(
    (id: string) => {
      updateAppointment(id, { status: "no_asistio" });
      toast.success("Marcada como no asistió");
      refresh();
      setDrawerOpen(false);
      setSelectedAppointment(null);
    },
    [refresh],
  );

  const handleAtendida = useCallback(
    (id: string) => {
      updateAppointment(id, { status: "atendida" });
      toast.success("Marcada como atendida");
      refresh();
      setDrawerOpen(false);
      setSelectedAppointment(null);
    },
    [refresh],
  );

  const handleEnviarConfirmacion = useCallback(
    (_id: string) => {
      toast.success("Confirmación enviada (simulado)");
      notifications.add({ type: "confirmacion_enviada", title: "Confirmación enviada", body: "Recordatorio enviado al paciente (simulado)." });
    },
    [notifications.add],
  );

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const openNewAppointment = useCallback((date?: string, time?: string) => {
    setSelectedAppointment(null);
    setNewSlotDefault(date && time ? { date, time } : null);
    setDrawerOpen(true);
  }, []);

  const openEditAppointment = useCallback((apt: AppointmentWithDetails) => {
    setSelectedAppointment(apt);
    setNewSlotDefault(null);
    setDrawerOpen(true);
  }, []);

  return (
    <div className="space-y-6 print:space-y-4">
      <div className="flex flex-col gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold">Agenda</h1>
          <p className="text-muted-foreground text-sm">
            {format(selectedDate, "EEEE d 'de' MMMM yyyy", { locale: es })}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <AgendaToolbar
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onNewAppointment={() => openNewAppointment()}
            onPrint={handlePrint}
            appointmentCount={filtered.length}
          />
          <NotificationsCenter
            items={notifications.items}
            onMarkRead={notifications.markRead}
            onClearAll={notifications.clearAll}
          />
        </div>
        <FiltersPanel filters={filters} onFiltersChange={setFilters} doctors={doctors} chairs={chairs} />
      </div>

      {viewMode === "daily_grid" && (
        <CalendarDailyGrid
          date={selectedDateStr}
          appointments={filtered}
          onSelectAppointment={openEditAppointment}
          onSelectSlot={(date, time) => openNewAppointment(date, time)}
        />
      )}

      {viewMode === "daily_list" && (
        <AgendaDailyListTable appointments={filtered} onSelectAppointment={openEditAppointment} />
      )}

      {viewMode === "weekly_grid" && (
        <div className="bg-card rounded-xl border border-border shadow-card p-4 text-muted-foreground">
          Vista semanal (próximamente con calendario completo). Citas del período: {filtered.length}.
        </div>
      )}

      {viewMode === "daily_global" && (
        <div className="bg-card rounded-xl border border-border shadow-card p-4 text-muted-foreground">
          Vista diaria global por doctor (próximamente). Citas del día: {filtered.length}.
        </div>
      )}

      <AppointmentDrawer
        open={drawerOpen}
        onOpenChange={(open) => {
          setDrawerOpen(open);
          if (!open) setDefaultPatientId(null);
        }}
        appointment={selectedAppointment}
        doctors={doctors}
        chairs={chairs}
        patients={patients}
        defaultDate={newSlotDefault?.date}
        defaultTime={newSlotDefault?.time}
        defaultPatientId={defaultPatientId ?? undefined}
        nextAppointmentByPatientId={nextAppointmentByPatientId}
        onSave={handleSave}
        onAnular={handleAnular}
        onNoAsiste={handleNoAsiste}
        onAtendida={handleAtendida}
        onEnviarConfirmacion={handleEnviarConfirmacion}
        onViewPatient={(id) => {
          setDrawerOpen(false);
          setDefaultPatientId(null);
        }}
      />
    </div>
  );
}
