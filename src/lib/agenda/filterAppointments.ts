import type { AppointmentWithDetails } from "@/types/agenda";
import type { AgendaFiltersState } from "@/components/agenda/FiltersPanel";
import { addDays, startOfWeek, isWithinInterval } from "date-fns";

export function filterAppointmentsByDate(
  appointments: AppointmentWithDetails[],
  selectedDate: Date,
  viewMode: "daily_grid" | "daily_list" | "weekly_grid" | "daily_global",
): AppointmentWithDetails[] {
  const dateStr = (d: Date) => d.toISOString().slice(0, 10);
  const selectedStr = dateStr(selectedDate);

  if (viewMode === "daily_grid" || viewMode === "daily_list" || viewMode === "daily_global") {
    return appointments.filter((a) => a.date === selectedStr);
  }
  // weekly: show Mon–Sun of the week containing selectedDate
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekEnd = addDays(weekStart, 6);
  return appointments.filter((a) => {
    const d = new Date(a.date);
    return isWithinInterval(d, { start: weekStart, end: weekEnd });
  });
}

export function applyAgendaFilters(
  appointments: AppointmentWithDetails[],
  filters: AgendaFiltersState,
): AppointmentWithDetails[] {
  return appointments.filter((apt) => {
    if (filters.searchPatient && !apt.patientName.toLowerCase().includes(filters.searchPatient.toLowerCase())) return false;
    if (filters.doctorId && filters.doctorId !== "all" && apt.doctorId !== filters.doctorId) return false;
    if (filters.status && apt.status !== filters.status) return false;
    if (filters.situation && apt.situation !== filters.situation) return false;
    if (filters.chairId && filters.chairId !== "all" && apt.chairId !== filters.chairId) return false;
    if (filters.statuses.length > 0 && !filters.statuses.includes(apt.status)) return false;
    if (filters.situations.length > 0 && (!apt.situation || !filters.situations.includes(apt.situation))) return false;
    return true;
  });
}
