package redis

import (
	"context"
	"time"
)

// Example methods showing how to use the Redis client

// Set stores a key-value pair in Redis
func (c *Client) Set(ctx context.Context, key string, value any, expiration time.Duration) error {
	return c.redisClient.Set(ctx, key, value, expiration).Err()
}

// Get retrieves a value from Redis by key
func (c *Client) Get(ctx context.Context, key string) (string, error) {
	return c.redisClient.Get(ctx, key).Result()
}

// Delete removes a key from Redis
func (c *Client) Delete(ctx context.Context, keys ...string) error {
	return c.redisClient.Del(ctx, keys...).Err()
}

// Exists checks if a key exists in Redis
func (c *Client) Exists(ctx context.Context, keys ...string) (int64, error) {
	return c.redisClient.Exists(ctx, keys...).Result()
}

// SetNX sets a key only if it doesn't exist (useful for locks)
func (c *Client) SetNX(ctx context.Context, key string, value any, expiration time.Duration) (bool, error) {
	return c.redisClient.SetNX(ctx, key, value, expiration).Result()
}

// Expire sets an expiration time on a key
func (c *Client) Expire(ctx context.Context, key string, expiration time.Duration) error {
	return c.redisClient.Expire(ctx, key, expiration).Err()
}
