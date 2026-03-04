package routes

import (
	health "sprint-copilot/internal/health"
	oauth "sprint-copilot/internal/jira/oauth"

	"github.com/gin-gonic/gin"

	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

func InitRoutes(r *gin.Engine) {
	OauthRoutes(r)
	HealthRoutes(r)
	SwaggerRoutes(r)
}

func OauthRoutes(r *gin.Engine) {
	r.GET("/jira/oauth", oauth.Login)
	r.GET("/jira/callback", oauth.Callback)
}

func HealthRoutes(r *gin.Engine) {
	r.GET("/health", health.HealthHandler)
}

func SwaggerRoutes(r *gin.Engine){
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
}