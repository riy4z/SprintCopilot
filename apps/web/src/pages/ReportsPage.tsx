import { useState, useEffect } from 'react';
import { CommonHeader } from '../components/common/CommonHeader';
import { useSprints, useBurndown, burndownUtils, useRetrospective } from '../lib/hooks';
import { generateRetrospectivePDF } from '../lib/pdfGenerator';

export function ReportsPage() {
  // For now, using a default project key. In a real app, this might come from URL params or context
  const defaultProjectKey = 'PIMI'; // Matches the mock data in api-services.ts
  const [selectedSprintId, setSelectedSprintId] = useState<string>('');


  const { data: sprints = [], isLoading: sprintsLoading } = useSprints(defaultProjectKey);

  // Fetch retrospective data for the selected sprint
  const {
    data: retrospective,
    isLoading: retrospectiveLoading,
    error: retrospectiveError,
    refetch: refetchRetrospective
  } = useRetrospective(defaultProjectKey, selectedSprintId, undefined, !!selectedSprintId);

  const selectedSprint = sprints.find(sprint => sprint.sprintId === selectedSprintId);


  useEffect(() => {
    if (sprints.length > 0 && !selectedSprintId) {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time for accurate date comparison

      // First, try to find currently active sprints
      const activeSprints = sprints.filter(sprint => {
        const startDate = new Date(sprint.startDate);
        const endDate = new Date(sprint.endDate);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);

        return today >= startDate && today <= endDate;
      });

      let latestSprint;

      if (activeSprints.length > 0) {
        // If there are active sprints, pick the one that started most recently
        latestSprint = activeSprints.reduce((latest, current) => {
          const latestStartDate = new Date(latest.startDate);
          const currentStartDate = new Date(current.startDate);
          return currentStartDate > latestStartDate ? current : latest;
        });
        console.log('Auto-selecting active sprint:', latestSprint.sprintName);
      } else {
        // No active sprints, pick the most recently ended one
        latestSprint = sprints.reduce((latest, current) => {
          const latestEndDate = new Date(latest.endDate);
          const currentEndDate = new Date(current.endDate);
          return currentEndDate > latestEndDate ? current : latest;
        });
        console.log('Auto-selecting most recently ended sprint:', latestSprint.sprintName);
      }

      setSelectedSprintId(latestSprint.sprintId);
    }
  }, [sprints, selectedSprintId]);

  // Fetch burndown data for the selected sprint
  const { data: burndownData = [], isLoading: burndownLoading } = useBurndown(
    defaultProjectKey,
    selectedSprintId
  );

  // Handle PDF generation
  const handleGeneratePDF = async () => {
    if (!retrospective) {
      alert('No retrospective data available for PDF generation.');
      return;
    }

    try {
      console.log('🎯 Generating Retrospective PDF for:', retrospective.sprint.sprintName);
      await generateRetrospectivePDF(retrospective);
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('Failed to generate PDF. Please ensure jsPDF is installed and try again.');
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-[#111118] dark:text-white min-h-screen">
      <CommonHeader searchPlaceholder="Search reports..." />

      <main className="p-8 space-y-8 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#616189] text-sm font-medium mb-1">
              <span className="material-symbols-outlined text-primary text-lg">analytics</span>
              <span>Reports</span>
              {selectedSprintId && !sprintsLoading && (
                <span className="ml-2 px-2 py-0.5 rounded text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                  Auto-selected latest
                </span>
              )}
            </div>
            <h1 className="text-3xl font-bold text-[#111118] dark:text-white">Sprint Performance</h1>
            <p className="text-[#616189] text-sm">
              {selectedSprint ? (
                <>
                  {selectedSprint.sprintName} - Performance analysis from {' '}
                  {new Date(selectedSprint.startDate).toLocaleDateString()} to{' '}
                  {new Date(selectedSprint.endDate).toLocaleDateString()}
                  {sprints.length > 0 && sprints.find(s => s.sprintId === selectedSprintId) ===
                    sprints.reduce((latest, current) =>
                      new Date(current.endDate) > new Date(latest.endDate) ? current : latest
                    ) && (
                    <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                      Latest Sprint
                    </span>
                  )}
                </>
              ) : sprintsLoading ? (
                'Loading sprint data...'
              ) : (
                'Select a sprint to view detailed performance analysis and retrospective insights'
              )}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex flex-col">
              <label className="text-[#111118] dark:text-white text-xs font-bold uppercase tracking-wider pb-2">
                Select Sprint
              </label>
              <div className="relative">
                <select
                  className="min-w-64 bg-background-light dark:bg-white/5 border-none rounded-lg py-2.5 px-3 pr-10 text-sm font-medium text-[#111118] dark:text-white focus:ring-2 focus:ring-primary/20 cursor-pointer appearance-none"
                  value={selectedSprintId}
                  onChange={(e) => setSelectedSprintId(e.target.value)}
                  disabled={sprintsLoading}
                >
                  {sprintsLoading ? (
                    <option value="">Loading sprints...</option>
                  ) : sprints.length === 0 ? (
                    <option value="">No sprints available</option>
                  ) : (
                    <>
                      {!selectedSprintId && <option value="">Loading latest sprint...</option>}
                      {sprints
                        .sort((a, b) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);

                          const aStart = new Date(a.startDate);
                          const aEnd = new Date(a.endDate);
                          const bStart = new Date(b.startDate);
                          const bEnd = new Date(b.endDate);

                          aStart.setHours(0, 0, 0, 0);
                          aEnd.setHours(23, 59, 59, 999);
                          bStart.setHours(0, 0, 0, 0);
                          bEnd.setHours(23, 59, 59, 999);

                          const aIsActive = today >= aStart && today <= aEnd;
                          const bIsActive = today >= bStart && today <= bEnd;

                          // Active sprints first, then by most recent end date
                          if (aIsActive && !bIsActive) return -1;
                          if (!aIsActive && bIsActive) return 1;

                          if (aIsActive && bIsActive) {
                            // Both active, sort by most recent start date
                            return bStart.getTime() - aStart.getTime();
                          }

                          // Both completed, sort by most recent end date
                          return bEnd.getTime() - aEnd.getTime();
                        })
                        .map((sprint, index) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);

                          const startDate = new Date(sprint.startDate);
                          const endDate = new Date(sprint.endDate);
                          startDate.setHours(0, 0, 0, 0);
                          endDate.setHours(23, 59, 59, 999);

                          const isActive = today >= startDate && today <= endDate;
                          const isFirstActive = isActive && index === 0;
                          const isFirstCompleted = !isActive && sprints.filter(s => {
                            const sStart = new Date(s.startDate);
                            const sEnd = new Date(s.endDate);
                            sStart.setHours(0, 0, 0, 0);
                            sEnd.setHours(23, 59, 59, 999);
                            return !(today >= sStart && today <= sEnd);
                          }).sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime())[0]?.sprintId === sprint.sprintId;

                          let statusIcon = '';
                          let statusLabel = '';

                          if (isActive) {
                            statusIcon = '🟢 ';
                            statusLabel = 'Active';
                          } else if (isFirstCompleted) {
                            statusIcon = '🔸 ';
                            statusLabel = 'Recently Completed';
                          } else {
                            statusIcon = '';
                            statusLabel = 'Completed';
                          }

                          return (
                            <option key={sprint.sprintId} value={sprint.sprintId}>
                              {statusIcon}{sprint.sprintName} - {statusLabel} ({sprint.completedPoints}/{sprint.committedPoints} pts)
                            </option>
                          );
                        })}
                    </>
                  )}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-2.5 pointer-events-none text-[#616189]">expand_more</span>
              </div>
            </div>

            <div className="flex items-end gap-2">
              <button className="px-4 py-2.5 bg-primary hover:bg-primary/90 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2">
                <span className="material-symbols-outlined text-base">download</span>
                Export Report
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Story Points Delivered */}
          <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-white/5 border border-[#dbdbe6] dark:border-white/10 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-[#616189] text-sm font-medium">Story Points Delivered</p>
            <p className="text-2xl font-bold leading-tight text-[#111118] dark:text-white">
              {selectedSprint
                ? `${selectedSprint.completedPoints} / ${selectedSprint.committedPoints}`
                : '-- / --'
              }
            </p>
            <p className="text-success text-sm font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">trending_up</span>
              {selectedSprint && selectedSprint.committedPoints > 0
                ? `${Math.round((selectedSprint.completedPoints / selectedSprint.committedPoints) * 100)}% completion`
                : 'Select sprint for data'
              }
            </p>
          </div>

          {/* Sprint Progress */}
          <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-white/5 border border-[#dbdbe6] dark:border-white/10 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-[#616189] text-sm font-medium">Sprint Status</p>
            <p className="text-2xl font-bold leading-tight text-[#111118] dark:text-white">
              {selectedSprint
                ? new Date(selectedSprint.endDate) > new Date()
                  ? 'Active'
                  : 'Completed'
                : '--'
              }
            </p>
            <div className="w-full bg-[#f0f0f4] dark:bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-all duration-300"
                style={{
                  width: selectedSprint
                    ? `${Math.min((selectedSprint.completedPoints / Math.max(selectedSprint.committedPoints, 1)) * 100, 100)}%`
                    : '0%'
                }}
              ></div>
            </div>
          </div>

          {/* Completed Tickets */}
          <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-white/5 border border-[#dbdbe6] dark:border-white/10 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-[#616189] text-sm font-medium">Tickets Completed</p>
            <p className="text-2xl font-bold leading-tight text-[#111118] dark:text-white">
              {selectedSprint ? selectedSprint.completedTickets : '--'}
            </p>
            <p className="text-success text-sm font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">check_circle</span>
              {selectedSprint ? 'Tickets done' : 'Select sprint'}
            </p>
          </div>

          {/* Sprint Health */}
          <div className="flex flex-col gap-2 rounded-xl p-6 bg-primary text-white shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-shadow">
            <p className="text-white/80 text-sm font-medium">Sprint Health</p>
            <p className="text-2xl font-bold leading-tight">
              {selectedSprint && selectedSprint.committedPoints > 0
                ? `${Math.round((selectedSprint.completedPoints / selectedSprint.committedPoints) * 100)}%`
                : '--'
              }
            </p>
            <p className="text-white text-sm font-medium">
              {selectedSprint && selectedSprint.committedPoints > 0
                ? (selectedSprint.completedPoints / selectedSprint.committedPoints) >= 0.8
                  ? 'On track'
                  : 'Needs attention'
                : 'Select sprint for health'
              }
            </p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Dynamic Burndown Chart */}
          <div className="xl:col-span-2 rounded-xl bg-white dark:bg-white/5 border border-[#dbdbe6] dark:border-white/10 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <h3 className="font-bold text-lg text-[#111118] dark:text-white">Burndown Chart</h3>
                {burndownLoading && (
                  <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                )}
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#dbdbe6] dark:bg-white/20"></div>
                  <span className="text-xs text-[#616189]">Ideal</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                  <span className="text-xs text-[#616189]">Actual</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-slate-200/50 dark:bg-slate-600/50"></div>
                  <span className="text-xs text-[#616189]">Weekend</span>
                </div>
              </div>
            </div>

            <div className="h-[300px] w-full">
              {burndownLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-[#616189] text-sm">Loading burndown data...</div>
                </div>
              ) : !selectedSprintId ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-[#616189] text-sm">Select a sprint to view burndown chart</div>
                </div>
              ) : burndownData.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-[#616189] text-sm">No burndown data available</div>
                </div>
              ) : (
                <>
                  <div className="flex h-[240px] mb-3">
                    {/* Y-axis labels */}
                    <div className="w-10 flex flex-col justify-between text-xs text-[#616189] py-2 pr-2">
                      {(() => {
                        const maxPoints = Math.max(...burndownData.map(d => d.remainingPoints));
                        const startPoints = selectedSprint?.committedPoints || maxPoints;
                        const chartMax = Math.max(maxPoints, startPoints);
                        const steps = 4;
                        const stepValue = chartMax / steps;
                        return Array.from({ length: steps + 1 }, (_, i) => (
                          <span key={i} className="text-right text-[10px]">
                            {Math.round(chartMax - (stepValue * i))}
                          </span>
                        ));
                      })()}
                    </div>

                    {/* Chart area */}
                    <div className="flex-1 relative border-l border-b border-[#f0f0f4] dark:border-white/10">
                      {/* Weekend Background Bars */}
                      <div className="absolute inset-0 flex">
                        {burndownData.map((point, index) => (
                          <div
                            key={`day-${index}`}
                            className={`flex-1 ${point.isWeekend ? 'bg-slate-100/40 dark:bg-slate-700/20' : ''}`}
                          />
                        ))}
                      </div>

                      {/* Horizontal Grid Lines */}
                      <div className="absolute inset-0 flex flex-col justify-between">
                        {Array.from({ length: 5 }, (_, i) => (
                          <div key={i} className="border-t border-[#f0f0f4] dark:border-white/5 w-full"></div>
                        ))}
                      </div>

                      {/* Chart Lines */}
                      <div className="absolute inset-0 p-2">
                        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                          {(() => {
                            if (burndownData.length === 0) return null;

                            const maxPoints = Math.max(...burndownData.map(d => d.remainingPoints));
                            const startPoints = selectedSprint?.committedPoints || maxPoints;
                            const chartMax = Math.max(maxPoints, startPoints);

                            // Calculate ideal burndown line
                            const idealLine = burndownUtils.calculateIdealBurndown(startPoints, burndownData.length);
                            const idealPath = burndownUtils.generateBurndownPath(idealLine, 100, 100, chartMax);

                            // Calculate actual burndown line
                            const actualPoints = burndownData.map((point, index) => ({
                              x: index,
                              y: point.remainingPoints
                            }));
                            const actualPath = burndownUtils.generateBurndownPath(actualPoints, 100, 100, chartMax);

                            return (
                              <>
                                {/* Ideal burndown line */}
                                <path
                                  d={idealPath}
                                  fill="none"
                                  stroke="#94a3b8"
                                  strokeWidth="2"
                                  strokeDasharray="5,3"
                                  vectorEffect="non-scaling-stroke"
                                />

                                {/* Actual burndown line */}
                                <path
                                  d={actualPath}
                                  fill="none"
                                  stroke="#1111d4"
                                  strokeWidth="2.5"
                                  vectorEffect="non-scaling-stroke"
                                />
                              </>
                            );
                          })()}
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* X-axis labels */}
                  <div className="ml-10 flex justify-between text-xs text-[#616189] px-2">
                    {burndownData.map((point, index) => {
                      // Show start, end, and every few days in between
                      const isFirst = index === 0;
                      const isLast = index === burndownData.length - 1;
                      const isInterval = index % Math.max(Math.floor(burndownData.length / 4), 1) === 0;

                      if (!(isFirst || isLast || isInterval)) {
                        return <div key={index} className="flex-1"></div>;
                      }

                      return (
                        <div key={index} className="flex-1 text-center">
                          <div className={`text-[10px] font-medium ${point.isWeekend ? 'text-slate-400 dark:text-slate-500' : ''}`}>
                            {point.dayName}
                          </div>
                          <div className={`text-[9px] ${point.isWeekend ? 'text-slate-400 dark:text-slate-500' : 'text-[#616189]'}`}>
                            {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Velocity Comparison */}
          <div className="rounded-xl bg-white dark:bg-white/5 border border-[#dbdbe6] dark:border-white/10 p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-6 text-[#111118] dark:text-white">Velocity History</h3>
            <div className="flex items-end justify-between h-[300px] gap-2">
              {sprintsLoading ? (
                <div className="flex items-center justify-center w-full h-full">
                  <div className="text-[#616189] text-sm">Loading velocity data...</div>
                </div>
              ) : sprints.length === 0 ? (
                <div className="flex items-center justify-center w-full h-full">
                  <div className="text-[#616189] text-sm">No sprint data available</div>
                </div>
              ) : (
                (() => {
                  const sortedSprints = sprints
                    .slice()
                    .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
                    .slice(-5);

                  const maxPoints = Math.max(...sortedSprints.map(s => s.completedPoints), 1);

                  return sortedSprints.map((sprint) => {
                    const isActive = sprint.sprintId === selectedSprintId;
                    const heightPixels = Math.max((sprint.completedPoints / maxPoints) * 240, 16); // Convert to pixels with minimum

                    // Extract sprint number from sprint name
                    const sprintNumber = sprint.sprintName.match(/\d+/)?.[0] || sprint.sprintName;

                    return (
                      <div key={sprint.sprintId} className="flex flex-col justify-end items-center gap-2 w-full group h-full">
                        {/* Value labels */}
                        <div className="flex flex-col items-center gap-1 text-[9px] text-[#616189]">
                          <span className="font-bold">{sprint.completedPoints}pts</span>
                          <span className="opacity-60">{Math.round((sprint.completedPoints / Math.max(sprint.committedPoints, 1)) * 100)}%</span>
                        </div>

                        {/* Bar */}
                        <div
                          className={`w-full rounded-t-lg transition-all duration-200 ${
                            isActive
                              ? 'bg-primary shadow-lg shadow-primary/20'
                              : 'bg-[#dbdbe6] dark:bg-white/20 group-hover:bg-primary/30'
                          }`}
                          style={{ height: `${heightPixels}px` }}
                        />

                        {/* Sprint label */}
                        <div className="text-center mt-2">
                          <span className={`text-[10px] font-bold block ${
                            isActive ? 'text-primary' : 'text-[#616189]'
                          }`}>
                            S{sprintNumber}
                          </span>
                          {isActive && (
                            <div className="w-1 h-1 bg-primary rounded-full mx-auto mt-1"></div>
                          )}
                        </div>
                      </div>
                    );
                  });
                })()
              )}
            </div>
          </div>
        </div>

        {/* AI Retrospective Section */}
        <div className="rounded-2xl bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900/50 dark:to-gray-800/30 border border-gray-200/60 dark:border-gray-700/30 shadow-lg shadow-gray-100/50 dark:shadow-gray-900/20 backdrop-blur-sm">
          <div className="p-8">
            <div className="flex items-start gap-4 mb-8">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary via-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/25">
                  <span className="material-symbols-outlined text-white text-xl">auto_awesome</span>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white dark:border-gray-900 animate-pulse"></div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-xl text-gray-900 dark:text-white mb-1">
                  SprintCoPilot Retrospective
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {selectedSprint
                    ? (
                        <>
                          Intelligent analysis for <span className="font-semibold text-primary">{selectedSprint.sprintName}</span>
                          <span className="block text-xs mt-1 text-gray-500 dark:text-gray-500">
                            Automated insights • Performance patterns • Team dynamics
                          </span>
                        </>
                      )
                    : (
                        <>
                          Select a sprint to generate AI-powered retrospective insights
                          <span className="block text-xs mt-1 text-gray-500 dark:text-gray-500">
                            Real-time analysis • Actionable recommendations • Team performance
                          </span>
                        </>
                      )
                  }
                </p>
              </div>
            </div>

            {retrospectiveLoading ? (
              <div className="animate-pulse">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left Column Skeleton */}
                  <div className="lg:col-span-2 space-y-8">
                    {/* What Went Well Skeleton */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
                      </div>
                      <div className="space-y-3">
                        {[1, 2].map((i) => (
                          <div key={i} className="flex gap-3 items-start">
                            <div className="w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded-full flex-shrink-0 mt-1"></div>
                            <div className="flex-1 space-y-2">
                              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
                              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Key Achievements Skeleton */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-36"></div>
                      </div>
                      <div className="space-y-3">
                        {[1, 2].map((i) => (
                          <div key={i} className="flex gap-3 items-start">
                            <div className="w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded-full flex-shrink-0 mt-1"></div>
                            <div className="flex-1 space-y-2">
                              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
                              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Challenges Skeleton */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-40"></div>
                      </div>
                      <div className="space-y-3">
                        {[1, 2].map((i) => (
                          <div key={i} className="flex gap-3 items-start">
                            <div className="w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded-full flex-shrink-0 mt-1"></div>
                            <div className="flex-1 space-y-2">
                              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
                              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-4/5"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column Skeleton */}
                  <div className="space-y-8">
                    {/* Metrics Skeleton */}
                    <div>
                      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24 mb-4"></div>
                      <div className="space-y-4">
                        <div className="text-center">
                          <div className="h-12 bg-gray-300 dark:bg-gray-600 rounded w-20 mx-auto mb-2"></div>
                          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-24 mx-auto"></div>
                        </div>
                        <div className="text-center">
                          <div className="h-12 bg-gray-300 dark:bg-gray-600 rounded w-16 mx-auto mb-2"></div>
                          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-20 mx-auto"></div>
                        </div>
                      </div>
                    </div>

                    {/* Team Insights Skeleton */}
                    <div>
                      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-28 mb-4"></div>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
                        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-5/6"></div>
                        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-4/5"></div>
                      </div>
                    </div>

                    {/* Progress Bars Skeleton */}
                    <div className="space-y-6">
                      {[1, 2].map((i) => (
                        <div key={i}>
                          <div className="flex justify-between mb-2">
                            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
                            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-8"></div>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div className="bg-gray-300 dark:bg-gray-600 h-2 rounded-full w-3/4"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Loading indicator */}
                <div className="flex items-center justify-center mt-8 py-4">
                  <div className="flex items-center gap-3 text-primary">
                    <div className="relative">
                      <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    </div>
                    <span className="text-sm font-medium">AI is analyzing your sprint data...</span>
                  </div>
                </div>
              </div>
            ) : retrospectiveError ? (
              <div className="text-center py-16">
                <span className="material-symbols-outlined text-red-500 text-4xl mb-4 block">error</span>
                <h5 className="font-semibold text-lg text-[#111118] dark:text-white mb-2">Unable to Generate Retrospective</h5>
                <p className="text-red-600 dark:text-red-400 mb-6">
                  We encountered an issue while analyzing your sprint data. Please try again.
                </p>
                <button
                  onClick={() => refetchRetrospective()}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">refresh</span>
                  Retry Analysis
                </button>
              </div>
            ) : !retrospective ? (
              <div className="text-center py-20">
                <div className="relative inline-block mb-6">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center shadow-lg">
                    <span className="material-symbols-outlined text-gray-400 dark:text-gray-500 text-3xl">auto_awesome</span>
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-primary text-xs font-bold">AI</span>
                  </div>
                </div>
                <h5 className="font-semibold text-xl text-gray-900 dark:text-white mb-3">
                  {selectedSprintId ? 'No Retrospective Available' : 'Ready for AI Analysis'}
                </h5>
                <p className="text-gray-600 dark:text-gray-400 max-w-lg mx-auto leading-relaxed mb-6">
                  {selectedSprintId
                    ? 'This sprint doesn\'t have retrospective data yet. AI analysis will be available once there\'s sufficient sprint activity and completion data.'
                    : 'Choose a sprint from the dropdown above to unlock intelligent insights about your team\'s performance, productivity patterns, and actionable recommendations.'
                  }
                </p>
                {!selectedSprintId && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium hover:bg-primary/15 transition-colors">
                    <span className="material-symbols-outlined text-sm">north</span>
                    Select sprint above
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Retrospective Content */}
                <div className="lg:col-span-2 space-y-6">
                  {/* What Went Well */}
                  {retrospective.whatWentWell.length > 0 && (
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50/70 dark:from-green-900/20 dark:to-emerald-900/10 p-6 rounded-2xl border border-green-200/60 dark:border-green-700/30 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-5">
                        <div className="w-8 h-8 rounded-xl bg-green-500 flex items-center justify-center shadow-sm">
                          <span className="material-symbols-outlined text-white text-sm">check_circle</span>
                        </div>
                        <h5 className="font-bold text-green-700 dark:text-green-300 text-sm uppercase tracking-wider">What Went Well</h5>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {retrospective.whatWentWell.slice(0, 4).map((item, index) => (
                          <div key={index} className="flex gap-3 items-start p-3 bg-white/70 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800/30">
                            <div className="flex-shrink-0 mt-0.5">
                              <div className="w-4 h-4 rounded-full bg-green-500/30 flex items-center justify-center">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">{item}</p>
                          </div>
                        ))}
                        {retrospective.whatWentWell.length > 4 && (
                          <div className="md:col-span-2 text-center py-2">
                            <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                              +{retrospective.whatWentWell.length - 4} more in full report
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Key Achievements */}
                  {retrospective.keyAchievements.length > 0 && (
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50/70 dark:from-blue-900/20 dark:to-cyan-900/10 p-6 rounded-2xl border border-blue-200/60 dark:border-blue-700/30 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-5">
                        <div className="w-8 h-8 rounded-xl bg-blue-500 flex items-center justify-center shadow-sm">
                          <span className="material-symbols-outlined text-white text-sm">trophy</span>
                        </div>
                        <h5 className="font-bold text-blue-700 dark:text-blue-300 text-sm uppercase tracking-wider">Key Achievements</h5>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {retrospective.keyAchievements.slice(0, 4).map((item, index) => (
                          <div key={index} className="flex gap-3 items-start p-3 bg-white/70 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/30">
                            <div className="flex-shrink-0 mt-0.5">
                              <div className="w-4 h-4 rounded-full bg-blue-500/30 flex items-center justify-center">
                                <span className="material-symbols-outlined text-blue-500 text-xs">star</span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">{item}</p>
                          </div>
                        ))}
                        {retrospective.keyAchievements.length > 4 && (
                          <div className="md:col-span-2 text-center py-2">
                            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                              +{retrospective.keyAchievements.length - 4} more in full report
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Challenges / Improvements */}
                  {(retrospective.whatCouldBeImproved.length > 0 || retrospective.challenges.length > 0) && (
                    <div className="bg-gradient-to-br from-orange-50 to-amber-50/70 dark:from-orange-900/20 dark:to-amber-900/10 p-6 rounded-2xl border border-orange-200/60 dark:border-orange-700/30 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-5">
                        <div className="w-8 h-8 rounded-xl bg-orange-500 flex items-center justify-center shadow-sm">
                          <span className="material-symbols-outlined text-white text-sm">
                            {retrospective.challenges.length > 0 ? 'warning' : 'lightbulb'}
                          </span>
                        </div>
                        <h5 className="font-bold text-orange-700 dark:text-orange-300 text-sm uppercase tracking-wider">
                          {retrospective.challenges.length > 0 ? 'Challenges Faced' : 'Areas for Improvement'}
                        </h5>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {(retrospective.challenges.length > 0 ? retrospective.challenges : retrospective.whatCouldBeImproved).slice(0, 4).map((item, index) => (
                          <div key={index} className="flex gap-3 items-start p-3 bg-white/70 dark:bg-orange-900/20 rounded-xl border border-orange-100 dark:border-orange-800/30">
                            <div className="flex-shrink-0 mt-0.5">
                              <div className="w-4 h-4 rounded-full bg-orange-500/30 flex items-center justify-center">
                                <span className="material-symbols-outlined text-orange-500 text-xs">
                                  {retrospective.challenges.length > 0 ? 'priority_high' : 'lightbulb'}
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">{item}</p>
                          </div>
                        ))}
                        {(retrospective.challenges.length > 0 ? retrospective.challenges : retrospective.whatCouldBeImproved).length > 4 && (
                          <div className="md:col-span-2 text-center py-2">
                            <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                              +{(retrospective.challenges.length > 0 ? retrospective.challenges : retrospective.whatCouldBeImproved).length - 4} more in full report
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column - Metrics & Insights */}
                <div className="space-y-6">
                  {/* Sprint Metrics */}
                  <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900/30 p-6 rounded-2xl border border-gray-200/60 dark:border-gray-700/30 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-sm">
                        <span className="material-symbols-outlined text-white text-sm">analytics</span>
                      </div>
                      <h5 className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wider">Sprint Metrics</h5>
                    </div>
                    <div className="space-y-5">
                      <div className="text-center p-4 bg-white dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700/50">
                        <div className="text-3xl font-black text-primary mb-1 leading-none">
                          {retrospective.metrics.completionRate}%
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 font-medium uppercase tracking-wider">Completion Rate</div>
                      </div>
                      <div className="text-center p-4 bg-white dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700/50">
                        <div className="text-3xl font-black text-green-600 dark:text-green-400 mb-1 leading-none">
                          {retrospective.metrics.completedPoints}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 font-medium uppercase tracking-wider">Story Points</div>
                      </div>
                    </div>
                  </div>

                  {/* Progress Indicators */}
                  <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900/30 p-6 rounded-2xl border border-gray-200/60 dark:border-gray-700/30 shadow-sm space-y-5">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">Predictability</span>
                        <span className="text-xs font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-md">
                          {Math.round((retrospective.metrics.completedPoints / Math.max(retrospective.metrics.committedPoints, 1)) * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div
                          className="bg-gradient-to-r from-green-500 to-green-600 h-2.5 rounded-full transition-all duration-700 shadow-sm"
                          style={{
                            width: `${Math.min((retrospective.metrics.completedPoints / Math.max(retrospective.metrics.committedPoints, 1)) * 100, 100)}%`
                          }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">Velocity</span>
                        <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-md">
                          {retrospective.metrics.completionRate}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div
                          className="bg-gradient-to-r from-primary to-blue-600 h-2.5 rounded-full transition-all duration-700 shadow-sm"
                          style={{ width: `${retrospective.metrics.completionRate}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* AI Team Insights */}
                  {retrospective.teamInsights && (
                    <div className="bg-gradient-to-br from-purple-50/70 to-indigo-50/50 dark:from-purple-900/20 dark:to-indigo-900/10 p-6 rounded-2xl border border-purple-200/50 dark:border-purple-700/30 shadow-sm">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-xl bg-purple-500 flex items-center justify-center shadow-sm">
                          <span className="material-symbols-outlined text-white text-sm">psychology</span>
                        </div>
                        <h5 className="font-bold text-purple-700 dark:text-purple-300 text-sm uppercase tracking-wider">AI Insights</h5>
                      </div>
                      <div className="bg-white/60 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-100 dark:border-purple-800/30">
                        <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">{retrospective.teamInsights}</p>
                      </div>
                    </div>
                  )}

                  {/* AI Recommendations Preview */}
                  {retrospective.recommendations.length > 0 && (
                    <div className="bg-gradient-to-br from-indigo-50/70 to-blue-50/50 dark:from-indigo-900/20 dark:to-blue-900/10 p-6 rounded-2xl border border-indigo-200/50 dark:border-indigo-700/30 shadow-sm">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-xl bg-indigo-500 flex items-center justify-center shadow-sm">
                          <span className="material-symbols-outlined text-white text-sm">lightbulb</span>
                        </div>
                        <h5 className="font-bold text-indigo-700 dark:text-indigo-300 text-sm uppercase tracking-wider">AI Recommendations</h5>
                      </div>
                      <div className="space-y-3">
                        {retrospective.recommendations.slice(0, 3).map((item, index) => (
                          <div key={index} className="flex gap-3 items-start p-3 bg-white/60 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800/30">
                            <div className="flex-shrink-0 mt-1">
                              <div className="w-4 h-4 rounded-full bg-indigo-500/30 flex items-center justify-center">
                                <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">{item}</p>
                          </div>
                        ))}
                        {retrospective.recommendations.length > 3 && (
                          <div className="text-center py-2">
                            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                              +{retrospective.recommendations.length - 3} more recommendations in PDF
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* PDF Generation Button */}
            {retrospective && (
              <div className="mt-10 pt-8 border-t border-gray-200/60 dark:border-gray-700/30">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-300"></div>
                  <button
                    onClick={handleGeneratePDF}
                    className="relative w-full py-4 px-8 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-500 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl hover:scale-[1.02] transform"
                  >
                    <div className="relative">
                      <span className="material-symbols-outlined text-lg group-hover:animate-bounce">download</span>
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping opacity-75"></div>
                    </div>
                    <span className="font-semibold">Generate Full Retrospective PDF</span>
                    <div className="absolute inset-0 bg-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}