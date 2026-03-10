package routes

import (
	health "sprint-copilot/internal/health"
	jira "sprint-copilot/internal/jira"
	oauth "sprint-copilot/internal/jira/oauth"

	"github.com/gin-gonic/gin"

	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

func InitRoutes(r *gin.Engine) {
	OauthRoutes(r)
	HealthRoutes(r)
	SwaggerRoutes(r)
	jiraRoutes(r)
}

func OauthRoutes(r *gin.Engine) {
	r.GET("/jira/oauth", oauth.Login)
	r.GET("/jira/callback", oauth.Callback)
}

func jiraRoutes(r *gin.Engine){
	r.GET("/jira/projects", jira.GetProjects)
	r.GET("/jira/:boardId/backlogs", jira.GetBacklogs)
	r.GET("/jira/projects/:projectKey/team", jira.GetTeamMembers)
	r.GET("/jira/:boardId/sprints", jira.GetSprints)
	// r.POST("/jira/<projectKey>/team", oauth.Callback) 
	// r.POST("/jira/<projectKey>/dependency/", oauth.Callback)
	// r.POST("/jira/<projectKey>/<sprintId>/burndown", oauth.Callback)
}

// func AIRoutes(r *gin.Engine){
// 	r.POST("/ai/backlog/<projectKey>/health",oauth.Callback)
// 	r.POST("/ai/predict/storypoints", oauth.Callback)
// 	r.POST("/ai/autoassign", oauth.Callback)
// 	r.POST("/ai/retrospective/<projectKey>/<sprintId>", oauth.Callback)
// }

func HealthRoutes(r *gin.Engine) {
	r.GET("/health", health.HealthHandler)
}

func SwaggerRoutes(r *gin.Engine){
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
}