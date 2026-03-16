package health

import (
	"context"
	"net/http"
	"sprint-copilot/config"
	aiClient "sprint-copilot/internal/ai"
	jiraClient "sprint-copilot/internal/jira/service"
	redisClient "sprint-copilot/internal/redis"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	redisService *redisClient.Service
	jiraService  *jiraClient.Service
	aiService    *aiClient.Service
}

func NewHandler(redisService *redisClient.Service, jiraService *jiraClient.Service, aiService *aiClient.Service) *Handler {
	return &Handler{
		redisService: redisService,
		jiraService:  jiraService,
		aiService:    aiService,
	}
}

// @Summary Health check
// @Description Check if server, Redis, Jira, and OpenAI are accessible
// @Tags Health
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Failure 503 {object} map[string]interface{}
// @Router /health [get]
func (h *Handler) HealthHandler(c *gin.Context) {
	ctx := context.Background()

	response := gin.H{
		"message":     "Server is running at port " + config.AppConfig.Port,
		"environment": config.AppConfig.AppEnv,
		"services": gin.H{},
	}

	isHealthy := true

	//Redis
	redisClient, err := h.redisService.GetClient(ctx)
	if err != nil {
		response["services"].(gin.H)["redis"] = gin.H{
			"status": "unhealthy",
			"error":  err.Error(),
		}
		isHealthy = false
	} else {
		// Ping Redis
		_, err = redisClient.GetRedisClient().Ping(ctx).Result()
		if err != nil {
			response["services"].(gin.H)["redis"] = gin.H{
				"status": "unhealthy",
				"error":  err.Error(),
			}
			isHealthy = false
		} else {
			response["services"].(gin.H)["redis"] = gin.H{
				"status": "healthy",
			}
		}
	}

	//Jira
	_, err = h.jiraService.GetClient(ctx)
	if err != nil {
		response["services"].(gin.H)["jira"] = gin.H{
			"status": "unhealthy",
			"error":  err.Error(),
		}
		isHealthy = false
	} else {
		response["services"].(gin.H)["jira"] = gin.H{
			"status": "healthy",
		}
	}

	//OpenAI
	_, err = h.aiService.GetClient()
	if err != nil {
		response["services"].(gin.H)["openai"] = gin.H{
			"status": "unhealthy",
			"error":  err.Error(),
		}
		isHealthy = false
	} else {
		response["services"].(gin.H)["openai"] = gin.H{
			"status": "healthy",
		}
	}

	if !isHealthy {
		c.JSON(http.StatusServiceUnavailable, response)
		return
	}

	c.JSON(http.StatusOK, response)
}