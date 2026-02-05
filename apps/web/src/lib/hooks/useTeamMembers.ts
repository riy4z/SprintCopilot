import { useQuery } from '@tanstack/react-query';
import { jira } from '../api-services';
import { queryKeys } from '../queryClient';
import type { TeamMembersResponse } from '../api-services';

// Cache configuration for team members
const TEAM_MEMBERS_CACHE_CONFIG = {
  // Team data changes infrequently, so we can cache it for a reasonable time
  staleTime: 15 * 60 * 1000, // 15 minutes - data considered fresh
  gcTime: 30 * 60 * 1000, // 30 minutes - keep in memory

  // Retry configuration
  retry: (failureCount: number, error: any) => {
    // Don't retry on 4xx errors (client errors)
    if (error?.response?.status >= 400 && error?.response?.status < 500) {
      return false;
    }
    // Retry up to 2 times for server errors
    return failureCount < 2;
  },
  retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 5000),

  // Background refetch settings
  refetchOnWindowFocus: false, // Don't refetch on every focus
  refetchOnMount: false, // Don't refetch on every mount if we have cached data
  refetchOnReconnect: true, // Do refetch when connection is restored
};

// Get team members for a project with caching
export const useTeamMembers = (projectCode: string | undefined, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: queryKeys.teamMembers(projectCode || ''),
    queryFn: () => {
      if (!projectCode) {
        throw new Error('Project code is required to fetch team members');
      }
      return jira.getTeamMembers(projectCode);
    },
    enabled: !!projectCode && (options?.enabled !== false),
    ...TEAM_MEMBERS_CACHE_CONFIG,
  });
};

// Prefetch team members for background loading
export const usePrefetchTeamMembers = (projectCode: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.teamMembers(projectCode || ''),
    queryFn: () => {
      if (!projectCode) {
        throw new Error('Project code is required to fetch team members');
      }
      return jira.getTeamMembers(projectCode);
    },
    enabled: !!projectCode,
    ...TEAM_MEMBERS_CACHE_CONFIG,
    // Prefetch in background without affecting UI
    notifyOnChangeProps: [], // Don't trigger re-renders
  });
};