
-- name: CreateSubject :one
INSERT INTO subjects (user_id, name)
VALUES ($1, $2)
RETURNING *;

-- name: GetSubjectsByUserId :many
SELECT * FROM subjects
WHERE user_id = $1
ORDER BY name ASC;

-- name: GetSubjectByID :one
SELECT * FROM subjects
WHERE id = $1;

-- name: GetSubjectByUserAndName :one
SELECT * FROM subjects
WHERE user_id = $1 AND name = $2;

-- name: UpdateSubject :one
UPDATE subjects
SET name = $2,
    updated_at = now()
WHERE id = $1
RETURNING *;

-- name: DeleteSubject :exec
DELETE FROM subjects
WHERE id = $1;

-- name: GetSubjectWithCounts :one
SELECT
    s.*,
    COUNT(DISTINCT e.id) as exams_count,
    COUNT(DISTINCT sp.id) as study_plans_count
FROM subjects s
LEFT JOIN exams e ON s.id = e.subject_id
LEFT JOIN study_plans sp ON e.id = sp.exam_id
WHERE s.id = $1
GROUP BY s.id, s.user_id, s.name, s.created_at, s.updated_at;

-- name: GetSubjectsWithCounts :many
SELECT
    s.*,
    COUNT(DISTINCT e.id) as exams_count,
    COUNT(DISTINCT sp.id) as study_plans_count
FROM subjects s
LEFT JOIN exams e ON s.id = e.subject_id
LEFT JOIN study_plans sp ON e.id = sp.exam_id
WHERE s.user_id = $1
GROUP BY s.id, s.user_id, s.name, s.created_at, s.updated_at
ORDER BY s.name ASC;
