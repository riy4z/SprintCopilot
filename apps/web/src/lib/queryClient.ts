import { QueryClient } from '@tanstack/react-query';
import { handleApiError } from './api';

// Create a query client with default configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Time in milliseconds that data is considered fresh
      staleTime: 5 * 60 * 1000, // 5 minutes

      // Time in milliseconds that unused/inactive cache data remains in memory
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)

      // Retry failed requests
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors (client errors)
        if (error && typeof error === 'object' && 'response' in error) {
          const status = (error.response as any)?.status;
          if (status >= 400 && status < 500) {
            return false;
          }
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },

      // Retry delay with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Refetch on window focus in production, disable in development
      refetchOnWindowFocus: !import.meta.env.DEV,

      // Refetch on reconnect
      refetchOnReconnect: true,

      // Error handling
      throwOnError: false,
    },
    mutations: {
      // Retry mutations only once
      retry: 1,

      // Global error handler for mutations
      onError: (error) => {
        const errorMessage = handleApiError(error);
        console.error('Mutation failed:', errorMessage);

        // You can add toast notifications here
        // toast.error(errorMessage);
      },
    },
  },
});

// Query keys factory for consistent query key management
export const queryKeys = {
  // Projects
  projects: ['projects'] as const,
  project: (id: string) => ['projects', id] as const,

  // Backlog
  backlog: (projectKey: string) => ['backlog', projectKey] as const,

  // Sprints
  sprints: (projectKey: string) => ['sprints', projectKey] as const,

  // Team Members
  teamMembers: (projectKey: string) => ['teamMembers', projectKey] as const,

  // Retrospective
  retrospective: (projectKey: string, sprintId: string) => ['retrospective', projectKey, sprintId] as const,
} as const;