# Módulo Paciente (estilo Dentalink)

## Odontograma FDI

### Cómo extender condiciones

Las condiciones del diente se definen en `src/lib/patients/dentalChart.ts`:

- **Tipo:** añadir un valor al union type `DentalCondition` (ej. `"puente"`).
- **Etiqueta:** agregar la entrada en `DENTAL_CONDITION_LABELS`.
- **Color:** agregar la entrada en `DENTAL_CONDITION_COLORS` (hex).
- **Toolbar:** en `src/components/patient/DentalChartFDI.tsx`, incluir el nuevo valor en el array `CONDITION_OPTIONS`.

Ejemplo para añadir "Puente":

```ts
// dentalChart.ts
export type DentalCondition =
  | "caries"
  | "obturacion"
  // ...
  | "puente";

export const DENTAL_CONDITION_LABELS: Record<DentalCondition, string> = {
  // ...
  puente: "Puente",
};

export const DENTAL_CONDITION_COLORS: Record<DentalCondition, string> = {
  // ...
  puente: "#0d9488",
};
```

```tsx
// DentalChartFDI.tsx - en CONDITION_OPTIONS
const CONDITION_OPTIONS: DentalCondition[] = [
  "caries",
  // ...
  "puente",
];
```

### Persistencia

El odontograma se guarda en `localStorage` bajo la clave `psg_dental_charts`. La estructura es un array de `PatientDentalChart` (patientId, permanent, teeth, updatedAt). Cada diente tiene un objeto con `conditions[]` (id, type, surfaces opcional).

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
