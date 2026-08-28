-- Mentorías sin reserva: se atienden acercándose a la mesa, así que no hay
-- nada que agendar ni cupo que guardar. Se van las dos tablas y la columna
-- que las apuntaba.
-- El orden importa: primero la constraint y la columna, después las tablas.
-- Al revés, el CASCADE del DROP TABLE ya se lleva la clave foránea por
-- delante y el DROP CONSTRAINT posterior falla por no encontrarla.
ALTER TABLE "dashboard_teams" DROP CONSTRAINT IF EXISTS "dashboard_teams_mentor_table_id_dashboard_mentor_tables_id_fk";--> statement-breakpoint
ALTER TABLE "dashboard_teams" DROP COLUMN IF EXISTS "mentor_table_id";--> statement-breakpoint
DROP TABLE IF EXISTS "dashboard_mentor_slots" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "dashboard_mentor_tables" CASCADE;
