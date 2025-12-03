package db

import (
	"log/slog"
	"os"

	"golang.org/x/net/context"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var Composants *mongo.Collection
var Matieres *mongo.Collection
var Procedes *mongo.Collection
var Produits *mongo.Collection

func InitConnection() (func(), error) {

	//ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
	//defer cancel()

	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	dbName := os.Getenv("DB_NAME") // /"+dbName+"?sslmode=disable"

	if dbName == "" {
		dbName = "database"
	}

	client, err := mongo.Connect(context.Background(), options.Client().ApplyURI("mongodb://"+user+":"+password+"@"+dbName+":27017/app?authSource=admin"))
	if err != nil {
		slog.Error("Unable to connect to the DB", "error", err)
		return nil, err
	}

	closer := func() {
		err := client.Disconnect(context.Background())
		if err != nil {
			slog.Error("Unable to connect to the DB", "error", err)
		}
	}

	err = client.Ping(context.Background(), nil)
	if err != nil {
		return closer, err
	}

	slog.Info("Connected!")

	appDb := client.Database("app")

	Composants = appDb.Collection("composants")
	Matieres = appDb.Collection("matieres")
	Procedes = appDb.Collection("procedes")
	Produits = appDb.Collection("produits")

	return closer, nil
}
