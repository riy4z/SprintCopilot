import { useQuery } from '@tanstack/react-query';
import { jira } from '../api-services';
import { queryKeys } from '../queryClient';

// Burndown data point interface
export interface BurndownDataPoint {
  date: string;
  remainingPoints: number;
}

// Get burndown data for a sprint
export const useBurndown = (projectKey: string, sprintId: string) => {
  return useQuery({
    queryKey: [...queryKeys.sprints(projectKey), 'burndown', sprintId],
    queryFn: () => jira.getSprintBurndown(projectKey, sprintId),
    enabled: !!(projectKey && sprintId), // Only run query if both parameters are provided
    staleTime: 5 * 60 * 1000, // 5 minutes - burndown data can update during active sprints
    gcTime: 30 * 60 * 1000, // 30 minutes in cache
    select: (data: BurndownDataPoint[]) => {
      if (!data || data.length === 0) return [];

      // Process the data to add additional metadata
      return data.map((point, index) => {
        const date = new Date(point.date);
        const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

        return {
          ...point,
          date: point.date,
          remainingPoints: point.remainingPoints,
          dayOfWeek,
          isWeekend,
          dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
          formattedDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          index
        };
      });
    }
  });
};

// Burndown chart utilities
export const burndownUtils = {
  // Calculate ideal burndown line
  calculateIdealBurndown: (startPoints: number, totalDays: number) => {
    const pointsPerDay = startPoints / Math.max(totalDays - 1, 1);
    const idealLine: Array<{x: number, y: number}> = [];

    for (let day = 0; day < totalDays; day++) {
      idealLine.push({
        x: day,
        y: Math.max(startPoints - (pointsPerDay * day), 0)
      });
    }

    return idealLine;
  },

  // Generate SVG path for burndown line
  generateBurndownPath: (dataPoints: Array<{x: number, y: number}>, chartWidth: number, chartHeight: number, maxPoints: number) => {
    if (dataPoints.length === 0) return '';

    const xStep = chartWidth / Math.max(dataPoints.length - 1, 1);
    const yScale = chartHeight / maxPoints;

    let path = `M 0 ${chartHeight - (dataPoints[0].y * yScale)}`;

    for (let i = 1; i < dataPoints.length; i++) {
      const x = i * xStep;
      const y = chartHeight - (dataPoints[i].y * yScale);
      path += ` L ${x} ${y}`;
    }

    return path;
  },

  // Format date for chart labels
  formatDateLabel: (dateString: string, labelType: 'short' | 'day' | 'date' = 'short') => {
    const date = new Date(dateString);
    switch (labelType) {
      case 'day':
        return date.toLocaleDateString('en-US', { weekday: 'short' });
      case 'date':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      default:
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  }
};