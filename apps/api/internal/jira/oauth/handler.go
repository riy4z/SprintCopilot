package oauth

import (
	"net/http"

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

	c.JSON(200, gin.H{
		"access_token": token.AccessToken,
	})
}