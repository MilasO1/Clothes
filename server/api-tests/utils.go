package apitests

import (
	"bytes"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"net/http/cookiejar"
	"net/url"
	"strings"
	"testing"
	"time"
)

var authUrl, _ = url.Parse("http://localhost:8081/auth")
var backendUrl, _ = url.Parse("http://localhost:8080")
var mockApiUrl, _ = url.Parse("http://localhost:8081/api")

// Global client with a proper timeout and cookies management
var jar, _ = cookiejar.New(nil)
var client = &http.Client{Jar: jar, Timeout: 10 * time.Second}

type doc = map[string]any

// Wrapper to HTTP calls, does the error handling and JSON decoding
// Implicitely uses the previous headers (for authentication)
func call(method, path string, body any, code *int, result any) (*http.Response, error) {
	return call2(method, backendUrl.String()+path, body, code, result)
}

func callMock(method, path string, body any, code *int, result any) (*http.Response, error) {
	return call2(method, mockApiUrl.String()+path, body, code, result)
}

func call2(method, fullPath string, body any, code *int, result any) (*http.Response, error) {
	var reqBody io.Reader
	if body != nil { // Optional
		jsonBody, err := json.Marshal(body)
		if err != nil {
			return nil, err
		}
		reqBody = bytes.NewReader(jsonBody)
	}

	res, err := rawCall(method, fullPath, reqBody)
	if err != nil {
		return nil, err
	}

	if code != nil { // Optional
		*code = res.StatusCode
	}

	if result != nil { // Optional

		contentType := res.Header.Get("Content-Type")
		if strings.Contains(contentType, "application/json") {
			defer res.Body.Close()
			err = json.NewDecoder(res.Body).Decode(result)
		}
	}
	return res, err
}

func rawCall(method, fullPath string, reqBody io.Reader) (*http.Response, error) {

	req, _ := http.NewRequest(method, fullPath, reqBody)

	req.Header.Set("content-type", "application/json")

	// send the request
	res, err := client.Do(req)
	if err != nil {
		return nil, err
	}

	return res, err
}

func getStringContent(res *http.Response) string {
	if res == nil || res.StatusCode != http.StatusOK {
		log.Println("Invalid http response to process")
	}
	defer res.Body.Close()

	buf := new(strings.Builder)
	io.Copy(buf, res.Body)

	return buf.String()
}

func login(userName string) {

	res, err := rawCall("POST", authUrl.String()+"/login", bytes.NewBufferString(userName))
	successUrl := getStringContent(res)
	log.Println("Login resp", res.StatusCode, err, successUrl)

	rawCall("GET", successUrl, nil)
	// The cookie is automatically managed by the jar and sent into subsequent requests
}

func retrieveRsc[T any](t *testing.T, rscType, rscID string) T {
	t.Helper()
	code := 0
	var rscData T
	_, err := call("GET", "/api/"+rscType+"/"+rscID, nil, &code, &rscData)
	if err != nil {
		t.Fatal("Request error", err)
	}

	if code != http.StatusOK {
		t.Fatal("Resource retrieval should pass, got", code)
	}

	return rscData
}

func createRsc(t *testing.T, rscType string, body doc) string {
	t.Helper()
	code := 0
	rscID := ""
	call("POST", "/api/"+rscType, body, &code, &rscID)
	if code != http.StatusCreated {
		t.Fatal("Resource creation should pass, got", code, body)
	}

	return rscID
}

func updateRsc(t *testing.T, rscType, rscID string, body doc) any {
	t.Helper()
	code := 0
	var resp any
	call("PUT", "/api/"+rscType+"/"+rscID, body, &code, &resp)
	if code != http.StatusNoContent {
		t.Fatal("Resource update should pass, got", code)
	}

	return resp
}

type RespStatus struct {
	NbCalls int `json:"nbCalls,omitempty"`
}

type Response struct {
	ID       string     `json:"id,omitempty"`
	Code     int        `json:"code,omitempty"`
	Endpoint string     `json:"endpoint,omitempty"`
	Body64   string     `json:"body64,omitempty"`
	Mode     string     `json:"mode,omitempty"`
	body     []byte     // Decoded
	Status   RespStatus `json:"status,omitempty"`
}

func createMockResponse(t *testing.T, body doc) string {
	t.Helper()
	code := 0
	rscID := ""
	callMock("POST", "/responses", body, &code, &rscID)
	if code != http.StatusCreated {
		t.Fatal("Mock resource creation should pass, got", code, body)
	}

	return rscID
}

func retrieveMockResponse(t *testing.T, rscID string) Response {
	t.Helper()
	code := 0
	var rscData Response
	_, err := callMock("GET", "/responses/"+rscID, nil, &code, &rscData)
	if err != nil {
		t.Fatal("Request error", err)
	}

	if code != http.StatusOK {
		t.Fatal("Resource retrieval should pass, got", code)
	}

	return rscData
}

func clearAllMockResponses() {
	code := 0
	_, err := callMock("DELETE", "/responses", nil, &code, nil)
	if err != nil || code != http.StatusNoContent {
		log.Fatalln("Bad deletion of response mocks during init", err, code)
	}
}
