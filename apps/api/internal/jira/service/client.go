package jira

import (
	"context"
	"net/http"
	"sync"
)

type Client struct {
	httpClient *http.Client
	cloudID    string
	token      string
}


type Service struct {
	mu              sync.RWMutex
	httpClient      *http.Client
	cloudID         string
	getOAuthClient  func(ctx context.Context) (*http.Client, string, error)
}


func NewService(getOAuthClient func(ctx context.Context) (*http.Client, string, error)) *Service {
	return &Service{
		getOAuthClient: getOAuthClient,
	}
}


func (s *Service) GetClient(ctx context.Context) (*Client, error) {
	s.mu.RLock()
	if s.httpClient != nil && s.cloudID != "" {
		client := &Client{
			httpClient: s.httpClient,
			cloudID:    s.cloudID,
		}
		s.mu.RUnlock()
		return client, nil
	}
	s.mu.RUnlock()

	s.mu.Lock()
	defer s.mu.Unlock()

	// Double-check after acquiring write lock
	if s.httpClient != nil && s.cloudID != "" {
		return &Client{
			httpClient: s.httpClient,
			cloudID:    s.cloudID,
		}, nil
	}

	// Get OAuth client
	httpClient, cloudID, err := s.getOAuthClient(ctx)
	if err != nil {
		return nil, err
	}

	s.httpClient = httpClient
	s.cloudID = cloudID

	return &Client{
		httpClient: s.httpClient,
		cloudID:    s.cloudID,
	}, nil
}
