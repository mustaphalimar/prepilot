-- name: CreateStudyPlan :one
INSERT INTO study_plans (user_id, title, subject, description, exam_date, start_date, end_date)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING *;

-- name: GetStudyPlansByUserId :many
SELECT * FROM study_plans
WHERE user_id = $1
ORDER BY created_at DESC;

-- name: GetStudyPlanByID :one
SELECT * FROM study_plans
WHERE id = $1;

-- name: UpdateStudyPlan :one
UPDATE study_plans
SET title = $2,
    subject = $3,
    description = $4,
    exam_date = $5,
    start_date = $6,
    end_date = $7,
    updated_at = now()
WHERE id = $1
RETURNING *;

-- name: DeleteStudyPlan :exec
DELETE FROM study_plans
WHERE id = $1;
