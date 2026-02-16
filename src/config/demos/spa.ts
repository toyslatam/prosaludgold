import type { VerticalConfig } from "./types";

/**
 * Demo Spa. Mismo layout, contenido orientado a gestión de spa (agenda, cabinas, staff, paquetes, membresías).
 */
export const spaConfig: VerticalConfig = {
  key: "spa",
  name: "Spa",
  hero: {
    badge: "Software de gestión para spa",
    title: "Tu spa, ",
    titleHighlight: "organizado e inteligente",
    subtitle:
      "Agenda, cabinas y salas, staff, paquetes, membresías, ventas e inventario. Todo lo que necesitas para gestionar tu spa o centro de bienestar en Panamá, en una sola plataforma.",
    ctaText: "Solicitar demo",
    ctaSecondaryText: "Ver módulos",
    bullets: ["Sin instalaciones", "Soporte local", "Datos seguros"],
  },
  problemsTitle: "¿Qué resuelve ProSalud Gold?",
  problemsSubtitle: "Una plataforma integral para que te enfoques en la experiencia de tus clientes.",
  problems: [
    { title: "Orden en la agenda", desc: "Reservas por servicio, cabina y terapeuta sin conflictos." },
    { title: "Gestión de cabinas y salas", desc: "Disponibilidad en tiempo real y asignación de recursos." },
    { title: "Control de caja", desc: "Ventas, membresías, paquetes y múltiples medios de pago." },
    { title: "Reportes claros", desc: "Ocupación, ingresos, servicios más vendidos y métricas." },
    { title: "Remuneraciones", desc: "Comisiones por servicio y liquidaciones automáticas." },
    { title: "Inventario controlado", desc: "Productos, insumos y alertas de stock." },
    { title: "Recordatorios y fidelización", desc: "Confirmaciones, recordatorios y campañas por WhatsApp/email." },
    { title: "Seguridad y permisos", desc: "Roles para recepción, terapeutas y administración." },
  ],
  modulesTitle: "Módulos de ProSalud Gold",
  modulesSubtitle: "Diseñados para spas, centros de bienestar y salones.",
  modules: [
    {
      title: "Agenda / Reservas",
      features: [
        "Vistas por día, semana y mes",
        "Reservas por servicio, cabina/sala y staff",
        "Recordatorios automáticos por WhatsApp y email",
        "Reservas online 24/7",
        "Gestión de listas de espera y reprogramación",
      ],
    },
    {
      title: "Clientes / Ficha",
      features: [
        "Registro de clientes con preferencias",
        "Historial de visitas y servicios",
        "Notas y contraindicaciones",
        "Documentos y consentimientos",
      ],
    },
    {
      title: "Experiencia del Cliente",
      features: [
        "Confirmación y recordatorios",
        "Encuestas de satisfacción",
        "Campañas de marketing por email",
      ],
    },
    {
      title: "Staff / Terapeutas / Permisos",
      features: [
        "Gestión de terapeutas: disponibilidad y servicios",
        "Usuarios y roles: Admin, Recepción, Terapeuta, Caja",
        "Permisos por módulo y sede",
      ],
    },
    {
      title: "Ventas / Caja",
      features: [
        "Pagos presenciales y online",
        "Venta de servicios, paquetes y membresías",
        "Control de caja y cierres",
      ],
    },
    {
      title: "Paquetes y Membresías",
      features: [
        "Paquetes de servicios con vigencia",
        "Membresías y planes recurrentes",
        "Control de sesiones incluidas",
      ],
    },
    {
      title: "Operación / Administración",
      features: [
        "Inventario de productos e insumos",
        "Control de gastos",
        "Cabinas y salas: disponibilidad y asignación",
      ],
    },
    {
      title: "Laboratorios / Proveedores",
      features: [
        "Solicitudes a proveedores",
        "Seguimiento y pagos",
      ],
    },
    {
      title: "Reportería",
      features: [
        "Reportes de ocupación e ingresos",
        "Servicios más vendidos y productividad por staff",
      ],
    },
    {
      title: "Hub de IA",
      features: [
        "Resúmenes y notas por voz",
        "Recomendaciones y recordatorios inteligentes",
      ],
    },
  ],
  howItWorksTitle: "¿Cómo funciona?",
  howItWorksSubtitle: "7 pasos para transformar tu spa.",
  howItWorksSteps: [
    { title: "Configuras", desc: "Sedes, staff, servicios, cabinas y horarios." },
    { title: "Registras clientes", desc: "Ficha con preferencias e historial." },
    { title: "Reservas", desc: "Agenda online o en recepción con recordatorios." },
    { title: "Atiendes", desc: "Servicios, notas de sesión y documentos." },
    { title: "Cobras", desc: "Ventas, paquetes, membresías y pagos." },
    { title: "Mides", desc: "Reportes y métricas de ocupación e ingresos." },
    { title: "Automatizas", desc: "Recordatorios, comisiones y fidelización." },
  ],
  navItems: [
    { pathKey: "inicio", label: "Inicio" },
    { pathKey: "agenda", label: "Agenda" },
    { pathKey: "procedimientos", label: "Servicios" },
    { pathKey: "pacientes", label: "Clientes" },
    { pathKey: "atencion", label: "Atención" },
    { pathKey: "doctores", label: "Staff" },
    { pathKey: "caja", label: "Caja y Ventas" },
    { pathKey: "remuneraciones", label: "Remuneraciones" },
    { pathKey: "inventario", label: "Inventario" },
    { pathKey: "laboratorios", label: "Proveedores" },
    { pathKey: "gastos", label: "Gastos" },
    { pathKey: "reportes", label: "Reportes" },
    { pathKey: "experiencia", label: "Experiencia Cliente" },
    { pathKey: "ia", label: "Hub de IA" },
    { pathKey: "configuracion", label: "Configuración" },
  ],
};
