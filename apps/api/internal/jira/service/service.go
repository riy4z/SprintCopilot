package jira

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
)




func (c *Client) FetchProjects(ctx context.Context) ([]ProjectResponse, error) {

	url := fmt.Sprintf(
		"https://api.atlassian.com/ex/jira/%s/rest/api/3/project",
		c.cloudID,
	)

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, err
	}

	// Authorization header is automatically handled by oauth2.NewClient when using OAuth2
	// For direct token usage, we need to set it manually
	if c.token != "" {
		req.Header.Set("Authorization", "Bearer "+c.token)
	}
	req.Header.Set("Accept", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, err
	}

	defer resp.Body.Close()

	var jiraProjects []JiraProject

	err = json.NewDecoder(resp.Body).Decode(&jiraProjects)
	if err != nil {
		return nil, err
	}

	var projects []ProjectResponse

	for _, p := range jiraProjects {

		project := ProjectResponse{
			ID:   p.ID,
			Key:  p.Key,
			Name: p.Name,

			Avatar:          p.AvatarUrls["48x48"],
			AvatarUrls:      p.AvatarUrls,
			ProjectCategory: ProjectCategory(p.ProjectCategory),

			TeamSize:    0,
			Velocity:    0,
			Category:    nil,
			SprintGraph: []SprintData{},
		}

		projects = append(projects, project)
	}

	return projects, nil
}

func (c *Client) FetchBacklogs(ctx context.Context, boardId int) ([]Ticket, error) {

	url := fmt.Sprintf(
		"https://api.atlassian.com/ex/jira/%s/rest/agile/1.0/board/%d/backlog",
		c.cloudID,
		boardId,
	)

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)

	if err != nil {
		return nil, err
	}

	// Authorization header is automatically handled by oauth2.NewClient when using OAuth2
	// For direct token usage, we need to set it manually
	if c.token != "" {
		req.Header.Set("Authorization", "Bearer "+c.token)
	}
	req.Header.Set("Accept", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, err
	}

	defer resp.Body.Close()

	// Check for HTTP errors
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("jira API returned status %d: %s", resp.StatusCode, resp.Status)
	}

	var result struct {
		Issues []struct {
			ID     string `json:"id"`
			Key    string `json:"key"`
			Fields struct {
				Summary     string `json:"summary"`
				Status      struct{ Name string `json:"name"` } `json:"status"`
				Priority    struct{ Name string `json:"name"` } `json:"priority"`
				IssueType   struct{ Name string `json:"name"` } `json:"issuetype"`
				Assignee    *struct {
					AccountID   string            `json:"accountId"`
					DisplayName string            `json:"displayName"`
					AvatarUrls  map[string]string `json:"avatarUrls"`
				} `json:"assignee"`
				Reporter struct {
					DisplayName string `json:"displayName"`
				} `json:"reporter"`
				Created           string   `json:"created"`
				Updated           string   `json:"updated"`
				Labels            []string `json:"labels"`
				CustomField_10016 *float64 `json:"customfield_10016"`
				Parent            *struct{ Key string `json:"key"` } `json:"parent,omitempty"`
			} `json:"fields"`
		} `json:"issues"`
	}

	err = json.NewDecoder(resp.Body).Decode(&result)
	if err != nil {
		return nil, err
	}

	var tickets []Ticket
	for _, issue := range result.Issues {
		ticket := Ticket{
			ID:          issue.ID,
			Key:         issue.Key,
			Summary:     issue.Fields.Summary,
			Status:      issue.Fields.Status.Name,
			Priority:    Priority(issue.Fields.Priority.Name),
			Type:        TicketType(issue.Fields.IssueType.Name),
			Reporter:    issue.Fields.Reporter.DisplayName,
			Labels:      issue.Fields.Labels,
			CreatedDate: issue.Fields.Created,
			UpdatedDate: issue.Fields.Updated,
		}

		if issue.Fields.Assignee != nil {
			ticket.Assignee = &issue.Fields.Assignee.AccountID
			ticket.AssigneeName = &issue.Fields.Assignee.DisplayName
			if avatarURL, exists := issue.Fields.Assignee.AvatarUrls["48x48"]; exists {
				ticket.AssigneeAvatar = &avatarURL
			}
		}

		if issue.Fields.CustomField_10016 != nil {
			ticket.StoryPoints = int(*issue.Fields.CustomField_10016)
		}

		if issue.Fields.Parent != nil {
			ticket.ParentIssueKey = &issue.Fields.Parent.Key
		}

		tickets = append(tickets, ticket)
	}

	return tickets, nil
}