-- ============================================================
-- Code Plagiarism Detection System - Database Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS plagiarism_db;
USE plagiarism_db;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Analysis Table
CREATE TABLE IF NOT EXISTS analysis (
    analysis_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    file_names JSON NOT NULL,           -- Array of uploaded file names
    similarity_score FLOAT NOT NULL,    -- Overall similarity score (0-100)
    algorithm VARCHAR(50) DEFAULT 'cosine',
    language VARCHAR(50),               -- Programming language
    result_json LONGTEXT,               -- Full JSON result with matches
    report_path VARCHAR(255),           -- Path to generated PDF report
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- File Submissions Table (individual files per analysis)
CREATE TABLE IF NOT EXISTS file_submissions (
    file_id INT AUTO_INCREMENT PRIMARY KEY,
    analysis_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255),
    file_size INT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (analysis_id) REFERENCES analysis(analysis_id) ON DELETE CASCADE
);

-- Indexes for faster lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_analysis_user_id ON analysis(user_id);
CREATE INDEX idx_analysis_created_at ON analysis(created_at);
