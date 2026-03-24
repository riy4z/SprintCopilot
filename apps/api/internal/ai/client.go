package ai

import (
	"fmt"
	"net/http"
	"sprint-copilot/config"
	"sprint-copilot/internal/redis"
	"sync"
)

type AIClient struct {
	apiKey     string
	httpClient *http.Client
	redis 	   *redis.Service
}

type Service struct {
	mu         sync.RWMutex
	client     *AIClient
	redis	   *redis.Service
	httpClient *http.Client
}

func NewService(redis *redis.Service) (*Service, error) {
	if config.AppConfig.OpenAIKey == "" {
		return nil, fmt.Errorf("openai api key not configured")
	}

	return &Service{
		httpClient: &http.Client{},
		redis: redis,
	}, nil
}


func (s *Service) GetClient() (*AIClient, error) {
	s.mu.RLock()
	if s.client != nil {
		client := s.client
		s.mu.RUnlock()
		return client, nil
	}
	s.mu.RUnlock()

	// Need to initialize the client
	s.mu.Lock()
	defer s.mu.Unlock()

	// Double-check after acquiring write lock
	if s.client != nil {
		return s.client, nil
	}

	if config.AppConfig.OpenAIKey == "" {
		return nil, fmt.Errorf("openai api key not configured")
	}

	s.client = &AIClient{
		httpClient: s.httpClient,
		apiKey:     config.AppConfig.OpenAIKey,
		redis:		s.redis,
	}

	return s.client, nil
}