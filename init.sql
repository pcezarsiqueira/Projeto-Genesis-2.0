-- ============================================================
-- SCRIPT DE MIGRATION INICIAL DA BASE DE DADOS (PROJETO GÊNESIS)
-- Executar apenas UMA VEZ contra uma base MySQL vazia
-- ============================================================

-- Configurar Encoding Padrão para Suporte a Emojis e Caracteres Especias
ALTER DATABASE CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 1. TABELA DE LEADS (Captura e Diagnóstico Inicial)
CREATE TABLE IF NOT EXISTS leads (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50) NOT NULL,
    instagram VARCHAR(100) NOT NULL,
    linkedin VARCHAR(255) DEFAULT NULL,
    interest_tag VARCHAR(100) DEFAULT NULL,
    privacy_consent TINYINT(1) NOT NULL DEFAULT 1,
    marketing_consent TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. TABELA DE PROGRESSO DOS ALUNOS
CREATE TABLE IF NOT EXISTS users_progress (
    id VARCHAR(100) NOT NULL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    active_days INT NOT NULL DEFAULT 1,
    completed_lessons JSON NOT NULL,
    is_pro TINYINT(1) NOT NULL DEFAULT 0,
    phase VARCHAR(50) NOT NULL DEFAULT 'ignicao',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. TABELA DE RESULTADOS DO DIAGNÓSTICO GÊNESIS
CREATE TABLE IF NOT EXISTS genesis_diagnostics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    genesis_index DECIMAL(5,2) NOT NULL,
    stage_name VARCHAR(100) NOT NULL,
    scores_json JSON NOT NULL,
    weakest_dimension VARCHAR(100) NOT NULL,
    strongest_dimension VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_diag_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. TABELA DE PAGAMENTOS E REGISTRO DE TRANSAÇÕES
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mp_payment_id VARCHAR(100) NOT NULL UNIQUE,
    user_email VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) NOT NULL,
    phase VARCHAR(50) NOT NULL DEFAULT 'tracao',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_payment_mp_id (mp_payment_id),
    INDEX idx_payment_email (user_email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. TABELA DE CONFIGURAÇÕES GERAIS DO SISTEMA
CREATE TABLE IF NOT EXISTS app_config (
    key_name VARCHAR(100) NOT NULL PRIMARY KEY,
    config_value JSON NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. TABELA DE USUÁRIOS ADMINISTRATIVOS
CREATE TABLE IF NOT EXISTS admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. TABELA DE MÍDIAS DOS DESAFIOS (VÍDEO E ÁUDIO)
CREATE TABLE IF NOT EXISTS challenge_media (
    day_id VARCHAR(50) NOT NULL PRIMARY KEY,
    video_url TEXT DEFAULT NULL,
    audio_url TEXT DEFAULT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- VALORES INICIAIS (SEED IDEMPOTENTE)
-- ============================================================

-- Inserir links padrões dos grupos do WhatsApp na tabela app_config
INSERT INTO app_config (key_name, config_value) VALUES (
    'whatsappLinks',
    JSON_OBJECT(
        'ignicao', 'https://chat.whatsapp.com/DL5ojA2RgnB3OpUuxT8Brz',
        'tracao', 'https://chat.whatsapp.com/EYlX9rIctzbFDXB6gsvrRO',
        'expansao', 'https://chat.whatsapp.com/IW8X2LfJuEd9sE35oj0t3o'
    )
) ON DUPLICATE KEY UPDATE config_value = VALUES(config_value);

-- NOTA DE SEGURANÇA PARA A CONTA ADMIN:
-- O usuário Admin padrão (ex: admin@seu-dominio.com) será provisionado/atualizado
-- automaticamente na inicialização da aplicação usando a variável ADMIN_PASSWORD do arquivo .env.
