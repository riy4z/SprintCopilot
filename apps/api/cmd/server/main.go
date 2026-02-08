package main

import (
	"net/http"
	"sprint-copilot/config"

	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"

	_ "sprint-copilot/docs"
)

func main() {

	config.LoadConfig()
	router:= gin.Default()


	router.GET("/health", HealthHandler)

	router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	router.Run(":"+config.AppConfig.Port)
}

// @Summary Health check
// @Description Check if server is running
// @Tags Health
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Router /health [get]
func HealthHandler(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status":      "ok",
		"message":     "Server is running at port " + config.AppConfig.Port,
		"environment": config.AppConfig.AppEnv,
	})
}
