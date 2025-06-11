package app

import (
	"database/sql"
	"net/http"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/mustaphalimar/prepilot/internal/store"
)

// CreateStudyTaskRequest represents the request body for creating a study task
type CreateStudyTaskRequest struct {
	PlanID      *uuid.UUID `json:"plan_id"`
	Title       string     `json:"title" validate:"required"`
	DueDate     time.Time  `json:"due_date" validate:"required"`
	IsCompleted *bool      `json:"is_completed"`
	Priority    *int32     `json:"priority"`
	Notes       *string    `json:"notes"`
}

// UpdateStudyTaskRequest represents the request body for updating a study task
type UpdateStudyTaskRequest struct {
	Title       string    `json:"title" validate:"required"`
	DueDate     time.Time `json:"due_date" validate:"required"`
	IsCompleted bool      `json:"is_completed"`
	Priority    *int32    `json:"priority"`
	Notes       *string   `json:"notes"`
}

// StudyTaskResponse represents the response format for study tasks
type StudyTaskResponse struct {
	ID          uuid.UUID  `json:"id"`
	PlanID      *uuid.UUID `json:"plan_id"`
	Title       string     `json:"title"`
	DueDate     time.Time  `json:"due_date"`
	IsCompleted bool       `json:"is_completed"`
	Priority    *int32     `json:"priority"`
	Notes       *string    `json:"notes"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}

// convertStudyTaskToResponse converts a store.StudyTask to StudyTaskResponse
func convertStudyTaskToResponse(task store.StudyTask) StudyTaskResponse {
	response := StudyTaskResponse{
		ID:        task.ID,
		Title:     task.Title,
		DueDate:   task.DueDate,
		CreatedAt: task.CreatedAt.Time,
		UpdatedAt: task.UpdatedAt.Time,
	}

	if task.PlanID.Valid {
		planID := task.PlanID.UUID
		response.PlanID = &planID
	}

	if task.IsCompleted.Valid {
		response.IsCompleted = task.IsCompleted.Bool
	}

	if task.Priority.Valid {
		priority := task.Priority.Int32
		response.Priority = &priority
	}

	if task.Notes.Valid {
		notes := task.Notes.String
		response.Notes = &notes
	}

	return response
}

// CreateStudyTaskHandler creates a new study task
func (app *Application) CreateStudyTaskHandler(w http.ResponseWriter, r *http.Request, user *UserClaims) {
	var req CreateStudyTaskRequest
	if err := app.readJSON(w, r, &req); err != nil {
		app.badRequestError(w, r, err)
		return
	}

	if err := Validate.Struct(req); err != nil {
		app.badRequestError(w, r, err)
		return
	}

	// Prepare parameters for database insertion
	params := store.CreateTaskParams{
		Title:   req.Title,
		DueDate: req.DueDate,
	}

	if req.PlanID != nil {
		params.PlanID = uuid.NullUUID{UUID: *req.PlanID, Valid: true}
	}

	if req.IsCompleted != nil {
		params.IsCompleted = sql.NullBool{Bool: *req.IsCompleted, Valid: true}
	}

	if req.Priority != nil {
		params.Priority = sql.NullInt32{Int32: *req.Priority, Valid: true}
	}

	if req.Notes != nil {
		params.Notes = sql.NullString{String: *req.Notes, Valid: true}
	}

	// Create the task
	task, err := app.Queries.CreateTask(r.Context(), params)
	if err != nil {
		app.internalServerError(w, r, err)
		return
	}

	response := convertStudyTaskToResponse(task)
	app.writeJSON(w, http.StatusCreated, response)
}

// GetStudyTasksHandler retrieves all study tasks for the authenticated user
func (app *Application) GetStudyTasksHandler(w http.ResponseWriter, r *http.Request, user *UserClaims) {
	// Get query parameters for filtering
	planIDStr := r.URL.Query().Get("plan_id")
	priorityStr := r.URL.Query().Get("priority")
	statusStr := r.URL.Query().Get("status")

	var tasks []store.StudyTask
	var err error

	// Handle different filtering scenarios
	if planIDStr != "" && priorityStr != "" {
		// Filter by plan and priority
		planID, err := uuid.Parse(planIDStr)
		if err != nil {
			app.badRequestError(w, r, err)
			return
		}

		priority, err := strconv.ParseInt(priorityStr, 10, 32)
		if err != nil {
			app.badRequestError(w, r, err)
			return
		}

		params := store.GetTasksByPriorityParams{
			PlanID:   uuid.NullUUID{UUID: planID, Valid: true},
			Priority: sql.NullInt32{Int32: int32(priority), Valid: true},
		}
		tasks, err = app.Queries.GetTasksByPriority(r.Context(), params)
	} else if planIDStr != "" && statusStr != "" {
		// Filter by plan and status
		planID, err := uuid.Parse(planIDStr)
		if err != nil {
			app.badRequestError(w, r, err)
			return
		}

		isCompleted, err := strconv.ParseBool(statusStr)
		if err != nil {
			app.badRequestError(w, r, err)
			return
		}

		params := store.GetTasksByStatusParams{
			PlanID:      uuid.NullUUID{UUID: planID, Valid: true},
			IsCompleted: sql.NullBool{Bool: isCompleted, Valid: true},
		}
		tasks, err = app.Queries.GetTasksByStatus(r.Context(), params)
	} else if planIDStr != "" {
		// Filter by plan only
		planID, err := uuid.Parse(planIDStr)
		if err != nil {
			app.badRequestError(w, r, err)
			return
		}

		tasks, err = app.Queries.GetTasksByPlan(r.Context(), uuid.NullUUID{UUID: planID, Valid: true})
	} else {
		// Get all tasks for the authenticated user
		tasks, err = app.Queries.GetTasksByUser(r.Context(), user.ClerkID)
	}

	if err != nil {
		app.internalServerError(w, r, err)
		return
	}

	// Convert to response format
	response := make([]StudyTaskResponse, len(tasks))
	for i, task := range tasks {
		response[i] = convertStudyTaskToResponse(task)
	}

	// Ensure we always return an empty array instead of null when no tasks exist
	if response == nil {
		response = []StudyTaskResponse{}
	}

	if err := app.jsonResponse(w, http.StatusOK, response); err != nil {
		app.internalServerError(w, r, err)
	}
}

// GetStudyTaskHandler retrieves a specific study task by ID
func (app *Application) GetStudyTaskHandler(w http.ResponseWriter, r *http.Request, user *UserClaims) {
	taskIDStr := chi.URLParam(r, "id")
	taskID, err := uuid.Parse(taskIDStr)
	if err != nil {
		app.badRequestError(w, r, err)
		return
	}

	task, err := app.Queries.GetTaskByID(r.Context(), taskID)
	if err != nil {
		if err == sql.ErrNoRows {
			app.writeJSONError(w, http.StatusNotFound, "Task not found")
			return
		}
		app.internalServerError(w, r, err)
		return
	}

	response := convertStudyTaskToResponse(task)
	app.writeJSON(w, http.StatusOK, response)
}

// UpdateStudyTaskHandler updates a study task
func (app *Application) UpdateStudyTaskHandler(w http.ResponseWriter, r *http.Request, user *UserClaims) {
	taskIDStr := chi.URLParam(r, "id")
	taskID, err := uuid.Parse(taskIDStr)
	if err != nil {
		app.badRequestError(w, r, err)
		return
	}

	var req UpdateStudyTaskRequest
	if err := app.readJSON(w, r, &req); err != nil {
		app.badRequestError(w, r, err)
		return
	}

	if err := Validate.Struct(req); err != nil {
		app.badRequestError(w, r, err)
		return
	}

	// Check if task exists
	_, err = app.Queries.GetTaskByID(r.Context(), taskID)
	if err != nil {
		if err == sql.ErrNoRows {
			app.writeJSONError(w, http.StatusNotFound, "Task not found")
			return
		}
		app.internalServerError(w, r, err)
		return
	}

	// Prepare update parameters
	params := store.UpdateTaskParams{
		ID:          taskID,
		Title:       req.Title,
		DueDate:     req.DueDate,
		IsCompleted: sql.NullBool{Bool: req.IsCompleted, Valid: true},
	}

	if req.Priority != nil {
		params.Priority = sql.NullInt32{Int32: *req.Priority, Valid: true}
	}

	if req.Notes != nil {
		params.Notes = sql.NullString{String: *req.Notes, Valid: true}
	}

	// Update the task
	task, err := app.Queries.UpdateTask(r.Context(), params)
	if err != nil {
		app.internalServerError(w, r, err)
		return
	}

	response := convertStudyTaskToResponse(task)
	app.writeJSON(w, http.StatusOK, response)
}

// DeleteStudyTaskHandler deletes a study task
func (app *Application) DeleteStudyTaskHandler(w http.ResponseWriter, r *http.Request, user *UserClaims) {
	taskIDStr := chi.URLParam(r, "id")
	taskID, err := uuid.Parse(taskIDStr)
	if err != nil {
		app.badRequestError(w, r, err)
		return
	}

	// Check if task exists
	_, err = app.Queries.GetTaskByID(r.Context(), taskID)
	if err != nil {
		if err == sql.ErrNoRows {
			app.writeJSONError(w, http.StatusNotFound, "Task not found")
			return
		}
		app.internalServerError(w, r, err)
		return
	}

	// Delete the task
	err = app.Queries.DeleteTask(r.Context(), taskID)
	if err != nil {
		app.internalServerError(w, r, err)
		return
	}

	app.writeJSON(w, http.StatusOK, map[string]string{
		"message": "Task deleted successfully",
	})
}

// UpdateStudyTaskStatusHandler updates only the completion status of a task
func (app *Application) UpdateStudyTaskStatusHandler(w http.ResponseWriter, r *http.Request, user *UserClaims) {
	taskIDStr := chi.URLParam(r, "id")
	taskID, err := uuid.Parse(taskIDStr)
	if err != nil {
		app.badRequestError(w, r, err)
		return
	}

	var req struct {
		IsCompleted bool `json:"is_completed"`
	}

	if err := app.readJSON(w, r, &req); err != nil {
		app.badRequestError(w, r, err)
		return
	}

	// Check if task exists
	_, err = app.Queries.GetTaskByID(r.Context(), taskID)
	if err != nil {
		if err == sql.ErrNoRows {
			app.writeJSONError(w, http.StatusNotFound, "Task not found")
			return
		}
		app.internalServerError(w, r, err)
		return
	}

	// Update task status
	params := store.UpdateTaskStatusParams{
		ID:          taskID,
		IsCompleted: sql.NullBool{Bool: req.IsCompleted, Valid: true},
	}

	err = app.Queries.UpdateTaskStatus(r.Context(), params)
	if err != nil {
		app.internalServerError(w, r, err)
		return
	}

	app.writeJSON(w, http.StatusOK, map[string]string{
		"message": "Task status updated successfully",
	})
}
