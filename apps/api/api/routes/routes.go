package routes

import (
	ai "sprint-copilot/internal/ai"
	health "sprint-copilot/internal/health"
	jira "sprint-copilot/internal/jira"
	oauth "sprint-copilot/internal/jira/oauth"
	jiraService "sprint-copilot/internal/jira/service"
	redisClient "sprint-copilot/internal/redis"

	"github.com/gin-gonic/gin"

	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

func InitRoutes(r *gin.Engine, redisSvc *redisClient.Service, jiraSvc *jiraService.Service, aiSvc *ai.Service) {

	// Initialize handlers with the provided services
	jiraHandler := jira.NewHandler(jiraSvc)
	aiHandler := ai.NewHandler(aiSvc)
	healthHandler := health.NewHandler(redisSvc, jiraSvc, aiSvc)

	api := r.Group("/api/v1")

	OauthRoutes(r)
	HealthRoutes(r, healthHandler)
	SwaggerRoutes(r)
	jiraRoutes(api, jiraHandler)
	AIRoutes(r, aiHandler)
}

func OauthRoutes(r *gin.Engine) {
	r.GET("/jira/oauth", oauth.Login)
	r.GET("/jira/callback", oauth.Callback)
}

func jiraRoutes(r *gin.RouterGroup, handler *jira.Handler){
	r.GET("/jira/projects", handler.GetProjects)
	r.GET("/jira/:projectKey/backlogs", handler.GetBacklogs)
	r.GET("/jira/projects/:projectKey/team", handler.GetTeamMembers)
	r.GET("/jira/:projectKey/sprints", handler.GetSprints)
	r.GET("/jira/:projectKey/dependency-graph", handler.GetDependencyGraph)
	// r.POST("/jira/<projectKey>/team", oauth.Callback)
	// r.POST("/jira/<projectKey>/dependency/", oauth.Callback)
	// r.POST("/jira/<projectKey>/<sprintId>/burndown", oauth.Callback)
}

func AIRoutes(r *gin.Engine, handler *ai.Handler){
	r.POST("/ai/predict/storypoints", handler.PredictStoryPoints)
// 	r.POST("/ai/backlog/<projectKey>/health",oauth.Callback)
// 	r.POST("/ai/autoassign", oauth.Callback)
// 	r.POST("/ai/retrospective/<projectKey>/<sprintId>", oauth.Callback)
}

func HealthRoutes(r *gin.Engine, handler *health.Handler) {
	r.GET("/health", handler.HealthHandler)
}

func SwaggerRoutes(r *gin.Engine){
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
}