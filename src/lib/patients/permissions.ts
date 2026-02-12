/** Mock de permisos para mostrar/ocultar antecedentes médicos (estilo Dentalink) */
export const permissions = {
  canViewMedicalHistory: true,
};

export function setPermissionsMock(value: { canViewMedicalHistory?: boolean }) {
  Object.assign(permissions, value);
}
