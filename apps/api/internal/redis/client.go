package redis

import (
	"context"
	"fmt"
	"log"
	"sprint-copilot/config"
	"strconv"
	"sync"

	"github.com/redis/go-redis/v9"
)

type Client struct {
	redisClient *redis.Client
}

type Service struct {
	mu          sync.RWMutex
	redisClient *redis.Client
}

func NewService() *Service {
	return &Service{}
}

func (s *Service) GetClient(ctx context.Context) (*Client, error) {
	s.mu.RLock()
	if s.redisClient != nil {
		client := &Client{
			redisClient: s.redisClient,
		}
		s.mu.RUnlock()
		return client, nil
	}
	s.mu.RUnlock()

	s.mu.Lock()
	defer s.mu.Unlock()

	// Double-check after acquiring write lock
	if s.redisClient != nil {
		return &Client{
			redisClient: s.redisClient,
		}, nil
	}

	// Initialize Redis client
	db, err := strconv.Atoi(config.AppConfig.RedisDB)
	if err != nil {
		log.Printf("Invalid Redis DB number, using default 0: %v", err)
		db = 0
	}

	s.redisClient = redis.NewClient(&redis.Options{
		Addr:     fmt.Sprintf("%s:%s", config.AppConfig.RedisHost, config.AppConfig.RedisPort),
		Password: config.AppConfig.RedisPassword,
		DB:       db,
	})

	// Test the connection
	_, err = s.redisClient.Ping(ctx).Result()
	if err != nil {
		log.Printf("Failed to connect to Redis: %v", err)
		return nil, err
	}

	log.Println("Successfully connected to Redis")

	return &Client{
		redisClient: s.redisClient,
	}, nil
}

// Close closes the Redis connection
func (s *Service) Close() error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if s.redisClient != nil {
		return s.redisClient.Close()
	}
	return nil
}

// GetRedisClient returns the underlying redis.Client for direct access
func (c *Client) GetRedisClient() *redis.Client {
	return c.redisClient
}
