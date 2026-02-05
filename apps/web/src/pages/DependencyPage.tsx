import { useParams } from 'react-router-dom';
import { useState, useRef, useCallback, useEffect } from 'react';
import { CommonHeader } from '../components/common/CommonHeader';
import { jira } from '../lib/api-services';

interface DependencyNode {
  id: string;
  summary: string;
  assignee: string | null;
  priority: 'Major' | 'Minor';
  isBlocked: boolean;
  isBlocker: boolean;
  isInCycle: boolean;
  isSprintSafe: boolean;
}

interface DependencyEdge {
  from: string;
  to: string;
  type: string;
  label: string;
}

interface DependencyGraphData {
  nodes: DependencyNode[];
  edges: DependencyEdge[];
}

export function DependencyPage() {
  const { projectCode } = useParams<{ projectCode: string }>();

  // Zoom and pan state
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const graphRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Dependency data state
  const [dependencyData, setDependencyData] = useState<DependencyGraphData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Zoom controls
  const zoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev * 1.2, 3));
  }, []);

  const zoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev / 1.2, 0.2));
  }, []);

  const resetView = useCallback(() => {
    setZoom(1);
    setPanX(0);
    setPanY(0);
  }, []);

  const centerGraph = useCallback(() => {
    setPanX(0);
    setPanY(0);
  }, []);

  // Fullscreen functionality
  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        if (containerRef.current?.requestFullscreen) {
          await containerRef.current.requestFullscreen();
          setIsFullscreen(true);
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
          setIsFullscreen(false);
        }
      }
    } catch (err) {
      console.error('Error attempting to toggle fullscreen:', err);
    }
  }, []);

  // Listen for fullscreen changes
  const handleFullscreenChange = useCallback(() => {
    setIsFullscreen(!!document.fullscreenElement);
  }, []);

  // Add fullscreen event listener
  useEffect(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [handleFullscreenChange]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F11') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 'f' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        // Only if not typing in an input
        if (!['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
          toggleFullscreen();
        }
      } else if (e.key === 'Escape' && isFullscreen) {
        // Allow ESC to exit fullscreen
        if (document.fullscreenElement) {
          document.exitFullscreen();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [toggleFullscreen, isFullscreen]);

  // Fetch dependency graph data
  useEffect(() => {
    const fetchDependencyGraph = async () => {
      if (!projectCode) return;

      setIsLoading(true);
      setError(null);

      try {
        const graphData = await jira.getDependencyGraph(projectCode);
        setDependencyData(graphData);
      } catch (error) {
        console.error('Error fetching dependency graph:', error);
        setError('Failed to load dependency graph');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDependencyGraph();
  }, [projectCode]);

  // Helper functions for filtering and categorizing nodes
  const getNodesWithDependencies = () => {
    if (!dependencyData) return [];

    // Get all node IDs that are involved in blocking relationships
    const involvedNodeIds = new Set<string>();

    dependencyData.edges.forEach(edge => {
      involvedNodeIds.add(edge.from);
      involvedNodeIds.add(edge.to);
    });

    // Return only nodes that are either blockers, blocked, or involved in dependencies
    return dependencyData.nodes.filter(node =>
      node.isBlocker ||
      node.isBlocked ||
      involvedNodeIds.has(node.id) ||
      !node.isSprintSafe
    );
  };

  const getCriticalBlockers = () => {
    const filteredNodes = getNodesWithDependencies();
    return filteredNodes.filter(node => node.isBlocker && !node.isSprintSafe);
  };

  const getSafeBlockers = () => {
    const filteredNodes = getNodesWithDependencies();
    return filteredNodes.filter(node => node.isBlocker && node.isSprintSafe);
  };

  const getSafeNodes = () => {
    const filteredNodes = getNodesWithDependencies();
    return filteredNodes.filter(node => node.isSprintSafe && !node.isBlocker && !node.isBlocked);
  };

  const getUnsafeNodes = () => {
    const filteredNodes = getNodesWithDependencies();
    return filteredNodes.filter(node => node.isBlocked || node.isInCycle);
  };

  // Get initials from assignee name
  const getInitials = (name: string | null) => {
    if (!name) return '??';
    return name.split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Calculate node positions in a left-to-right hierarchical layout
  const calculateNodePosition = (node: DependencyNode, nodes: DependencyNode[], edges: DependencyEdge[]) => {
    // Group nodes by their role in the dependency graph
    const blockerNodes = nodes.filter(n => n.isBlocker && !n.isBlocked);
    const blockedNodes = nodes.filter(n => n.isBlocked && !n.isBlocker);
    const mixedNodes = nodes.filter(n => n.isBlocker && n.isBlocked);
    const neutralNodes = nodes.filter(n => !n.isBlocker && !n.isBlocked);

    let x = 100;
    let y = 100;

    // Left column: Root blocker nodes (nodes that block others but aren't blocked)
    if (blockerNodes.includes(node)) {
      const index = blockerNodes.indexOf(node);
      x = 100;
      y = 100 + index * 280;
    }
    // Middle column: Mixed nodes (both blockers and blocked)
    else if (mixedNodes.includes(node)) {
      const index = mixedNodes.indexOf(node);
      x = 500;
      y = 100 + index * 280;
    }
    // Right columns: Blocked nodes (organized in columns by dependency depth)
    else if (blockedNodes.includes(node)) {
      const index = blockedNodes.indexOf(node);
      const rows = Math.max(Math.ceil(blockedNodes.length / 3), 1);
      const col = Math.floor(index / rows);
      const row = index % rows;
      x = 900 + col * 400;
      y = 100 + row * 280;
    }
    // Far right: Neutral nodes (shouldn't appear much with our filtering)
    else {
      const index = neutralNodes.indexOf(node);
      x = 1300;
      y = 100 + index * 280;
    }

    return { x, y };
  };

  // Pan controls
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) { // Left mouse button
      setIsDragging(true);
      setDragStart({ x: e.clientX - panX, y: e.clientY - panY });
      e.preventDefault();
    }
  }, [panX, panY]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      setPanX(e.clientX - dragStart.x);
      setPanY(e.clientY - dragStart.y);
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.min(Math.max(prev * delta, 0.2), 3));
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex flex-col h-screen overflow-hidden"
    >
      <CommonHeader />

      <div className="flex flex-1 overflow-hidden">
        {/* Main Content - Now takes full width */}
        <main className="flex-1 flex flex-col bg-slate-50 relative">
          {/* Top Bar */}
          <div className="flex items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-md z-10 px-6">
            <div className="flex items-center gap-2 py-3">
              <a className="text-slate-500 text-sm font-medium hover:text-primary transition-colors" href="/dashboard">Dashboard</a>
              <span className="text-slate-300 text-sm font-medium">/</span>
              <a className="text-slate-500 text-sm font-medium hover:text-primary transition-colors" href={`/backlog/${projectCode}`}>Backlog</a>
              <span className="text-slate-300 text-sm font-medium">/</span>
              <span className="text-slate-900 text-sm font-semibold">Dependency Graph</span>
            </div>

            <div className="flex items-center gap-2 py-2">
              <div className="text-xs text-slate-500 font-medium mr-3">
                {Math.round(zoom * 100)}%
              </div>
              <div className="flex gap-1 border-r border-slate-200 pr-4 mr-2">
                <button
                  onClick={zoomIn}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
                  title="Zoom In"
                >
                  <span className="material-symbols-outlined text-xl">add</span>
                </button>
                <button
                  onClick={zoomOut}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
                  title="Zoom Out"
                >
                  <span className="material-symbols-outlined text-xl">remove</span>
                </button>
                <button
                  onClick={toggleFullscreen}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
                  title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                >
                  <span className="material-symbols-outlined text-xl">
                    {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
                  </span>
                </button>
                <button
                  onClick={resetView}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
                  title="Reset View"
                >
                  <span className="material-symbols-outlined text-xl">zoom_out_map</span>
                </button>
                <button
                  onClick={centerGraph}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
                  title="Center"
                >
                  <span className="material-symbols-outlined text-xl">center_focus_weak</span>
                </button>
              </div>
              <button className="flex items-center justify-center rounded-lg h-9 bg-white border border-slate-200 text-slate-900 gap-2 text-xs font-bold px-4 hover:bg-slate-50 transition-colors shadow-sm">
                <span className="material-symbols-outlined text-sm">download</span>
                <span className="truncate">Export Graph</span>
              </button>
            </div>
          </div>

          {/* Graph Canvas */}
          <div
            className="relative flex-1 graph-canvas overflow-hidden"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          >
            {/* Filter Tags */}
            {dependencyData && (
              <div className="absolute top-6 left-6 z-20 flex flex-col gap-3 max-w-sm">
                <div className="bg-white/90 backdrop-blur-md rounded-lg border border-slate-200 shadow-lg p-4">
                  <h4 className="text-sm font-semibold text-slate-900 mb-2">Dependency Flow</h4>
                  <div className="text-xs text-slate-600 mb-3">
                    Showing {getNodesWithDependencies().length} tickets with blocking relationships
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                      <span className="text-slate-700">Critical Blockers: {getCriticalBlockers().length}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                      <span className="text-slate-700">Safe Blockers: {getSafeBlockers().length}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                      <span className="text-slate-700">Complex: {getNodesWithDependencies().filter(n => n.isBlocker && n.isBlocked).length}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span>
                      <span className="text-slate-700">Blocked: {getUnsafeNodes().length}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                      <span className="text-slate-700">Safe: {getSafeNodes().length}</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-200">
                    <div className="text-[10px] text-slate-500 flex items-center gap-1">
                      <span>Flow:</span>
                      <span className="font-mono">Left → Right</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Dependency Graph Nodes */}
            <div
              ref={graphRef}
              className="relative h-full p-12"
              style={{
                width: '1800px', // Slightly smaller for better fit
                minHeight: '1000px',
                transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
                transformOrigin: 'center center', // Better centering
                transition: isDragging ? 'none' : 'transform 0.2s ease-out'
              }}
            >
              {isLoading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-slate-500">Loading dependency graph...</div>
                </div>
              ) : error ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-red-500">Error: {error}</div>
                </div>
              ) : dependencyData ? (
                <>
                  {/* SVG Connections */}
                  <div className="absolute inset-0 pointer-events-none">
                    <svg className="absolute w-full h-full">
                      {(() => {
                        // Remove duplicate edges by creating a unique key
                        const uniqueEdges = Array.from(
                          new Map(
                            dependencyData.edges.map(edge => [
                              `${edge.from}-${edge.to}`,
                              edge
                            ])
                          ).values()
                        );

                        return uniqueEdges.map((edge, index) => {
                          const filteredNodes = getNodesWithDependencies();
                          const fromNode = filteredNodes.find(n => n.id === edge.from);
                          const toNode = filteredNodes.find(n => n.id === edge.to);

                          if (!fromNode || !toNode) return null;

                          const fromPos = calculateNodePosition(fromNode, filteredNodes, dependencyData.edges);
                          const toPos = calculateNodePosition(toNode, filteredNodes, dependencyData.edges);

                          // Calculate connection points (right side of from-node to left side of to-node)
                          const fromX = fromPos.x + 256; // Right edge of from-node
                          const fromY = fromPos.y + 60;  // Center height of from-node
                          const toX = toPos.x;           // Left edge of to-node
                          const toY = toPos.y + 60;      // Center height of to-node

                          // Create curved path for better visual flow
                          const midX = fromX + (toX - fromX) / 2;
                          const pathData = `M ${fromX} ${fromY} C ${midX} ${fromY}, ${midX} ${toY}, ${toX} ${toY}`;

                          return (
                            <g key={`edge-${edge.from}-${edge.to}`}>
                              {/* Curved connection line */}
                              <path
                                d={pathData}
                                stroke="#ef4444"
                                strokeWidth="2"
                                fill="none"
                                strokeDasharray="none"
                                markerEnd="url(#arrowhead-red)"
                              />
                              {/* Edge label */}
                              <text
                                x={midX}
                                y={(fromY + toY) / 2 - 8}
                                fill="#ef4444"
                                fontSize="9"
                                fontWeight="600"
                                textAnchor="middle"
                                className="pointer-events-none"
                              >
                                BLOCKS
                              </text>
                            </g>
                          );
                        });
                      })()}
                      <defs>
                        <marker id="arrowhead" markerHeight="7" markerWidth="10" orient="auto" refX="10" refY="3.5">
                          <polygon fill="#cbd5e1" points="0 0, 10 3.5, 0 7"></polygon>
                        </marker>
                        <marker id="arrowhead-red" markerHeight="7" markerWidth="10" orient="auto" refX="10" refY="3.5">
                          <polygon fill="#ef4444" points="0 0, 10 3.5, 0 7"></polygon>
                        </marker>
                      </defs>
                    </svg>
                  </div>

                  {/* Dynamic Node Cards - Only show nodes with dependencies */}
                  {getNodesWithDependencies().map((node, index) => {
                    const filteredNodes = getNodesWithDependencies();
                    const position = calculateNodePosition(node, filteredNodes, dependencyData.edges);

                    // Determine node styling based on dependency role
                    let nodeClassName = "absolute w-64 node-card flex flex-col gap-3 z-10";
                    let statusIcon = "radio_button_unchecked";
                    let statusColor = "text-slate-300";
                    let cardBg = "bg-blue-50";
                    let cardTextColor = "text-blue-600";
                    let roleLabel = "Unknown";

                    if (node.isBlocker && !node.isBlocked) {
                      // Pure blocker - blocks others, but consider sprint safety
                      nodeClassName += " blocker-node";
                      statusIcon = "block";
                      if (node.isSprintSafe) {
                        // Sprint safe blockers should be orange/amber, not red
                        statusColor = "text-amber-600";
                        cardBg = "bg-amber-50";
                        cardTextColor = "text-amber-600";
                        roleLabel = "SAFE BLOCKER";
                      } else {
                        // Non-sprint safe blockers are critical (red)
                        statusColor = "text-red-600";
                        cardBg = "bg-red-50";
                        cardTextColor = "text-red-600";
                        roleLabel = "CRITICAL BLOCKER";
                      }
                    } else if (node.isBlocked && !node.isBlocker) {
                      // Pure blocked - blocked by others
                      nodeClassName += " blocked-node";
                      statusIcon = "warning";
                      statusColor = "text-yellow-600";
                      cardBg = "bg-yellow-50";
                      cardTextColor = "text-yellow-600";
                      roleLabel = "BLOCKED";
                    } else if (node.isBlocker && node.isBlocked) {
                      // Mixed - both blocks others and is blocked
                      nodeClassName += " mixed-node";
                      statusIcon = "sync_problem";
                      statusColor = "text-purple-600";
                      cardBg = "bg-purple-50";
                      cardTextColor = "text-purple-600";
                      roleLabel = "COMPLEX";
                    } else if (!node.isSprintSafe) {
                      // Not sprint safe
                      nodeClassName += " unsafe-border";
                      statusIcon = "dangerous";
                      statusColor = "text-red-600";
                      cardBg = "bg-red-50";
                      cardTextColor = "text-red-600";
                      roleLabel = "UNSAFE";
                    } else {
                      // Has dependencies but is otherwise safe
                      nodeClassName += " safe-glow";
                      statusIcon = "check_circle";
                      statusColor = "text-green-600";
                      cardBg = "bg-green-50";
                      cardTextColor = "text-green-600";
                      roleLabel = "SAFE";
                    }

                    return (
                      <div
                        key={node.id}
                        className={nodeClassName}
                        style={{
                          left: `${position.x}px`,
                          top: `${position.y}px`
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-0.5 rounded ${cardBg} ${cardTextColor} text-[10px] font-bold uppercase tracking-wider`}>
                            {node.id}
                          </span>
                          <div className="flex items-center gap-1">
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${cardBg} ${cardTextColor}`}>
                              {roleLabel}
                            </span>
                            <span className={`material-symbols-outlined text-lg ${statusColor}`}>
                              {statusIcon}
                            </span>
                          </div>
                        </div>

                        <h3 className="text-sm font-semibold leading-tight text-slate-900 line-clamp-2">
                          {node.summary}
                        </h3>

                        <div className="text-[11px] text-slate-500 leading-relaxed space-y-1">
                          {node.isBlocker && (
                            <p>🚫 Blocks other tickets</p>
                          )}
                          {node.isBlocked && (
                            <p>⏳ Blocked by dependencies</p>
                          )}
                          {!node.isSprintSafe && (
                            <p>⚠️ Not sprint safe</p>
                          )}
                          {node.isInCycle && (
                            <p>🔄 In dependency cycle</p>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
                          <div className="flex items-center gap-2">
                            <div className="size-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                              {getInitials(node.assignee)}
                            </div>
                            <span className="text-xs text-slate-500">
                              {node.assignee || 'Unassigned'}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase">
                            {node.priority}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-slate-500">No dependency data available</div>
                </div>
              )}
            </div>

            {/* Mini Map */}
            <div className="absolute bottom-6 right-6 w-48 h-32 rounded-xl bg-white/90 backdrop-blur-md border border-slate-200 p-2 shadow-xl hidden md:block z-30">
              <div className="w-full h-full bg-slate-50 rounded-lg flex items-center justify-center relative border border-slate-100 overflow-hidden">
                <div className="w-4 h-3 bg-indigo-200 rounded absolute top-4 left-4"></div>
                <div className="w-4 h-3 bg-indigo-200 rounded absolute bottom-4 left-4"></div>
                <div className="w-6 h-4 bg-red-100 rounded absolute top-12 left-12 border border-red-300"></div>
                <div className="w-4 h-3 bg-slate-200 rounded absolute top-12 right-4"></div>
                <div className="absolute inset-2 border-2 border-primary/30 rounded-lg pointer-events-none"></div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Custom Styles - Add these to your global CSS or styled-components */}
      <style>{`
        .graph-canvas {
          background-image: radial-gradient(#cbd5e1 1px, transparent 1px);
          background-size: 32px 32px;
        }
        .safe-glow {
          box-shadow: 0 4px 12px rgba(34, 197, 94, 0.12), 0 0 0 1px rgba(34, 197, 94, 0.2);
        }
        .unsafe-border {
          border: 2px solid #ef4444;
          box-shadow: 0 4px 20px rgba(239, 68, 68, 0.15);
        }
        .blocker-node {
          border: 3px solid #ef4444;
          box-shadow: 0 8px 25px rgba(239, 68, 68, 0.25), 0 0 0 1px rgba(239, 68, 68, 0.1);
        }
        .blocked-node {
          border: 2px solid #f59e0b;
          box-shadow: 0 4px 15px rgba(245, 158, 11, 0.15);
        }
        .mixed-node {
          border: 2px solid #8b5cf6;
          box-shadow: 0 4px 15px rgba(139, 92, 246, 0.15);
        }
        .node-card {
          background: white;
          border-radius: 0.75rem;
          padding: 1rem;
          border: 1px solid #e2e8f0;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
          transition: box-shadow 0.2s ease-in-out;
        }
        .node-card:hover {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}