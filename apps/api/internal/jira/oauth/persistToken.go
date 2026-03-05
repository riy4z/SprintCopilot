package oauth

import (
	"context"
	"encoding/json"
	"net/http"
	"os"
	"time"

	"golang.org/x/oauth2"
)

type StoredToken struct {
	AccessToken  string `json:"access_token"`
	TokenType    string `json:"token_type"`
	RefreshToken string `json:"refresh_token"`
	Expiry       string `json:"expiry"`
	CloudID      string `json:"cloudId"`
}

func SaveToken(token *oauth2.Token, cloudID string) error {

	stored := StoredToken{
		AccessToken:  token.AccessToken,
		TokenType:    token.TokenType,
		RefreshToken: token.RefreshToken,
		Expiry:       token.Expiry.Format("2006-01-02T15:04:05.0000000Z07:00"),
		CloudID:      cloudID,
	}

	data, err := json.MarshalIndent(stored, "", "  ")
	if err != nil {
		return err
	}

	return os.WriteFile("jira_token.json", data, 0600)
}

func LoadToken() (*StoredToken, error) {

	data, err := os.ReadFile("jira_token.json")
	
	if err != nil {
		return nil, err
	}

	var stored StoredToken

	err = json.Unmarshal(data, &stored)
	if err != nil {
		return nil, err
	}

	return &stored, nil
}

// ToOAuth2Token converts StoredToken to oauth2.Token
func (s *StoredToken) ToOAuth2Token() (*oauth2.Token, error) {
	expiry, err := time.Parse("2006-01-02T15:04:05.0000000Z07:00", s.Expiry)
	if err != nil {
		return nil, err
	}

	return &oauth2.Token{
		AccessToken:  s.AccessToken,
		TokenType:    s.TokenType,
		RefreshToken: s.RefreshToken,
		Expiry:       expiry,
	}, nil
}

// PersistentTokenSource wraps oauth2.TokenSource to save refreshed tokens
type PersistentTokenSource struct {
	source  oauth2.TokenSource
	cloudID string
}

func (pts *PersistentTokenSource) Token() (*oauth2.Token, error) {
	token, err := pts.source.Token()
	if err != nil {
		return nil, err
	}

	// Save the refreshed token back to JSON file
	go func() {
		SaveToken(token, pts.cloudID)
	}()

	return token, nil
}

func GetOAuthClient(ctx context.Context) (*http.Client, string, error) {

	stored, err := LoadToken()
	if err != nil {
		return nil, "", err
	}

	token, err := stored.ToOAuth2Token()
	if err != nil {
		return nil, "", err
	}

	conf := getOAuthConfig()
	baseTokenSource := conf.TokenSource(ctx, token)

	// Wrap with our persistent token source
	persistentTS := &PersistentTokenSource{
		source:  baseTokenSource,
		cloudID: stored.CloudID,
	}

	return oauth2.NewClient(ctx, persistentTS), stored.CloudID, nil
}