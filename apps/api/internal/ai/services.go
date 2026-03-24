package ai

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"
)


func (c *AIClient) PredictStoryPoints(ctx context.Context, tickets []TicketItem) ([]StoryPointPrediction, error) {
	systemPromptBytes, err := os.ReadFile("internal/ai/prompts/predictStoryPoints.md")
	if err != nil {
		return nil, fmt.Errorf("failed to read system prompt: %w", err)
	}
	systemPrompt := string(systemPromptBytes)

	var ticketList strings.Builder
	for _, ticket := range tickets {
		fmt.Fprintf(&ticketList, "- %s: %s\n", ticket.JiraId, ticket.Description)
	}

	userPrompt := fmt.Sprintf("Analyze these Jira tickets and predict story points based on complexity for each:\n%s\nReturn ONLY a valid JSON array with predictions. No explanations, no markdown, just the JSON array.", ticketList.String())

	url := "https://api.openai.com/v1/chat/completions"

	body := map[string]any{
		"model": "gpt-4o-mini",
		"messages": []map[string]string{
			{
				"role":    "system",
				"content": systemPrompt,
			},
			{
				"role":    "user",
				"content": userPrompt,
			},
		},
		"temperature": 0.3,
	}

	jsonBody, err := json.Marshal(body)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewBuffer(jsonBody))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+c.apiKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to call OpenAI API: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		var errorResult map[string]any
		json.NewDecoder(resp.Body).Decode(&errorResult)
		return nil, fmt.Errorf("OpenAI API error (status %d): %v", resp.StatusCode, errorResult)
	}

	var result OpenAIResponse

	err = json.NewDecoder(resp.Body).Decode(&result)
	if err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	if len(result.Choices) == 0 {
		return nil, fmt.Errorf("no response from OpenAI")
	}

	content := strings.TrimSpace(result.Choices[0].Message.Content)

	content = strings.TrimPrefix(content, "```json")
	content = strings.TrimPrefix(content, "```")
	content = strings.TrimSuffix(content, "```")
	content = strings.TrimSpace(content)

	var predictions []StoryPointPrediction
	err = json.Unmarshal([]byte(content), &predictions)
	if err != nil {
		return nil, fmt.Errorf("failed to parse predictions: %w, content: %s", err, content)
	}

	return predictions, nil
}