-- Migration: Add period configuration to project_detail table
-- Date: 2026-06-14
-- Author: Syikha Akmal
-- Description: Add PERIOD_INTERVAL and PERIOD_TYPE columns for auto-generating project periods

ALTER TABLE project_detail
ADD COLUMN PERIOD_INTERVAL INT DEFAULT NULL COMMENT 'Days interval between periods (e.g., 7 for weekly, 30 for monthly)',
ADD COLUMN PERIOD_TYPE ENUM('weekly', 'monthly', 'custom') DEFAULT NULL COMMENT 'Type of period generation';

-- Add index for faster filtering by period type
CREATE INDEX idx_period_type ON project_detail(PERIOD_TYPE);
