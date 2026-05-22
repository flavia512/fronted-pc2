-- =============================================================
--  VoyContigo – Datos de prueba
--  Base de datos: voycontigo_prueba
--  Ejecutar con: mysql -u root voycontigo_prueba < seed_prueba.sql
-- =============================================================
--
--  CREDENCIALES DE ACCESO
--  ─────────────────────────────────────────────────────────────
--  ROL ADMIN
--    Email   : admin@voycontigo.com
--    Password: Admin123!
--
--  ROL USER (todos comparten la misma contraseña)
--    maria.garcia@voycontigo.com  / User123!
--    carlos.lopez@voycontigo.com  / User123!
--    lucia.martin@voycontigo.com  / User123!
--    juan.perez@voycontigo.com    / User123!
-- =============================================================

USE voycontigo_prueba;

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE predicciones;
TRUNCATE TABLE favoritos;
TRUNCATE TABLE alertas;
TRUNCATE TABLE reservas;
TRUNCATE TABLE viaje_compartidos;
TRUNCATE TABLE rutas;
TRUNCATE TABLE users;

SET FOREIGN_KEY_CHECKS = 1;

-- ─── USUARIOS ────────────────────────────────────────────────
INSERT INTO users
  (email, full_name, password_hash, puntos, is_active, rol, created_at, updated_at)
VALUES
  ('admin@voycontigo.com',       'Admin VoyContigo', '$2y$12$mPb.P1rl9EUPMOwIGBEjh.TIcVCHrsU69Ib4Vh5tjOTZkm1XDG6AS', 150, 1, 'admin', NOW(), NOW()),
  ('maria.garcia@voycontigo.com','María García',     '$2y$12$tE04MKIO.15tRj8b19/cPuPJLXTa9yDUpmXtMxQsZqXY1xMCKog0K',  80, 1, 'user',  NOW(), NOW()),
  ('carlos.lopez@voycontigo.com','Carlos López',     '$2y$12$tE04MKIO.15tRj8b19/cPuPJLXTa9yDUpmXtMxQsZqXY1xMCKog0K',  45, 1, 'user',  NOW(), NOW()),
  ('lucia.martin@voycontigo.com','Lucía Martín',     '$2y$12$tE04MKIO.15tRj8b19/cPuPJLXTa9yDUpmXtMxQsZqXY1xMCKog0K', 120, 1, 'user',  NOW(), NOW()),
  ('juan.perez@voycontigo.com',  'Juan Pérez',       '$2y$12$tE04MKIO.15tRj8b19/cPuPJLXTa9yDUpmXtMxQsZqXY1xMCKog0K',  30, 1, 'user',  NOW(), NOW());

-- ─── RUTAS ───────────────────────────────────────────────────
-- user_id 2 = María, 3 = Carlos, 4 = Lucía, 5 = Juan
INSERT INTO rutas
  (user_id, nombre, origin_text, origin_lat, origin_lng, dest_text, dest_lat, dest_lng, hora_salida, duration_min, pasa_por_m30, created_at, updated_at)
VALUES
  (2, 'Casa al trabajo',              'Alcorcón, Madrid',      40.3492, -3.8473, 'Príncipe Pío, Madrid',      40.4141, -3.7194, '08:30:00', 35, 1, NOW(), NOW()),
  (3, 'Getafe Centro al trabajo',     'Getafe Centro, Madrid', 40.3051, -3.7342, 'Puerta del Sol, Madrid',    40.4169, -3.7037, '07:45:00', 40, 0, NOW(), NOW()),
  (4, 'Leganés a Atocha',            'Leganés, Madrid',        40.3280, -3.7632, 'Atocha, Madrid',            40.4065, -3.6888, '08:00:00', 45, 1, NOW(), NOW()),
  (2, 'Móstoles a Chamartín',        'Móstoles, Madrid',       40.3225, -3.8645, 'Chamartín, Madrid',         40.4722, -3.6788, '07:30:00', 55, 1, NOW(), NOW()),
  (5, 'Vallecas a Nuevos Ministerios','Vallecas, Madrid',      40.3885, -3.6607, 'Nuevos Ministerios, Madrid',40.4463, -3.6921, '09:00:00', 30, 0, NOW(), NOW());

-- ─── VIAJES COMPARTIDOS ──────────────────────────────────────
-- seats_available ya refleja las reservas confirmadas
INSERT INTO viaje_compartidos
  (driver_user_id, route_id, origin, destiny, trip_datetime, seats_total, seats_available, status, created_at, updated_at)
VALUES
  (2, 1, 'Alcorcón, Madrid',       'Príncipe Pío, Madrid',       '2026-05-23 08:30:00', 4, 2, 'active', NOW(), NOW()),
  (3, 2, 'Getafe Centro, Madrid',  'Puerta del Sol, Madrid',     '2026-05-23 07:45:00', 3, 2, 'active', NOW(), NOW()),
  (4, 3, 'Leganés, Madrid',        'Atocha, Madrid',             '2026-05-23 08:00:00', 4, 4, 'active', NOW(), NOW()),
  (2, 4, 'Móstoles, Madrid',       'Chamartín, Madrid',          '2026-05-24 07:30:00', 5, 3, 'active', NOW(), NOW()),
  (5, 5, 'Vallecas, Madrid',       'Nuevos Ministerios, Madrid', '2026-05-24 09:00:00', 2, 1, 'active', NOW(), NOW());

-- ─── RESERVAS ────────────────────────────────────────────────
-- trip_id 1 = viaje de María, 2 = Carlos, 3 = Lucía, 4 = María B, 5 = Juan
INSERT INTO reservas
  (user_id, trip_id, seats, status, created_at, updated_at)
VALUES
  (3, 1, 1, 'confirmed', NOW(), NOW()),  -- Carlos reserva el viaje de María (Alcorcón)
  (4, 2, 1, 'confirmed', NOW(), NOW()),  -- Lucía reserva el viaje de Carlos (Getafe)
  (5, 1, 1, 'pending',   NOW(), NOW()),  -- Juan reserva el viaje de María (Alcorcón)
  (2, 5, 1, 'confirmed', NOW(), NOW()),  -- María reserva el viaje de Juan (Vallecas)
  (3, 4, 2, 'pending',   NOW(), NOW());  -- Carlos reserva 2 plazas viaje de María (Móstoles)

-- ─── ALERTAS ─────────────────────────────────────────────────
INSERT INTO alertas
  (route_id, user_id, for_datetime, status, created_at, updated_at)
VALUES
  (1, 3, '2026-05-23 08:30:00', 'pending', NOW(), NOW()),
  (2, 4, '2026-05-23 07:45:00', 'sent',    NOW(), NOW()),
  (3, 5, '2026-05-23 08:00:00', 'pending', NOW(), NOW()),
  (4, 2, '2026-05-24 07:30:00', 'pending', NOW(), NOW()),
  (5, 3, '2026-05-24 09:00:00', 'pending', NOW(), NOW());

-- ─── FAVORITOS ───────────────────────────────────────────────
INSERT INTO favoritos
  (user_id, route_id)
VALUES
  (3, 1),  -- Carlos → ruta de María (Alcorcón)
  (4, 2),  -- Lucía  → ruta de Carlos (Getafe)
  (5, 3),  -- Juan   → ruta de Lucía (Leganés)
  (2, 5),  -- María  → ruta de Juan (Vallecas)
  (3, 4);  -- Carlos → ruta de María B (Móstoles)

-- ─── PREDICCIONES ────────────────────────────────────────────
INSERT INTO predicciones
  (route_id, resultado, ml_model_id, created_at, updated_at)
VALUES
  (1, '{"congestion":"alta","tiempo_extra_min":12,"recomendacion":"Salir 10 min antes"}',  'model_v2', NOW(), NOW()),
  (2, '{"congestion":"baja","tiempo_extra_min":3,"recomendacion":"Tráfico fluido"}',        'model_v2', NOW(), NOW()),
  (3, '{"congestion":"media","tiempo_extra_min":7,"recomendacion":"Prever retardo leve"}',  'model_v2', NOW(), NOW()),
  (4, '{"congestion":"alta","tiempo_extra_min":18,"recomendacion":"Considerar Metro M30"}', 'model_v2', NOW(), NOW()),
  (5, '{"congestion":"baja","tiempo_extra_min":2,"recomendacion":"Sin incidencias"}',       'model_v2', NOW(), NOW());
