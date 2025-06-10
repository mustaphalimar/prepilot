-- name: CreateTask :one
INSERT INTO study_tasks (plan_id, title, due_date, is_completed, priority, notes)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING *;

-- name: GetTaskByID :one
SELECT * FROM study_tasks
WHERE id = $1;

-- name: GetTasksByPlan :many
SELECT * FROM study_tasks
WHERE plan_id = $1
ORDER BY due_date ASC;

-- name: UpdateTaskStatus :exec
UPDATE study_tasks
SET is_completed = $2, updated_at = now()
WHERE id = $1;

-- name: UpdateTask :one
UPDATE study_tasks
SET title = $2,
    due_date = $3,
    is_completed = $4,
    priority = $5,
    notes = $6,
    updated_at = now()
WHERE id = $1
RETURNING *;

-- name: DeleteTask :exec
DELETE FROM study_tasks
WHERE id = $1;

-- name: GetOverdueTasks :many
SELECT * FROM study_tasks
WHERE plan_id = $1 AND due_date < CURRENT_DATE AND is_completed = FALSE
ORDER BY due_date ASC;

-- name: GetTasksByStatus :many
SELECT * FROM study_tasks
WHERE plan_id = $1 AND is_completed = $2
ORDER BY due_date ASC;

-- name: GetTasksByPriority :many
SELECT * FROM study_tasks
WHERE plan_id = $1 AND priority = $2
ORDER BY due_date ASC;

-- name: GetTasksByUser :many
SELECT st.* FROM study_tasks st
JOIN study_plans sp ON st.plan_id = sp.id
WHERE sp.user_id = $1
ORDER BY st.due_date ASC;
