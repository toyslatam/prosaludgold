/**
 * Puntos de extensión para notificaciones (WhatsApp, Email, in-app).
 * Implementa MockNotificationProvider por defecto; sustituye por el proveedor real cuando tengas API/credenciales.
 */

export interface WhatsAppPayload {
  to: string;
  message: string;
  appointmentId?: string;
}

export interface EmailPayload {
  to: string;
  subject: string;
  body: string;
  appointmentId?: string;
}

export interface InAppPayload {
  userId?: string;
  title: string;
  body: string;
  type?: "cita_creada" | "cita_reprogramada" | "recordatorio" | "deuda" | "confirmacion_enviada";
}

export interface NotificationProvider {
  sendWhatsApp?(payload: WhatsAppPayload): Promise<{ ok: boolean; error?: string }>;
  sendEmail?(payload: EmailPayload): Promise<{ ok: boolean; error?: string }>;
  sendInApp?(payload: InAppPayload): void;
}

/** Simula envío; registra en consola y devuelve ok. Sustituir por implementación real. */
export const MockNotificationProvider: NotificationProvider = {
  async sendWhatsApp() {
    console.log("[MockNotificationProvider] sendWhatsApp", arguments);
    return { ok: true };
  },
  async sendEmail() {
    console.log("[MockNotificationProvider] sendEmail", arguments);
    return { ok: true };
  },
  sendInApp(payload) {
    console.log("[MockNotificationProvider] sendInApp", payload);
  },
};

let currentProvider: NotificationProvider = MockNotificationProvider;

export function setNotificationProvider(provider: NotificationProvider) {
  currentProvider = provider;
}

export function getNotificationProvider(): NotificationProvider {
  return currentProvider;
}
