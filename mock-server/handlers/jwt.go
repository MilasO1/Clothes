package handlers

import (
	"bytes"
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"strings"
)

type Claims = map[string]string

var header = Claims{"alg": "HS256", "typ": "JWT"}

func encodeIdToken(user *User) string {

	claims := Claims{
		"sub":          user.id,
		"custom:orga":  user.orga,
		"custom:roles": strings.Join(user.roles, ","),
	}

	return encodeJwt(claims)
}

func sign(message, secret []byte) []byte {
	mac := hmac.New(sha256.New, secret)
	mac.Write(message)
	return mac.Sum(nil)
}

func generateRandomKey(length int) []byte {
	randStr := make([]byte, length)
	rand.Read(randStr)
	return randStr
}

var signKey = generateRandomKey(16)

func encodeJwt(claims Claims) string {

	headerB, _ := json.Marshal(header)
	payloadB, _ := json.Marshal(claims)

	var buff bytes.Buffer

	encoder := base64.NewEncoder(base64.RawURLEncoding, &buff)

	encoder.Write(headerB)
	buff.WriteString(".")
	encoder.Write(payloadB)
	encoder.Close() // Necessary for getting the bytes after

	signatureB := sign(buff.Bytes(), signKey)

	buff.WriteString(".")
	encoder.Write(signatureB)
	encoder.Close()

	//log.Println("key", base64.RawURLEncoding.EncodeToString(signKey), "   _____   ", buff.String())

	return buff.String()
}
