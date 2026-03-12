package jira

import (
	jira "sprint-copilot/internal/jira/service"
	"strconv"

	"github.com/gin-gonic/gin"
)

// Handler holds the Jira service for dependency injection
type Handler struct {
	service *jira.Service
}

// NewHandler creates a new Jira handler with the service
func NewHandler(service *jira.Service) *Handler {
	return &Handler{
		service: service,
	}
}

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
func (h *Handler) GetProjects(c *gin.Context) {
	client, err := h.service.GetClient(c.Request.Context())
	if err != nil {
		c.JSON(401, gin.H{"error": "not authenticated"})
		return
	}

	projects, err := client.FetchProjects(c.Request.Context())
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
func (h *Handler) GetBacklogs(c *gin.Context) {
	boardId := c.Param("boardId")
	boardIdInt, err := strconv.Atoi(boardId)
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid boardId"})
		return
	}

	client, err := h.service.GetClient(c.Request.Context())
	if err != nil {
		c.JSON(401, gin.H{"error": "not authenticated"})
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
func (h *Handler) GetSprints(c *gin.Context) {
	boardId := c.Param("boardId")
	boardIdInt, err := strconv.Atoi(boardId)
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid boardId"})
		return
	}

	client, err := h.service.GetClient(c.Request.Context())
	if err != nil {
		c.JSON(401, gin.H{"error": "not authenticated"})
		return
	}

	sprints, err := client.FetchSprints(c.Request.Context(), boardIdInt)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, sprints)
}


func (h *Handler) GetTeamMembers(c *gin.Context) {
	projectKey := c.Param("projectKey")

	client, err := h.service.GetClient(c.Request.Context())
	if err != nil {
		c.JSON(401, gin.H{"error": "not authenticated"})
		return
	}

	team, err := client.FetchTeamMembers(c.Request.Context(), projectKey)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, team)
}