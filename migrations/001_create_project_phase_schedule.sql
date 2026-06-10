-- Migration: Create project_phase_schedule table
-- Date: 2026-05-18
-- Author: Syikha Akmal

CREATE TABLE IF NOT EXISTS project_phase_schedule (
  id CHAR(36) PRIMARY KEY,
  project_id CHAR(36) NOT NULL,
  department_id VARCHAR(255) NOT NULL,
  phase VARCHAR(50) NOT NULL,
  plan_start_week VARCHAR(20) NOT NULL,
  plan_end_week VARCHAR(20) NOT NULL,
  actual_start_week VARCHAR(20) NULL,
  actual_end_week VARCHAR(20) NULL,
  input_by CHAR(36) NOT NULL,
  input_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_date DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY uk_project_dept_phase (project_id, department_id, phase),
  INDEX idx_project_id (project_id),
  INDEX idx_department_id (department_id),
  INDEX idx_input_by (input_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
