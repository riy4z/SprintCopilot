package jira

import (
	jira "sprint-copilot/internal/jira/service"
	"strconv"

	"sprint-copilot/internal/jira/oauth"

	"github.com/gin-gonic/gin"
)

// GetProjects godoc
// @Summary Get Jira Projects
// @Description Fetch all Jira projects from the connected Jira cloud instance
// @Tags Jira
// @Accept json
// @Produce json
// @Success 200 {array} jira.ProjectResponse "List of Jira projects"
// @Failure 401 {object} map[string]interface{} "Unauthorized"
// @Failure 500 {object} map[string]interface{} "Internal server error"
// @Router /jira/projects [get]
func GetProjects(c *gin.Context) {

	client, cloudID, err := oauth.GetOAuthClient(c.Request.Context())
	if err != nil {
		c.JSON(401, gin.H{"error": "not authenticated"})
		return
	}

	jiraClient := jira.NewClient(client,cloudID)

	projects, err := jiraClient.FetchProjects(c.Request.Context())
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, projects)
}

// GetBacklogs godoc
// @Summary Get Jira Backlog Issues
// @Description Fetch all backlog issues for a specific Jira board
// @Tags Jira
// @Accept json
// @Produce json
// @Param boardId path int true "Board ID" minimum(1)
// @Success 200 {array} jira.Ticket "List of backlog tickets"
// @Failure 400 {object} map[string]interface{} "Invalid board ID"
// @Failure 401 {object} map[string]interface{} "Unauthorized"
// @Failure 500 {object} map[string]interface{} "Internal server error"
// @Router /jira/backlogs/{boardId} [get]
func GetBacklogs(c *gin.Context) {

	httpClient, cloudID, err := oauth.GetOAuthClient(c.Request.Context())
	if err != nil {
		c.JSON(401, gin.H{"error": "not authenticated"})
		return
	}

	client := jira.NewClient(httpClient, cloudID)

	boardId := c.Param("boardId")
	boardIdInt, err := strconv.Atoi(boardId)
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid boardId"})
		return
	}

	backlogs, err := client.FetchBacklogs(c.Request.Context(), boardIdInt)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, backlogs)
}

// GetSprints godoc
// @Summary Get Sprints by Project
// @Description Fetch all Sprint under Jira projects from the connected Jira cloud instance
// @Tags Jira
// @Accept json
// @Produce json
// @Success 200 {array} jira.ProjectResponse "List of Jira projects"
// @Failure 401 {object} map[string]interface{} "Unauthorized"
// @Failure 500 {object} map[string]interface{} "Internal server error"
// @Router /jira/projects [get]
func GetSprints(c *gin.Context) {

	boardId := c.Param("boardId")
	boardIdInt, err := strconv.Atoi(boardId)

	client, cloudID, err := oauth.GetOAuthClient(c.Request.Context())
	if err != nil {
		c.JSON(401, gin.H{"error": "not authenticated"})
		return
	}

	jiraClient := jira.NewClient(client,cloudID)

	projects, err := jiraClient.FetchSprints(c.Request.Context(), boardIdInt)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, projects)
}


func GetTeamMembers(c *gin.Context) {
	projectKey := c.Param("projectKey")
	client, cloudID, err := oauth.GetOAuthClient(c.Request.Context())
		if err != nil {
		c.JSON(401, gin.H{"error": "not authenticated"})
		return
	}

	jiraClient := jira.NewClient(client, cloudID)
	team, err := jiraClient.FetchTeamMembers(c.Request.Context(), projectKey)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, team)
}