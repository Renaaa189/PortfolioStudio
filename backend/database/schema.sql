-- Portfolio Studio — esquema MySQL 8 / MariaDB 10.6+
-- Plataforma multiusuario: cada usuario tiene sus propios proyectos, habilidades y certificados.
-- Se ejecuta con `npm run db:setup` (idempotente).

CREATE TABLE IF NOT EXISTS users (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(30)  NOT NULL COMMENT 'Usado en la URL pública /p/:username',
  email         VARCHAR(190) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name    VARCHAR(80)  NOT NULL DEFAULT '',
  last_name     VARCHAR(80)  NOT NULL DEFAULT '',
  photo         VARCHAR(500) NULL,
  role          VARCHAR(120) NULL COMMENT 'Cargo',
  bio           TEXT         NULL,
  location      VARCHAR(120) NULL,
  github        VARCHAR(500) NULL,
  linkedin      VARCHAR(500) NULL,
  website       VARCHAR(500) NULL,
  is_published  TINYINT(1)   NOT NULL DEFAULT 0,
  design        TEXT         NULL COMMENT 'JSON con paleta, fondo, tipografía y plantillas',
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_users_email (email),
  UNIQUE KEY uq_users_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS projects (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id      INT UNSIGNED  NOT NULL,
  name         VARCHAR(120)  NOT NULL,
  description  TEXT          NOT NULL,
  category     VARCHAR(60)   NULL,
  image        VARCHAR(500)  NULL,
  github_url   VARCHAR(500)  NULL,
  demo_url     VARCHAR(500)  NULL,
  project_date DATE          NOT NULL,
  status       ENUM('en_progreso','finalizado','pausado') NOT NULL DEFAULT 'en_progreso',
  featured     TINYINT(1)    NOT NULL DEFAULT 0,
  created_at   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_projects_user_name (user_id, name),
  KEY idx_projects_status (status),
  KEY idx_projects_featured (featured),
  KEY idx_projects_date (project_date),
  KEY idx_projects_category (category),
  CONSTRAINT fk_projects_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tecnologías normalizadas (muchos a muchos) en lugar de texto separado por comas.
CREATE TABLE IF NOT EXISTS technologies (
  id   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(60) NOT NULL,
  UNIQUE KEY uq_technologies_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS project_technologies (
  project_id    INT UNSIGNED NOT NULL,
  technology_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (project_id, technology_id),
  KEY idx_pt_technology (technology_id),
  CONSTRAINT fk_pt_project    FOREIGN KEY (project_id)    REFERENCES projects (id)     ON DELETE CASCADE,
  CONSTRAINT fk_pt_technology FOREIGN KEY (technology_id) REFERENCES technologies (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS skills (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    INT UNSIGNED NOT NULL,
  name       VARCHAR(80)  NOT NULL,
  category   VARCHAR(60)  NOT NULL,
  level      ENUM('basico','intermedio','avanzado','experto') NOT NULL DEFAULT 'intermedio',
  icon       VARCHAR(500) NULL,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_skills_user_name (user_id, name),
  KEY idx_skills_category (category),
  CONSTRAINT fk_skills_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS certificates (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED NOT NULL,
  name        VARCHAR(150) NOT NULL,
  institution VARCHAR(150) NOT NULL,
  issue_date  DATE         NOT NULL,
  description TEXT         NULL,
  image       VARCHAR(500) NULL,
  pdf_file    VARCHAR(500) NULL,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_certificates_date (issue_date),
  CONSTRAINT fk_certificates_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
