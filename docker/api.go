package docker

import (
	"context"
	"net/http"
	"regexp"
	"strings"
	"sync"
	"time"

	authProvider "github.com/ViBiOh/auth/provider"
	"github.com/ViBiOh/httputils/httperror"
	"github.com/ViBiOh/httputils/request"
)

const (
	// DeployTimeout indicates delay for application to deploy before rollback
	DeployTimeout    = 3 * time.Minute
	healthPrefix     = `/health`
	containersPrefix = `/containers`
)

var (
	containerRequest       = regexp.MustCompile(`^/([^/]+)/?$`)
	containerActionRequest = regexp.MustCompile(`^/([^/]+)/([^/]+)`)
)

var backgroundTasks = sync.Map{}

func getCtx() (context.Context, context.CancelFunc) {
	return context.WithTimeout(context.Background(), 30*time.Second)
}

func getGracefulCtx() (context.Context, context.CancelFunc) {
	return context.WithTimeout(context.Background(), DeployTimeout)
}

// CanBeGracefullyClosed indicates if application can terminate safely
func CanBeGracefullyClosed() (canBe bool) {
	canBe = true

	backgroundTasks.Range(func(_ interface{}, value interface{}) bool {
		canBe = !value.(bool)
		return canBe
	})

	return
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	if docker != nil {
		ctx, cancel := getCtx()
		defer cancel()

		if _, err := docker.Ping(ctx); err == nil {
			w.WriteHeader(http.StatusOK)
			return
		}
	}

	w.WriteHeader(http.StatusServiceUnavailable)
}

func containersHandler(w http.ResponseWriter, r *http.Request, urlPath string, user *authProvider.User) {
	if r.Method == http.MethodGet && (urlPath == `/` || urlPath == ``) {
		listContainersHandler(w, r, user)
	} else if containerRequest.MatchString(urlPath) {
		containerID := containerRequest.FindStringSubmatch(urlPath)[1]

		if r.Method == http.MethodGet {
			basicActionHandler(w, r, user, containerID, getAction)
		} else if r.Method == http.MethodDelete {
			basicActionHandler(w, r, user, containerID, deleteAction)
		} else if r.Method == http.MethodPost {
			if composeBody, err := request.ReadBody(r.Body); err != nil {
				httperror.InternalServerError(w, err)
			} else {
				composeHandler(w, r, user, containerRequest.FindStringSubmatch(urlPath)[1], composeBody)
			}
		} else {
			w.WriteHeader(http.StatusMethodNotAllowed)
		}
	} else if containerActionRequest.MatchString(urlPath) && r.Method == http.MethodPost {
		matches := containerActionRequest.FindStringSubmatch(urlPath)
		basicActionHandler(w, r, user, matches[1], matches[2])
	} else {
		httperror.NotFound(w)
	}
}

// Handler for Docker request. Should be use with net/http
func Handler() http.Handler {
	authHandler := authApp.Handler(func(w http.ResponseWriter, r *http.Request, user *authProvider.User) {
		if strings.HasPrefix(r.URL.Path, containersPrefix) {
			containersHandler(w, r, strings.TrimPrefix(r.URL.Path, containersPrefix), user)
		}
	})

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodOptions {
			if _, err := w.Write(nil); err != nil {
				httperror.InternalServerError(w, err)
			}
			return
		}

		if strings.HasPrefix(r.URL.Path, healthPrefix) && r.Method == http.MethodGet {
			healthHandler(w, r)
			return
		}

		if r.Method == http.MethodGet && (r.URL.Path == `/` || r.URL.Path == ``) {
			http.ServeFile(w, r, `doc/api.html`)
			return
		}

		authHandler.ServeHTTP(w, r)
	})
}
