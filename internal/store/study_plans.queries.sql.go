// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.29.0
// source: study_plans.queries.sql

package store

import (
	"context"
	"database/sql"
	"time"

	"github.com/google/uuid"
)

const createStudyPlan = `-- name: CreateStudyPlan :one
INSERT INTO study_plans (user_id, title, subject, description, exam_date, start_date, end_date)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING id, user_id, title, subject, description, exam_date, start_date, end_date, created_at, updated_at
`

type CreateStudyPlanParams struct {
	UserID      string         `json:"user_id"`
	Title       string         `json:"title"`
	Subject     string         `json:"subject"`
	Description string `json:"description"`
	ExamDate    time.Time      `json:"exam_date"`
	StartDate   time.Time      `json:"start_date"`
	EndDate     time.Time      `json:"end_date"`
}

func (q *Queries) CreateStudyPlan(ctx context.Context, arg CreateStudyPlanParams) (StudyPlan, error) {
	row := q.db.QueryRowContext(ctx, createStudyPlan,
		arg.UserID,
		arg.Title,
		arg.Subject,
		arg.Description,
		arg.ExamDate,
		arg.StartDate,
		arg.EndDate,
	)
	var i StudyPlan
	err := row.Scan(
		&i.ID,
		&i.UserID,
		&i.Title,
		&i.Subject,
		&i.Description,
		&i.ExamDate,
		&i.StartDate,
		&i.EndDate,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const deleteStudyPlan = `-- name: DeleteStudyPlan :exec
DELETE FROM study_plans
WHERE id = $1
`

func (q *Queries) DeleteStudyPlan(ctx context.Context, id uuid.UUID) error {
	_, err := q.db.ExecContext(ctx, deleteStudyPlan, id)
	return err
}

const getStudyPlanByID = `-- name: GetStudyPlanByID :one
SELECT id, user_id, title, subject, description, exam_date, start_date, end_date, created_at, updated_at FROM study_plans
WHERE id = $1
`

func (q *Queries) GetStudyPlanByID(ctx context.Context, id uuid.UUID) (StudyPlan, error) {
	row := q.db.QueryRowContext(ctx, getStudyPlanByID, id)
	var i StudyPlan
	err := row.Scan(
		&i.ID,
		&i.UserID,
		&i.Title,
		&i.Subject,
		&i.Description,
		&i.ExamDate,
		&i.StartDate,
		&i.EndDate,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const getStudyPlansByUserId = `-- name: GetStudyPlansByUserId :many
SELECT id, user_id, title, subject, description, exam_date, start_date, end_date, created_at, updated_at FROM study_plans
WHERE user_id = $1
ORDER BY created_at DESC
`

func (q *Queries) GetStudyPlansByUserId(ctx context.Context, userID string) ([]StudyPlan, error) {
	rows, err := q.db.QueryContext(ctx, getStudyPlansByUserId, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []StudyPlan
	for rows.Next() {
		var i StudyPlan
		if err := rows.Scan(
			&i.ID,
			&i.UserID,
			&i.Title,
			&i.Subject,
			&i.Description,
			&i.ExamDate,
			&i.StartDate,
			&i.EndDate,
			&i.CreatedAt,
			&i.UpdatedAt,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const updateStudyPlan = `-- name: UpdateStudyPlan :one
UPDATE study_plans
SET title = $2,
    subject = $3,
    description = $4,
    exam_date = $5,
    start_date = $6,
    end_date = $7,
    updated_at = now()
WHERE id = $1
RETURNING id, user_id, title, subject, description, exam_date, start_date, end_date, created_at, updated_at
`

type UpdateStudyPlanParams struct {
	ID          uuid.UUID      `json:"id"`
	Title       string         `json:"title"`
	Subject     string         `json:"subject"`
	Description sql.NullString `json:"description"`
	ExamDate    time.Time      `json:"exam_date"`
	StartDate   time.Time      `json:"start_date"`
	EndDate     time.Time      `json:"end_date"`
}

func (q *Queries) UpdateStudyPlan(ctx context.Context, arg UpdateStudyPlanParams) (StudyPlan, error) {
	row := q.db.QueryRowContext(ctx, updateStudyPlan,
		arg.ID,
		arg.Title,
		arg.Subject,
		arg.Description,
		arg.ExamDate,
		arg.StartDate,
		arg.EndDate,
	)
	var i StudyPlan
	err := row.Scan(
		&i.ID,
		&i.UserID,
		&i.Title,
		&i.Subject,
		&i.Description,
		&i.ExamDate,
		&i.StartDate,
		&i.EndDate,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}
