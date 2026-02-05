import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CommonHeader } from '../components/common/CommonHeader';
import { ai, type AutoAssignRequest, type AutoAssignResponse } from '../lib/api-services';
import { SparkleLoader } from '../components/ui/SparkleLoader';
import { useSelectedProject } from '../lib/projectContext';

export function AISprintPlanPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedProject } = useSelectedProject();
  const [isAutoAssigning, setIsAutoAssigning] = useState(false);
  const [showAllTickets, setShowAllTickets] = useState(false);
  const [ticketAssignments, setTicketAssignments] = useState<{[ticketId: string]: string}>({}); 
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set()); 
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null); 
  const [dropdownSearch, setDropdownSearch] = useState<string>(''); 
  const [showAssignmentDialog, setShowAssignmentDialog] = useState(false); 
  const [assignmentWarnings, setAssignmentWarnings] = useState<AutoAssignResponse['warnings']>([]); 
  const [lastAssignmentResult, setLastAssignmentResult] = useState<AutoAssignResponse | null>(null); 
  const [predictingStoryPoints, setPredictingStoryPoints] = useState<Set<string>>(new Set()); 

  // Extract data from navigation state
  const sprintData = location.state as any;
  const actualTeamMembers = sprintData?.teamMembers?.filter((m: any) => m.isSelected) || [];
  const actualTickets = sprintData?.selectedTickets || [];
  const sprintConfig = sprintData?.sprintConfig || {};
  const projectInfo = sprintData?.projectInfo || {};

  // Log and handle incoming sprint planning data
  useEffect(() => {
    if (location.state) {
      console.group('📋 Sprint Planning Page - Received Data');
      console.log('🔄 Full State Object:', location.state);

      const {
        selectedTickets,
        sprintConfig,
        projectCode,
        projectInfo,
        wasAutoSelected,
        teamMembers,
        allBacklogTickets
      } = location.state as any;

      console.log('🎯 Sprint Configuration:', sprintConfig);
      console.log('👥 Team Members:', teamMembers);
      console.log('🎫 Selected Tickets:', selectedTickets);
      console.log('📊 Project Info:', { code: projectCode, info: projectInfo });
      console.log('🔄 Auto-Selected:', wasAutoSelected);
      console.log('📋 Total Backlog Tickets:', allBacklogTickets?.length || 0);

      // Log team member details for auto-assignment
      if (teamMembers && teamMembers.length > 0) {
        console.log('👨‍💻 Team Member Details for Auto-Assignment:');
        teamMembers.forEach((member: any) => {
          console.log(`  - ${member.name} (${member.userId}):`, {
            role: member.roleKeywords || 'No role set',
            capacity: member.capacity,
            availability: member.availability,
            selected: member.isSelected
          });
        });
      }

      // Log ticket details for assignment
      if (selectedTickets && selectedTickets.length > 0) {
        console.log('🎫 Tickets Ready for Auto-Assignment:');
        selectedTickets.forEach((ticket: any) => {
          console.log(`  - ${ticket.key}: ${ticket.summary}`, {
            points: ticket.storyPoints,
            priority: ticket.priority,
            currentAssignee: ticket.assigneeName || 'Unassigned'
          });
        });
      }

      console.groupEnd();

      // Initialize ticket assignments from existing assignees
      if (selectedTickets && selectedTickets.length > 0) {
        const initialAssignments: {[ticketId: string]: string} = {};
        const assignedCount = selectedTickets.filter((ticket: any) => ticket.assignee).length;
        const unassignedCount = selectedTickets.length - assignedCount;

        selectedTickets.forEach((ticket: any) => {
          if (ticket.assignee) {
            initialAssignments[ticket.id] = ticket.assignee;
          }
        });

        console.log(`📋 Ticket Assignment Status: ${assignedCount} assigned, ${unassignedCount} unassigned (ready for auto-assignment)`);

        if (unassignedCount > 0) {
          console.log('🔄 Unassigned tickets available for reassignment:',
            selectedTickets.filter((ticket: any) => !ticket.assignee).map((ticket: any) => ticket.key).join(', ')
          );
        }

        setTicketAssignments(initialAssignments);
      }
    } else {
      console.log('⚠️ No sprint planning data received - direct navigation?');
    }
  }, [location.state]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (activeDropdown && !target.closest('.assignee-dropdown')) {
        setActiveDropdown(null);
        setDropdownSearch('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeDropdown]);

  // Toggle card expansion
  const toggleCardExpansion = (userId: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  // Helper functions
  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'critical':
      case 'highest':
        return 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400';
      case 'high':
        return 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400';
      case 'medium':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400';
      case 'low':
      case 'lowest':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-400';
    }
  };

  // Calculate story points availability for each team member
  const calculateMemberAvailability = (member: any) => {
    if (!member || !sprintConfig) return { totalStoryPoints: 0, assignedStoryPoints: 0, availabilityPercentage: 0 };

    // Calculate total story points available based on capacity and availability
    // Formula: capacity (days) * availability (%) * average story points per day
    // We'll use a base of 2-3 story points per day as a reasonable average
    const storyPointsPerDay = 2.5; // This could be made configurable or derived from historical data

    const effectiveCapacityDays = (member.capacity || 5) * (member.availability || 100) / 100;
    const totalStoryPoints = Math.round(effectiveCapacityDays * storyPointsPerDay);

    // Find tickets assigned to this member (using current assignment state or original assignee)
    const assignedTickets = actualTickets.filter((ticket: any) => {
      const currentAssignment = ticketAssignments[ticket.id];
      return currentAssignment === member.userId ||
             (currentAssignment === undefined && (ticket.assignee === member.userId || ticket.assigneeName === member.name));
    });

    const assignedStoryPoints = assignedTickets.reduce((sum: number, ticket: any) =>
      sum + (ticket.storyPoints || 0), 0
    );

    const availabilityPercentage = totalStoryPoints > 0
      ? Math.round((assignedStoryPoints / totalStoryPoints) * 100)
      : 0;

    return {
      totalStoryPoints,
      assignedStoryPoints,
      availabilityPercentage: Math.min(availabilityPercentage, 100), // Cap at 100%
      assignedTickets
    };
  };


  // Production-level capacity validation
  const validateCapacityConstraints = (
    members: any[],
    tickets: any[],
    assignments: {[ticketId: string]: string}
  ) => {
    const warnings: AutoAssignResponse['warnings'] = [];
    const memberCapacity: {[userId: string]: {used: number, total: number, name: string}} = {};

    // Initialize member capacity tracking
    members.forEach(member => {
      const availability = calculateMemberAvailability(member);
      memberCapacity[member.userId] = {
        used: 0,
        total: availability.totalStoryPoints,
        name: member.name
      };
    });

    // Calculate proposed assignments
    tickets.forEach((ticket: any) => {
      const assignedUserId = assignments[ticket.id];
      if (assignedUserId && memberCapacity[assignedUserId]) {
        memberCapacity[assignedUserId].used += ticket.storyPoints || 0;
      }
    });

    // Check for capacity violations
    Object.entries(memberCapacity).forEach(([userId, capacity]) => {
      const utilizationPct = capacity.total > 0 ? (capacity.used / capacity.total) * 100 : 0;

      if (utilizationPct > 100) {
        warnings.push({
          type: 'CAPACITY_EXCEEDED',
          userId,
          message: `${capacity.name} would be overloaded at ${utilizationPct.toFixed(1)}% capacity (${capacity.used}/${capacity.total} SP)`
        });
      }
    });

    return { warnings, memberCapacity };
  };

  // Intelligent assignment algorithm with production-level logic
  const performIntelligentAssignment = async (reassignAll: boolean) => {
    const sprintData = location.state as any;
    if (!sprintData) throw new Error('No sprint data available');

    const selectedMembers = sprintData.teamMembers?.filter((m: any) => m.isSelected) || [];
    const ticketsToProcess = sprintData.selectedTickets || [];

    if (selectedMembers.length === 0) {
      throw new Error('No team members selected for assignment');
    }

    // Prepare API request
    const autoAssignRequest: AutoAssignRequest = {
      users: selectedMembers.map((member: any) => {
        const availability = calculateMemberAvailability(member);
        return {
          userId: member.userId,
          totalVelocity: availability.totalStoryPoints,
          availableVelocity: reassignAll ? availability.totalStoryPoints : availability.totalStoryPoints - availability.assignedStoryPoints,
          skills: member.roleKeywords ? member.roleKeywords.split(',').map((s: string) => s.trim()) : []
        };
      }),
      jiraToBeSelected: ticketsToProcess
        .filter((ticket: any) => reassignAll || (!ticketAssignments[ticket.id] && !ticket.assignee))
        .map((ticket: any) => ({
          jiraid: ticket.id,
          storypoints: ticket.storyPoints || 0,
          description: ticket.summary,
          labels: ticket.labels || []
        }))
    };

    console.group('🤖 Production Auto-Assignment');
    console.log('📋 Request payload:', autoAssignRequest);
    console.log(`🎯 Mode: ${reassignAll ? 'Reassign All' : 'Unassigned Only'}`);

    try {
      // Call actual API
      const response: AutoAssignResponse = await ai.autoassign(autoAssignRequest);
      console.log('✅ API Response:', response);

      // Validate capacity constraints
      const proposedAssignments = { ...ticketAssignments };

      // Clear existing assignments if reassigning all
      if (reassignAll) {
        Object.keys(proposedAssignments).forEach(ticketId => {
          delete proposedAssignments[ticketId];
        });
      }

      // Apply API assignments
      response.assignments.forEach((assignment: any) => {
        const assignedTicket = ticketsToProcess.find((t: any) => t.id === assignment.jiraid);
        if (assignedTicket) {
          // Find the user assignment in the response
          const userAssignment = response.assignments.find((ua: any) =>
            ua.jiras && ua.jiras.some((j: any) => j.jiraId === assignment.jiraid)
          );
          if (userAssignment) {
            proposedAssignments[assignment.jiraid] = userAssignment.userId;
          }
        }
      });

      // Validate capacity constraints
      const { warnings } = validateCapacityConstraints(selectedMembers, ticketsToProcess, proposedAssignments);

      // Check if we should proceed despite warnings
      if (warnings.length > 0) {
        const capacityWarnings = warnings.filter(w => w.type === 'CAPACITY_EXCEEDED');
        if (capacityWarnings.length > 0) {
          // Don't apply assignments that would cause overload
          console.warn('🚨 Capacity constraints violated, reverting problematic assignments');
          setAssignmentWarnings(warnings);
          return { success: false, warnings };
        }
      }

      // Apply successful assignments
      setTicketAssignments(proposedAssignments);
      setLastAssignmentResult(response);
      setAssignmentWarnings(warnings);

      return { success: true, response, warnings };

    } catch (error) {
      console.error('❌ Auto-assignment API failed:', error);

      // Fallback to local algorithm if API fails
      console.log('🔄 Falling back to local assignment algorithm...');
      return await performLocalAssignment(reassignAll, selectedMembers, ticketsToProcess);
    } finally {
      console.groupEnd();
    }
  };

  // Local fallback assignment algorithm
  const performLocalAssignment = async (
    reassignAll: boolean,
    selectedMembers: any[],
    ticketsToProcess: any[]
  ) => {
    const proposedAssignments = reassignAll ? {} : { ...ticketAssignments };

    // Filter tickets based on assignment mode
    const ticketsToAssign = ticketsToProcess.filter((ticket: any) =>
      reassignAll || (!proposedAssignments[ticket.id] && !ticket.assignee)
    );

    // Sort tickets by priority and story points (high priority, high complexity first)
    const priorityOrder = { 'critical': 5, 'highest': 5, 'high': 4, 'medium': 3, 'low': 2, 'lowest': 1 };
    ticketsToAssign.sort((a: any, b: any) => {
      const aPriority = priorityOrder[a.priority?.toLowerCase()] || 3;
      const bPriority = priorityOrder[b.priority?.toLowerCase()] || 3;
      if (aPriority !== bPriority) return bPriority - aPriority;
      return (b.storyPoints || 0) - (a.storyPoints || 0);
    });

    // Calculate member loads
    const memberLoads = selectedMembers.map((member: any) => {
      const availability = calculateMemberAvailability(member);
      const currentAssigned = reassignAll ? 0 : availability.assignedStoryPoints;
      return {
        ...member,
        currentLoad: currentAssigned,
        capacity: availability.totalStoryPoints,
        availableCapacity: availability.totalStoryPoints - currentAssigned,
        skills: member.roleKeywords ? member.roleKeywords.split(',').map((s: string) => s.trim().toLowerCase()) : []
      };
    }).sort((a, b) => a.currentLoad - b.currentLoad);

    const unassignedTickets: {jiraid: string, reason: string}[] = [];
    const warnings: AutoAssignResponse['warnings'] = [];

    // Assign tickets
    for (const ticket of ticketsToAssign) {
      const ticketStoryPoints = ticket.storyPoints || 0;

      // Find best member considering skills and capacity
      let bestMember = null;
      let bestScore = -1;

      for (const member of memberLoads) {
        if (member.availableCapacity < ticketStoryPoints) continue; // Can't fit

        // Calculate match score (skill matching + capacity availability)
        let skillScore = 0;
        const ticketLabels = (ticket.labels || []).map((l: string) => l.toLowerCase());

        if (member.skills.length > 0 && ticketLabels.length > 0) {
          const matches = member.skills.filter(skill =>
            ticketLabels.some(label => label.includes(skill) || skill.includes(label))
          );
          skillScore = matches.length / Math.max(member.skills.length, ticketLabels.length);
        }

        // Capacity score (prefer less loaded members)
        const capacityScore = member.availableCapacity / member.capacity;

        // Combined score
        const totalScore = (skillScore * 0.3) + (capacityScore * 0.7);

        if (totalScore > bestScore) {
          bestScore = totalScore;
          bestMember = member;
        }
      }

      if (bestMember) {
        proposedAssignments[ticket.id] = bestMember.userId;
        bestMember.availableCapacity -= ticketStoryPoints;
        bestMember.currentLoad += ticketStoryPoints;

        // Re-sort to maintain load balance
        memberLoads.sort((a, b) => a.currentLoad - b.currentLoad);

        console.log(`🎯 Assigned ${ticket.key} (${ticketStoryPoints} SP) to ${bestMember.name} (Score: ${bestScore.toFixed(2)})`);
      } else {
        unassignedTickets.push({
          jiraid: ticket.id,
          reason: `No available capacity. Ticket requires ${ticketStoryPoints} SP but no team member has sufficient capacity.`
        });
        console.warn(`⚠️ Could not assign ${ticket.key} - insufficient capacity`);
      }
    }

    // Validate final assignments
    const { warnings: finalWarnings } = validateCapacityConstraints(selectedMembers, ticketsToProcess, proposedAssignments);

    // Apply assignments
    setTicketAssignments(proposedAssignments);
    setAssignmentWarnings(finalWarnings);

    const mockResponse: AutoAssignResponse = {
      totalUnassignedTickets: unassignedTickets.length,
      totalStoryPoints: ticketsToAssign.reduce((sum: number, t: any) => sum + (t.storyPoints || 0), 0),
      assignments: memberLoads.map(member => ({
        userId: member.userId,
        assignedStoryPoints: member.currentLoad,
        velocity: member.capacity,
        availableCapacity: member.capacity,
        remainingCapacity: member.availableCapacity,
        jiras: ticketsToProcess
          .filter((t: any) => proposedAssignments[t.id] === member.userId)
          .map((t: any) => ({
            jiraId: t.id,
            storyPoints: t.storyPoints || 0,
            assignmentReason: 'Local algorithm assignment'
          }))
      })),
      unassignableTickets: unassignedTickets
    };

    setLastAssignmentResult(mockResponse);

    return { success: true, response: mockResponse, warnings: finalWarnings };
  };

  // Main auto-assign handler with user choice dialog
  const handleAutoAssign = async () => {
    // Show dialog to ask user preference
    setShowAssignmentDialog(true);
  };

  // Execute assignment with user choice
  const executeAssignment = async (reassignAll: boolean) => {
    setIsAutoAssigning(true);
    setShowAssignmentDialog(false);

    try {
      const result = await performIntelligentAssignment(reassignAll);

      if (result.success) {
        console.log('✅ Auto-assignment completed successfully');

        // Show success message or warnings if any
        if (result.warnings && result.warnings.length > 0) {
          console.warn('⚠️ Assignment completed with warnings:', result.warnings);
        }
      } else {
        console.error('❌ Auto-assignment failed due to capacity constraints');
      }
    } catch (error) {
      console.error('❌ Auto-assignment failed:', error);
      setAssignmentWarnings([{
        type: 'NO_ASSIGNEE_FOUND',
        message: `Assignment failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }]);
    } finally {
      setIsAutoAssigning(false);
    }
  };

  // Assignment Choice Dialog Component
  const AssignmentChoiceDialog = () => {
    if (!showAssignmentDialog) return null;

    const unassignedCount = actualTickets.filter((ticket: any) =>
      !ticketAssignments[ticket.id] && !ticket.assignee
    ).length;
    const totalCount = actualTickets.length;
    const assignedCount = totalCount - unassignedCount;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 max-w-md mx-4 shadow-2xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <span className="material-symbols-outlined text-primary text-xl">auto_awesome</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Auto-Assignment Mode</h3>
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
            Choose how you want to handle ticket assignments:
          </p>

          <div className="space-y-3 mb-6">
            <div className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-slate-900 dark:text-white">Current Status</span>
              </div>
              <div className="text-xs text-slate-500">
                <span className="text-green-600 font-medium">{assignedCount} assigned</span> •{' '}
                <span className="text-amber-600 font-medium">{unassignedCount} unassigned</span> •{' '}
                <span className="text-slate-400">{totalCount} total</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <button
              onClick={() => executeAssignment(false)}
              disabled={isAutoAssigning || unassignedCount === 0}
              className="w-full p-4 text-left border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-md">
                  <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-sm">add_task</span>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-slate-900 dark:text-white text-sm">
                    Assign Unassigned Only {unassignedCount === 0 && '(None available)'}
                  </div>
                  <div className="text-xs text-slate-500">
                    Keep existing assignments, only assign {unassignedCount} unassigned tickets
                  </div>
                </div>
              </div>
            </button>

            <button
              onClick={() => executeAssignment(true)}
              disabled={isAutoAssigning}
              className="w-full p-4 text-left border-2 border-primary/20 bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-primary/20 rounded-md">
                  <span className="material-symbols-outlined text-primary text-sm">refresh</span>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-slate-900 dark:text-white text-sm">
                    Reassign All (Recommended)
                  </div>
                  <div className="text-xs text-slate-500">
                    Optimize all {totalCount} tickets for best load balancing
                  </div>
                </div>
              </div>
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowAssignmentDialog(false)}
              disabled={isAutoAssigning}
              className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Capacity Warnings Display Component
  const CapacityWarnings = () => {
    if (assignmentWarnings.length === 0) return null;

    const capacityWarnings = assignmentWarnings.filter(w => w.type === 'CAPACITY_EXCEEDED');
    const otherWarnings = assignmentWarnings.filter(w => w.type !== 'CAPACITY_EXCEEDED');

    return (
      <div className="mb-6">
        {capacityWarnings.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-lg">warning</span>
              <h4 className="font-semibold text-red-800 dark:text-red-300">Capacity Exceeded</h4>
            </div>
            <div className="space-y-1">
              {capacityWarnings.map((warning, idx) => (
                <p key={idx} className="text-sm text-red-700 dark:text-red-300">{warning.message}</p>
              ))}
            </div>
          </div>
        )}

        {otherWarnings.length > 0 && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-lg">info</span>
              <h4 className="font-semibold text-amber-800 dark:text-amber-300">Assignment Notes</h4>
            </div>
            <div className="space-y-1">
              {otherWarnings.map((warning, idx) => (
                <p key={idx} className="text-sm text-amber-700 dark:text-amber-300">{warning.message}</p>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-[#111118] dark:text-white min-h-screen">
      <CommonHeader showSearch={false} />

      {/* Main Content */}
      <main className="max-w-[1400px] mx-auto py-8 px-8">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div className="flex min-w-72 flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-primary/10 text-primary text-xs font-bold rounded-full uppercase tracking-wider">
                  {sprintData?.wasAutoSelected ? 'AI Generated' : 'Manual Selection'}
                </span>
                {projectInfo?.name && (
                  <span className="px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium rounded-full">
                    {projectInfo.name}
                  </span>
                )}
              </div>
              <h1 className="text-[#111118] dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">
                Sprint {sprintConfig.duration || 2}-Week Preview
              </h1>
              <p className="text-[#616189] dark:text-white/60 text-base font-normal leading-normal">
                {actualTickets.length} tickets planned with {actualTeamMembers.length} team members ready for auto-assignment.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  // Navigate to the correct backlog path with project code
                  const projectCode = selectedProject?.key || sprintData?.projectCode || 'default';
                  navigate(`/backlog/${projectCode}`);
                }}
                className="flex min-w-[120px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-11 px-6 border-2 border-[#dbdbe6] dark:border-white/10 bg-transparent text-[#111118] dark:text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-background-light dark:hover:bg-white/5 transition-all"
              >
                <span className="material-symbols-outlined text-sm mr-2">arrow_back</span>
                <span>Back to Backlog</span>
              </button>

              {/* Auto Assign Button */}
              <button
                onClick={handleAutoAssign}
                disabled={isAutoAssigning}
                className="flex min-w-[140px] max-w-[480px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-11 px-6 bg-gradient-to-r from-purple-600 to-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:opacity-90 transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAutoAssigning ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-base">refresh</span>
                    <span>Assigning...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-base">auto_awesome</span>
                    <span>Auto Assign</span>
                  </>
                )}
              </button>

              <button className="flex min-w-[160px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-11 px-8 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:opacity-90 transition-all shadow-lg shadow-primary/20">
                <span>Commit to JIRA</span>
              </button>
            </div>
          </div>

          {/* Capacity Warnings */}
          <CapacityWarnings />

          {/* Compact Project Metrics */}
          <div className="flex gap-4 mb-6">
            {/* Project Velocity */}
            <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 dark:bg-primary/10 border border-blue-200 dark:border-primary/20 rounded-lg">
              <span className="material-symbols-outlined text-primary text-sm">history_edu</span>
              <div>
                <span className="text-lg font-bold text-[#111118] dark:text-white">
                  {actualTickets.reduce((sum: number, ticket: any) => sum + (ticket.storyPoints || 0), 0)}
                </span>
                <span className="text-xs text-[#616189] ml-1">SP</span>
              </div>
              <span className="text-xs text-primary font-medium">Velocity</span>
            </div>

            {/* Team Utilization */}
            <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg">
              <span className="material-symbols-outlined text-slate-600 dark:text-white/60 text-sm">analytics</span>
              {(() => {
                const teamStats = actualTeamMembers.map((member: any) => calculateMemberAvailability(member));
                const totalCapacity = teamStats.reduce((sum:any, stats:any) => sum + stats.totalStoryPoints, 0);
                const totalAssigned = teamStats.reduce((sum:any, stats:any) => sum + stats.assignedStoryPoints, 0);
                const utilizationPercentage = totalCapacity > 0 ? Math.round((totalAssigned / totalCapacity) * 100) : 0;

                return (
                  <>
                    <div>
                      <span className="text-lg font-bold text-[#111118] dark:text-white">
                        {utilizationPercentage}%
                      </span>
                      <span className="text-xs text-[#616189] ml-1">
                        ({totalAssigned}/{totalCapacity})
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs font-medium text-slate-600 dark:text-white/70">Utilization</span>
                      <div className="w-16 h-1.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            utilizationPercentage > 85 ? 'bg-red-500' :
                            utilizationPercentage > 70 ? 'bg-amber-500' :
                            'bg-green-500'
                          }`}
                          style={{width: `${Math.min(utilizationPercentage, 100)}%`}}
                        ></div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          {/* Team Capacity Load */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#616189] dark:text-white/60 uppercase tracking-widest">Team Capacity Load</h3>
              {(() => {
                const totalAssigned = actualTickets.filter((ticket: any) =>
                  ticketAssignments[ticket.id] || ticket.assignee
                ).length;
                const totalTickets = actualTickets.length;
                const unassignedCount = totalTickets - totalAssigned;

                return (
                  <div className="flex items-center gap-2">
                    {unassignedCount > 0 && (
                      <span className="text-xs text-amber-600 font-bold bg-amber-100 dark:bg-amber-900/20 px-2 py-1 rounded">
                        {unassignedCount} Unassigned
                      </span>
                    )}
                    <span className="text-xs text-slate-500 font-bold">
                      {totalAssigned}/{totalTickets} Assigned
                    </span>
                  </div>
                );
              })()}
            </div>
            <div className="overflow-x-auto">
              <div className="flex gap-4 pb-2" style={{ minWidth: `${Math.max(actualTeamMembers.length * 240, 800)}px` }}>
                {actualTeamMembers.length > 0 ? actualTeamMembers.map((member: any, index: number) => {
                  const availability = calculateMemberAvailability(member);
                  const isOverloaded = availability.availabilityPercentage > 80;
                  const progressColor = isOverloaded ? 'bg-red-500' :
                                     availability.availabilityPercentage > 60 ? 'bg-amber-500' :
                                     'bg-green-500';
                  // Use a unique card ID combining userId and index to avoid conflicts
                  const cardId = `${member.userId}_${index}`;
                  const isExpanded = expandedCards.has(cardId);
                  const hasTickets = availability.assignedTickets.length > 0;

                  return (
                    <div key={index} className="bg-white dark:bg-white/5 border border-[#dbdbe6] dark:border-white/10 p-4 rounded-xl shadow-sm flex-shrink-0 w-56">
                      <div className="flex items-center gap-3 mb-3">
                        {member.avatar ? (
                          <div
                            className="size-8 rounded-full bg-cover bg-center border border-white dark:border-white/10"
                            style={{ backgroundImage: `url('${member.avatar}')` }}
                          />
                        ) : (
                          <div className="size-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                            {member.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold dark:text-white truncate">{member.name}</p>
                          <p className="text-[10px] text-[#616189] truncate">
                            {member.userId}
                          </p>
                        </div>
                        {hasTickets && (
                          <button
                            onClick={() => toggleCardExpansion(cardId)}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-white/10 rounded transition-colors"
                            title={isExpanded ? "Hide tickets" : "Show tickets"}
                          >
                            <span
                              className={`material-symbols-outlined text-sm text-slate-400 hover:text-slate-600 dark:hover:text-white/80 transition-transform duration-200 ${
                                isExpanded ? 'rotate-180' : ''
                              }`}
                            >
                              expand_more
                            </span>
                          </button>
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold">
                          <span className={`${isOverloaded ? 'text-red-600' : 'text-[#616189]'}`}>
                            {availability.availabilityPercentage}% Assigned
                          </span>
                          <span className="text-slate-400">
                            {availability.assignedStoryPoints}/{availability.totalStoryPoints} SP
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-[#dbdbe6] dark:bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`${progressColor} h-full transition-all duration-300`}
                            style={{width: `${availability.availabilityPercentage}%`}}
                          ></div>
                        </div>
                        {hasTickets && isExpanded && (
                          <div className="mt-2 pt-2 border-t border-slate-200 dark:border-white/10">
                            <p className="text-[8px] text-slate-500 font-medium mb-1">Assigned:</p>
                            <div className="grid grid-cols-2 gap-1 max-h-24 overflow-y-auto">
                              {availability.assignedTickets.map((ticket: any, ticketIndex: number) => (
                                <span key={ticketIndex} className="text-[8px] text-primary font-bold">
                                  {ticket.key}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }) : (
                  <div className="w-full text-center py-8 text-slate-500">
                    <span className="material-symbols-outlined text-4xl mb-2 block">group_off</span>
                    <p>No team members selected</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Planned JIRA Tickets */}
            <div className="flex-1 w-full bg-white dark:bg-white/5 rounded-xl border border-[#dbdbe6] dark:border-white/10 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-[#dbdbe6] dark:border-white/10 flex justify-between items-center">
                <h3 className="text-[#111118] dark:text-white text-lg font-bold">Planned JIRA Tickets</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#616189] dark:text-white/60">
                    Showing {showAllTickets ? actualTickets.length : Math.min(5, actualTickets.length)} of {actualTickets.length} items
                  </span>
                  <button className="material-symbols-outlined text-[#616189] hover:text-[#111118] dark:hover:text-white transition-colors">filter_list</button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-background-light/50 dark:bg-white/5">
                      <th className="px-6 py-4 text-[#616189] dark:text-white/60 text-xs font-bold uppercase tracking-wider w-32">Key</th>
                      <th className="px-6 py-4 text-[#616189] dark:text-white/60 text-xs font-bold uppercase tracking-wider">Title</th>
                      <th className="px-6 py-4 text-[#616189] dark:text-white/60 text-xs font-bold uppercase tracking-wider w-32 text-center">Story Points</th>
                      <th className="px-6 py-4 text-[#616189] dark:text-white/60 text-xs font-bold uppercase tracking-wider w-32">Assignee</th>
                      <th className="px-6 py-4 text-[#616189] dark:text-white/60 text-xs font-bold uppercase tracking-wider w-32">Priority</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#dbdbe6] dark:divide-white/10">
                    {actualTickets.length > 0 ? (
                      (showAllTickets ? actualTickets : actualTickets.slice(0, 5)).map((ticket: any, index: number) => (
                        <tr key={index} className="hover:bg-background-light dark:hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4 text-primary font-bold text-sm">{ticket.key}</td>
                          <td className="px-6 py-4 text-[#111118] dark:text-white text-sm font-medium truncate max-w-[2rem]">{ticket.summary}</td>
                          <td className="px-6 py-4 text-center">
                            {predictingStoryPoints.has(ticket.id) && (!ticket.storyPoints || ticket.storyPoints === 0) ? (
                              <SparkleLoader size="lg" variant="inline" showText={true} text="AI" />
                            ) : (
                              <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg bg-background-light dark:bg-white/10 text-[#111118] dark:text-white text-xs font-bold">
                                {ticket.storyPoints || 'N/A'}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 relative">
                            {(() => {
                              // Check for current assignment or fall back to original assignee
                              const currentAssignment = ticketAssignments[ticket.id];
                              const assignedMember = currentAssignment
                                ? actualTeamMembers.find((m: any) => m.userId === currentAssignment)
                                : null;

                              const displayAssignee = assignedMember || (ticket.assigneeName ? ticket : null);
                              const isDropdownOpen = activeDropdown === ticket.id;
                              const filteredMembers = actualTeamMembers.filter((member: any) =>
                                member.name.toLowerCase().includes(dropdownSearch.toLowerCase()) ||
                                member.userId.toLowerCase().includes(dropdownSearch.toLowerCase())
                              );

                              return (
                                <div className="relative assignee-dropdown">
                                  <div
                                    className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 rounded px-2 py-1 -mx-2 transition-colors"
                                    onClick={() => {
                                      setActiveDropdown(isDropdownOpen ? null : ticket.id);
                                      setDropdownSearch('');
                                    }}
                                  >
                                    {displayAssignee ? (
                                      <>
                                        {(assignedMember?.avatar || ticket.assigneeAvatar) ? (
                                          <div
                                            className="size-7 rounded-full bg-cover bg-center border border-white dark:border-white/10"
                                            style={{ backgroundImage: `url('${assignedMember?.avatar || ticket.assigneeAvatar}')` }}
                                          />
                                        ) : (
                                          <div className="size-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                                            {(assignedMember?.name || ticket.assigneeName).split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                                          </div>
                                        )}
                                        <div className="flex flex-col">
                                          <span className="text-xs font-medium dark:text-white truncate max-w-[4rem]">
                                            {assignedMember?.name || ticket.assigneeName}
                                          </span>
                                          {currentAssignment && !ticket.assignee && (
                                            <span className="text-[8px] text-green-600 font-bold">NEW</span>
                                          )}
                                        </div>
                                      </>
                                    ) : (
                                      <>
                                        <div className="size-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                                          <span className="material-symbols-outlined text-slate-400 text-sm">person</span>
                                        </div>
                                        <span className="text-xs text-slate-500 italic">Click to assign</span>
                                      </>
                                    )}
                                    {/* <span className="material-symbols-outlined text-slate-400 text-xs ml-auto">
                                      {isDropdownOpen ? 'expand_less' : 'expand_more'}
                                    </span> */}
                                  </div>

                                  {/* Dropdown */}
                                  {isDropdownOpen && (
                                    <div className="absolute top-full left-0 w-[12rem] right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50 max-h-48 overflow-hidden">
                                      <div className="p-2">
                                        <input
                                          type="text"
                                          placeholder="Search team members..."
                                          value={dropdownSearch}
                                          onChange={(e) => setDropdownSearch(e.target.value)}
                                          className="w-full px-2 py-1 text-xs border border-slate-200 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary"
                                          autoFocus
                                        />
                                      </div>
                                      <div className="max-h-32 overflow-y-auto">
                                        {filteredMembers.map((member: any) => (
                                          <button
                                            key={member.userId}
                                            className="w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors"
                                            onClick={() => {
                                              setTicketAssignments(prev => ({
                                                ...prev,
                                                [ticket.id]: member.userId
                                              }));
                                              setActiveDropdown(null);
                                              setDropdownSearch('');
                                            }}
                                          >
                                            {member.avatar ? (
                                              <div
                                                className="size-6 rounded-full bg-cover bg-center border border-white dark:border-white/10"
                                                style={{ backgroundImage: `url('${member.avatar}')` }}
                                              />
                                            ) : (
                                              <div className="size-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold">
                                                {member.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                                              </div>
                                            )}
                                            <div className="flex flex-col">
                                              <span className="text-xs font-medium dark:text-white">{member.name}</span>
                                              <span className="text-[10px] text-slate-500">{member.userId}</span>
                                            </div>
                                          </button>
                                        ))}
                                        {filteredMembers.length === 0 && (
                                          <div className="px-3 py-2 text-xs text-slate-500 text-center">
                                            No team members found
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })()}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${getPriorityColor(ticket.priority)}`}>
                              {ticket.priority || 'Medium'}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                          <span className="material-symbols-outlined text-4xl mb-2 block">assignment</span>
                          No tickets selected for this sprint
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {actualTickets.length > 5 && (
                <div className="p-4 bg-background-light/30 dark:bg-white/5 flex justify-center">
                  <button
                    onClick={() => setShowAllTickets(!showAllTickets)}
                    className="text-primary text-sm font-bold flex items-center gap-2 hover:underline"
                  >
                    {showAllTickets ? (
                      <>Show less <span className="material-symbols-outlined text-sm">keyboard_arrow_up</span></>
                    ) : (
                      <>View all {actualTickets.length} planned items <span className="material-symbols-outlined text-sm">keyboard_arrow_down</span></>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* AI Rationale Sidebar */}
            <aside className="w-full lg:w-[400px] flex flex-col gap-6">
              <div className="bg-gradient-to-br from-primary to-[#4a4ae6] rounded-xl p-6 text-white shadow-xl shadow-primary/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
                    <span className="material-symbols-outlined text-xl">auto_awesome</span>
                  </div>
                  <h3 className="text-lg font-bold">Sprint Copilot Rationale</h3>
                </div>
                <p className="text-white/80 text-sm leading-relaxed mb-6">
                  Auto-assignment complete. This plan maximizes team output while maintaining a stable buffer for unexpected bugs.
                </p>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <span className="material-symbols-outlined text-white/60 text-lg shrink-0">person_search</span>
                    <div className="flex flex-col">
                      <span className="text-xs font-black uppercase tracking-widest text-white/50">Assignment Logic</span>
                      <p className="text-sm font-medium">Assigned to Anaesh based on 95% historical velocity match for Backend tasks.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <span className="material-symbols-outlined text-white/60 text-lg shrink-0">history_edu</span>
                    <div className="flex flex-col">
                      <span className="text-xs font-black uppercase tracking-widest text-white/50">Historical Trends</span>
                      <p className="text-sm font-medium">Plan matches your 3-month average velocity of 41.2 SP.</p>
                    </div>
                  </div>
                </div>
                <div className="mt-8 pt-6 border-t border-white/20">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-widest text-white/70">Resource Warning</span>
                    <span className="px-2 py-0.5 rounded bg-amber-500 text-[10px] font-black uppercase">Caution</span>
                  </div>
                  <p className="text-sm bg-white/10 rounded-lg p-3 border border-white/10">
                    Sankar is at higher capacity. AI suggests shifting some tickets if any blockers emerge on her critical path.
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-white/5 rounded-xl border border-[#dbdbe6] dark:border-white/10 p-6">
                <h4 className="text-[#111118] dark:text-white font-bold mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">analytics</span> Load Distribution
                </h4>
                <div className="space-y-3">
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-[#616189] dark:text-white/60">Backend (Anaesh)</span>
                      <span className="text-[#111118] dark:text-white">38%</span>
                    </div>
                    <div className="h-1.5 bg-[#dbdbe6] dark:bg-white/10 rounded-full overflow-hidden">
                      <div className="bg-primary h-full" style={{width: '38%'}}></div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-[#616189] dark:text-white/60">Backend / Configuration (Sankar)</span>
                      <span className="text-[#111118] dark:text-white">40%</span>
                    </div>
                    <div className="h-1.5 bg-[#dbdbe6] dark:bg-white/10 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full" style={{width: '40%'}}></div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-[#616189] dark:text-white/60">CI/CD (Cristian)</span>
                      <span className="text-[#111118] dark:text-white">22%</span>
                    </div>
                    <div className="h-1.5 bg-[#dbdbe6] dark:bg-white/10 rounded-full overflow-hidden">
                      <div className="bg-purple-500 h-full" style={{width: '22%'}}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-2 border-dashed border-[#dbdbe6] dark:border-white/10 rounded-xl flex flex-col items-center justify-center text-center gap-3 opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
                <span className="material-symbols-outlined text-2xl">add_circle</span>
                <p className="text-sm font-bold">Add Manual Insight or Override</p>
              </div>
            </aside>
          </div>
        <div className="h-20"></div>
      </main>

      {/* Assignment Choice Dialog */}
      <AssignmentChoiceDialog />
    </div>
  );
}