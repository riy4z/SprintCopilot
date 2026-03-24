package jira

import (
	"context"
	"net/http"
	redisClient "sprint-copilot/internal/redis"
	"sync"
)

type Client struct {
	httpClient *http.Client
	cloudID    string
	token      string
	redis 	   *redisClient.Service
}


type Service struct {
	mu              sync.RWMutex
	httpClient      *http.Client
	cloudID         string
	redis			*redisClient.Service
	getOAuthClient  func(ctx context.Context) (*http.Client, string, error)
}


func NewService(getOAuthClient func(ctx context.Context) (*http.Client, string, error), redis *redisClient.Service) *Service {
	return &Service{
		getOAuthClient: getOAuthClient,
		redis: redis,
	}
}


func (s *Service) GetClient(ctx context.Context) (*Client, error) {
	s.mu.RLock()
	if s.httpClient != nil && s.cloudID != "" {
		client := &Client{
			httpClient: s.httpClient,
			cloudID:    s.cloudID,
			redis:      s.redis,
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
			redis:      s.redis,
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
		redis:      s.redis,
	}, nil
}
