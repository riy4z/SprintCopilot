package jira

type ProjectCategory struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
}

type SprintData struct {
	SprintName string `json:"sprintName"`
	Velocity   int    `json:"velocity"`
}

type ProjectResponse struct {
	Avatar          string            `json:"Avatar"`
	AvatarUrls      map[string]string `json:"avatarUrls"`
	ProjectCategory ProjectCategory   `json:"projectCategory"`
	ID              string            `json:"id"`
	Key             string            `json:"key"`
	Name            string            `json:"name"`
	TeamSize        int               `json:"teamSize"`
	Velocity        int               `json:"velocity"`
	Category        *string           `json:"Category"`
	SprintGraph     []SprintData      `json:"sprintGraph"`
}

//temporary

type JiraProject struct {
	ID   string `json:"id"`
	Key  string `json:"key"`
	Name string `json:"name"`

	AvatarUrls map[string]string `json:"avatarUrls"`

	ProjectCategory struct {
		ID          string `json:"id"`
		Name        string `json:"name"`
		Description string `json:"description"`
	} `json:"projectCategory"`
}

type Priority string
type TicketType string

const (
	PriorityLow      Priority = "Low"
	PriorityMedium   Priority = "Medium"
	PriorityHigh     Priority = "High"
	PriorityCritical Priority = "Critical"

	TypeBug   TicketType = "Bug"
	TypeStory TicketType = "Story"
	TypeTask  TicketType = "Task"
	TypeEpic  TicketType = "Epic"
)

type Ticket struct {
	ID             string     `json:"id"`
	Key            string     `json:"key"`
	Summary        string     `json:"summary"`
	Status         string     `json:"status"`
	Priority       Priority   `json:"priority"` // "Low" | "Medium" | "High" | "Critical"
	Type           TicketType `json:"type"`     // "Bug" | "Story" | "Task" | "Epic"
	Assignee       *string    `json:"assignee"`
	AssigneeName   *string    `json:"assigneeName"`
	AssigneeAvatar *string    `json:"assigneeAvatar"`
	Reporter       string     `json:"reporter"`
	StoryPoints    int        `json:"storyPoints"`
	Labels         []string   `json:"labels"`
	CreatedDate    string     `json:"createdDate"`
	UpdatedDate    string     `json:"updatedDate"`
	ParentIssueKey *string    `json:"parentIssueKey"`
}