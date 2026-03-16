package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
	"golang.org/x/oauth2"
)

type Config struct {
	Port   string
	AppEnv string
	JiraClientId string
	JiraSecret string
	RedirectURL string
	OpenAIKey string
	RedisHost string
	RedisPort string
	RedisPassword string
	RedisDB string
}

var AppConfig Config
var JiraToken *oauth2.Token
var CloudID string

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
	AppConfig.OpenAIKey = os.Getenv("OPENAI_KEY")
	AppConfig.RedisHost = os.Getenv("REDIS_HOST")
	AppConfig.RedisPort = os.Getenv("REDIS_PORT")
	AppConfig.RedisPassword = os.Getenv("REDIS_PASSWORD")
	AppConfig.RedisDB = os.Getenv("REDIS_DB")
}