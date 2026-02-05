import { queryClient } from './queryClient';
import { projectsCacheUtils } from './hooks/useProjects';

export interface CacheMetrics {
  totalCacheSize: number;
  projectsCacheSize: number;
  projectsCacheAge: number;
  hasProjectsCache: boolean;
  reactQueryCacheSize: number;
}

// Global cache manager
export class CacheManager {
  // Get comprehensive cache metrics
  static getCacheMetrics(): CacheMetrics {
    const projectsStatus = projectsCacheUtils.getCacheStatus();

    // Calculate localStorage usage
    let totalSize = 0;
    let projectsCacheSize = 0;

    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        const size = localStorage[key].length;
        totalSize += size;

        if (key === 'sprintflow-projects-cache') {
          projectsCacheSize = size;
        }
      }
    }

    // Get React Query cache info
    const queryCache = queryClient.getQueryCache();
    const queries = queryCache.getAll();
    const reactQueryCacheSize = queries.length;

    return {
      totalCacheSize: totalSize,
      projectsCacheSize,
      projectsCacheAge: projectsStatus.age,
      hasProjectsCache: projectsStatus.hasCache,
      reactQueryCacheSize
    };
  }

  // Clear all SprintFlow caches
  static clearAllCaches(): void {
    // Clear React Query cache
    queryClient.clear();

    // Clear localStorage caches
    const keysToRemove = [];
    for (let key in localStorage) {
      if (key.startsWith('sprintflow-')) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });

    console.info('All SprintFlow caches cleared');
  }

  // Preload critical data
  static async preloadCriticalData(): Promise<void> {
    try {
      // Preload projects in background if not already cached
      const projectsStatus = projectsCacheUtils.getCacheStatus();

      if (!projectsStatus.hasCache || projectsStatus.isExpired) {
        console.info('Preloading projects data...');
        await queryClient.prefetchQuery({
          queryKey: ['projects'],
          queryFn: async () => {
            const { jira } = await import('./api-services');
            return jira.getProjects();
          },
          staleTime: 30 * 60 * 1000, // 30 minutes
        });
      }
    } catch (error) {
      console.warn('Failed to preload critical data:', error);
    }
  }

  // Cache health check
  static performHealthCheck(): {
    isHealthy: boolean;
    issues: string[];
    recommendations: string[];
  } {
    const metrics = this.getCacheMetrics();
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check for cache size issues
    if (metrics.totalCacheSize > 5 * 1024 * 1024) { // 5MB
      issues.push('localStorage cache size is large (>5MB)');
      recommendations.push('Consider clearing old cache data');
    }

    // Check for stale projects cache
    if (metrics.hasProjectsCache && metrics.projectsCacheAge > 4) {
      issues.push('Projects cache is stale (>4 hours)');
      recommendations.push('Refresh projects data');
    }

    // Check for React Query cache bloat
    if (metrics.reactQueryCacheSize > 50) {
      issues.push('React Query cache has many entries');
      recommendations.push('Consider clearing unused queries');
    }

    return {
      isHealthy: issues.length === 0,
      issues,
      recommendations
    };
  }

  // Format cache size for display
  static formatCacheSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }
}

// Auto-cleanup old cache on app load
export const initializeCacheManager = () => {
  // Perform health check on app initialization
  const healthCheck = CacheManager.performHealthCheck();

  if (!healthCheck.isHealthy) {
    console.info('Cache health issues detected:', healthCheck.issues);
    console.info('Recommendations:', healthCheck.recommendations);
  }

  // Auto-preload critical data in background
  CacheManager.preloadCriticalData();
};

// Export for debugging in console
if (typeof window !== 'undefined') {
  (window as any).sprintflowCache = CacheManager;
}