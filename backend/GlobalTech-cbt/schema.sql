CREATE DATABASE IF NOT EXISTS globaltech_cbt;
USE globaltech_cbt;

CREATE TABLE IF NOT EXISTS admins (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    username    VARCHAR(100) UNIQUE NOT NULL,
    password    VARCHAR(255) NOT NULL,
    full_name   VARCHAR(200) NOT NULL,
    email       VARCHAR(200),
    role        ENUM('super_admin', 'admin') DEFAULT 'admin',
    status      ENUM('active', 'inactive') DEFAULT 'active',
    created_at  DATETIME DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS students (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    exam_id     VARCHAR(50) UNIQUE NOT NULL,
    password    VARCHAR(255) NOT NULL,
    full_name   VARCHAR(200) NOT NULL,
    email       VARCHAR(200),
    status      ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    created_at  DATETIME DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subjects (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(100) UNIQUE NOT NULL,
    slug            VARCHAR(100) UNIQUE NOT NULL,
    icon            VARCHAR(10),
    total_questions INT NOT NULL,
    duration_mins   INT NOT NULL,
    is_compulsory   TINYINT(1) DEFAULT 0,
    is_active       TINYINT(1) DEFAULT 1,
    created_at      DATETIME DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS questions (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    subject_id  INT NOT NULL,
    text        TEXT NOT NULL,
    image_url   TEXT,
    created_at  DATETIME DEFAULT NOW(),
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS options (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    question_id INT NOT NULL,
    letter      CHAR(1) NOT NULL,
    text        TEXT NOT NULL,
    is_correct  TINYINT(1) DEFAULT 0,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS exam_sessions (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    student_id      INT NOT NULL,
    token           VARCHAR(100) UNIQUE NOT NULL,
    started_at      DATETIME DEFAULT NOW(),
    submitted_at    DATETIME,
    is_submitted    TINYINT(1) DEFAULT 0,
    total_score     INT DEFAULT 0,
    total_possible  INT DEFAULT 0,
    FOREIGN KEY (student_id) REFERENCES students(id)
);

CREATE TABLE IF NOT EXISTS session_subjects (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    session_id  INT NOT NULL,
    subject_id  INT NOT NULL,
    score       INT DEFAULT 0,
    UNIQUE KEY unique_session_subject (session_id, subject_id),
    FOREIGN KEY (session_id) REFERENCES exam_sessions(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id)
);

CREATE TABLE IF NOT EXISTS student_answers (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    session_id       INT NOT NULL,
    question_id      INT NOT NULL,
    chosen_option_id INT,
    is_correct       TINYINT(1) DEFAULT 0,
    answered_at      DATETIME DEFAULT NOW(),
    UNIQUE KEY unique_session_question (session_id, question_id),
    FOREIGN KEY (session_id) REFERENCES exam_sessions(id),
    FOREIGN KEY (question_id) REFERENCES questions(id),
    FOREIGN KEY (chosen_option_id) REFERENCES options(id)
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    admin_id    INT NOT NULL,
    token       VARCHAR(100) UNIQUE NOT NULL,
    expires_at  DATETIME NOT NULL,
    used        TINYINT(1) DEFAULT 0,
    created_at  DATETIME DEFAULT NOW(),
    FOREIGN KEY (admin_id) REFERENCES admins(id)
);

-- Admin sessions table
CREATE TABLE IF NOT EXISTS admin_sessions (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    admin_id    INT NOT NULL,
    action      ENUM('login', 'logout', 'failed_login') NOT NULL,
    ip_address  VARCHAR(50),
    device      VARCHAR(200),
    created_at  DATETIME DEFAULT NOW(),
    FOREIGN KEY (admin_id) REFERENCES admins(id)
);


-- INSERT INTO admins (username, password, full_name) 
-- VALUES ('admin', '$2b$12$H.c2apv51qUXtMm0prGnousvXsJCvw4JT7/IUAhzqMyXcQvg9FP1e', 'System Administrator')
-- ON DUPLICATE KEY UPDATE username = username;

INSERT INTO admins (username, password, full_name, role)
VALUES (
    'admin',
    '$2b$12$H.c2apv51qUXtMm0prGnousvXsJCvw4JT7/IUAhzqMyXcQvg9FP1e',
    'System Administrator',
    'super_admin'
)
ON DUPLICATE KEY UPDATE role = 'super_admin';


INSERT INTO subjects (name, slug, icon, total_questions, duration_mins, is_compulsory, is_active) VALUES
('English Language', 'english_language', '📖', 60, 120, 1, 1),
('Mathematics', 'mathematics', '📐', 40, 30, 0, 1),
('Biology', 'biology', '🔬', 40, 30, 0, 1),
('Physics', 'physics', '⚛️', 40, 30, 0, 1),
('Chemistry', 'chemistry', '🧪', 40, 30, 0, 1),
('Economics', 'economics', '📈', 40, 30, 0, 1),
('Literature', 'literature', '📚', 40, 30, 0, 1),
('Geography', 'geography', '🌍', 40, 30, 0, 1)
ON DUPLICATE KEY UPDATE name = name;