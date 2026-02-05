import { useQuery } from '@tanstack/react-query';
import { ai, type RetrospectiveRequest, type SprintRetrospective } from '../api-services';
import { queryKeys } from '../queryClient';

export const useRetrospective = (
  projectKey: string,
  sprintId: string,
  request?: RetrospectiveRequest,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: queryKeys.retrospective(projectKey, sprintId),
    queryFn: () => ai.retrospective(projectKey, sprintId, request),
    enabled: enabled && !!projectKey && !!sprintId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook for generating retrospective with custom context
export const useRetrospectiveGeneration = () => {
  const generateRetrospective = async (
    projectKey: string,
    sprintId: string,
    request?: RetrospectiveRequest
  ): Promise<SprintRetrospective> => {
    console.group('🤖 Generating AI Retrospective');
    console.log('📋 Request Details:', {
      projectKey,
      sprintId,
      additionalContext: request?.additionalContext,
      teamHighlights: request?.teamHighlights?.length || 0,
      knownBlockers: request?.knownBlockers?.length || 0
    });

    try {
      const retrospective = await ai.retrospective(projectKey, sprintId, request);

      console.log('✅ Retrospective Generated Successfully');
      console.log('📊 Metrics:', retrospective.metrics);
      console.log('🎯 Action Items:', retrospective.actionItems.length);
      console.log('💡 Recommendations:', retrospective.recommendations.length);

      return retrospective;
    } catch (error) {
      console.error('❌ Retrospective Generation Failed:', error);
      throw error;
    } finally {
      console.groupEnd();
    }
  };

  return { generateRetrospective };
};