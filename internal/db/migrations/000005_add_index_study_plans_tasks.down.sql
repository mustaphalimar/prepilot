-- Drop the indexes created in the UP migration
DROP INDEX IF EXISTS idx_study_plans_user_id;

DROP INDEX IF EXISTS idx_study_tasks_plan_id;

DROP INDEX IF EXISTS idx_study_tasks_due_date;

DROP INDEX IF EXISTS idx_study_tasks_plan_id_due_date;
