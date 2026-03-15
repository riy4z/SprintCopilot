package jira

import (
	jira "sprint-copilot/internal/jira/service"

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

	c.JSON(200, gin.H{"projects":projects})
}

// GetBacklogs godoc
// @Summary Get Jira Backlog Issues
// @Description Fetch all backlog issues (unassigned to sprints) for a specific Jira project
// @Tags Jira
// @Accept json
// @Produce json
// @Param projectKey path string true "Project Key" example("SCO")
// @Success 200 {object} map[string]interface{} "Backlog tickets with metadata"
// @Failure 400 {object} map[string]interface{} "Invalid project key"
// @Failure 401 {object} map[string]interface{} "Unauthorized"
// @Failure 500 {object} map[string]interface{} "Internal server error"
// @Router /jira/{projectKey}/backlogs [get]
func (h *Handler) GetBacklogs(c *gin.Context) {
	projectKey := c.Param("projectKey")

	client, err := h.service.GetClient(c.Request.Context())
	if err != nil {
		c.JSON(401, gin.H{"error": "not authenticated"})
		return
	}

	backlogs, err := client.FetchBacklogs(c.Request.Context(), projectKey)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, gin.H{
	"projectKey": "SCO",
	"totalTickets": 63,
	"totalStoryPoints": 3,
		"tickets": backlogs})
}

// GetSprints godoc
// @Summary Get Sprints by Project
// @Description Fetch all sprints for a specific Jira project using JQL search
// @Tags Jira
// @Accept json
// @Produce json
// @Param projectKey path string true "Project Key" example("SCO")
// @Success 200 {array} map[string]interface{} "List of sprint data"
// @Failure 400 {object} map[string]interface{} "Invalid project key"
// @Failure 401 {object} map[string]interface{} "Unauthorized"
// @Failure 500 {object} map[string]interface{} "Internal server error"
// @Router /jira/{projectKey}/sprints [get]
func (h *Handler) GetSprints(c *gin.Context) {
	projectKey := c.Param("projectKey")

	client, err := h.service.GetClient(c.Request.Context())
	if err != nil {
		c.JSON(401, gin.H{"error": "not authenticated"})
		return
	}

	sprints, err := client.FetchSprints(c.Request.Context(), projectKey)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, sprints)
}


// GetTeamMembers godoc
// @Summary Get Team Members by Project
// @Description Fetch all assignable team members for a specific Jira project
// @Tags Jira
// @Accept json
// @Produce json
// @Param projectKey path string true "Project Key" example("SCO")
// @Success 200 {object} jira.ProjectTeamResponse "Project team members with velocity data"
// @Failure 400 {object} map[string]interface{} "Invalid project key"
// @Failure 401 {object} map[string]interface{} "Unauthorized"
// @Failure 500 {object} map[string]interface{} "Internal server error"
// @Router /jira/projects/{projectKey}/team [get]
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

// GetDependencyGraph godoc
// @Summary Get Dependency Graph for Project Backlog
// @Description Fetch dependency graph with nodes and edges for backlog issues, including cycle detection
// @Tags Jira
// @Accept json
// @Produce json
// @Param projectKey path string true "Project Key" example("SCO")
// @Success 200 {object} jira.DependencyGraphData "Dependency graph with nodes and edges"
// @Failure 400 {object} map[string]interface{} "Invalid project key"
// @Failure 401 {object} map[string]interface{} "Unauthorized"
// @Failure 500 {object} map[string]interface{} "Internal server error"
// @Router /jira/{projectKey}/dependency-graph [get]
func (h *Handler) GetDependencyGraph(c *gin.Context) {
	projectKey := c.Param("projectKey")

	client, err := h.service.GetClient(c.Request.Context())
	if err != nil {
		c.JSON(401, gin.H{"error": "not authenticated"})
		return
	}

	graph, err := client.FetchDependencyGraph(c.Request.Context(), projectKey)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, graph)
}