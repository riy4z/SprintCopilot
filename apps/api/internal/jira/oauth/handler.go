package oauth

import (
	"encoding/json"
	"net/http"
	"sprint-copilot/config"

	"github.com/gin-gonic/gin"
)

// Jira OAuth godoc
// @Summary Connect Jira OAuth
// @Description Redirects user to Jira Cloud OAuth2 login page
// @Tags OAuth
// @Produce json
// @Success 307 {string} string "Redirect"
// @Header 307 {string} Location "OAuth login URL"
// @Router /jira/oauth [get]
func Login(c *gin.Context) {

	url := GetLoginURL()
	c.Redirect(http.StatusTemporaryRedirect, url)
}

// Callback godoc
// @Summary Jira OAuth callback
// @Description Handles OAuth callback from Jira Cloud and exchanges authorization code for an access token
// @Tags OAuth
// @Accept json
// @Produce json
// @Param code query string true "Authorization code returned by Atlassian"
// @Param state query string true "OAuth state value"
// @Success 200 {object} map[string]interface{} "Access token response"
// @Failure 400 {object} map[string]interface{} "Invalid request"
// @Failure 500 {object} map[string]interface{} "Token exchange failed"
// @Router /jira/callback [get]
func Callback(c *gin.Context) {

	code := c.Query("code")

	token, err := ExchangeCode(c.Request.Context(), code)
	if err != nil {
		c.JSON(500, gin.H{
			"error": err.Error(),
		})
		return
	}

	// store token in memory
	config.JiraToken = token
	
	// request cloud resources
	req, err := http.NewRequest(
		"GET",
		"https://api.atlassian.com/oauth/token/accessible-resources",
		nil,
	)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	
	req.Header.Set("Authorization", "Bearer "+token.AccessToken)
	req.Header.Set("Accept", "application/json")
	
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	defer resp.Body.Close()

	var resources []struct {
		ID   string `json:"id"`
		Name string `json:"name"`
		URL  string `json:"url"`
	}
	
	err = json.NewDecoder(resp.Body).Decode(&resources)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	
	if len(resources) == 0 {
		c.JSON(500, gin.H{
			"error": "no jira resources found",
		})
		return
	}
	
	// store cloudID in memory
	config.CloudID = resources[0].ID
	SaveToken(token, resources[0].ID)

	c.Redirect(302, "http://localhost:5173/dashboard")
}