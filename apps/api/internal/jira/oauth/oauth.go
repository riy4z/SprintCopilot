package oauth

import (
	"context"
	"sprint-copilot/config"

	"golang.org/x/oauth2"
)

var JiraConf *oauth2.Config

func init() {
	JiraConf = getOAuthConfig()
}

func getOAuthConfig() *oauth2.Config {
	return &oauth2.Config{
		ClientID:     config.AppConfig.JiraClientId,
		ClientSecret: config.AppConfig.JiraSecret,
		Scopes: []string{
			"read:jira-work",
			"write:jira-work",
			"read:jira-user",
			"read:issue-details:jira",
			"read:board-scope:jira-software",
			"read:project:jira",
			"read:sprint:jira-software",
			"read:issue:jira",
			"read:issue:jira-software",
			"read:issue-details:jira",
			"read:email-address:jira",
			"offline_access",
		},
		RedirectURL: config.AppConfig.RedirectURL,
		Endpoint: oauth2.Endpoint{
			AuthURL:  "https://auth.atlassian.com/authorize",
			TokenURL: "https://auth.atlassian.com/oauth/token",
		},
	}
}

func GetLoginURL() string {
	conf:= getOAuthConfig()

	return conf.AuthCodeURL(
		"jira-state", 
		oauth2.AccessTypeOffline, 
		oauth2.SetAuthURLParam("audience", "api.atlassian.com"),
		oauth2.SetAuthURLParam("prompt", "consent"),
	)
}

func ExchangeCode(ctx context.Context, code string) (*oauth2.Token, error) {
	conf := getOAuthConfig()
	return conf.Exchange(ctx, code)
}