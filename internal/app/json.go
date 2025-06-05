package app

import (
	"encoding/json"
	"net/http"

	"github.com/go-playground/validator/v10"
)

var Validate *validator.Validate

func init() {
	Validate = validator.New(validator.WithRequiredStructEnabled())
}

func (app *Application) writeJSON(w http.ResponseWriter, status int, data any) error {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	return json.NewEncoder(w).Encode(data)
}

func (app *Application) readJSON(w http.ResponseWriter, r *http.Request, data any) error {
	// Setting the maximum size of the json recieved in the request
	maxBytes := 1_048_578 // 1MB
	r.Body = http.MaxBytesReader(w, r.Body, int64(maxBytes))

	//
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields() // as its name suggest

	return decoder.Decode(data)
}

func (app *Application) writeJSONError(w http.ResponseWriter, status int, message string) error {
	type envelope struct {
		Error string `json:"error"`
	}

	return app.writeJSON(w, status, &envelope{
		Error: message,
	})
}

func (app *Application) jsonResponse(w http.ResponseWriter, status int, data any) error {
	type envelope struct {
		Data any `json:"data"`
	}
	return app.writeJSON(w, status, &envelope{Data: data})
}
