package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port   string
	AppEnv string
}

var AppConfig Config

func LoadConfig() {
	err:= godotenv.Load()
	if err != nil {
		log.Println("Environment Variables not found")
	}
	AppConfig.Port = os.Getenv("PORT")
	AppConfig.AppEnv = os.Getenv("APP_ENV")
}