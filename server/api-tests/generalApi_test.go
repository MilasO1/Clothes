package apitests

import (
	"net/http"
	"strings"
	"testing"
)

func TestGetClientIndex(t *testing.T) {
	code := 0
	res, err := call("GET", "/", nil, &code, nil)
	if err != nil {
		t.Fatal("Request error", err)
	}

	if code != http.StatusOK {
		t.Error("We should get code 200, got", code)
	}
	if !strings.HasPrefix(res.Header.Get("Content-Type"), "text/html") {
		t.Error("We should get a Content-Type header containing text/html, got", res.Header.Get("Content-Type"))
	}
}

func TestGetSwaggerUI(t *testing.T) {

	code := 0
	res, err := call("GET", "/api", nil, &code, nil)
	if err != nil {
		t.Fatal("Request error", err)
	}

	if code != http.StatusOK {
		t.Error("We should get code 200, got", code)
	}
	if !strings.HasPrefix(res.Header.Get("Content-Type"), "text/html") {
		t.Error("We should get a Content-Type header containing text/html, got", res.Header.Get("Content-Type"))
	}
}

func TestGetVersion(t *testing.T) {

	code := 0
	result := ""
	_, err := call("GET", "/api/version", nil, &code, &result)
	if err != nil {
		t.Fatal("Request error", err)
	}

	if code != http.StatusOK {
		t.Error("We should get code 200, got", code)
	}
}
