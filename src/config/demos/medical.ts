import type { VerticalConfig } from "./types";

/**
 * Demo Medicina General. Mismo layout, contenido orientado a consultorio médico / clínica general.
 */
export const medicalConfig: VerticalConfig = {
  key: "medical",
  name: "Medicina General",
  hero: {
    badge: "Software de gestión médica",
    title: "Tu consultorio médico, ",
    titleHighlight: "organizado e inteligente",
    subtitle:
      "Agenda médica, historia clínica, recetas, facturación, reportes e inventario. Todo lo que necesitas para gestionar tu consultorio o clínica en Panamá, en una sola plataforma.",
    ctaText: "Solicitar demo",
    ctaSecondaryText: "Ver módulos",
    bullets: ["Sin instalaciones", "Soporte local", "Datos seguros"],
  },
  problemsTitle: "¿Qué resuelve ProSalud Gold?",
  problemsSubtitle: "Una plataforma integral para que te enfoques en lo que importa: tus pacientes.",
  problems: [
    { title: "Orden en la agenda", desc: "Gestión de citas médicas con recordatorios y confirmaciones." },
    { title: "Historia clínica centralizada", desc: "Expediente único, antecedentes, evolución y documentos." },
    { title: "Control de caja", desc: "Ingresos, egresos, múltiples medios de pago y facturación." },
    { title: "Reportes claros", desc: "KPIs de consulta, productividad y métricas exportables." },
    { title: "Remuneraciones automáticas", desc: "Contratos y liquidaciones por prestación o esquema." },
    { title: "Inventario controlado", desc: "Stock de insumos, medicamentos y alertas de bajo stock." },
    { title: "Herramientas con IA", desc: "Resúmenes clínicos, notas por voz y apoyo al diagnóstico." },
    { title: "Seguridad y permisos", desc: "Roles por usuario y acceso por módulo y sede." },
  ],
  modulesTitle: "Módulos de ProSalud Gold",
  modulesSubtitle: "Diseñados para las necesidades reales de consultorios y clínicas médicas.",
  modules: [
    {
      title: "Agenda médica / Citas",
      features: [
        "Vistas diaria, semanal y mensual",
        "Estados de cita y recordatorios automáticos",
        "Agendamiento online y por sede",
        "Tiempos configurables por médico y especialidad",
        "Reprogramación y gestión de sobreagenda",
      ],
    },
    {
      title: "Pacientes / Historia clínica",
      features: [
        "Registro completo del paciente",
        "Historia clínica: antecedentes, evolución, documentos",
        "Recetas y órdenes médicas",
        "Consentimientos informados con firma electrónica",
        "Plantillas de documentos configurables",
      ],
    },
    {
      title: "Experiencia del Paciente",
      features: [
        "Confirmación y recordatorios",
        "Encuestas de satisfacción y NPS",
        "Comunicación por email y WhatsApp",
      ],
    },
    {
      title: "Médicos / Usuarios / Permisos",
      features: [
        "Gestión de médicos: disponibilidad, especialidad, sede",
        "Usuarios y roles: Administrador, Recepción, Médico, Caja",
        "Permisos por módulo y sucursal",
      ],
    },
    {
      title: "Cobros / Caja / Finanzas",
      features: [
        "Pagos presenciales y online",
        "Control de caja y cierres imprimibles",
        "Facturación y medios de pago",
      ],
    },
    {
      title: "Remuneraciones",
      features: [
        "Contratos por prestación o esquema",
        "Liquidaciones y exportación",
      ],
    },
    {
      title: "Operación / Administración",
      features: [
        "Inventario y alertas de stock",
        "Control de gastos",
        "Carga masiva de pacientes",
      ],
    },
    {
      title: "Laboratorios / Estudios",
      features: [
        "Solicitudes de estudios",
        "Seguimiento de resultados y pagos",
      ],
    },
    {
      title: "Reportería y Métricas",
      features: [
        "Reportes y KPIs exportables",
        "Productividad por médico y ocupación",
      ],
    },
    {
      title: "Hub de IA",
      features: [
        "Resumen clínico del paciente",
        "Notas por voz (transcripción automática)",
        "Reportes asistidos por IA",
      ],
    },
  ],
  howItWorksTitle: "¿Cómo funciona?",
  howItWorksSubtitle: "7 pasos para transformar tu consultorio.",
  howItWorksSteps: [
    { title: "Configuras", desc: "Sedes, médicos, servicios, horarios y permisos." },
    { title: "Registras pacientes", desc: "Historia clínica y datos configurables." },
    { title: "Agendas", desc: "Citas online o presencial con recordatorios." },
    { title: "Atiendes", desc: "Evolución, recetas, documentos y consentimientos." },
    { title: "Cobras", desc: "Pagos presenciales, online y facturación." },
    { title: "Mides", desc: "Reportes y métricas de productividad." },
    { title: "Automatizas", desc: "IA, remuneraciones y recordatorios." },
  ],
  navItems: [
    { pathKey: "inicio", label: "Inicio" },
    { pathKey: "agenda", label: "Agenda" },
    { pathKey: "procedimientos", label: "Servicios" },
    { pathKey: "pacientes", label: "Pacientes" },
    { pathKey: "atencion", label: "Atención Clínica" },
    { pathKey: "doctores", label: "Médicos" },
    { pathKey: "caja", label: "Caja y Pagos" },
    { pathKey: "remuneraciones", label: "Remuneraciones" },
    { pathKey: "inventario", label: "Inventario" },
    { pathKey: "laboratorios", label: "Laboratorios" },
    { pathKey: "gastos", label: "Gastos" },
    { pathKey: "reportes", label: "Reportes" },
    { pathKey: "experiencia", label: "Experiencia Paciente" },
    { pathKey: "ia", label: "Hub de IA" },
    { pathKey: "configuracion", label: "Configuración" },
  ],
};
