package handlers

import (
	"encoding/json"
	"log/slog"
	"net/http"
	"slices"

	"github.com/google/uuid"
)

type RespStatus struct {
	NbCalls int `json:"nbCalls,omitempty"`
}

type Response struct {
	Endpoint string `json:"endpoint,omitempty"`

	Code    int             `json:"code,omitempty"`
	Headers http.Header     `json:"headers,omitempty"`
	Body    json.RawMessage `json:"body,omitempty"`

	Mode string `json:"mode,omitempty"`

	// Used for verifications
	ID     string     `json:"id,omitempty"`
	Status RespStatus `json:"status,omitempty"`
}

var responses = []*Response{}

var ListResponses = MakeHandlerFunc(func(req *http.Request) (int, any) {
	return http.StatusOK, responses
})

var PostResponse = MakeHandlerFunc(func(req *http.Request) (int, any) {

	var mockResp Response
	err := json.NewDecoder(req.Body).Decode(&mockResp)
	if err != nil {
		slog.Info("Could not decode the body", "error", err)
		return http.StatusBadRequest, "Invalid body"
	}

	if len(mockResp.Endpoint) == 0 {
		slog.Info("Endpoint should be set")
		return http.StatusBadRequest, "Invalid endpoint"
	}

	idx := slices.IndexFunc(responses, func(currResp *Response) bool {
		return currResp.Endpoint == mockResp.Endpoint
	})

	if idx != -1 {
		slog.Info("Endpoint already set")
		return http.StatusConflict, map[string]any{
			"error":    "Conflicting endpoint",
			"conflict": responses[idx].ID,
		}
	}

	mockResp.ID = uuid.New().String()
	responses = append(responses, &mockResp)

	return http.StatusCreated, mockResp.ID
})

var DeleteResponses = MakeHandlerFunc(func(*http.Request) (int, any) {
	responses = nil
	return http.StatusNoContent, nil
})

var GetOneResponse = MakeHandlerFunc(func(req *http.Request) (int, any) {
	respID := req.PathValue("respId")
	idx := slices.IndexFunc(responses, func(currResp *Response) bool {
		return currResp.ID == respID
	})

	if idx == -1 {
		return http.StatusNotFound, "Resource not found"
	} else {
		return http.StatusOK, responses[idx]
	}
})

var DeleteOneResponse = MakeHandlerFunc(func(req *http.Request) (int, any) {
	respID := req.PathValue("respId")
	_ = slices.DeleteFunc(responses, func(currResp *Response) bool {
		return currResp.ID == respID
	})
	return http.StatusNoContent, nil
})

func MatchMockResponse(res http.ResponseWriter, req *http.Request) {

	endpoint := req.Method + " " + req.URL.Path

	idx := slices.IndexFunc(responses, func(currResp *Response) bool {
		return currResp.Endpoint == endpoint
	})

	if idx == -1 {
		slog.Info("No mock found", "endpoint", endpoint, "path", req.URL.Path)
		res.WriteHeader(http.StatusTeapot)
		res.Write([]byte("No mock found"))
		return
	}

	mockResp := responses[idx]
	mockResp.Status.NbCalls++

	if len(mockResp.Mode) > 0 {
		switch mockResp.Mode {
		case "hang":
			slog.Info("Hanging")
			ctx := req.Context()
			// Simulate an infinite wait until client disconnects
			select {
			case <-ctx.Done():
				// The client closed the connection
				slog.Info("Client disconnected")
				return
			}
		default:
			slog.Info("Mode unknown", "mode", mockResp.Mode)
		}
	} else {
		resultCode := mockResp.Code
		if resultCode == 0 {
			resultCode = http.StatusOK
		}

		for hKey, hVals := range mockResp.Headers {
			for _, hVal := range hVals {
				res.Header().Add(hKey, hVal)
			}
		}
		res.WriteHeader(resultCode)

		if len(mockResp.Body) > 0 {
			res.Write(mockResp.Body)
		}
	}
}
