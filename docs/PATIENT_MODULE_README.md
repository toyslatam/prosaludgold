# Módulo Paciente (estilo Dentalink)

## Odontograma interactivo (solo vertical dental)

Componente: `<DentalOdontogram patientId={id} verticalKey="dental" />` en `src/components/patient/DentalOdontogram.tsx`.

### Nomenclatura

- **FDI:** implementada (18-11, 21-28, 31-38, 41-48 permanente; 51-55, 61-65, 71-75, 81-85 temporal).
- **ADA / Continuo:** opción en UI (selector) preparada; valor "próximamente".

### Superficies

V (vestibular), L (palatino/lingual), M (mesial), D (distal), O (oclusal/incisal). Se eligen por checkboxes al aplicar una condición.

### Condiciones

Definidas en `src/lib/patients/dentalChart.ts`: caries, obturacion, corona, endodoncia, extraccion, ausente, sellante, implante, protesis. Para añadir una nueva: extender `DentalCondition`, `DENTAL_CONDITION_LABELS`, `DENTAL_CONDITION_COLORS` y el array `CONDITION_OPTIONS` en `DentalOdontogram.tsx`.

### Modelo JSON (registros con historial)

En `src/lib/patients/odontogramRecords.ts`:

- **OdontogramRecord:** id, patientId, permanent, toothId, condition, surfaces[], createdAt, annulledAt (null = activo).
- No se borran registros: solo se **anulan** (annulledAt) para trazabilidad.
- Funciones: getActiveRecords, getAllRecords, addRecord, annulRecord, getChartFromRecords, migrateLegacyChartsToRecords.

### Persistencia (demo)

- **Registros:** `localStorage` clave `psg_odontogram_records` (array de OdontogramRecord).
- **Compatibilidad:** los datos del chart legacy (`psg_dental_charts`) se migran a registros la primera vez que se abre el odontograma.
- El PDF de historia clínica usa `getChartFromRecords(patientId, true)` para incluir el estado actual del odontograma.

### Uso

1. Seleccionar pieza(s): clic en diente; Ctrl+clic para varias.
2. Opcional: marcar superficies (V, L, M, D, O).
3. Elegir condición en la barra y pulsar **Aplicar**.
4. En la lista inferior: ver todos los registros y **Anular** los que corresponda (no se eliminan, quedan con fecha de anulación).

---

## Migrar repositorios a API

Los datos del módulo paciente están en:

- `src/lib/patients/repository.ts` → pacientes (getPatients, getPatientById).
- `src/lib/patients/clinicalHistory.ts` → historial clínico (getClinicalEventsByPatient, addClinicalEvent).
- `src/lib/patients/treatmentPlans.ts` → planes de tratamiento (getPlansByPatient, getPlanById, applyPaymentToPlan).
- `src/lib/patients/payments.ts` → pagos (getPaymentsByPatient, addPayment).
- `src/lib/patients/dentalChart.ts` → odontograma (getDentalChart, addConditionToTooth, removeConditionFromTooth).

**Pasos para conectar a backend:**

1. Crear clientes API (fetch o Supabase) que reemplacen las lecturas/escrituras a `localStorage`.
2. Sustituir en cada repo las funciones `load*`/`save*` por llamadas a la API (GET/POST/PATCH).
3. Mantener los mismos tipos y firmas de las funciones exportadas para no cambiar los componentes.
4. Opcional: mantener un fallback a localStorage o seed cuando no haya conexión.

Ejemplo para `getPatientById`:

```ts
// Antes (local)
export function getPatientById(id: string): Patient | undefined {
  return loadPatients().find((p) => p.id === id);
}

// Después (API)
export async function getPatientById(id: string): Promise<Patient | undefined> {
  const res = await fetch(`/api/patients/${id}`);
  if (!res.ok) return undefined;
  return res.json();
}
```

En ese caso los componentes que usen `getPatientById` deberán usar `useEffect` + estado o React Query para cargar el paciente de forma asíncrona.
