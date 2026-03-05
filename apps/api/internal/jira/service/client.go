package jira

import (
	"net/http"
)

type Client struct {
	httpClient *http.Client
	cloudID    string
	token      string
}

func NewClient(httpClient *http.Client, cloudID string) *Client {
	return &Client{
		httpClient: httpClient,
		cloudID:    cloudID,
	}
}

// NewClientWithToken creates a client with a token string
func NewClientWithToken(token string, cloudID string) *Client {
	return &Client{
		httpClient: &http.Client{},
		cloudID:    cloudID,
		token:      token,
	}
}
