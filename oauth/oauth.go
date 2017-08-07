package main

import (
	"context"
	"flag"
	"log"
	"net/http"
	"os"
	"os/signal"
	"runtime"
	"strings"
	"syscall"
	"time"

	"github.com/ViBiOh/alcotest/alcotest"
	"github.com/ViBiOh/dashboard/oauth/basic"
	"github.com/ViBiOh/dashboard/oauth/github"
)

const basicPrefix = `/basic`
const githubPrefix = `/github`

var basicHandler = http.StripPrefix(basicPrefix, basic.Handler{})
var githubHandler = http.StripPrefix(githubPrefix, github.Handler{})

// Init configure OAuth provided
func Init() {
	basic.Init()
	github.Init()
}

func handleGracefulClose(server *http.Server) {
	signals := make(chan os.Signal, 1)
	signal.Notify(signals, syscall.SIGTERM)

	<-signals

	log.Print(`SIGTERM received`)

	if server != nil {
		log.Print(`Shutting down http server`)

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		if err := server.Shutdown(ctx); err != nil {
			log.Print(err)
		}
	}
}

func oauthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Add(`Access-Control-Allow-Origin`, `*`)
	w.Header().Add(`Access-Control-Allow-Headers`, `Content-Type`)
	w.Header().Add(`Access-Control-Allow-Methods`, `GET`)
	w.Header().Add(`X-Content-Type-Options`, `nosniff`)

	if strings.HasPrefix(r.URL.Path, githubPrefix) {
		githubHandler.ServeHTTP(w, r)
	} else if strings.HasPrefix(r.URL.Path, basicPrefix) {
		basicHandler.ServeHTTP(w, r)
	}
}

func main() {
	url := flag.String(`c`, ``, `URL to healthcheck (check and exit)`)
	port := flag.String(`port`, `1080`, `Listen port`)
	flag.Parse()

	if *url != `` {
		alcotest.Do(url)
		return
	}

	runtime.GOMAXPROCS(runtime.NumCPU())

	log.Printf(`Starting server on port %s`, *port)

	Init()

	server := &http.Server{
		Addr:    `:` + *port,
		Handler: http.HandlerFunc(oauthHandler),
	}

	go server.ListenAndServe()
	handleGracefulClose(server)
}
