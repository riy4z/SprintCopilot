package ai

type OpenAIResponse struct {
	Choices []struct {
		Message struct {
			Content string `json:"content"`
		} `json:"message"`
	} `json:"choices"`
}

type TicketItem struct {
	JiraId      string `json:"jiraId"`
	Description string `json:"jiraDescription"`
}

type PredictStoryPointsRequest struct {
	Tickets []TicketItem `json:"tickets" binding:"required"`
}

type StoryPointPrediction struct {
	JiraId      string `json:"jiraId"`
	StoryPoints int    `json:"storyPoints"`
}
