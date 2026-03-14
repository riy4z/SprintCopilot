package routes

import (
	ai "sprint-copilot/internal/ai"
	health "sprint-copilot/internal/health"
	jira "sprint-copilot/internal/jira"
	oauth "sprint-copilot/internal/jira/oauth"
	jiraService "sprint-copilot/internal/jira/service"

	"github.com/gin-gonic/gin"

	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

func InitRoutes(r *gin.Engine) {
	// Initialize Jira service
	jiraSvc := jiraService.NewService(oauth.GetOAuthClient)
	jiraHandler := jira.NewHandler(jiraSvc)

	// Initialize OpenAI service
	aiSvc, _ := ai.NewService()
	aiHandler := ai.NewHandler(aiSvc)

	OauthRoutes(r)
	HealthRoutes(r)
	SwaggerRoutes(r)
	jiraRoutes(r, jiraHandler)
	AIRoutes(r, aiHandler)
}

func OauthRoutes(r *gin.Engine) {
	r.GET("/jira/oauth", oauth.Login)
	r.GET("/jira/callback", oauth.Callback)
}

func jiraRoutes(r *gin.Engine, handler *jira.Handler){
	r.GET("/jira/projects", handler.GetProjects)
	r.GET("/jira/:boardId/backlogs", handler.GetBacklogs)
	r.GET("/jira/projects/:projectKey/team", handler.GetTeamMembers)
	r.GET("/jira/:boardId/sprints", handler.GetSprints)
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

func HealthRoutes(r *gin.Engine) {
	r.GET("/health", health.HealthHandler)
}

func SwaggerRoutes(r *gin.Engine){
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
}