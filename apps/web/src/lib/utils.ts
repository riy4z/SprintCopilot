import type { SprintData } from '@/types';

export interface TrendInfo {
  direction: 'up' | 'down' | 'flat';
  percentage: number;
  sparklinePath: string;
}

// Calculate trend from sprint graph data
export function calculateTrend(sprintGraph: SprintData[]): TrendInfo {
  if (!sprintGraph || sprintGraph.length === 0) {
    return { direction: 'flat', percentage: 0, sparklinePath: '' };
  }

  if (sprintGraph.length === 1) {
    const sparklinePath = generateSparklinePath(sprintGraph);
    return { direction: 'flat', percentage: 0, sparklinePath };
  }

  // Get the last two sprints to calculate trend
  const lastSprint = sprintGraph[sprintGraph.length - 1];
  const previousSprint = sprintGraph[sprintGraph.length - 2];

  // Handle edge cases
  if (!lastSprint || !previousSprint || previousSprint.velocity === 0) {
    const sparklinePath = generateSparklinePath(sprintGraph);
    return { direction: 'flat', percentage: 0, sparklinePath };
  }

  const difference = lastSprint.velocity - previousSprint.velocity;
  const percentage = Math.abs(Math.round((difference / previousSprint.velocity) * 100));

  let direction: 'up' | 'down' | 'flat' = 'flat';
  if (Math.abs(difference) > 0.01) { // Small threshold to avoid floating point issues
    direction = difference > 0 ? 'up' : 'down';
  }

  // Generate sparkline path from sprint data
  const sparklinePath = generateSparklinePath(sprintGraph);

  return {
    direction,
    percentage: isNaN(percentage) ? 0 : percentage,
    sparklinePath,
  };
}

// Generate SVG path for sparkline chart
export function generateSparklinePath(sprintGraph: SprintData[]): string {
  if (sprintGraph.length === 0) return '';

  // Find min and max velocities for scaling
  const velocities = sprintGraph.map(sprint => sprint.velocity);
  const minVelocity = Math.min(...velocities);
  const maxVelocity = Math.max(...velocities);

  // If all values are the same, create a flat line
  if (minVelocity === maxVelocity) {
    return 'M0,20 L100,20';
  }

  // Calculate points for smooth line
  const points: Array<{x: number, y: number}> = [];

  sprintGraph.forEach((sprint, index) => {
    // Scale x position (0-100)
    const x = sprintGraph.length === 1 ? 50 : (index / (sprintGraph.length - 1)) * 100;

    // Scale y position (5-35, inverted because SVG y increases downward)
    const normalizedVelocity = (sprint.velocity - minVelocity) / (maxVelocity - minVelocity);
    const y = 35 - (normalizedVelocity * 30); // Scale to 5-35 range with padding

    points.push({ x, y });
  });

  // Generate smooth curve using quadratic bezier curves
  if (points.length === 1) {
    return `M${points[0].x},${points[0].y}`;
  }

  let path = `M${points[0].x.toFixed(2)},${points[0].y.toFixed(2)}`;

  for (let i = 1; i < points.length; i++) {
    const prevPoint = points[i - 1];
    const currentPoint = points[i];

    if (i === 1) {
      // First segment - simple line to smooth start
      path += ` L${currentPoint.x.toFixed(2)},${currentPoint.y.toFixed(2)}`;
    } else {
      // Use quadratic bezier for smooth curves
      const controlX = prevPoint.x + (currentPoint.x - prevPoint.x) * 0.5;
      const controlY = prevPoint.y;
      path += ` Q${controlX.toFixed(2)},${controlY.toFixed(2)} ${currentPoint.x.toFixed(2)},${currentPoint.y.toFixed(2)}`;
    }
  }

  return path;
}


// Get project icon based on project name or key
export function getProjectIcon(name: string, key: string): {
  icon: string;
  iconBg: string;
  iconColor: string;
  sparklineColor: string;
} {
  const lowerName = name.toLowerCase();
  const lowerKey = key.toLowerCase();

  // Determine icon based on project name/key patterns
  if (lowerName.includes('mobile') || lowerName.includes('app') || lowerKey.includes('mob')) {
    return {
      icon: 'smartphone',
      iconBg: 'bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-800/20',
      iconColor: 'text-purple-600',
      sparklineColor: '#9333ea',
    };
  }

  if (lowerName.includes('api') || lowerName.includes('backend') || lowerName.includes('server')) {
    return {
      icon: 'dns',
      iconBg: 'bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-900/30 dark:to-orange-800/20',
      iconColor: 'text-orange-600',
      sparklineColor: '#ea580c',
    };
  }

  if (lowerName.includes('web') || lowerName.includes('portal') || lowerName.includes('site')) {
    return {
      icon: 'public',
      iconBg: 'bg-gradient-to-br from-teal-100 to-teal-50 dark:from-teal-900/30 dark:to-teal-800/20',
      iconColor: 'text-teal-600',
      sparklineColor: '#0d9488',
    };
  }

  // Default icon for other projects
  return {
    icon: 'rocket_launch',
    iconBg: 'bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/20',
    iconColor: 'text-primary',
    sparklineColor: '#1111d4',
  };
}