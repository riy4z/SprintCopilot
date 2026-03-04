package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port   string
	AppEnv string
	JiraClientId string
	JiraSecret string
	RedirectURL string
}

var AppConfig Config

func LoadConfig() {
	err:= godotenv.Load()
	if err != nil {
		log.Println("Environment Variables not found")
	}
	AppConfig.Port = os.Getenv("PORT")
	AppConfig.AppEnv = os.Getenv("APP_ENV")
	AppConfig.JiraClientId = os.Getenv("JIRA_CLIENT_ID")
	AppConfig.JiraSecret = os.Getenv("JIRA_SECRET")
	AppConfig.RedirectURL = os.Getenv("OAUTH_REDIRECT_URL")
}