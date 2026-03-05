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