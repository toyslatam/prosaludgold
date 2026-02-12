# Auditoría y plan del módulo Agenda

## PASO 0 — Auditoría del repo (realizada)

### Ruta y router
- **Ruta:** `/demo/agenda`
- **Archivo:** `src/pages/dashboard/Agenda.tsx`
- **Router:** `App.tsx` → `<Route path="agenda" element={<Agenda />} />` dentro de `DashboardLayout` (`/demo`).

### Componentes actuales (antes de la implementación)
- Una sola página `Agenda.tsx` con:
  - Filtros rápidos: input “Buscar paciente”, select Doctor, select Estado.
  - Dialog “Nueva cita” (formulario básico).
  - Time grid manual (divs) con bloques de citas.
  - Tabla lista debajo del grid.
- No existían componentes reutilizables de calendario ni drawer.

### Modelos de datos
- **mockData.ts:** `Appointment`, `Patient`, `Doctor` (sin chair, situation, confirmations).
- **types/agenda.ts:** `AppointmentWithDetails`, `Chair`, `SituationFinancial`, `Confirmations`, `AgendaViewMode`.
- **Supabase:** tablas `appointments`, `patients`, `doctors`, `chairs`; appointments con columnas opcionales `chair_id`, `notes`, `situation`, `confirmations` (jsonb).

### Estado y datos
- Sin Zustand/Redux.
- Sin TanStack Query para agenda.
- **Implementación actual:** capa `lib/agenda/repository.ts` con localStorage + seed (`data/agendaSeed.ts`). Los datos se leen con `getAppointmentsWithDetails()`, `getDoctors()`, `getChairs()`, `getPatients()` y se actualizan con `createAppointment`, `updateAppointment`, `deleteAppointment`.

### UI
- **Tailwind + shadcn/ui:** Button, Input, Select, Sheet, Dialog, Command, Popover, Calendar, Checkbox, ToggleGroup, etc.
- **Toasts:** Sonner.
- **Fechas:** date-fns.

### Plan incremental (checkpoints)

| Fase | Contenido | Estado |
|------|-----------|--------|
| **1** | Modelo extendido (chairs, situation, confirmations), repo + seed, AppointmentDrawer, AppointmentForm, vista Lista, toolbar, filtros rápidos y avanzados | Hecho |
| **2** | Vista Diaria Grid (time grid propio con bloques, click slot/cita), sin librería externa | Hecho |
| **3** | Vistas Semanal y Diaria Global (placeholders; se pueden implementar con FullCalendar o componentes propios) | Placeholder |
| **4** | Filtros avanzados (panel lateral con checkboxes por estado/situación/confirmación) | Hecho |
| **5** | Notificaciones in-app (toasts + NotificationsCenter), NotificationProvider (mock) y README | Hecho |

### Dependencias añadidas
- **Ninguna.** Se reutilizan Vite, React, TypeScript, react-router-dom, Tailwind, shadcn, date-fns, react-hook-form, zod, sonner, cmdk. Para drag & drop y vistas semanales/globales completas se puede añadir después FullCalendar o similar si se desea.
