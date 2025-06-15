
-- name: CreateExam :one
INSERT INTO exams (user_id, title, subject_id, date)
VALUES ($1, $2, $3, $4)
RETURNING *;

-- name: GetExamsByUserId :many
SELECT
    e.*,
    s.name as subject_name
FROM exams e
JOIN subjects s ON e.subject_id = s.id
WHERE e.user_id = $1
ORDER BY e.date ASC;

-- name: GetExamByID :one
SELECT
    e.*,
    s.name as subject_name
FROM exams e
JOIN subjects s ON e.subject_id = s.id
WHERE e.id = $1;

-- name: GetExamsBySubjectId :many
SELECT
    e.*,
    s.name as subject_name
FROM exams e
JOIN subjects s ON e.subject_id = s.id
WHERE e.subject_id = $1
ORDER BY e.date ASC;

-- name: GetExamsByDateRange :many
SELECT
    e.*,
    s.name as subject_name
FROM exams e
JOIN subjects s ON e.subject_id = s.id
WHERE e.user_id = $1
  AND e.date >= $2
  AND e.date <= $3
ORDER BY e.date ASC;

-- name: GetUpcomingExams :many
SELECT
    e.*,
    s.name as subject_name
FROM exams e
JOIN subjects s ON e.subject_id = s.id
WHERE e.user_id = $1 AND e.date >= CURRENT_DATE
ORDER BY e.date ASC
LIMIT $2;

-- name: GetPastExams :many
SELECT
    e.*,
    s.name as subject_name
FROM exams e
JOIN subjects s ON e.subject_id = s.id
WHERE e.user_id = $1 AND e.date < CURRENT_DATE
ORDER BY e.date DESC;

-- name: UpdateExam :one
UPDATE exams
SET title = $2,
    subject_id = $3,
    date = $4,
    updated_at = now()
WHERE id = $1
RETURNING *;

-- name: DeleteExam :exec
DELETE FROM exams
WHERE id = $1;

-- name: GetExamWithStudyPlansCount :one
SELECT
    e.*,
    s.name as subject_name,
    COUNT(sp.id) as study_plans_count
FROM exams e
JOIN subjects s ON e.subject_id = s.id
LEFT JOIN study_plans sp ON e.id = sp.exam_id
WHERE e.id = $1
GROUP BY e.id, e.user_id, e.title, e.subject_id, e.date, e.created_at, e.updated_at, s.name;

-- name: GetExamsWithStudyPlansCount :many
SELECT
    e.*,
    s.name as subject_name,
    COUNT(sp.id) as study_plans_count
FROM exams e
JOIN subjects s ON e.subject_id = s.id
LEFT JOIN study_plans sp ON e.id = sp.exam_id
WHERE e.user_id = $1
GROUP BY e.id, e.user_id, e.title, e.subject_id, e.date, e.created_at, e.updated_at, s.name
ORDER BY e.date ASC;

-- name: GetExamsByUserAndSubject :many
SELECT
    e.*,
    s.name as subject_name
FROM exams e
JOIN subjects s ON e.subject_id = s.id
WHERE e.user_id = $1 AND e.subject_id = $2
ORDER BY e.date ASC;

-- name: CountExamsBySubject :one
SELECT COUNT(*) FROM exams
WHERE subject_id = $1;

-- name: CountExamsByUser :one
SELECT COUNT(*) FROM exams
WHERE user_id = $1;

-- name: GetNextExamBySubject :one
SELECT
    e.*,
    s.name as subject_name
FROM exams e
JOIN subjects s ON e.subject_id = s.id
WHERE e.subject_id = $1 AND e.date >= CURRENT_DATE
ORDER BY e.date ASC
LIMIT 1;

-- name: GetSubjectStats :one
SELECT
    s.id,
    s.name,
    COUNT(DISTINCT e.id) as total_exams,
    COUNT(DISTINCT CASE WHEN e.date >= CURRENT_DATE THEN e.id END) as upcoming_exams,
    COUNT(DISTINCT CASE WHEN e.date < CURRENT_DATE THEN e.id END) as past_exams,
    COUNT(DISTINCT sp.id) as total_study_plans,
    MIN(CASE WHEN e.date >= CURRENT_DATE THEN e.date END) as next_exam_date
FROM subjects s
LEFT JOIN exams e ON s.id = e.subject_id
LEFT JOIN study_plans sp ON e.id = sp.exam_id
WHERE s.id = $1
GROUP BY s.id, s.name;
