package jira

import (
	"net/http"
	"time"
)

type Client struct {
	httpClient *http.Client
	token      string
	cloudID    string
}

func NewClient(token string, cloudID string) *Client {
	return &Client{
		httpClient: &http.Client{
			Timeout: 10 * time.Second,
		},
		token:   token,
		cloudID: cloudID,
	}
}
