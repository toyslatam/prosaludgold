import type { VerticalConfig } from "./types";

/**
 * Demo Odontología (actual). Contenido idéntico al actual del landing.
 */
export const dentalConfig: VerticalConfig = {
  key: "dental",
  name: "Odontología",
  hero: {
    badge: "Software de gestión clínica odontológica",
    title: "Tu clínica dental, ",
    titleHighlight: "organizada e inteligente",
    subtitle:
      "Agenda, ficha clínica, caja, reportes, inventario y herramientas con IA. Todo lo que necesitas para gestionar tu consultorio o clínica dental en Panamá, en una sola plataforma.",
    ctaText: "Solicitar demo",
    ctaSecondaryText: "Ver módulos",
    bullets: ["Sin instalaciones", "Soporte local", "Datos seguros"],
  },
  problemsTitle: "¿Qué resuelve ProSalud Gold?",
  problemsSubtitle: "Una plataforma integral para que te enfoques en lo que importa: tus pacientes.",
  problems: [
    { title: "Orden en la agenda", desc: "Deja de perder citas y gestiona tu agenda de forma inteligente." },
    { title: "Ficha clínica completa", desc: "Historial centralizado con odontograma, documentos y consentimientos." },
    { title: "Control de caja", desc: "Ingresos, egresos, cierres y múltiples medios de pago en un solo lugar." },
    { title: "Reportes claros", desc: "KPIs de ocupación, ventas, productividad y más, listos para exportar." },
    { title: "Remuneraciones automáticas", desc: "Contratos configurables y liquidaciones sin errores." },
    { title: "Inventario controlado", desc: "Stock actualizado, alertas de bajo stock y registro de proveedores." },
    { title: "Herramientas con IA", desc: "Análisis de RX, resúmenes clínicos, notas por voz y más." },
    { title: "Seguridad y permisos", desc: "Roles personalizados para cada miembro de tu equipo." },
  ],
  modulesTitle: "Módulos de ProSalud Gold",
  modulesSubtitle: "Cada módulo fue diseñado para resolver las necesidades reales de clínicas dentales en Panamá.",
  modules: [
    {
      title: "Agenda / Citas",
      features: [
        "Vistas diaria, semanal y mensual con control de ocupación",
        "Estados de cita: pendiente, confirmada, en sala de espera, atendida, no asistió",
        "Reprogramación rápida y gestión de sobreagenda",
        "Tiempos configurables por odontólogo",
        "Recordatorios automáticos por WhatsApp y email",
        "Agendamiento online 24/7 con link para redes sociales y sitio web",
        "Reglas por profesional, especialidad y/o sucursal con disponibilidad en tiempo real",
      ],
    },
    {
      title: "Pacientes / Ficha Clínica",
      features: [
        "Registro completo del paciente con datos requeridos configurables",
        "Historia clínica centralizada: citas, antecedentes, evolución, documentos y planes",
        "Gestión de documentos e imágenes clínicas",
        "Plantillas de documentos (recetas, evoluciones, formularios)",
        "Consentimientos informados con firma electrónica",
        "Odontograma y periodontograma con seguimiento",
        "Soporte para ortodoncia: seguimiento por etapas, controles y avances",
      ],
    },
    {
      title: "Experiencia del Paciente",
      features: [
        "Confirmación y recordatorios para reducir ausentismo",
        "Sala de espera con avisos y estado del paciente",
        "Encuestas de satisfacción y NPS",
        "Email marketing para comunicación con pacientes",
        "Recursos educativos: biblioteca de videos y animaciones 3D",
      ],
    },
    {
      title: "Doctores / Usuarios / Permisos",
      features: [
        "Gestión de doctores: disponibilidad, especialidades, sucursal, tiempos por atención",
        "Usuarios y roles: Administrador, Recepción, Doctor, Caja, Inventario",
        "Permisos por módulo y por sucursal",
      ],
    },
    {
      title: "Cobros / Caja / Finanzas",
      features: [
        "Pagos presenciales y online",
        "Enlaces de pago a pacientes pendientes o morosos",
        "Control de caja: múltiples cajas, ingresos/egresos, cierres imprimibles",
        "Medios de pago, devoluciones y reembolsos",
        "Cuotas y financiamiento para tratamientos",
      ],
    },
    {
      title: "Remuneraciones Automáticas",
      features: [
        "Contratos configurables por prestación o esquema",
        "Liquidaciones por acción pagada o al final del plan",
        "Vista por odontólogo con detalle y exportación",
      ],
    },
    {
      title: "Operación / Administración",
      features: [
        "Inventario: stock, entradas/salidas, alertas de bajo stock",
        "Laboratorios: solicitudes, estados y pagos",
        "Control de gastos: registro y clasificación",
        "Carga masiva de pacientes",
      ],
    },
    {
      title: "Laboratorios",
      features: [
        "Solicitudes de trabajo a laboratorios",
        "Seguimiento de estados y entregas",
        "Control de pagos a proveedores",
      ],
    },
    {
      title: "Reportería y Métricas",
      features: [
        "Reportes gráficos con KPIs y exportables tipo Excel",
        "Indicadores: ocupación agenda, no show, ventas, ticket promedio",
        "Productividad por doctor, pacientes nuevos, cartera pendiente",
        "Rotación de inventario y análisis financiero",
      ],
    },
    {
      title: 'Hub de IA — "Tu clínica con IA"',
      features: [
        "Análisis automático de radiografías",
        "Reportes automáticos con IA",
        "Contact center inteligente (WhatsApp/llamadas + agenda)",
        "Resumen clínico del paciente",
        "Contralor IA: alertas de inconsistencias",
        "Simulador de sonrisas",
        "Notas clínicas por voz (transcripción automática)",
      ],
    },
  ],
  howItWorksTitle: "¿Cómo funciona?",
  howItWorksSubtitle: "7 pasos simples para transformar tu clínica.",
  howItWorksSteps: [
    { title: "Configuras", desc: "Sedes, doctores, servicios, horarios y permisos." },
    { title: "Registras pacientes", desc: "Ficha clínica completa con datos configurables." },
    { title: "Agendas", desc: "Online o presencial, con recordatorios automáticos." },
    { title: "Atiendes", desc: "Odontograma, evoluciones, documentos y consentimientos." },
    { title: "Cobras", desc: "Pagos presenciales, online y enlaces a pacientes." },
    { title: "Mides", desc: "Reportes, KPIs y métricas de productividad." },
    { title: "Automatizas", desc: "IA, remuneraciones, recordatorios y más." },
  ],
  navItems: [
    { pathKey: "inicio", label: "Inicio" },
    { pathKey: "agenda", label: "Agenda" },
    { pathKey: "procedimientos", label: "Procedimientos" },
    { pathKey: "pacientes", label: "Pacientes" },
    { pathKey: "atencion", label: "Atención Clínica" },
    { pathKey: "doctores", label: "Doctores" },
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
