package auth

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"errors"
	"log"
	"log/slog"
	"net/http"
	"net/url"
	"os"
	"slices"
	"strings"
)

type User struct {
	Id    string   `json:"id"`
	Orga  string   `json:"orga"`
	Roles []string `json:"roles"`
}

// Simple volatile storage
var sessions = map[string]*User{}

type CtxKey string

const CtxKeyUser CtxKey = "user"

func GetUser(req *http.Request) *User {
	user, _ := req.Context().Value(CtxKeyUser).(*User)
	return user
}

func withUser(req *http.Request, user *User) *http.Request {

	slog.Info("Adding the user to context", "user", user)
	ctx := context.WithValue(req.Context(), CtxKeyUser, user)
	return req.WithContext(ctx)
}

var (
	client_id      = os.Getenv("AUTH_CLIENT_ID")
	client_secret  = os.Getenv("AUTH_CLIENT_SECRET")
	idp_uri        = os.Getenv("AUTH_IDP_URI")
	idp_uri_client = idp_uri
	redirect_uri   = os.Getenv("AUTH_REDIRECT_URI")
	scope          = os.Getenv("AUTH_SCOPES")
)

const (
	grant_type    = "authorization_code"
	response_type = "code"
)

func init() {
	if client_id == "" || client_secret == "" || idp_uri == "" || redirect_uri == "" {
		slog.Error("Missing some auth env variable")
		os.Exit(1)
	}

	if os.Getenv("AUTH_IDP_URI_CLIENT") != "" {
		idp_uri_client = os.Getenv("AUTH_IDP_URI_CLIENT")
	}

	presetSessionsTxt := os.Getenv("AUTH_PRESET_SESSIONS")
	if presetSessionsTxt != "" {

		presetSessions := map[string]User{}
		err := json.NewDecoder(strings.NewReader(presetSessionsTxt)).Decode(&presetSessions)

		if err == nil {
			for sessionID, presetSession := range presetSessions {
				sessions[sessionID] = &presetSession
			}
		} else {
			log.Println("AUTH_PRESET_SESSIONS parsing error", err)
		}
	}

}

func SessionToUserMdw(next http.Handler) http.HandlerFunc {
	return func(res http.ResponseWriter, req *http.Request) {

		res.Header().Set("Access-Control-Allow-Origin", "https://app.darwie.com")
		res.Header().Set("Access-Control-Allow-Methods", "*")
		res.Header().Set("Access-Control-Allow-Headers", "*")

		if req.Method == "OPTIONS" {
			res.WriteHeader(http.StatusOK)
			return
		}

		var sessionID string
		if cookie, err := req.Cookie("session"); err == nil {
			sessionID = cookie.Value
		} else {
			clientApiKey := req.Header.Get("X-DARWIE-APIKEY")
			if clientApiKey != "" {
				sessionID = clientApiKey
			}
		}
		if sessionID != "" {
			user, exists := sessions[sessionID]
			if exists {
				// If the session exists, the user will be usable in the API endpoint callbacks
				next.ServeHTTP(res, withUser(req, user))
				return
			}
		}
		next.ServeHTTP(res, req)
	}
}

// Generates a cryptographically random string of the given length.
func generateRandomSessionID() string {
	randStr := make([]byte, 32)
	rand.Read(randStr)
	return base64.URLEncoding.EncodeToString(randStr)
}

// redirect_uri callback for the cognito/oauth2/authorize call
func GetSuccess(res http.ResponseWriter, req *http.Request) {
	code := req.URL.Query().Get("code")

	// Refered twice: by the /login redirect and by the /token redirect
	if len(code) != 0 {
		slog.Info("Success, enroll the user then go back", "code", code)

		user, err := fetchTokens(code)

		if err != nil {
			slog.Error("Authentication error from the IdP", "error", err)
		} else {

			slog.Info("idClaims", "user", user)

			// The RBAC roles are in the claim custom:roles of the id_token
			sessionID := generateRandomSessionID()
			sessions[sessionID] = user

			//slog.Info("Create a user", "sessionId", sessionID)

			cookie := http.Cookie{
				Name:     "session",
				Value:    sessionID,
				MaxAge:   1000 * 60 * 60 * 24 * 7,
				Path:     "/",
				SameSite: http.SameSiteStrictMode,
				Secure:   false, // for localhost https://github.com/golang/go/issues/60997
				HttpOnly: true,
			}
			http.SetCookie(res, &cookie)
		}
	} else {
		slog.Info("Juste le success apres le auth token...")
	}

	http.Redirect(res, req, "/", http.StatusFound)
}

func Login(res http.ResponseWriter, req *http.Request) {

	loginUrl, _ := url.Parse(idp_uri_client + "/login")
	params := url.Values{}
	params.Add("client_id", client_id)
	params.Add("redirect_uri", redirect_uri)
	params.Add("response_type", response_type)
	params.Add("scope", scope)
	loginUrl.RawQuery = params.Encode()

	http.Redirect(res, req, loginUrl.String(), http.StatusTemporaryRedirect)
}

func Logout(res http.ResponseWriter, req *http.Request) {

	if cookie, err := req.Cookie("session"); err == nil {
		user, exists := sessions[cookie.Value]
		if exists {
			slog.Info("Logout", "user", user.Id)
			delete(sessions, cookie.Value)

			cookie := http.Cookie{Name: "session", MaxAge: -1, Path: "/"}
			http.SetCookie(res, &cookie)
		}
	}

	logoutUrl, _ := url.Parse(idp_uri_client + "/logout")
	params := url.Values{}
	params.Add("client_id", client_id)
	params.Add("redirect_uri", redirect_uri)
	params.Add("response_type", response_type)
	params.Add("scope", scope)
	logoutUrl.RawQuery = params.Encode()

	http.Redirect(res, req, logoutUrl.String(), http.StatusTemporaryRedirect)
}

// The user needs any of the input roles. If empty no role check, just user integrity
func InputsValidationCallback(req *http.Request, roles []string) error {
	slog.Debug("Secu validation", "required roles (anyof)", roles)

	if len(roles) == 0 {
		return nil
	}

	user := GetUser(req)

	if user == nil {
		return errors.New("you need to login first on /login")
	}

	for _, role := range roles {
		if slices.Contains(user.Roles, role) {
			return nil
		}
	}

	return errors.New("The current user should have any of the roles: " + strings.Join(roles, ", "))
}
