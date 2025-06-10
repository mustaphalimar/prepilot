-- These will significantly improve query performance
CREATE INDEX idx_study_plans_user_id ON study_plans (user_id);

CREATE INDEX idx_study_tasks_plan_id ON study_tasks (plan_id);

CREATE INDEX idx_study_tasks_due_date ON study_tasks (due_date);

CREATE INDEX idx_study_tasks_plan_id_due_date ON study_tasks (plan_id, due_date);
