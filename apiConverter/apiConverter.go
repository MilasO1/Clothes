package main

import (
	"encoding/json"
	"log"
	"os"

	"gopkg.in/yaml.v3"
)

func main() {

	yfile, err := os.ReadFile("../server/openapi.yml")

	if err != nil {
		log.Fatal(err)
	}

	var data any

	err = yaml.Unmarshal(yfile, &data)

	if err != nil {
		log.Fatal(err)
	}

	jfile, err := os.OpenFile("../server/swagger-ui/openapi.json", os.O_TRUNC|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		log.Fatal(err)
	}

	enc := json.NewEncoder(jfile)
	enc.SetIndent("", "\t")
	enc.Encode(data)
}
