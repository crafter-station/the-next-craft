/**
 * Tamaño de equipo, del contenido canónico del sitio: «3–5 personas».
 *
 * Vive aparte de `team-actions.ts` porque un fichero `"use server"` solo puede
 * exportar funciones asíncronas, y estas constantes las necesita el cliente.
 */
export const MIN_TEAM_SIZE = 3;
export const MAX_TEAM_SIZE = 5;
