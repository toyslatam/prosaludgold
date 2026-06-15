import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import {
  useAppointments,
  useInsertAppointment,
  useUpdateAppointment,
  useDoctors,
  usePatients,
} from "@/hooks/useSupabase";
import { getChairs } from "@/lib/agenda/repository";
import { getLocationsWithSiteNames } from "@/lib/agenda/locations";
import { filterAppointmentsByDate, applyAgendaFilters } from "@/lib/agenda/filterAppointments";
import { AgendaToolbar } from "@/components/agenda/AgendaToolbar";
import { FiltersPanel, getDefaultAgendaFilters, type AgendaFiltersState } from "@/components/agenda/FiltersPanel";
import { AppointmentDrawer } from "@/components/agenda/AppointmentDrawer";
import { LocationManagerModal } from "@/components/agenda/LocationManagerModal";
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
  const [locationManagerOpen, setLocationManagerOpen] = useState(false);
  const [chairsKey, setChairsKey] = useState(0);
  const notifications = useAgendaNotifications();

  // ── Supabase data ──────────────────────────────────────────
  const { data: allAppointments = [] } = useAppointments();
  const { data: doctors = [] } = useDoctors();
  const { data: patients = [] } = usePatients();
  const insertApt = useInsertAppointment();
  const updateApt = useUpdateAppointment();

  // ── Local location/chair data (not in Supabase) ───────────
  const chairs = useMemo(() => getChairs(), [chairsKey]);
  const locationsForForm = useMemo(
    () => getLocationsWithSiteNames({ includeInactive: false }),
    [chairsKey],
  );

  useEffect(() => {
    const patientId = searchParams.get("patientId");
    if (patientId) {
      setDefaultPatientId(patientId);
      setNewSlotDefault({ date: format(new Date(), "yyyy-MM-dd"), time: "09:00" });
      setDrawerOpen(true);
    }
  }, [searchParams]);

  const refreshChairs = useCallback(() => setChairsKey((k) => k + 1), []);

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

  // Appointments per location (chairId not stored in Supabase, return 0)
  const appointmentCountByLocationId = useCallback((_locationId: string) => 0, []);

  const handleSave = useCallback(
    (values: AppointmentFormValues, patient: { id: string; name?: string }) => {
      const patientName = patient.name ?? "";
      const doctor = doctors.find((d) => d.id === values.doctorId);
      const base = {
        patient_id: values.patientId,
        doctor_id: values.doctorId,
        date: values.date,
        time: values.time,
        duration: values.duration,
        status: values.status as "pendiente" | "confirmada" | "en_sala" | "atendida" | "no_asistio",
        branch: doctor?.branch ?? "Sede Central",
        reason: values.reason || null,
      };

      if (selectedAppointment) {
        updateApt.mutate(
          { id: selectedAppointment.id, patch: base },
          {
            onSuccess: () => {
              toast.success("Cita actualizada");
              notifications.add({ type: "cita_reprogramada", title: "Cita actualizada", body: `${patientName} · ${values.date} ${values.time}` });
              setDrawerOpen(false);
              setSelectedAppointment(null);
              setNewSlotDefault(null);
              setDefaultPatientId(null);
            },
            onError: (err) => toast.error(err.message),
          }
        );
      } else {
        insertApt.mutate(
          base,
          {
            onSuccess: () => {
              toast.success("Cita creada");
              notifications.add({ type: "cita_creada", title: "Cita creada", body: `${patientName} · ${values.date} ${values.time}` });
              setDrawerOpen(false);
              setSelectedAppointment(null);
              setNewSlotDefault(null);
              setDefaultPatientId(null);
            },
            onError: (err) => toast.error(err.message),
          }
        );
      }
    },
    [doctors, selectedAppointment, insertApt, updateApt, notifications.add],
  );

  const handleStatusUpdate = useCallback(
    (id: string, status: "anulada" | "no_asistio" | "atendida", msg: string) => {
      updateApt.mutate(
        { id, patch: { status: status as "pendiente" | "confirmada" | "en_sala" | "atendida" | "no_asistio" } },
        {
          onSuccess: () => {
            toast.success(msg);
            setDrawerOpen(false);
            setSelectedAppointment(null);
          },
          onError: (err) => toast.error(err.message),
        }
      );
    },
    [updateApt],
  );

  const handleAnular   = useCallback((id: string) => {
    notifications.add({ type: "cita_reprogramada", title: "Cita anulada", body: "Se anuló la cita seleccionada." });
    handleStatusUpdate(id, "anulada", "Cita anulada");
  }, [handleStatusUpdate, notifications.add]);

  const handleNoAsiste = useCallback((id: string) => handleStatusUpdate(id, "no_asistio", "Marcada como no asistió"), [handleStatusUpdate]);
  const handleAtendida = useCallback((id: string) => handleStatusUpdate(id, "atendida",   "Marcada como atendida"),   [handleStatusUpdate]);

  const handleEnviarConfirmacion = useCallback(
    (_id: string) => {
      toast.success("Confirmación enviada (simulado)");
      notifications.add({ type: "confirmacion_enviada", title: "Confirmación enviada", body: "Recordatorio enviado al paciente." });
    },
    [notifications.add],
  );

  const handlePrint = useCallback(() => window.print(), []);

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
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <FiltersPanel filters={filters} onFiltersChange={setFilters} doctors={doctors as any} chairs={chairs} />
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
          Vista semanal (próximamente). Citas del período: {filtered.length}.
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
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        doctors={doctors as any}
        locations={locationsForForm}
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        patients={patients as any}
        defaultDate={newSlotDefault?.date}
        defaultTime={newSlotDefault?.time}
        defaultPatientId={defaultPatientId ?? undefined}
        nextAppointmentByPatientId={nextAppointmentByPatientId}
        onSave={handleSave}
        onOpenLocationManager={() => setLocationManagerOpen(true)}
        onAnular={handleAnular}
        onNoAsiste={handleNoAsiste}
        onAtendida={handleAtendida}
        onEnviarConfirmacion={handleEnviarConfirmacion}
        onViewPatient={() => {
          setDrawerOpen(false);
          setDefaultPatientId(null);
        }}
      />

      <LocationManagerModal
        open={locationManagerOpen}
        onOpenChange={(open) => {
          setLocationManagerOpen(open);
          if (!open) refreshChairs();
        }}
        locations={locationsForForm}
        onLocationsChange={refreshChairs}
        appointmentCountByLocationId={appointmentCountByLocationId}
      />
    </div>
  );
}
