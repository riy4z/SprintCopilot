package jira

import (
	"sprint-copilot/config"
	jira "sprint-copilot/internal/jira/service"

	"github.com/gin-gonic/gin"
)

// GetProjects godoc
// @Summary Get Jira Projects
// @Description Fetch all Jira projects from the connected Jira cloud instance
// @Tags Jira
// @Accept json
// @Produce json
// @Success 200 {object} interface{}
// @Failure 401 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /jira/projects [post]
func GetProjects(c *gin.Context) {

	client := jira.NewClient(
		config.JiraToken.AccessToken,
		config.CloudID,
	)

	projects, err := client.FetchProjects(c.Request.Context())
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, projects)
}