-- Step 7: Add constraints to study_plans
ALTER TABLE study_plans
ALTER COLUMN exam_id
SET
    NOT NULL;

-- Add foreign key constraints
ALTER TABLE study_plans ADD CONSTRAINT fk_study_plans_exam FOREIGN KEY (exam_id) REFERENCES exams (id) ON DELETE CASCADE;

-- Option 1: Remove subject_id entirely (RECOMMENDED)
-- Since exam already has subject_id, this column is redundant
ALTER TABLE study_plans
DROP COLUMN subject_id
