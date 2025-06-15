package app

import (
	"net/http"
)

const (
	ColorRed   = "\033[31m"
	ColorReset = "\033[0m"
)

func (app *Application) internalServerResponse(w http.ResponseWriter, r *http.Request, err error) {
	var message = "INTERNAL_SERVER_ERROR"
	app.Logger.Errorw(message, "method", r.Method, "path", r.URL.Path, err)
	app.writeJSONError(w, http.StatusInternalServerError, "The server encountered a problem while procession your request.")
}

func (app *Application) conflictResponse(w http.ResponseWriter, r *http.Request, err error) {
	var message = "CONFLICT_ERROR"
	app.Logger.Warnf(message, "method", r.Method, "path", r.URL.Path, err)
	app.writeJSONError(w, http.StatusConflict, err.Error())
}

func (app *Application) badRequestResponse(w http.ResponseWriter, r *http.Request, err error) {
	var message = "BAD_REQUEST_ERROR"
	app.Logger.Warnf(message, "method", r.Method, "path", r.URL.Path, err)
	app.writeJSONError(w, http.StatusBadRequest, err.Error())
}

func (app *Application) notFoundResponse(w http.ResponseWriter, r *http.Request, err error) {
	var message = "NOT_FOUND_ERROR"
	app.Logger.Warnf(message, "method", r.Method, "path", r.URL.Path, err)
	app.writeJSONError(w, http.StatusNotFound, "Resource not found.")
}

func (app *Application) unauthorizedResponse(w http.ResponseWriter, r *http.Request, err error) {
	var message = "UNAUTHORIZED_ERROR"
	app.Logger.Errorw(message, "method", r.Method, "path", r.URL.Path, err)

	app.writeJSONError(w, http.StatusUnauthorized, err.Error())
}
func (app *Application) unauthorizedBasicAuthResponse(w http.ResponseWriter, r *http.Request, err error) {
	var message = "UNAUTHORIZED_BASIC_AUTH_ERROR"
	app.Logger.Errorw(message, "method", r.Method, "path", r.URL.Path, err)

	w.Header().Set("WWW-Authenticate", `Basic realm="restriced", charset="UTF-8"`)
	app.writeJSONError(w, http.StatusUnauthorized, err.Error())
}
