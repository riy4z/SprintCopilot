package jira

import (
	"context"
	"fmt"
	"net/http"
	"net/url"
	"time"
)


func (c *Client) FetchProjects(ctx context.Context) ([]ProjectResponse, error) {
	cacheKey := fmt.Sprintf("jira:projects:%s", c.cloudID)

	// Cache hit
	var projects []ProjectResponse
	if c.getFromCache(ctx, cacheKey, &projects) {
		return projects, nil
	}
	
	//Cache miss
	url := c.buildJiraURL("/rest/api/3/project")

	req, err := c.newAuthenticatedRequest(ctx, http.MethodGet, url)
	if err != nil {
		return nil, err
	}

	var jiraProjects []JiraProject
	if err := c.executeRequest(req, &jiraProjects); err != nil {
		return nil, err
	}

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

	c.saveToCache(ctx, cacheKey, projects, 5*time.Minute)

	return projects, nil
}

func (c *Client) FetchBacklogs(ctx context.Context, projectKey string) ([]Ticket, error) {
	cacheKey := "jira:" + c.cloudID + ":" + projectKey + ":backlogs"

	// Cache-hit
	var tickets []Ticket
	if c.getFromCache(ctx, cacheKey, &tickets) {
		return tickets, nil
	}

	// Cache-miss
	jql := fmt.Sprintf("project=%s AND sprint IS EMPTY ORDER BY created DESC", projectKey)
	fields := "summary,status,priority,description,issuetype,assignee,reporter,labels,created,updated,customfield_10016,parent"

	path := fmt.Sprintf(
		"/rest/api/3/search/jql?jql=%s&maxResults=100&fields=%s",
		url.QueryEscape(jql),
		url.QueryEscape(fields),
	)
	endpoint := c.buildJiraURL(path)

	req, err := c.newAuthenticatedRequest(ctx, http.MethodGet, endpoint)
	if err != nil {
		return nil, err
	}

	var result struct {
		Issues []struct {
			ID  string `json:"id"`
			Key string `json:"key"`

			Fields struct {

				Summary     string           `json:"summary"`
				Description *JiraDescription `json:"description"`

				Status struct {
					Name string `json:"name"`
				} `json:"status"`

				Priority struct {
					Name string `json:"name"`
				} `json:"priority"`

				IssueType struct {
					Name string `json:"name"`
				} `json:"issuetype"`

				Assignee *struct {
					AccountID   string            `json:"accountId"`
					DisplayName string            `json:"displayName"`
					AvatarUrls  map[string]string `json:"avatarUrls"`
				} `json:"assignee"`

				Reporter struct {
					DisplayName string `json:"displayName"`
				} `json:"reporter"`

				Created string `json:"created"`
				Updated string `json:"updated"`

				Labels []string `json:"labels"`

				CustomField_10016 *float64 `json:"customfield_10016"`

				Parent *struct {
					Key string `json:"key"`
				} `json:"parent,omitempty"`
			} `json:"fields"`
		} `json:"issues"`
	}

	if err := c.executeRequest(req, &result); err != nil {
		return nil, err
	}

	for _, issue := range result.Issues {
		ticket := Ticket{
			ID:          issue.ID,
			Key:         issue.Key,
			Summary:     issue.Fields.Summary,
			Description: ExtractDescription(issue.Fields.Description),
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

			if avatar, ok := issue.Fields.Assignee.AvatarUrls["48x48"]; ok {
				ticket.AssigneeAvatar = &avatar
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

	c.saveToCache(ctx, cacheKey, tickets, 5*time.Minute)

	return tickets, nil
}

func (c *Client) FetchSprints(ctx context.Context, projectKey string) ([]map[string]any, error) {
	cacheKey := "jira:" + c.cloudID + ":" + projectKey + ":sprints"

	// Cache-hit
	var sprints []map[string]any
	if c.getFromCache(ctx, cacheKey, &sprints) {
		return sprints, nil
	}

	//Cache-miss
	jql := fmt.Sprintf("project=%s AND sprint is not EMPTY ORDER BY sprint DESC, created DESC", projectKey)

	path := fmt.Sprintf(
		"/rest/api/3/search/jql?jql=%s&maxResults=1000&fields=summary,status,sprint,customfield_10020",
		url.QueryEscape(jql),
	)
	endpoint := c.buildJiraURL(path)

	req, err := c.newAuthenticatedRequest(ctx, http.MethodGet, endpoint)
	if err != nil {
		return nil, err
	}

	var result struct {
		Issues []struct {
			ID     string         `json:"id"`
			Key    string         `json:"key"`
			Fields map[string]any `json:"fields"`
		} `json:"issues"`
	}

	if err := c.executeRequest(req, &result); err != nil {
		return nil, err
	}

	sprintMap := make(map[string]map[string]any)

	for _, issue := range result.Issues {
		// customfield_10020 -> sprint field
		if sprintField, ok := issue.Fields["customfield_10020"].([]any); ok {
			for _, s := range sprintField {
				if sprintData, ok := s.(map[string]any); ok {
					sprintID := fmt.Sprintf("%v", sprintData["id"])
					if _, exists := sprintMap[sprintID]; !exists {
						sprintMap[sprintID] = sprintData
					}
				}
			}
		}
	}

	sprints = make([]map[string]any, 0, len(sprintMap))
	for _, sprint := range sprintMap {
		sprints = append(sprints, sprint)
	}

	// Save to cache
	c.saveToCache(ctx, cacheKey, sprints, 5*time.Minute)

	return sprints, nil
}

func (c *Client) FetchTeamMembers(ctx context.Context, projectKey string) (*ProjectTeamResponse, error) {
	cacheKey := "jira:" + c.cloudID + ":" + projectKey + ":team"

	// Cache-hit
	var response ProjectTeamResponse
	if c.getFromCache(ctx, cacheKey, &response) {
		return &response, nil
	}

	//Cache-miss
	path := fmt.Sprintf("/rest/api/3/user/assignable/search?project=%s", projectKey)
	url := c.buildJiraURL(path)

	req, err := c.newAuthenticatedRequest(ctx, http.MethodGet, url)
	if err != nil {
		return nil, err
	}

	var users []map[string]any
	if err := c.executeRequest(req, &users); err != nil {
		return nil, err
	}


	sprintVelocities, memberSprintVelocities, err := c.calculateSprintVelocities(ctx, projectKey)
	if err != nil {
		return nil, err
	}

	var totalVelocity int
	sprintCount := len(sprintVelocities)
	for _, v := range sprintVelocities {
		totalVelocity += v.Velocity
	}

	averageVelocity := int8(0)
	if sprintCount > 0 {
		averageVelocity = int8(totalVelocity / sprintCount)
	}

	response.ProjectKey = projectKey
	response.Velocity = averageVelocity

	for _, u := range users {
		userId := u["accountId"].(string)

		member := TeamMember{
			UserId:        userId,
			Name:          u["displayName"].(string),
			Velocity:      0,
			SprintHistory: []map[string]any{},
		}

		if email, ok := u["emailAddress"].(string); ok {
			member.Email = email
		}

		if avatar, ok := u["avatarUrls"].(map[string]any); ok {
			if url, ok := avatar["24x24"].(string); ok {
				member.AvatarUrl = url
			}
		}

		if memberVelocities, exists := memberSprintVelocities[userId]; exists {
			for _, sprintVel := range memberVelocities {
				member.SprintHistory = append(member.SprintHistory, map[string]any{
					"sprintId":   sprintVel.SprintID,
					"sprintName": sprintVel.SprintName,
					"velocity":   sprintVel.Velocity,
				})
			}

			var totalMemberVelocity int
			for _, v := range memberVelocities {
				totalMemberVelocity += v.Velocity
			}
			if len(memberVelocities) > 0 {
				member.Velocity = int8(totalMemberVelocity / len(memberVelocities))
			}
		}

		response.TeamMembers = append(response.TeamMembers, member)
	}

	c.saveToCache(ctx, cacheKey, &response, 5*time.Minute)

	return &response, nil
}

func (c *Client) FetchDependencyGraph(ctx context.Context, projectKey string) (*DependencyGraphData, error) {
	cacheKey := "jira:" + c.cloudID + ":" + projectKey + ":dependencyGraph"

	// Cache-hit
	var response DependencyGraphData
	if c.getFromCache(ctx, cacheKey, &response) {
		return &response, nil
	}

	//Cache Miss
	jql := fmt.Sprintf("project=%s AND sprint IS EMPTY ORDER BY created DESC", projectKey)

	fields := "summary,status,priority,assignee,issuelinks"
	path := fmt.Sprintf(
		"/rest/api/3/search/jql?jql=%s&maxResults=100&fields=%s",
		url.QueryEscape(jql),
		url.QueryEscape(fields),
	)
	endpoint := c.buildJiraURL(path)

	req, err := c.newAuthenticatedRequest(ctx, http.MethodGet, endpoint)
	if err != nil {
		return nil, err
	}

	var result struct {
		Issues []struct {
			ID  string `json:"id"`
			Key string `json:"key"`

			Fields struct {
				Summary string `json:"summary"`

				Priority struct {
					Name string `json:"name"`
				} `json:"priority"`

				Assignee *struct {
					DisplayName string `json:"displayName"`
				} `json:"assignee"`

				IssueLinks []struct {
					Type struct {
						Name    string `json:"name"`
						Inward  string `json:"inward"`
						Outward string `json:"outward"`
					} `json:"type"`
					InwardIssue *struct {
						Key string `json:"key"`
					} `json:"inwardIssue,omitempty"`
					OutwardIssue *struct {
						Key string `json:"key"`
					} `json:"outwardIssue,omitempty"`
				} `json:"issuelinks"`
			} `json:"fields"`
		} `json:"issues"`
	}

	if err := c.executeRequest(req, &result); err != nil {
		return nil, err
	}


	nodesMap := make(map[string]*DependencyNode)
	var edges []DependencyEdge
	blockedByMap := make(map[string][]string)  
	blocksMap := make(map[string][]string)     

	for _, issue := range result.Issues {
		var assignee *string
		if issue.Fields.Assignee != nil {
			assignee = &issue.Fields.Assignee.DisplayName
		}

		node := &DependencyNode{
			ID:           issue.Key,
			Summary:      issue.Fields.Summary,
			Assignee:     assignee,
			Priority:     issue.Fields.Priority.Name,
			IsBlocked:    false,
			IsBlocker:    false,
			IsInCycle:    false,
			IsSprintSafe: true,
		}

		nodesMap[issue.Key] = node


		for _, link := range issue.Fields.IssueLinks {
			linkType := link.Type.Name

			if link.OutwardIssue != nil {
				targetKey := link.OutwardIssue.Key


				if link.Type.Outward == "blocks" || linkType == "Blocks" {
					edges = append(edges, DependencyEdge{
						From:  issue.Key,
						To:    targetKey,
						Type:  "blocks",
						Label: link.Type.Outward,
					})

					blocksMap[issue.Key] = append(blocksMap[issue.Key], targetKey)
					blockedByMap[targetKey] = append(blockedByMap[targetKey], issue.Key)
				}
			}


			if link.InwardIssue != nil {
				targetKey := link.InwardIssue.Key

				if link.Type.Inward == "is blocked by" || linkType == "Blocks" {
					edges = append(edges, DependencyEdge{
						From:  targetKey,
						To:    issue.Key,
						Type:  "blocks",
						Label: "blocks",
					})

					blocksMap[targetKey] = append(blocksMap[targetKey], issue.Key)
					blockedByMap[issue.Key] = append(blockedByMap[issue.Key], targetKey)
				}
			}
		}
	}


	cycleNodes := DetectCycles(blocksMap)


	for key, node := range nodesMap {
		if len(blockedByMap[key]) > 0 {
			node.IsBlocked = true
		}
		if len(blocksMap[key]) > 0 {
			node.IsBlocker = true
		}
		if _, inCycle := cycleNodes[key]; inCycle {
			node.IsInCycle = true
			node.IsSprintSafe = false
		} else if node.IsBlocked {
			node.IsSprintSafe = true
			for _, blockerKey := range blockedByMap[key] {
				if _, exists := nodesMap[blockerKey]; !exists {
					node.IsSprintSafe = false
					break
				}
			}
		}
	}


	nodes := make([]DependencyNode, 0, len(nodesMap))
	for _, node := range nodesMap {
		nodes = append(nodes, *node)
	}

	response = DependencyGraphData{
		Nodes: nodes,
		Edges: edges,
	}

	c.saveToCache(ctx, cacheKey, &response, 5*time.Minute)

	return &response, nil
}


