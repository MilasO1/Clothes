package handlers

import (
	"encoding/json"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"

	"github.com/google/uuid"
)

var (
	client_id     = os.Getenv("AUTH_CLIENT_ID")
	client_secret = os.Getenv("AUTH_CLIENT_SECRET")
	redirect_uri  = os.Getenv("AUTH_REDIRECT_URI")
	grant_type    = "authorization_code"
)

func init() {
	if len(client_id) == 0 || len(client_secret) == 0 || len(redirect_uri) == 0 {
		log.Fatalln("Missing some auth env variable")
	}
}

type User struct {
	id    string
	orga  string
	roles []string
}

// Local DB that fakes a cloud user management like Cognito
var users = map[string]User{
	"Gg":    {id: "Gg", orga: "kiabi", roles: []string{"reader", "writer"}},
	"Carlo": {id: "Carlo", orga: "kiabi", roles: []string{"reader"}},
	"Thierry": {id: "Thierry", orga: "hermes", roles: []string{"reader", "writer"}},

	// Test API users
	"test-reader-1":        {id: "tr1", orga: "test-orga-1", roles: []string{"reader"}},
	"test-reader-writer-1": {id: "trw1", orga: "test-orga-1", roles: []string{"reader", "writer"}},
	"test-reader-writer-2": {id: "trw2", orga: "test-orga-2", roles: []string{"reader", "writer"}},
}

var sessions = map[string]*User{}

func PostLogin(res http.ResponseWriter, req *http.Request) {

	body, _ := io.ReadAll(req.Body)

	userId := string(body)

	user, exists := users[userId]
	if !exists {
		res.WriteHeader(http.StatusInternalServerError)
		return
	}
	newCode := uuid.New().String()
	sessions[newCode] = &user

	redirect_uri, _ := url.Parse(redirect_uri + "/.auth/success")

	params := url.Values{}
	params.Add("code", newCode)

	redirect_uri.RawQuery = params.Encode()

	res.WriteHeader(http.StatusOK)
	res.Write([]byte(redirect_uri.String()))
}

func PostToken(res http.ResponseWriter, req *http.Request) {

	reqCode := req.FormValue("code")
	reqGrantType := req.FormValue("grant_type")
	reqRedirectUri := req.FormValue("redirect_uri")
	username, password, _ := req.BasicAuth()

	// No need crypto compare for this test backend
	if username != client_id || password != client_secret {
		log.Println("Invalid credentials", password, username, client_id, client_secret)
		res.WriteHeader(http.StatusForbidden)
		return
	}

	if reqGrantType != grant_type || reqRedirectUri != redirect_uri {
		log.Println("Non matching params")
		res.WriteHeader(http.StatusForbidden)
		return
	}

	user, exists := sessions[reqCode]
	if !exists {
		log.Println("Code not found in the open sessions")
		res.WriteHeader(http.StatusNotFound)
		return
	}

	token := map[string]any{
		"access_token": encodeJwt(Claims{"key": "value"}),
		"id_token":     encodeIdToken(user),
	}

	res.Header().Set("content-type", "application/json")
	res.WriteHeader(http.StatusOK)
	json.NewEncoder(res).Encode(token)
}
