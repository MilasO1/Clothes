package api

import (
	"context"
	"encoding/json"
	"log/slog"
	"math"
	"net/http"

	oav "gitlab.com/ggpack/openapi-validation-go"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"backend/models"
)

// Simple interface to implement to handle requests
type ServiceFunc func(*http.Request) (int, any)

// Wraps the ServiceFunc to manke a http.HandlerFunc with panic handling and JSON response encoding
func MakeHandlerFunc(svcFunc ServiceFunc) http.HandlerFunc {

	return func(res http.ResponseWriter, req *http.Request) {

		code, body := func(req *http.Request) (code int, body any) {
			// General panic/error handler to keep the server up
			defer func() {
				if recoveredPanic := recover(); recoveredPanic != nil {
					slog.Warn("Recovering", "panic", recoveredPanic)
					// Using the named return values for update in @defer time
					code = http.StatusInternalServerError
					body = http.StatusText(code)
				}
			}()
			return svcFunc(req)
		}(req)

		// Single response
		res.Header().Set("content-type", "application/json")
		res.WriteHeader(code)
		json.NewEncoder(res).Encode(body)
	}
}

type doc = map[string]any

func GetBody(req *http.Request) doc {
	body, _ := req.Context().Value(oav.CtxKeyBody).(doc)
	return body
}

func GetParams(req *http.Request) doc {
	params, _ := req.Context().Value(oav.CtxKeyParams).(doc)
	return params
}

// Could be DRYer with reflect
var Handlers = map[string]http.HandlerFunc{

	"api.GetComposants":    GetComposants,
	"api.GetComposantsIds": GetComposantsIds,
	"api.PostComposant":    PostComposant,
	"api.GetOneComposant":  GetOneComposant,
	"api.DeleteComposant":  DeleteComposant,
	"api.PutComposant":     PutComposant,

	"api.GetMatieres":    GetMatieres,
	"api.GetMatieresIds": GetMatieresIds,
	"api.PostMatiere":    PostMatiere,
	"api.GetOneMatiere":  GetOneMatiere,
	"api.DeleteMatiere":  DeleteMatiere,
	"api.PutMatiere":     PutMatiere,

	"api.GetProcedes":    GetProcedes,
	"api.GetProcedesIds": GetProcedesIds,
	"api.PostProcede":    PostProcede,
	"api.GetOneProcede":  GetOneProcede,
	"api.DeleteProcede":  DeleteProcede,
	"api.PutProcede":     PutProcede,

	"api.GetProduits":    GetProduits,
	"api.GetProduitsIds": GetProduitsIds,
	"api.PostProduit":    PostProduit,
	"api.GetOneProduit":  GetOneProduit,
	"api.DeleteProduit":  DeleteProduit,
	"api.PutProduit":     PutProduit,

	"api.PostProduitImpact":      PostProduitImpact,
	"api.GetProduitPureMatieres": GetProduitPureMatieres,

	"api.GetProfile": GetProfile,
	"api.GetVersion": GetVersion,
}

// To select only our ID
var projId = bson.M{
	"id": 1,
}

// To select all fields expect the technical ones
var projPublic = bson.M{
	"_id": 0,
	//"id":   0,
	"orga": 0,
}

func filterId(idVal any, orga string) bson.M {
	return bson.M{
		"id":   idVal,
		"orga": orga,
	}
}

func listIDs(collec *mongo.Collection, orga string) ([]string, error) {

	idsDB, err := collec.Distinct(context.Background(), "id", filterId(bson.M{"$exists": true}, orga))
	if err != nil {
		slog.Error("Unable to retrieve from the DB", "error", err)
		return nil, err
	}

	IDs := models.Map(idsDB, func(id any) string { return id.(string) })
	return IDs, nil
}

func findOne[T any](collec *mongo.Collection, id, orga string, proj bson.M) (T, error) {
	var resource T

	filter := filterId(id, orga)
	result := collec.FindOne(
		context.Background(),
		filter,
		options.FindOne().SetProjection(proj),
	)
	err := result.Decode(&resource)
	return resource, err
}

func findMatching[T any](collec *mongo.Collection, orga string, filt, proj bson.M) ([]T, error) {

	filt["orga"] = orga // That explicit orga param makes it harder to mix the tenants resources by accident

	cur, err := collec.Find(context.Background(), filt, options.Find().SetProjection(proj))
	if err != nil {
		slog.Error("Unable to retrieve from the DB", "error", err)
		return nil, err
	}
	defer cur.Close(context.Background())

	result := []T{}

	for cur.Next(context.Background()) {
		var elem T

		err := cur.Decode(&elem)
		if err != nil {
			slog.Error("Unable to decode", "error", err)
			return nil, err
		}

		result = append(result, elem)
	}

	if err := cur.Err(); err != nil {
		slog.Error("Unable to read from the DB results", "error", err)
		return nil, err
	}

	return result, nil
}

func equalFloat(a, b float64) bool {
	return math.Abs(b-a) < 0.000001
}
