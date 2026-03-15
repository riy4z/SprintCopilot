package main

import (
	"sprint-copilot/config"
	"time"

	"sprint-copilot/api/routes"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	_ "sprint-copilot/docs"
)

func main() {

	config.LoadConfig()
	router:= gin.Default()
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge: 12 * time.Hour,
	}))
	routes.InitRoutes(router)

	router.Run(":"+config.AppConfig.Port)
}


