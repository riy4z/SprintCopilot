import { useQuery } from '@tanstack/react-query';
import { jira } from '../api-services';
import { queryKeys } from '../queryClient';
import type { ProjectsResponse } from '../api-services';

// Enhanced caching configuration for projects
const PROJECTS_CACHE_CONFIG = {
  // Projects don't change often, so we can cache them longer
  staleTime: 30 * 60 * 1000, // 30 minutes - data considered fresh
  gcTime: 2 * 60 * 60 * 1000, // 2 hours - keep in memory

  // Retry configuration for expensive operations
  retry: (failureCount: number, error: any) => {
    // Don't retry on 4xx errors (client errors)
    if (error?.response?.status >= 400 && error?.response?.status < 500) {
      return false;
    }
    // Only retry twice for server errors due to expensive operation
    return failureCount < 2;
  },
  retryDelay: (attemptIndex: number) => Math.min(2000 * 2 ** attemptIndex, 10000),

  // Background refetch settings
  refetchOnWindowFocus: false, // Don't refetch on every focus
  refetchOnMount: false, // Don't refetch on every mount if we have cached data
  refetchOnReconnect: true, // Do refetch when connection is restored
};

// Persistent cache helper using localStorage
const PROJECTS_CACHE_KEY = 'sprintflow-projects-cache';
const CACHE_VERSION = '1.0';
const CACHE_EXPIRY_HOURS = 4; // Cache expires after 4 hours in localStorage

interface CachedProjects {
  data: ProjectsResponse;
  timestamp: number;
  version: string;
}

const saveProjectsToCache = (data: ProjectsResponse) => {
  try {
    const cacheData: CachedProjects = {
      data,
      timestamp: Date.now(),
      version: CACHE_VERSION
    };
    localStorage.setItem(PROJECTS_CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.warn('Failed to save projects to localStorage cache:', error);
  }
};

const getProjectsFromCache = (): ProjectsResponse | null => {
  try {
    const cached = localStorage.getItem(PROJECTS_CACHE_KEY);
    if (!cached) return null;

    const cacheData: CachedProjects = JSON.parse(cached);

    // Check version compatibility
    if (cacheData.version !== CACHE_VERSION) {
      localStorage.removeItem(PROJECTS_CACHE_KEY);
      return null;
    }

    // Check if cache has expired
    const hoursElapsed = (Date.now() - cacheData.timestamp) / (1000 * 60 * 60);
    if (hoursElapsed > CACHE_EXPIRY_HOURS) {
      localStorage.removeItem(PROJECTS_CACHE_KEY);
      return null;
    }

    return cacheData.data;
  } catch (error) {
    console.warn('Failed to load projects from localStorage cache:', error);
    localStorage.removeItem(PROJECTS_CACHE_KEY);
    return null;
  }
};

// Enhanced query function with persistent caching
const fetchProjectsWithCache = async (): Promise<ProjectsResponse> => {
  try {
    // Attempt to fetch from API
    const data = await jira.getProjects();

    // Save successful response to persistent cache
    saveProjectsToCache(data);

    return data;
  } catch (error) {
    console.warn('Failed to fetch projects from API, checking cache:', error);

    // If API fails, try to use cached data
    const cachedData = getProjectsFromCache();
    if (cachedData) {
      console.info('Using cached projects data due to API failure');
      return cachedData;
    }

    // If no cache available, re-throw the error
    throw error;
  }
};

// Get all projects with enhanced caching
export const useProjects = () => {
  return useQuery({
    queryKey: queryKeys.projects,
    queryFn: fetchProjectsWithCache,
    select: (data) => data.projects,
    ...PROJECTS_CACHE_CONFIG,

    // Initialize with cached data if available
    initialData: () => {
      const cached = getProjectsFromCache();
      return cached || undefined;
    },

    // Mark initial data as stale so it refetches in background
    initialDataUpdatedAt: () => {
      const cached = localStorage.getItem(PROJECTS_CACHE_KEY);
      if (cached) {
        try {
          const cacheData: CachedProjects = JSON.parse(cached);
          return cacheData.timestamp;
        } catch {
          return 0;
        }
      }
      return 0;
    },
  });
};

// Cache management utilities
export const projectsCacheUtils = {
  // Clear projects cache
  clearCache: () => {
    localStorage.removeItem(PROJECTS_CACHE_KEY);
  },

  // Get cache status
  getCacheStatus: () => {
    const cached = localStorage.getItem(PROJECTS_CACHE_KEY);
    if (!cached) {
      return { hasCache: false, age: 0, isExpired: true };
    }

    try {
      const cacheData: CachedProjects = JSON.parse(cached);
      const ageHours = (Date.now() - cacheData.timestamp) / (1000 * 60 * 60);
      const isExpired = ageHours > CACHE_EXPIRY_HOURS;

      return {
        hasCache: true,
        age: ageHours,
        isExpired,
        version: cacheData.version
      };
    } catch {
      return { hasCache: false, age: 0, isExpired: true };
    }
  },

  // Force refresh projects
  forceRefresh: async () => {
    // Clear cache and refetch
    localStorage.removeItem(PROJECTS_CACHE_KEY);
    const data = await jira.getProjects();
    saveProjectsToCache(data);
    return data;
  }
};