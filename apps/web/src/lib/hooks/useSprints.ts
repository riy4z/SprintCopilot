import { useQuery } from '@tanstack/react-query';
import { jira } from '../api-services';
import { queryKeys } from '../queryClient';

// Get sprints for a project
export const useSprints = (projectKey: string) => {
  return useQuery({
    queryKey: queryKeys.sprints(projectKey),
    queryFn: () => jira.getSprints(projectKey),
    enabled: !!projectKey, // Only run query if projectKey is provided
    select: (data) => data.sprintHistory || [], // Extract sprint history from the Sprint interface
  });
};