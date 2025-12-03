package auth

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"
	"net/url"
	"strings"
	"time"
)

type Claims = map[string]any

func decodeJwt(jwt string) (Claims, error) {

	slog.Info("Decoding a JWT " + jwt)

	pieces := strings.Split(jwt, ".")

	b64Reader := base64.NewDecoder(base64.RawURLEncoding, bytes.NewBufferString(pieces[1]))

	result := Claims{}
	err := json.NewDecoder(b64Reader).Decode(&result)

	return result, err
}

func extractUser(jwt string) (*User, error) {

	claims, err := decodeJwt(jwt)

	if err != nil {
		slog.Info("Error decoding the JWT")
		return nil, err
	}

	user := User{}

	if id, ok := claims["sub"].(string); ok {
		user.Id = id
	} else {
		return nil, errors.New("invalid user ID")
	}

	if orga, ok := claims["custom:orga"].(string); ok {
		user.Orga = orga
	} else {
		return nil, errors.New("invalid user orga")
	}

	if roles, ok := claims["custom:roles"].(string); ok {
		user.Roles = strings.Split(roles, ",")
	} else {
		return nil, errors.New("invalid user roles")
	}

	return &user, nil
}

func fetchTokens(code string) (*User, error) {

	formData := url.Values{}
	formData.Set("code", code)
	formData.Set("grant_type", grant_type)
	formData.Set("redirect_uri", redirect_uri)

	// Create a request
	req, err := http.NewRequest("POST", idp_uri+"/oauth2/token", strings.NewReader(formData.Encode()))
	if err != nil {
		slog.Info("Error creating the request")
		return nil, err
	}

	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.SetBasicAuth(client_id, client_secret)

	// Make the request
	var client = &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		slog.Info("Error making the request")
		return nil, err
	}
	defer resp.Body.Close()

	var tokens map[string]any
	err = json.NewDecoder(resp.Body).Decode(&tokens)
	if err != nil {
		slog.Info("Error decoding the body")
		return nil, err
	}

	return extractUser(tokens["id_token"].(string))
}
