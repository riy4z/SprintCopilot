package jira

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
)

//constructs a Jira API URL with the given cloudID and path
func (c *Client) buildJiraURL(path string) string {
	return fmt.Sprintf("https://api.atlassian.com/ex/jira/%s%s", c.cloudID, path)
}

//creates http request with authentication and standard headers
func (c *Client) newAuthenticatedRequest(ctx context.Context, method, url string) (*http.Request, error) {
	req, err := http.NewRequestWithContext(ctx, method, url, nil)
	if err != nil {
		return nil, err
	}

	if c.token != "" {
		req.Header.Set("Authorization", "Bearer "+c.token)
	}
	req.Header.Set("Accept", "application/json")

	return req, nil
}

//executes an http request and decodes the JSON response
func (c *Client) executeRequest(req *http.Request, target any) error {
	resp, err := c.httpClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("jira API returned status %d: %s", resp.StatusCode, resp.Status)
	}

	return json.NewDecoder(resp.Body).Decode(target)
}

// ExtractDescription extracts plain text from Jira's ADF (Atlassian Document Format) description
func ExtractDescription(desc *JiraDescription) string {
	if desc == nil {
		return ""
	}

	var text strings.Builder

	for _, block := range desc.Content {
		for _, c := range block.Content {
			text.WriteString(c.Text)
			text.WriteString(" ")
		}
	}

	return strings.TrimSpace(text.String())
}


func DetectCycles(graph map[string][]string) map[string]bool {
	cycleNodes := make(map[string]bool)
	visited := make(map[string]bool)
	recStack := make(map[string]bool)

	var dfs func(string) bool
	dfs = func(node string) bool {
		visited[node] = true
		recStack[node] = true

		for _, neighbor := range graph[node] {
			if !visited[neighbor] {
				if dfs(neighbor) {
					cycleNodes[node] = true
					return true
				}
			} else if recStack[neighbor] {
				// Found a cycle
				cycleNodes[node] = true
				cycleNodes[neighbor] = true
				return true
			}
		}

		recStack[node] = false
		return false
	}

	for node := range graph {
		if !visited[node] {
			dfs(node)
		}
	}

	return cycleNodes
}

//for debugging
func PrintJSON(v any) {
	b, _ := json.MarshalIndent(v, "", "  ")
	fmt.Println(string(b))
}
