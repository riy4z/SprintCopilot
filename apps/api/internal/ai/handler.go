package ai

import (
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

func (h *Handler) SendPrompt(c *gin.Context) {
	client, err := h.service.GetClient()
	if err != nil {
		c.JSON(500, gin.H{"error": "AI service not configured"})
		return
	}

	chat, err := client.Chat(c.Request.Context(), "Tell me a story")
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, chat)
}