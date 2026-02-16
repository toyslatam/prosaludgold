# Módulo Agenda (tipo Dentalink)

## Cómo correr

1. Instalar dependencias: `npm install`
2. Desarrollo: `npm run dev` → abrir http://localhost:8080/demo/agenda
3. La agenda usa datos en **localStorage** por defecto (seed la primera vez). Para resetear datos, borra las claves `agenda_appointments`, `agenda_patients`, `agenda_doctors`, `agenda_sites`, `agenda_locations` en localStorage.

## Cómo cambiar el proveedor de notificaciones

El módulo está preparado para conectar WhatsApp/Email:

1. **Notificaciones in-app**: ya se usan toasts (Sonner) al crear/editar/anular y al “Enviar confirmación”.
2. **Proveedor externo**: crea un servicio que implemente la interfaz de notificaciones (ej. `NotificationProvider` en `src/lib/agenda/notifications.ts`). Dicha interfaz puede exponer:
   - `sendWhatsApp(payload: { to: string; message: string })`
   - `sendEmail(payload: { to: string; subject: string; body: string })`
   - `sendInApp(payload: { userId: string; title: string; body: string })`
3. Sustituye las llamadas actuales a `toast.success("Confirmación enviada (simulado)")` por la llamada al proveedor real cuando tengas credenciales/API.

## Cómo agregar una nueva vista

1. Añade el valor al tipo `AgendaViewMode` en `src/types/agenda.ts` (ej. `"monthly"`).
2. En `AgendaViewSwitcher.tsx`, agrega la opción al array `VIEWS` con label e icono.
3. En `Agenda.tsx`, añade un `if (viewMode === "monthly")` y renderiza el componente de la nueva vista (ej. `CalendarMonthlyView`).
4. En `filterAppointmentsByDate` (`src/lib/agenda/filterAppointments.ts`), añade la lógica para el rango de fechas de la nueva vista (ej. mes completo).

## Cómo agregar un nuevo estado de cita

1. En Supabase (si usas DB): añade el valor al enum `appointment_status` y aplica la migración.
2. En el front: añade el valor al tipo `AppointmentStatus` en `src/types/agenda.ts`.
3. En `src/data/mockData.ts`, añade entradas en `statusColors` y `statusLabels`.
4. En `AppointmentForm.tsx`, añade la opción en `STATUS_OPTIONS`.
5. En `FiltersPanel.tsx`, añade el valor al array `ALL_STATUSES` si debe ser filtrable.
