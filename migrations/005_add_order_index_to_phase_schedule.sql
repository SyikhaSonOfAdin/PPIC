-- Migration: Add ORDER_INDEX to project_phase_schedule
-- Date: 2026-06-23
-- Author: Syikha Akmal

ALTER TABLE project_phase_schedule 
ADD COLUMN order_index INT DEFAULT 0 AFTER actual_end_week;

CREATE INDEX idx_phase_order ON project_phase_schedule(project_id, order_index);

SET @row_num := 0;
UPDATE project_phase_schedule 
SET order_index = (@row_num := @row_num + 10) 
ORDER BY id;
