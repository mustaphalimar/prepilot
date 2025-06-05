package app

import (
	"log"
	"net/http"
)

const (
	ColorRed   = "\033[31m"
	ColorReset = "\033[0m"
)

func (app *Application) internalServerError(w http.ResponseWriter, r *http.Request, err error) {
	log.Printf("%sINTERNAL_SERVER_ERROR_OCCURED: %s path: %s error: %s%s",
		ColorRed, r.Method, r.URL.Path, err.Error(), ColorReset)
	app.writeJSONError(w, http.StatusInternalServerError, "The server encountered a problem while procession your request.")
}

func (app *Application) conflictError(w http.ResponseWriter, r *http.Request, err error) {
	log.Printf("%sCONFLICT_ERROR_OCCURED: %s path: %s error: %s%s",
		ColorRed, r.Method, r.URL.Path, err.Error(), ColorReset)
	app.writeJSONError(w, http.StatusConflict, err.Error())
}

func (app *Application) badRequestError(w http.ResponseWriter, r *http.Request, err error) {
	log.Printf("%sBAD_REQUEST_ERROR: %s path: %s error: %s%s",
		ColorRed, r.Method, r.URL.Path, err.Error(), ColorReset)
	app.writeJSONError(w, http.StatusBadRequest, err.Error())
}

func (app *Application) notFoundError(w http.ResponseWriter, r *http.Request, err error) {
	log.Printf("%sNOT_FOUND_ERROR: %s path: %s error: %s%s",
		ColorRed, r.Method, r.URL.Path, err.Error(), ColorReset)
	app.writeJSONError(w, http.StatusNotFound, "Resource not found.")
}
