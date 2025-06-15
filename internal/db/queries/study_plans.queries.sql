-- STUDY PLANS QUERIES

-- name: CreateStudyPlan :one
INSERT INTO study_plans (user_id, title, exam_id)
VALUES ($1, $2, $3)
RETURNING *;

-- name: GetStudyPlansByUserId :many
SELECT sp.*, e.title as exam_title, e.date as exam_date, s.name as subject_name
FROM study_plans sp
JOIN exams e ON sp.exam_id = e.id
JOIN subjects s ON e.subject_id = s.id
WHERE sp.user_id = $1
ORDER BY sp.created_at DESC;

-- name: GetStudyPlanByID :one
SELECT sp.*, e.title as exam_title, e.date as exam_date, s.name as subject_name
FROM study_plans sp
JOIN exams e ON sp.exam_id = e.id
JOIN subjects s ON e.subject_id = s.id
WHERE sp.id = $1;

-- name: UpdateStudyPlan :one
UPDATE study_plans
SET title = $2,
    exam_id = $3,
    updated_at = now()
WHERE id = $1
RETURNING *;

-- name: DeleteStudyPlan :exec
DELETE FROM study_plans
WHERE id = $1;

-- name: GetStudyPlansByExamId :many
SELECT * FROM study_plans
WHERE exam_id = $1
ORDER BY created_at DESC;


-- name: GetSubjectWithStudyPlans :one
SELECT s.*,
       COUNT(sp.id) as study_plans_count,
       COUNT(e.id) as exams_count
FROM subjects s
LEFT JOIN exams e ON s.id = e.subject_id
LEFT JOIN study_plans sp ON e.id = sp.exam_id
WHERE s.id = $1
GROUP BY s.id, s.user_id, s.name, s.created_at, s.updated_at;

-- COMBINED QUERIES FOR DASHBOARD/OVERVIEW

-- name: GetUserStudyOverview :many
SELECT
    s.id as subject_id,
    s.name as subject_name,
    COUNT(DISTINCT e.id) as total_exams,
    COUNT(DISTINCT sp.id) as total_study_plans,
    MIN(e.date) as next_exam_date
FROM subjects s
LEFT JOIN exams e ON s.id = e.subject_id
LEFT JOIN study_plans sp ON e.id = sp.exam_id
WHERE s.user_id = $1
GROUP BY s.id, s.name
ORDER BY next_exam_date ASC NULLS LAST;
