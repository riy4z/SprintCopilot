import { useState, useEffect } from 'react';
import { jira } from '../../lib/api-services';
import type { Ticket } from '@/types';
import { useNavigate } from 'react-router-dom';

interface AIInsightsSidebarProps {
  tickets?: Ticket[];
  projectCode: string;
}

interface BacklogHealthData {
  healthScore: number;
  grade: string;
  velocity: number;
  totalStoryPoints: number;
  velocityUtilization: number;
  itemsAnalyzed: number;
  refinedItems: number;
  breakdown: {
    refinementScore: number;
    orderingScore: number;
    velocityScore: number;
    dependencyScore: number;
  };
  issues: string[];
  recommendations: string[];
}

interface DependencyGraphData {
  nodes: Array<{
    id: string;
    summary: string;
    assignee: string | null;
    priority: 'Major' | 'Minor';
    isBlocked: boolean;
    isBlocker: boolean;
    isInCycle: boolean;
    isSprintSafe: boolean;
  }>;
  edges: Array<{
    from: string;
    to: string;
    type: string;
    label: string;
  }>;
}

export function AIInsightsSidebar({ tickets, projectCode }: AIInsightsSidebarProps) {
  const [inputValue, setInputValue] = useState('');
  const [healthData, setHealthData] = useState<BacklogHealthData | null>(null);
  const [dependencyData, setDependencyData] = useState<DependencyGraphData | null>(null);
  const [focusNodeId, setFocusNodeId] = useState<string | null>(null);

    const navigate = useNavigate();

    const handleViewDependencies = () => {
    navigate(`/dependencies/${projectCode}`);
  };

  useEffect(() => {
    const fetchBacklogHealth = async () => {
      try {
        const response = await jira.getBacklogHealth(projectCode);
        setHealthData(response);
      } catch (error) {
        console.error('Error fetching backlog health:', error);
        setHealthData(null);
      }
    };

    const fetchDependencyGraph = async () => {
      try {
        const graphData = await jira.getDependencyGraph(projectCode);
        setDependencyData(graphData);
        
        // Set focus to first blocked node to show all its blockers
        const blockedNode = graphData.nodes.find(node => node.isBlocked);
        setFocusNodeId(blockedNode?.id || graphData.nodes[0]?.id || null);
      } catch (error) {
        console.error('Error fetching dependency graph:', error);
      }
    };

    if (projectCode) {
      fetchBacklogHealth();
      fetchDependencyGraph();
    }
  }, [projectCode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      console.log('AI Query:', inputValue);
      setInputValue('');
    }
  };

  const handleFetchDependencyGraph = async () => {
    try {
      const graphData = await jira.getDependencyGraph(projectCode);
      setDependencyData(graphData);
      
      // Set focus to first blocked node to show all its blockers
      const blockedNode = graphData.nodes.find(node => node.isBlocked);
      setFocusNodeId(blockedNode?.id || graphData.nodes[0]?.id || null);
    } catch (error) {
      console.error('Error fetching dependency graph:', error);
    }
  };

  const getFocusNode = () => {
    if (!dependencyData || !focusNodeId) return null;
    return dependencyData.nodes.find(node => node.id === focusNodeId);
  };

  const getBlockedByFocusNode = () => {
    if (!dependencyData || !focusNodeId) return [];
    // Get nodes that ARE BLOCKED BY the focus node (focus node blocks them)
    // Remove duplicates by using a Set to track unique node IDs
    const uniqueNodeIds = new Set();
    return dependencyData.edges
      .filter(edge => edge.from === focusNodeId) // Focus node is the blocker
      .map(edge => dependencyData.nodes.find(node => node.id === edge.to))
      .filter(node => node && !uniqueNodeIds.has(node.id) && uniqueNodeIds.add(node.id));
  };

  const getBlocksFocusNode = () => {
    if (!dependencyData || !focusNodeId) return [];
    // Get nodes that BLOCK the focus node (focus node is blocked by them)
    // Remove duplicates by using a Set to track unique node IDs
    const uniqueNodeIds = new Set();
    return dependencyData.edges
      .filter(edge => edge.to === focusNodeId) // Focus node is being blocked
      .map(edge => dependencyData.nodes.find(node => node.id === edge.from))
      .filter(node => node && !uniqueNodeIds.has(node.id) && uniqueNodeIds.add(node.id));
  };

  const getNodeBorderColor = (node: any) => {
    if (node.isBlocked) return 'border-red-500';
    if (node.isBlocker && !node.isSprintSafe) return 'border-red-500'; // Critical blockers
    if (node.isBlocker && node.isSprintSafe) return 'border-amber-500'; // Safe blockers
    if (!node.isSprintSafe) return 'border-red-500';
    return 'border-slate-300 dark:border-slate-600';
  };

  const getNodeBgColor = (node: any) => {
    if (!node.isSprintSafe) return 'bg-red-50 dark:bg-red-900/20';
    if (node.isBlocker && node.isSprintSafe) return 'bg-amber-50 dark:bg-amber-900/20';
    if (node.isBlocker && !node.isSprintSafe) return 'bg-red-50 dark:bg-red-900/20';
    if (node.isBlocked) return 'bg-yellow-50 dark:bg-yellow-900/20';
    return 'bg-white dark:bg-slate-800';
  };


  const getGradeColor = () => {
    const grade = healthData?.grade || 'F';
    if (grade === 'A') return 'text-emerald-600 dark:text-emerald-400';
    if (grade === 'B') return 'text-blue-600 dark:text-blue-400';
    if (grade === 'C') return 'text-amber-600 dark:text-amber-400';
    if (grade === 'D') return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getCircleColor = () => {
    const score = healthData?.healthScore || 0;
    if (score >= 80) return 'text-emerald-500';
    if (score >= 60) return 'text-amber-500';
    return 'text-red-500';
  };

  return (
    <aside className="hidden lg:flex lg:w-[380px] shrink-0 border-l border-slate-200 dark:border-slate-800 bg-background-light dark:bg-slate-950/80 backdrop-blur-sm overflow-y-auto flex-col shadow-xl z-5">
      {/* Sidebar Header */}
      <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 9l1.25-2.75L23 5l-2.75-1.25L19 1l-1.25 2.75L15 5l2.75 1.25L19 9zm-7.5.5L9 4 6.5 9.5 1 12l5.5 2.5L9 20l2.5-5.5L17 12l-5.5-2.5zM19 15l-1.25 2.75L15 19l2.75 1.25L19 23l1.25-2.75L23 19l-2.75-1.25L19 15z"/>
          </svg>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Sprint Analysis</h3>
        </div>
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary">
          LIVE
        </span>
      </div>

      <div className="p-6 space-y-6">
        {/* Health Score Card */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400">Backlog Health</h4>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1 flex items-center gap-2">
                {healthData?.healthScore?.toFixed(1) || 0}%
                <span className={`text-lg font-bold ${getGradeColor()} px-2 py-0.5 rounded-md bg-current/10`}>
                  {healthData?.grade || 'F'}
                </span>
              </p>
            </div>
            <div className="relative size-12">
              <svg className="size-full rotate-[-90deg]" viewBox="0 0 36 36">
                <circle
                  className="stroke-current text-slate-100 dark:text-slate-800"
                  cx="18"
                  cy="18"
                  fill="none"
                  r="16"
                  strokeWidth="4"
                />
                <circle
                  className={`stroke-current ${getCircleColor()}`}
                  cx="18"
                  cy="18"
                  fill="none"
                  r="16"
                  strokeDasharray={`${healthData?.healthScore || 0} 100`}
                  strokeLinecap="round"
                  strokeWidth="4"
                />
              </svg>
            </div>
          </div>

          {/* Health Breakdown */}
          {healthData && (
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Refinement</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">{healthData.breakdown.refinementScore.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Ordering</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">{healthData.breakdown.orderingScore.toFixed(1)}%</span>
              </div>
            </div>
          )}

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Based on story point estimation consistency, acceptance criteria detail, and dependency mapping.
          </p>
        </div>

        {/* Issues from API */}
        {healthData?.issues && healthData.issues.length > 0 && (
          <div className="space-y-3">
            {healthData.issues.slice(0, 2).map((issue, index) => (
              <div key={index} className="bg-red-50 dark:bg-red-900/10 rounded-xl p-4 border border-red-100 dark:border-red-900/30 flex gap-3 items-start">
                <svg className="w-5 h-5 text-red-600 dark:text-red-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                </svg>
                <div>
                  <h4 className="text-sm font-bold text-red-900 dark:text-red-400">Critical Issue</h4>
                  <p className="text-sm text-red-800/80 dark:text-red-400/80 mt-1 leading-normal">
                    {issue}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Velocity Stats */}
        {healthData && (
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
            <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-4">Sprint Metrics</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{healthData.velocity}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Team Velocity</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{healthData.totalStoryPoints}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Story Points</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Velocity Utilization</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">{healthData.velocityUtilization}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Dependency Graph Visualization */}
        <div onClick={handleViewDependencies} className="cursor-pointer bg-white dark:bg-slate-900 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-sm font-medium text-slate-900 dark:text-white">Blocking Dependencies</h4>
            {focusNodeId && <span className="text-xs font-medium text-slate-400">{focusNodeId} Focus</span>}
          </div>

          {dependencyData && focusNodeId ? (
            <div className="relative w-full bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-slate-800 overflow-hidden" style={{ minHeight: `${Math.max(180, getBlocksFocusNode().length * 40 + getBlockedByFocusNode().length * 40 + 100)}px` }}>
              {/* SVG Lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {/* Lines from left nodes to center */}
                {getBlocksFocusNode().map((node, idx) => (
                  <line
                    key={`left-line-${idx}`}
                    stroke="#94a3b8"
                    strokeDasharray="4 2"
                    strokeWidth="1.5"
                    x1="20%"
                    x2="50%"
                    y1={`${20 + idx * 30}%`}
                    y2="50%"
                  />
                ))}

                {/* Lines from center to right nodes */}
                {getBlockedByFocusNode().map((node, idx) => (
                  <line
                    key={`right-line-${idx}`}
                    stroke="#ef4444"
                    strokeWidth="1.5"
                    x1="50%"
                    x2="80%"
                    y1="50%"
                    y2={`${20 + idx * 30}%`}
                  />
                ))}
              </svg>

              {/* Left Nodes (Blocks Focus) */}
              {getBlocksFocusNode().map((node, idx) => (
                <div
                  key={`left-${node?.id}`}
                  className={`absolute ${getNodeBgColor(node)} ${getNodeBorderColor(node)} border-2 text-[10px] font-bold w-7 h-7 rounded-full flex items-center justify-center z-10 hover:shadow-md transition-shadow`}
                  style={{left: '20%', top: `${20 + idx * 30}%`, transform: 'translate(-50%, -50%)'}}
                  title={`${node?.summary} - ${node?.isSprintSafe ? 'Sprint Safe' : 'Not Sprint Safe'} ${node?.isBlocker ? 'Blocker' : ''}`}
                >
                  {node?.id?.split('-')[1]}
                </div>
              ))}

              {/* Center Node (Focus) */}
              <div
                className={`absolute ${getNodeBgColor(getFocusNode())} ${getNodeBorderColor(getFocusNode())} border-2 text-[10px] font-bold w-8 h-8 rounded-full flex items-center justify-center z-10 shadow-sm hover:shadow-md transition-shadow`}
                style={{left: '50%', top: '50%', transform: 'translate(-50%, -50%)'}}
                title={`${getFocusNode()?.summary} - ${getFocusNode()?.isBlocked ? 'BLOCKED' : 'Focus Node'}`}
              >
                <span className={getFocusNode()?.isBlocked ? 'text-red-700 dark:text-red-400' : 'text-primary dark:text-white'}>
                  {focusNodeId?.split('-')[1]}
                </span>
              </div>

              {/* Right Nodes (Blocked by Focus) */}
              {getBlockedByFocusNode().map((node, idx) => (
                <div
                  key={`right-${node?.id}`}
                  className="absolute bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-500 text-yellow-700 dark:text-yellow-400 text-[10px] font-bold w-7 h-7 rounded-full flex items-center justify-center z-10 shadow-sm hover:shadow-md transition-shadow"
                  style={{left: '80%', top: `${20 + idx * 30}%`, transform: 'translate(-50%, -50%)'}}
                  title={`${node?.summary} - Blocked by ${focusNodeId}`}
                >
                  {node?.id?.split('-')[1]}
                </div>
              ))}
            </div>
          ) : (
            <div className="relative h-32 w-full bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-slate-800 flex items-center justify-center overflow-hidden">
              <p className="text-xs text-slate-500 dark:text-slate-400">Loading dependency graph...</p>
            </div>
          )}

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 text-center">
            {focusNodeId && (getBlockedByFocusNode().length > 0 || getBlocksFocusNode().length > 0) ? (
              <>
                {getBlockedByFocusNode().length > 0 && (
                  <div className="mb-1">
                    <span className="font-semibold text-primary">{focusNodeId}</span> blocks{' '}
                    <span className="font-semibold text-yellow-600 dark:text-yellow-400">{getBlockedByFocusNode().map(n => n?.id).join(', ')}</span>
                  </div>
                )}
                {getBlocksFocusNode().length > 0 && (
                  <div>
                    <span className="font-semibold text-primary">{focusNodeId}</span> is blocked by{' '}
                    <span className="font-semibold text-amber-600 dark:text-amber-400">{getBlocksFocusNode().map(n => n?.id).join(', ')}</span>
                  </div>
                )}
              </>
            ) : (
              'No blocking dependencies found.'
            )}
          </p>
        </div>

        {/* AI Recommendations */}
        {healthData?.recommendations && healthData.recommendations.length > 0 && (
          <div className="space-y-3">
            {healthData.recommendations.slice(0, 2).map((recommendation, index) => (
              <div key={index} className="bg-primary/5 dark:bg-primary/10 rounded-xl p-4 border border-primary/10">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6C7.8 12.16 7 10.63 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z"/>
                  </svg>
                  <h4 className="text-sm font-bold text-primary">AI Recommendation</h4>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mb-3 leading-relaxed">
                  {recommendation}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

    </aside>
  );
}