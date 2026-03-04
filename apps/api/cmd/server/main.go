package main

import (
	"sprint-copilot/config"

	"sprint-copilot/api/routes"

	"github.com/gin-gonic/gin"

	_ "sprint-copilot/docs"
)

func main() {

	config.LoadConfig()
	router:= gin.Default()
	routes.InitRoutes(router)

	router.Run(":"+config.AppConfig.Port)
}


