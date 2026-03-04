package health

import (
	"net/http"
	"sprint-copilot/config"

	"github.com/gin-gonic/gin"
)

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