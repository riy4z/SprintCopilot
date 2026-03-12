package ai

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
)

func (c *AIClient) Chat(ctx context.Context, prompt string) (any, error) {

	url := "https://api.openai.com/v1/responses"

	body := map[string]any{
		"model": "gpt-4o-mini",
		"input": prompt,
	}

	jsonBody, err := json.Marshal(body)
	if err != nil {
		return "", err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewBuffer(jsonBody))
	if err != nil {
		return "", err
	}

	req.Header.Set("Authorization", "Bearer "+c.apiKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	var result map[string]any

	err = json.NewDecoder(resp.Body).Decode(&result)
	if err != nil {
		return "", err
	}

	return result, nil
}