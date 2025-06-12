package app

import (
	"database/sql"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/mustaphalimar/prepilot/internal/store"
)

func (app *Application) createStudyPlanHandler(w http.ResponseWriter, r *http.Request, user *UserClaims) {
	var studyPlanPayload store.CreateStudyPlanParams

	if err := app.readJSON(w, r, &studyPlanPayload); err != nil {
		app.badRequestError(w, r, err)
		return
	}

	if err := Validate.Struct(studyPlanPayload); err != nil {
		app.badRequestError(w, r, err)
		return
	}

	// Associate with authenticated user
	studyPlanPayload.UserID = user.ClerkID

	studyPlan, err := app.Queries.CreateStudyPlan(r.Context(), studyPlanPayload)
	if err != nil {
		app.internalServerError(w, r, err)
		return
	}

	app.writeJSON(w, http.StatusCreated, studyPlan)
}

// GetStudyPlansHandler retrieves all study plans for the authenticated user
func (app *Application) GetStudyPlansHandler(w http.ResponseWriter, r *http.Request, user *UserClaims) {
	studyPlans, err := app.Queries.GetStudyPlansByUserId(r.Context(), user.ClerkID)
	if err != nil {
		app.internalServerError(w, r, err)
		return
	}

	// Ensure we always return an empty array instead of null when no study plans exist
	if studyPlans == nil {
		studyPlans = []store.StudyPlan{}
	}

	if err := app.jsonResponse(w, http.StatusOK, studyPlans); err != nil {
		app.internalServerError(w, r, err)
	}
}

// GetStudyPlanHandler retrieves a specific study plan by ID
func (app *Application) GetStudyPlanHandler(w http.ResponseWriter, r *http.Request, user *UserClaims) {
	planIDStr := chi.URLParam(r, "id")
	planID, err := uuid.Parse(planIDStr)
	if err != nil {
		app.badRequestError(w, r, err)
		return
	}

	studyPlan, err := app.Queries.GetStudyPlanByID(r.Context(), planID)
	if err != nil {
		if err == sql.ErrNoRows {
			app.writeJSONError(w, http.StatusNotFound, "Study plan not found")
			return
		}
		app.internalServerError(w, r, err)
		return
	}

	// Verify the plan belongs to the authenticated user
	if studyPlan.UserID != user.ClerkID {
		app.writeJSONError(w, http.StatusForbidden, "Access denied")
		return
	}

	app.writeJSON(w, http.StatusOK, studyPlan)
}

// GetStudyPlanTasksHandler retrieves all tasks for a specific study plan
func (app *Application) GetStudyPlanTasksHandler(w http.ResponseWriter, r *http.Request, user *UserClaims) {
	planIDStr := chi.URLParam(r, "id")
	planID, err := uuid.Parse(planIDStr)
	if err != nil {
		app.badRequestError(w, r, err)
		return
	}

	// First verify the plan exists and belongs to the user
	studyPlan, err := app.Queries.GetStudyPlanByID(r.Context(), planID)
	if err != nil {
		if err == sql.ErrNoRows {
			app.writeJSONError(w, http.StatusNotFound, "Study plan not found")
			return
		}
		app.internalServerError(w, r, err)
		return
	}

	if studyPlan.UserID != user.ClerkID {
		app.writeJSONError(w, http.StatusForbidden, "Access denied")
		return
	}

	// Get tasks for the plan
	tasks, err := app.Queries.GetTasksByPlan(r.Context(), uuid.NullUUID{UUID: planID, Valid: true})
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

	app.writeJSON(w, http.StatusOK, response)
}
