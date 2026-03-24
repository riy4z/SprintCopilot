package jira

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"time"
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

//Redis helper
func (c *Client) getFromCache(ctx context.Context, key string, target any) bool {
	if c.redis == nil {
		return false
	}

	redisClient, err := c.redis.GetClient(ctx)
	if err != nil {
		return false
	}

	cached, err := redisClient.Get(ctx, key)
	if err != nil {
		return false
	}

	return json.Unmarshal([]byte(cached), target) == nil
}

func (c *Client) saveToCache(ctx context.Context, key string, data any, ttl time.Duration) {
	if c.redis == nil {
		return
	}

	redisClient, err := c.redis.GetClient(ctx)
	if err != nil {
		return
	}

	marshaled, err := json.Marshal(data)
	if err != nil {
		return
	}

	redisClient.Set(ctx, key, marshaled, ttl)
}


// Fetch all closed sprints with their issues
func (c *Client) calculateSprintVelocities(ctx context.Context, projectKey string) ([]sprintVelocity, map[string][]memberSprintVelocity, error) {
	jql := fmt.Sprintf("project=%s AND sprint in closedSprints() ORDER BY sprint DESC", projectKey)
	fields := "assignee,customfield_10016,customfield_10020,status"

	path := fmt.Sprintf(
		"/rest/api/3/search/jql?jql=%s&maxResults=500&fields=%s",
		url.QueryEscape(jql),
		url.QueryEscape(fields),
	)
	endpoint := c.buildJiraURL(path)

	req, err := c.newAuthenticatedRequest(ctx, http.MethodGet, endpoint)
	if err != nil {
		return nil, nil, err
	}

	var result struct {
		Issues []struct {
			Fields struct {
				Assignee *struct {
					AccountID string `json:"accountId"`
				} `json:"assignee"`
				CustomField_10016 *float64         `json:"customfield_10016"` // Story points
				CustomField_10020 []map[string]any `json:"customfield_10020"` // Sprint field
				Status            struct {
					StatusCategory struct {
						Key string `json:"key"`
					} `json:"statusCategory"`
				} `json:"status"`
			} `json:"fields"`
		} `json:"issues"`
	}

	if err := c.executeRequest(req, &result); err != nil {
		return nil, nil, err
	}

	sprintVelocityMap := make(map[string]*sprintVelocity)
	memberSprintMap := make(map[string]map[string]int) 

	for _, issue := range result.Issues {
		if issue.Fields.Status.StatusCategory.Key != "done" {
			continue
		}

		storyPoints := 0
		if issue.Fields.CustomField_10016 != nil {
			storyPoints = int(*issue.Fields.CustomField_10016)
		}

		if len(issue.Fields.CustomField_10020) > 0 {
			for _, sprintData := range issue.Fields.CustomField_10020 {
				sprintID := fmt.Sprintf("%v", sprintData["id"])
				sprintName := fmt.Sprintf("%v", sprintData["name"])

				if state, ok := sprintData["state"].(string); !ok || state != "closed" {
					continue
				}

				if _, exists := sprintVelocityMap[sprintID]; !exists {
					sprintVelocityMap[sprintID] = &sprintVelocity{
						SprintID:   sprintID,
						SprintName: sprintName,
						Velocity:   0,
					}
				}
				sprintVelocityMap[sprintID].Velocity += storyPoints

				if issue.Fields.Assignee != nil {
					userId := issue.Fields.Assignee.AccountID
					if _, exists := memberSprintMap[userId]; !exists {
						memberSprintMap[userId] = make(map[string]int)
					}
					memberSprintMap[userId][sprintID] += storyPoints
				}
			}
		}
	}

	var sprintVelocities []sprintVelocity
	for _, sv := range sprintVelocityMap {
		sprintVelocities = append(sprintVelocities, *sv)
	}

	memberSprintVelocities := make(map[string][]memberSprintVelocity)
	for userId, sprintMap := range memberSprintMap {
		for sprintID, points := range sprintMap {
			if sv, exists := sprintVelocityMap[sprintID]; exists {
				memberSprintVelocities[userId] = append(memberSprintVelocities[userId], memberSprintVelocity{
					SprintID:   sprintID,
					SprintName: sv.SprintName,
					Velocity:   points,
				})
			}
		}
	}

	return sprintVelocities, memberSprintVelocities, nil
}
