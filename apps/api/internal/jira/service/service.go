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

	req.Header.Set("Authorization", "Bearer "+c.token)
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