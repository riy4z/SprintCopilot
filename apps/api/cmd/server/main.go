package main

import (
	"log"
	"sprint-copilot/config"
	"time"

	"sprint-copilot/api/routes"
	ai "sprint-copilot/internal/ai"
	oauth "sprint-copilot/internal/jira/oauth"
	jiraService "sprint-copilot/internal/jira/service"
	redisClient "sprint-copilot/internal/redis"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	_ "sprint-copilot/docs"
)

func main() {

	config.LoadConfig()

	// Initialize services
	redisSvc := redisClient.NewService()
	log.Println("Redis service initialized")

	jiraSvc := jiraService.NewService(oauth.GetOAuthClient, redisSvc)
	log.Println("Jira service initialized")

	aiSvc, err := ai.NewService(redisSvc)
	if err != nil {
		log.Printf("Warning: AI service initialization failed: %v", err)
	} else {
		log.Println("AI service initialized")
	}

	router:= gin.Default()
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge: 12 * time.Hour,
	}))

	routes.InitRoutes(router, redisSvc, jiraSvc, aiSvc)

	router.Run(":"+config.AppConfig.Port)
}


