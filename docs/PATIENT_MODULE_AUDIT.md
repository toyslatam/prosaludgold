# Auditoría: Módulo Paciente (estilo Dentalink)

## Estado actual (resumen)

| Fase | Estado | Notas |
|------|--------|--------|
| **Paso 0** | Hecho | Auditoría realizada. |
| **Fase 1** | Hecho | Rutas, PatientLayout, PatientHeader, PatientTabs; "Ver ficha" navega a `/demo/pacientes/:id/datos`; sin modal. |
| **Fase 2** | Hecho | Datos personales (secciones + Editar mock), Ficha clínica con sub-tabs, Historial con timeline + filtros + seed. |
| **Fase 3** | Hecho | Planes (listado + detalle 2 columnas), Facturación (sub-tabs + tabla pagos), Recibir pago (tablas + botones mock funcionales). |
| **Fase 4** | Hecho | Odontograma FDI (condiciones, persistencia), Agendar desde perfil, Historia clínica export, Antecedentes bloqueado sin permisos, README. |

**DoD:** 1 ✅ · 2 ✅ · 3 ✅ · 4 ✅ · 5 ✅

---

## Paso 0 — Hallazgos (referencia)

### Página actual de Pacientes
- **Archivo:** `src/pages/dashboard/Pacientes.tsx`
- Lista de pacientes con búsqueda; botón "Ver ficha" abre estado `selectedPatient` y un **Dialog** (modal).

### Modal de ficha actual
- **Mismo archivo:** `Dialog` con `DialogContent className="max-w-2xl max-h-[80vh]"`.
- **Tabs:** Datos (info) | Tratamientos | Documentos | Odontograma.
- Datos: grid 2 columnas (cédula, teléfono, email, nacimiento, última visita, próxima cita).
- Tratamientos: cards con nombre, estado, costo/pagado/saldo, barra de progreso.
- Documentos: empty state + "Subir documento".
- Odontograma: **grilla de números** (divs con FDI 18-28 y 48-38), sin estados ni persistencia.

### Router
- **react-router-dom** v6.30.1.
- `App.tsx`: `BrowserRouter` > `Routes`. Layout bajo `/demo` con `DashboardLayout` y `<Outlet />`.
- Rutas: `/`, `/demo`, `/demo/agenda`, `/demo/pacientes`, etc. **No hay** `/demo/pacientes/:patientId`.

### Tipos actuales
- **Patient** (`data/mockData.ts`): id, name, cedula, phone, email, birthDate, lastVisit, nextAppointment, balance, treatments[].
- **Treatment**: id, name, status (pendiente|en_curso|completado), cost, paid, date.
- **Appointment** (mockData): id, patientName, doctorName, specialty, date, time, duration, status, branch, reason.
- **AppointmentWithDetails** (`types/agenda.ts`): incluye patientId, doctorId, chairId, situation, confirmations.
- No hay tipo **Document** ni **Payment** explícito; **CashEntry** existe (ingreso/egreso, patient opcional).
- Agenda usa `lib/agenda/types.ts`: PatientRow, DoctorRow, ChairRow, AppointmentRow.

### UI kit y librerías
- **Tailwind** + **shadcn/ui** (Radix): Tabs, Dialog, Sheet, Button, Input, Badge, Card, Select, Form (react-hook-form + zod).
- **date-fns** (^3.6.0) para fechas.
- **react-hook-form** + **@hookform/resolvers** + **zod** para formularios.
- **lucide-react** iconos. **recharts** para gráficos. **Sonner** toasts.

### Estado global
- No hay Redux/Zustand global para pacientes. Lista y modal son estado local en `Pacientes.tsx`. Agenda usa `lib/agenda/repository.ts` (localStorage + seed).

---

## Plan incremental en 4 fases

### Fase 1 — Rutas y layout tipo Dentalink (checkpoint: sin modal, navegación por ruta)
- Añadir rutas anidadas bajo `/demo/pacientes`:
  - `/demo/pacientes` → lista (actual, sin modal).
  - `/demo/pacientes/:patientId` → layout con header + tabs.
  - `/demo/pacientes/:patientId/datos` (default), `.../ficha`, `.../planes`, `.../facturacion`, `.../recibir-pago`.
- Crear **PatientLayout** que lea `patientId`, cargue paciente (mock/repo), renderice **PatientHeader** (sticky, fondo azul, avatar, ID, nombre, identificación, sexo, edad, badge, botones Agendar / Historia clínica) y **PatientTabs** (NavLink a las 5 rutas). Redirigir `/demo/pacientes/:id` → `.../datos`.
- En **Pacientes.tsx** (lista): "Ver ficha" → `navigate(/demo/pacientes/${patient.id})`; quitar modal de ficha.
- Checkpoint: clic en "Ver ficha" lleva a URL y se ve header + tabs; no se abre modal.

### Fase 2 — Datos personales y Ficha clínica (checkpoint: ficha completa + historial)
- **Datos personales:** Página con secciones (Datos básicos, Dirección, Convenio, Sucursal, Profesional, Colaboradores). Modo ver/editar con forms existentes o read-only + botón Editar (mock).
- **Ficha clínica:** Sub-tabs (Historial | Evoluciones | Antecedentes | Odontograma | …). Sub-tab **Historial**: timeline vertical por fecha (CITA AGENDADA, PRESTACIÓN REALIZADA, PRESUPUESTO CREADO) con filtros (mes, tipo, "Mostrar anuladas") y empty state. Crear **clinicalHistoryRepo** + seed (eventos por paciente).
- Checkpoint: datos personales visibles; historial con eventos mock y filtros.

### Fase 3 — Planes, Facturación y Recibir pago (checkpoint: todas las pestañas operativas)
- **Planes de tratamiento:** Listado con dropdown "Tratamientos activos", botón "+ Nuevo plan", cards (En ejecución) con #plan, profesional, colaboradores, última cita, progreso, estado financiero. Detalle en `/pacientes/:id/planes/:planId`: layout 2 columnas (resumen financiero + tabs Ortodoncia/Odontograma/Estética, sub-tabs, tabla prestaciones). **treatmentPlansRepo** + seed.
- **Facturación y pagos:** Sub-tabs (Pagos | Documentos emitidos | Devoluciones | Pagos eliminados | Balance). Empty state y tabla mock de pagos. **paymentsRepo**.
- **Recibir pago:** "Ingresar un pago": tablas Planes de tratamiento y Cuotas de financiamiento con botones "Pagar tratamiento(s)" y "Pagar cuotas" (mock que actualice estado).
- Checkpoint: navegación y contenido visible en las 5 pestañas principales.

### Fase 4 — Odontograma FDI, Agendar y permisos (checkpoint: DoD completo)
- **Odontograma FDI:** Componente SVG (odontograma real superior/inferior), toggle Permanente/Temporal, toolbar condiciones (Caries, Obturación, Corona, etc.), click en diente → panel/tooltip con número FDI, superficies, condiciones, "Quitar condición". **dentalChartRepo** (localStorage) con estructura PatientDentalChart; seed para 2–3 pacientes.
- **Agendar:** Botón en header abre flujo de cita (AppointmentDrawer/AppointmentForm del módulo Agenda) con paciente preseleccionado; si hace falta, parámetro en URL o estado para abrir drawer desde Agenda con patientId.
- **Historia clínica:** Botón "Historia clínica" → export/descarga mock (PDF o mensaje).
- **Permisos:** Mock `permissions.canViewMedicalHistory`; si false, banner en header "No posee los permisos para ver los antecedentes médicos del paciente" y sub-tab Antecedentes bloqueada.
- README breve: extender odontograma (agregar condiciones), migrar repos a API.
- Checkpoint: criterios de aceptación del DoD cumplidos.

---

## Criterios de aceptación (DoD)
1. ✅ "Ver ficha" navega a `/demo/pacientes/:id`; se ve header + tabs (no modal).
2. ✅ Header: ID, nombre, identificación, sexo, edad, badge, banner permisos si aplica, botones Agendar e Historia clínica.
3. ✅ Tabs principales con rutas: Datos personales, Ficha clínica (sub-tabs + timeline), Planes, Facturación, Recibir pago.
4. ✅ Odontograma FDI visual (no grilla), clickeable, condiciones y persistencia por paciente.
5. ✅ UI consistente con el kit actual, responsive, sin romper otras rutas.
