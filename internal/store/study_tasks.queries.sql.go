// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.29.0
// source: study_tasks.queries.sql

package store

import (
	"context"
	"database/sql"
	"time"

	"github.com/google/uuid"
)

const createTask = `-- name: CreateTask :one
INSERT INTO study_tasks (plan_id, title, due_date, is_completed, priority, notes)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING id, plan_id, title, due_date, is_completed, priority, notes, created_at, updated_at
`

type CreateTaskParams struct {
	PlanID      uuid.NullUUID  `json:"plan_id"`
	Title       string         `json:"title"`
	DueDate     time.Time      `json:"due_date"`
	IsCompleted sql.NullBool   `json:"is_completed"`
	Priority    sql.NullInt32  `json:"priority"`
	Notes       sql.NullString `json:"notes"`
}

func (q *Queries) CreateTask(ctx context.Context, arg CreateTaskParams) (StudyTask, error) {
	row := q.db.QueryRowContext(ctx, createTask,
		arg.PlanID,
		arg.Title,
		arg.DueDate,
		arg.IsCompleted,
		arg.Priority,
		arg.Notes,
	)
	var i StudyTask
	err := row.Scan(
		&i.ID,
		&i.PlanID,
		&i.Title,
		&i.DueDate,
		&i.IsCompleted,
		&i.Priority,
		&i.Notes,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const deleteTask = `-- name: DeleteTask :exec
DELETE FROM study_tasks
WHERE id = $1
`

func (q *Queries) DeleteTask(ctx context.Context, id uuid.UUID) error {
	_, err := q.db.ExecContext(ctx, deleteTask, id)
	return err
}

const getOverdueTasks = `-- name: GetOverdueTasks :many
SELECT id, plan_id, title, due_date, is_completed, priority, notes, created_at, updated_at FROM study_tasks
WHERE plan_id = $1 AND due_date < CURRENT_DATE AND is_completed = FALSE
ORDER BY due_date ASC
`

func (q *Queries) GetOverdueTasks(ctx context.Context, planID uuid.NullUUID) ([]StudyTask, error) {
	rows, err := q.db.QueryContext(ctx, getOverdueTasks, planID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []StudyTask
	for rows.Next() {
		var i StudyTask
		if err := rows.Scan(
			&i.ID,
			&i.PlanID,
			&i.Title,
			&i.DueDate,
			&i.IsCompleted,
			&i.Priority,
			&i.Notes,
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

const getTaskByID = `-- name: GetTaskByID :one
SELECT id, plan_id, title, due_date, is_completed, priority, notes, created_at, updated_at FROM study_tasks
WHERE id = $1
`

func (q *Queries) GetTaskByID(ctx context.Context, id uuid.UUID) (StudyTask, error) {
	row := q.db.QueryRowContext(ctx, getTaskByID, id)
	var i StudyTask
	err := row.Scan(
		&i.ID,
		&i.PlanID,
		&i.Title,
		&i.DueDate,
		&i.IsCompleted,
		&i.Priority,
		&i.Notes,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const getTasksByPlan = `-- name: GetTasksByPlan :many
SELECT id, plan_id, title, due_date, is_completed, priority, notes, created_at, updated_at FROM study_tasks
WHERE plan_id = $1
ORDER BY due_date ASC
`

func (q *Queries) GetTasksByPlan(ctx context.Context, planID uuid.NullUUID) ([]StudyTask, error) {
	rows, err := q.db.QueryContext(ctx, getTasksByPlan, planID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []StudyTask
	for rows.Next() {
		var i StudyTask
		if err := rows.Scan(
			&i.ID,
			&i.PlanID,
			&i.Title,
			&i.DueDate,
			&i.IsCompleted,
			&i.Priority,
			&i.Notes,
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

const getTasksByPriority = `-- name: GetTasksByPriority :many
SELECT id, plan_id, title, due_date, is_completed, priority, notes, created_at, updated_at FROM study_tasks
WHERE plan_id = $1 AND priority = $2
ORDER BY due_date ASC
`

type GetTasksByPriorityParams struct {
	PlanID   uuid.NullUUID `json:"plan_id"`
	Priority sql.NullInt32 `json:"priority"`
}

func (q *Queries) GetTasksByPriority(ctx context.Context, arg GetTasksByPriorityParams) ([]StudyTask, error) {
	rows, err := q.db.QueryContext(ctx, getTasksByPriority, arg.PlanID, arg.Priority)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []StudyTask
	for rows.Next() {
		var i StudyTask
		if err := rows.Scan(
			&i.ID,
			&i.PlanID,
			&i.Title,
			&i.DueDate,
			&i.IsCompleted,
			&i.Priority,
			&i.Notes,
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

const getTasksByStatus = `-- name: GetTasksByStatus :many
SELECT id, plan_id, title, due_date, is_completed, priority, notes, created_at, updated_at FROM study_tasks
WHERE plan_id = $1 AND is_completed = $2
ORDER BY due_date ASC
`

type GetTasksByStatusParams struct {
	PlanID      uuid.NullUUID `json:"plan_id"`
	IsCompleted sql.NullBool  `json:"is_completed"`
}

func (q *Queries) GetTasksByStatus(ctx context.Context, arg GetTasksByStatusParams) ([]StudyTask, error) {
	rows, err := q.db.QueryContext(ctx, getTasksByStatus, arg.PlanID, arg.IsCompleted)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []StudyTask
	for rows.Next() {
		var i StudyTask
		if err := rows.Scan(
			&i.ID,
			&i.PlanID,
			&i.Title,
			&i.DueDate,
			&i.IsCompleted,
			&i.Priority,
			&i.Notes,
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

const getTasksByUser = `-- name: GetTasksByUser :many
SELECT st.id, st.plan_id, st.title, st.due_date, st.is_completed, st.priority, st.notes, st.created_at, st.updated_at FROM study_tasks st
JOIN study_plans sp ON st.plan_id = sp.id
WHERE sp.user_id = $1
ORDER BY st.due_date ASC
`

func (q *Queries) GetTasksByUser(ctx context.Context, userID string) ([]StudyTask, error) {
	rows, err := q.db.QueryContext(ctx, getTasksByUser, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []StudyTask
	for rows.Next() {
		var i StudyTask
		if err := rows.Scan(
			&i.ID,
			&i.PlanID,
			&i.Title,
			&i.DueDate,
			&i.IsCompleted,
			&i.Priority,
			&i.Notes,
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

const updateTask = `-- name: UpdateTask :one
UPDATE study_tasks
SET title = $2,
    due_date = $3,
    is_completed = $4,
    priority = $5,
    notes = $6,
    updated_at = now()
WHERE id = $1
RETURNING id, plan_id, title, due_date, is_completed, priority, notes, created_at, updated_at
`

type UpdateTaskParams struct {
	ID          uuid.UUID      `json:"id"`
	Title       string         `json:"title"`
	DueDate     time.Time      `json:"due_date"`
	IsCompleted sql.NullBool   `json:"is_completed"`
	Priority    sql.NullInt32  `json:"priority"`
	Notes       sql.NullString `json:"notes"`
}

func (q *Queries) UpdateTask(ctx context.Context, arg UpdateTaskParams) (StudyTask, error) {
	row := q.db.QueryRowContext(ctx, updateTask,
		arg.ID,
		arg.Title,
		arg.DueDate,
		arg.IsCompleted,
		arg.Priority,
		arg.Notes,
	)
	var i StudyTask
	err := row.Scan(
		&i.ID,
		&i.PlanID,
		&i.Title,
		&i.DueDate,
		&i.IsCompleted,
		&i.Priority,
		&i.Notes,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const updateTaskStatus = `-- name: UpdateTaskStatus :exec
UPDATE study_tasks
SET is_completed = $2, updated_at = now()
WHERE id = $1
`

type UpdateTaskStatusParams struct {
	ID          uuid.UUID    `json:"id"`
	IsCompleted sql.NullBool `json:"is_completed"`
}

func (q *Queries) UpdateTaskStatus(ctx context.Context, arg UpdateTaskStatusParams) error {
	_, err := q.db.ExecContext(ctx, updateTaskStatus, arg.ID, arg.IsCompleted)
	return err
}
