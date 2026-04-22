-- VoyContigo schema local (MySQL/MariaDB)

USE voycontigo_local;

CREATE TABLE users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  puntos INT NOT NULL DEFAULT 0,
  last_login_at TIMESTAMP NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  PRIMARY KEY (id),
  UNIQUE KEY users_email_unique (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE rutas (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  origin_text VARCHAR(255) NOT NULL,
  origin_lat DECIMAL(10,7) NOT NULL,
  origin_lng DECIMAL(10,7) NOT NULL,
  dest_text VARCHAR(255) NOT NULL,
  dest_lat DECIMAL(10,7) NOT NULL,
  dest_lng DECIMAL(10,7) NOT NULL,
  arrival_time TIME NULL,
  duration_min INT UNSIGNED NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  PRIMARY KEY (id),
  KEY rutas_user_id_foreign (user_id),
  CONSTRAINT rutas_user_id_foreign
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE viaje_compartidos (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  driver_user_id BIGINT UNSIGNED NOT NULL,
  route_id BIGINT UNSIGNED NOT NULL,
  origin VARCHAR(255) NOT NULL,
  destiny VARCHAR(255) NULL,
  trip_datetime DATETIME NOT NULL,
  seats_total INT UNSIGNED NOT NULL,
  seats_available INT UNSIGNED NOT NULL,
  status VARCHAR(255) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  PRIMARY KEY (id),
  KEY viaje_compartidos_driver_user_id_foreign (driver_user_id),
  KEY viaje_compartidos_route_id_foreign (route_id),
  CONSTRAINT viaje_compartidos_driver_user_id_foreign
    FOREIGN KEY (driver_user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT viaje_compartidos_route_id_foreign
    FOREIGN KEY (route_id) REFERENCES rutas(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE reservas (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  trip_id BIGINT UNSIGNED NOT NULL,
  seats INT UNSIGNED NOT NULL,
  status VARCHAR(255) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  PRIMARY KEY (id),
  KEY reservas_user_id_foreign (user_id),
  KEY reservas_trip_id_foreign (trip_id),
  CONSTRAINT reservas_user_id_foreign
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT reservas_trip_id_foreign
    FOREIGN KEY (trip_id) REFERENCES viaje_compartidos(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE alertas (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  route_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  for_datetime DATETIME NOT NULL,
  status VARCHAR(255) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  PRIMARY KEY (id),
  KEY alertas_route_id_foreign (route_id),
  KEY alertas_user_id_foreign (user_id),
  CONSTRAINT alertas_route_id_foreign
    FOREIGN KEY (route_id) REFERENCES rutas(id)
    ON DELETE CASCADE,
  CONSTRAINT alertas_user_id_foreign
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE favoritos (
  user_id BIGINT UNSIGNED NOT NULL,
  route_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (user_id, route_id),
  KEY favoritos_route_id_foreign (route_id),
  CONSTRAINT favoritos_user_id_foreign
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT favoritos_route_id_foreign
    FOREIGN KEY (route_id) REFERENCES rutas(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE predicciones (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  route_id BIGINT UNSIGNED NOT NULL,
  resultado TEXT NOT NULL,
  ml_model_id VARCHAR(255) NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  PRIMARY KEY (id),
  KEY predicciones_route_id_foreign (route_id),
  CONSTRAINT predicciones_route_id_foreign
    FOREIGN KEY (route_id) REFERENCES rutas(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
