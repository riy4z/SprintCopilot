import { useQuery } from '@tanstack/react-query';
import { jira } from '../api-services';
import { queryKeys } from '../queryClient';

// Get backlog for a specific project
export const useBacklog = (projectKey: string) => {
  return useQuery({
    queryKey: queryKeys.backlog(projectKey),
    queryFn: () => jira.getBacklog(projectKey),
    select: (data) => data.tickets, // Extract the tickets array from the response
    enabled: !!projectKey, // Only run query if projectKey is provided
  });
};