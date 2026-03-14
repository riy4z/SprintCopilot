package ai

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{
		service: service,
	}
}


func (h *Handler) PredictStoryPoints(c *gin.Context) {
	var req PredictStoryPointsRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body", "details": err.Error()})
		return
	}

	if len(req.Tickets) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "At least one ticket is required"})
		return
	}

	client, err := h.service.GetClient()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "AI service not configured"})
		return
	}

	predictions, err := client.PredictStoryPoints(c.Request.Context(), req.Tickets)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to predict story points", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"predictions": predictions,
	})
}