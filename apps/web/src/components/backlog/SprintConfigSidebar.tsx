import { useState, useEffect } from 'react';
import type {TeamMember as APITeamMember } from '@/lib/api-services';
import type { Ticket } from '@/types';
import { jira } from '@/lib/api-services';
import { useToast } from '@/context/toastContext';
import { useTeamMembers } from '../../lib/hooks';

interface TeamMember {
  id: string;
  name: string;
  userId: string;
  avatar?: string;
  capacity: number; 
  availability: number; 
  isSelected: boolean; 
  roleKeywords: string; 
}

interface SprintConfigSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTickets: Ticket[];
  onStartSprint: (config: SprintConfig) => void;
  projectCode?: string;
  allTickets?: Ticket[]; 
}

interface SprintConfig {
  duration: number; 
  teamCapacity: number; 
  totalVelocity: number; 
  autoCalculate: boolean;
  teamMembers: TeamMember[];
  autoSelectAdditional?: boolean; 
  autoSelectedTickets?: Ticket[]; 
}


const convertAPITeamMember = (apiMember: APITeamMember): TeamMember => ({
  id: apiMember.userId,
  userId: apiMember.userId,
  name: apiMember.name,
  avatar: apiMember.avatarUrl,
  capacity: 5, 
  availability: 100, 
  isSelected: true, 
  roleKeywords: '' 
});

interface InsufficientTicketsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPoints: number;
  teamCapacity: number;
  shortfall: number;
  onAutoSelect: () => void;
  onManualSelect: () => void;
}

function InsufficientTicketsModal({
  isOpen,
  onClose,
  selectedPoints,
  teamCapacity,
  shortfall,
  onAutoSelect,
  onManualSelect
}: InsufficientTicketsModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-60 transition-opacity duration-300" />

      {/* Modal */}
      <div className="fixed inset-0 z-61 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-950 rounded-xl border border-[#dbdbe6] dark:border-white/10 shadow-2xl max-w-md w-full">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-amber-600">warning</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#111118] dark:text-white">Insufficient Story Points</h3>
                <p className="text-sm text-[#616189]">Not enough tickets selected for sprint capacity</p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="bg-slate-50 dark:bg-white/5 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#616189]">Selected tickets:</span>
                  <span className="font-medium text-[#111118] dark:text-white">{selectedPoints} story points</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#616189]">Team capacity:</span>
                  <span className="font-medium text-[#111118] dark:text-white">{teamCapacity} story points</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-slate-200 dark:border-white/10">
                  <span className="text-[#616189]">Additional needed:</span>
                  <span className="font-bold text-amber-600">{shortfall} story points</span>
                </div>
              </div>

              <p className="text-sm text-[#616189] leading-relaxed">
                Your selected tickets don't fully utilize the team's capacity. AI can automatically select additional tickets by priority and story points, or you can manually select more tickets.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onManualSelect}
                className="flex-1 py-2.5 border border-[#dbdbe6] dark:border-white/10 text-[#111118] dark:text-white font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
              >
                Let me choose
              </button>
              <button
                onClick={onAutoSelect}
                className="flex-1 py-2.5 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-primary/20"
              >
                Auto-select tickets
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export function SprintConfigSidebar({ isOpen, onClose, selectedTickets, onStartSprint, projectCode, allTickets }: SprintConfigSidebarProps) {
  const { showToast } = useToast();

  // Use cached team members data
  const { data: teamData, isLoading: isLoadingMembers } = useTeamMembers(projectCode, { enabled: isOpen });

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [projectVelocity, setProjectVelocity] = useState<number>(0);
  const [showInsufficientModal, setShowInsufficientModal] = useState<boolean>(false);
  const [expandedMembers, setExpandedMembers] = useState<Set<string>>(new Set());
  const [config, setConfig] = useState<SprintConfig>({
    duration: 2,
    teamCapacity: 0,
    totalVelocity: 0,
    autoCalculate: true,
    teamMembers: [],
  });

  // Initialize team members from cached data when available
  useEffect(() => {
    if (teamData && teamData.teamMembers) {
      console.log(`✅ Using cached team data for sprint config (${teamData.teamMembers.length} members)`);
      const convertedMembers = teamData.teamMembers.map(convertAPITeamMember);
      setTeamMembers(convertedMembers);
      setProjectVelocity(teamData.projectVelocity);

      setConfig(prev => ({
        ...prev,
        teamMembers: convertedMembers,
        teamCapacity: Math.round(teamData.projectVelocity),
        totalVelocity: Math.round(teamData.projectVelocity)
      }));
    }
  }, [teamData]);

  // Toggle expand/collapse for role keywords
  const toggleMemberExpansion = (memberId: string) => {
    setExpandedMembers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(memberId)) {
        newSet.delete(memberId);
      } else {
        newSet.add(memberId);
      }
      return newSet;
    });
  };

  // Calculate total capacity from selected team members only (in days)
  const calculateTotalCapacity = () => {
    return config.teamMembers
      .filter(member => member.isSelected)
      .reduce((total, member) => {
        return total + (member.capacity * member.availability / 100);
      }, 0);
  };

  // Update total capacity when auto-calculate is toggled
  const handleAutoCalculateToggle = (enabled: boolean) => {
    const newConfig = { ...config, autoCalculate: enabled };

    if (!enabled) {
      // Switching to manual mode - use current individual capacities
      newConfig.teamCapacity = Math.round(calculateTotalCapacity());
    } else {
      // Switching to auto mode - use total velocity for capacity calculation
      newConfig.teamCapacity = config.totalVelocity;
    }

    setConfig(newConfig);
  };

  const handleMemberChange = (memberId: string, field: 'capacity' | 'availability' | 'isSelected' | 'roleKeywords', value: number | boolean | string) => {
    const updatedMembers = config.teamMembers.map(member =>
      member.id === memberId ? { ...member, [field]: value } : member
    );
    const newConfig = { ...config, teamMembers: updatedMembers };

    // In manual mode, update the total team capacity based on sum of individual capacities
    if (!config.autoCalculate) {
      newConfig.teamCapacity = Math.round(updatedMembers
        .filter(member => member.isSelected)
        .reduce((total, member) => {
          return total + (member.capacity * member.availability / 100);
        }, 0)
      );
    }

    setConfig(newConfig);
    setTeamMembers(updatedMembers);
  };

  // Handle velocity change in auto mode
  const handleVelocityChange = (newVelocity: number) => {
    setConfig(prev => ({
      ...prev,
      totalVelocity: newVelocity,
      teamCapacity: newVelocity
    }));
  };

  // Check if selected tickets are sufficient for sprint capacity
  const checkTicketSufficiency = (): { sufficient: boolean; shortfall: number } => {
    const selectedPoints = totalSelectedPoints;
    const capacity = config.autoCalculate ? config.totalVelocity : config.teamCapacity;
    const shortfall = Math.max(0, capacity - selectedPoints);

    return {
      sufficient: shortfall === 0,
      shortfall
    };
  };

  // Auto-select tickets based on priority and story points needed
  const autoSelectTickets = (): Ticket[] => {
    if (!allTickets || allTickets.length === 0) {
      return selectedTickets;
    }

    const targetCapacity = config.autoCalculate ? config.totalVelocity : config.teamCapacity;

    console.log('🤖 Enhanced Auto-Selection Algorithm:');
    console.log(`📊 Target Capacity: ${targetCapacity} story points`);
    console.log(`👥 Selected Team Members: ${config.teamMembers.filter(m => m.isSelected).length}`);
    console.log(`📋 Starting with ${selectedTickets.length} manually selected tickets (${totalSelectedPoints} SP)`);

    // If we already have selected tickets, check if we need more
    let currentPoints = totalSelectedPoints;
    let finalSelectedTickets = [...selectedTickets];

    if (currentPoints >= targetCapacity) {
      return selectedTickets; // Already have enough
    }

    // Get available tickets (not selected, have story points)
    const availableTickets = allTickets
      .filter(ticket =>
        !selectedTickets.some(selected => selected.id === ticket.id) && // Not already selected
        ticket.storyPoints && ticket.storyPoints > 0 // Has story points
      )
      .sort((a, b) => {
        // 1. Prioritize "In Progress" tickets first (they might have already started)
        const aInProgress = a.status?.toLowerCase() === 'in progress' || a.status?.toLowerCase() === 'in-progress';
        const bInProgress = b.status?.toLowerCase() === 'in progress' || b.status?.toLowerCase() === 'in-progress';

        if (aInProgress && !bInProgress) return -1;
        if (!aInProgress && bInProgress) return 1;

        // 2. Sort by priority (Critical > High > Medium > Low)
        const priorityOrder = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
        const aPriority = priorityOrder[a.priority] || 0;
        const bPriority = priorityOrder[b.priority] || 0;

        if (aPriority !== bPriority) {
          return bPriority - aPriority; // Higher priority first
        }

        // 3. If same priority, prefer smaller story points to fit better
        return (a.storyPoints || 0) - (b.storyPoints || 0);
      });

    // Log prioritization results
    const inProgressTickets = availableTickets.filter(t =>
      t.status?.toLowerCase() === 'in progress' || t.status?.toLowerCase() === 'in-progress'
    );
    if (inProgressTickets.length > 0) {
      console.log(`🚀 Found ${inProgressTickets.length} "In Progress" tickets that will be prioritized`);
    }

    // Track assignee workload to avoid overloading
    const assigneeWorkload: { [key: string]: number } = {};

    // Initialize with already selected tickets' assignees
    finalSelectedTickets.forEach(ticket => {
      if (ticket.assignee) {
        assigneeWorkload[ticket.assignee] = (assigneeWorkload[ticket.assignee] || 0) + (ticket.storyPoints || 0);
      }
    });

    // Calculate individual team member capacities in story points
    const memberCapacities: { [key: string]: { name: string; capacityStoryPoints: number } } = {};
    const selectedMembers = config.teamMembers.filter(m => m.isSelected);

    selectedMembers.forEach(member => {
      // Convert member capacity (days * availability) to story points
      // Using same logic as in sprint planning page: 2.5 story points per effective day
      const effectiveCapacityDays = (member.capacity || 5) * (member.availability || 100) / 100;
      const capacityStoryPoints = Math.round(effectiveCapacityDays * 2.5);

      memberCapacities[member.userId] = {
        name: member.name,
        capacityStoryPoints
      };
    });

    console.log('👥 Individual team member capacities (in story points):');
    Object.values(memberCapacities).forEach(({ name, capacityStoryPoints }) => {
      console.log(`  - ${name}: ${capacityStoryPoints} SP capacity`);
    });

    // Select tickets until we reach target capacity, with smart assignee balancing
    let skippedAssignedTickets: Ticket[] = []; // Track tickets we skip due to overload

    for (const ticket of availableTickets) {
      if (currentPoints >= targetCapacity) break;

      // Handle assigned tickets with load balancing
      if (ticket.assignee && memberCapacities[ticket.assignee]) {
        const currentAssigneeLoad = assigneeWorkload[ticket.assignee] || 0;
        const memberCapacity = memberCapacities[ticket.assignee];
        const maxAllowedLoad = memberCapacity.capacityStoryPoints;

        // Skip if this would exceed the individual team member's actual capacity
        if (currentAssigneeLoad + (ticket.storyPoints || 0) > maxAllowedLoad) {
          console.log(`⚠️ Temporarily skipping ${ticket.key} to avoid overloading ${ticket.assigneeName} (would be ${currentAssigneeLoad + (ticket.storyPoints || 0)} SP vs ${maxAllowedLoad} SP capacity)`);
          skippedAssignedTickets.push(ticket);
          continue;
        }

        // Update assignee workload tracking
        assigneeWorkload[ticket.assignee] = currentAssigneeLoad + (ticket.storyPoints || 0);
      } else if (ticket.assignee && !memberCapacities[ticket.assignee]) {
        // This assignee is not in the selected team members, skip for now
        console.log(`⚠️ Skipping ${ticket.key} - assignee ${ticket.assigneeName} is not in selected team members`);
        skippedAssignedTickets.push(ticket);
        continue;
      }

      finalSelectedTickets.push(ticket);
      currentPoints += ticket.storyPoints || 0;
    }

    // If we haven't reached target capacity, try to include some of the skipped assigned tickets
    if (currentPoints < targetCapacity && skippedAssignedTickets.length > 0) {
      console.log(`📈 Haven't reached target capacity (${currentPoints}/${targetCapacity}). Reconsidering ${skippedAssignedTickets.length} skipped tickets...`);

      // Sort skipped tickets by priority again and try to fit some in
      skippedAssignedTickets.sort((a, b) => {
        const priorityOrder = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
        const aPriority = priorityOrder[a.priority] || 0;
        const bPriority = priorityOrder[b.priority] || 0;
        return bPriority - aPriority;
      });

      for (const ticket of skippedAssignedTickets) {
        if (currentPoints >= targetCapacity) break;

        // For critical priority tickets, allow slight capacity overrun (10% buffer)
        if (ticket.priority === 'Critical' && ticket.assignee && memberCapacities[ticket.assignee]) {
          const currentAssigneeLoad = assigneeWorkload[ticket.assignee] || 0;
          const memberCapacity = memberCapacities[ticket.assignee].capacityStoryPoints;
          const allowedOverrun = memberCapacity * 1.1; // 10% buffer for critical tickets

          if (currentAssigneeLoad + (ticket.storyPoints || 0) <= allowedOverrun) {
            console.log(`🔴 Including critical priority ${ticket.key} with slight capacity overrun for ${ticket.assigneeName}`);
            finalSelectedTickets.push(ticket);
            currentPoints += ticket.storyPoints || 0;
            assigneeWorkload[ticket.assignee] = currentAssigneeLoad + (ticket.storyPoints || 0);
          }
        }
      }
    }

    const addedTickets = finalSelectedTickets.length - selectedTickets.length;
    const velocityMatch = Math.round((currentPoints / targetCapacity) * 100);

    console.log(`✅ Auto-selected ${addedTickets} additional tickets`);
    console.log(`📈 Total story points: ${currentPoints}/${targetCapacity} (${velocityMatch}% of target velocity)`);

    if (velocityMatch < 80) {
      console.log(`⚠️ Warning: Selected tickets are significantly below target velocity. Consider:
        - Reducing target velocity
        - Adding more tickets to the backlog
        - Adjusting team capacity settings`);
    } else if (velocityMatch > 120) {
      console.log(`⚠️ Warning: Selected tickets exceed target velocity significantly.`);
    }

    // Log final assignee distribution
    const finalAssigneeWorkload: { [key: string]: { name: string; points: number } } = {};
    finalSelectedTickets.forEach(ticket => {
      if (ticket.assignee && ticket.assigneeName) {
        if (!finalAssigneeWorkload[ticket.assignee]) {
          finalAssigneeWorkload[ticket.assignee] = { name: ticket.assigneeName, points: 0 };
        }
        finalAssigneeWorkload[ticket.assignee].points += ticket.storyPoints || 0;
      }
    });

    if (Object.keys(finalAssigneeWorkload).length > 0) {
      console.log('👥 Final assignee distribution vs capacity:');
      const highUtilizationMembers: string[] = [];
      const overloadedMembers: string[] = [];

      Object.entries(finalAssigneeWorkload).forEach(([userId, { name, points }]) => {
        const capacity = memberCapacities[userId]?.capacityStoryPoints || 0;
        const utilizationPercent = capacity > 0 ? Math.round((points / capacity) * 100) : 0;
        const status = utilizationPercent > 100 ? '⚠️ OVERLOADED' : utilizationPercent > 80 ? '⚡ HIGH' : '✅ GOOD';
        console.log(`  - ${name}: ${points}/${capacity} SP (${utilizationPercent}%) ${status}`);

        // Track members for toast notifications
        if (utilizationPercent > 100) {
          overloadedMembers.push(name);
        } else if (utilizationPercent >= 80) {
          highUtilizationMembers.push(name);
        }
      });

      // Show toast notifications for capacity warnings
      if (overloadedMembers.length > 0) {
        showToast(
          `⚠️ ${overloadedMembers.join(', ')} ${overloadedMembers.length === 1 ? 'is' : 'are'} overloaded. Consider reassigning tickets to balance workload.`,
          "error",
          8000 // Show for 8 seconds
        );
      } else if (highUtilizationMembers.length > 0) {
        showToast(
          `⚡ ${highUtilizationMembers.join(', ')} ${highUtilizationMembers.length === 1 ? 'is' : 'are'} at high capacity (80%+). Consider reassigning tickets for better balance.`,
          "warning",
          6000 // Show for 6 seconds
        );
      }
    }

    return finalSelectedTickets;
  };

  // Handle start sprint planning with validation
  const handleStartSprintClick = () => {
    // If no tickets selected, auto-select from scratch
    if (selectedTickets.length === 0) {
      const ticketsForSprint = autoSelectTickets();
      console.log(`🎯 Auto-selected all tickets: ${ticketsForSprint.length} tickets`);

      onStartSprint({
        ...config,
        autoSelectedTickets: ticketsForSprint
      });
      return;
    }

    // If tickets are manually selected, check if they meet target capacity
    const sufficiency = checkTicketSufficiency();
    if (!sufficiency.sufficient) {
      // Show modal to let user choose: manual selection or auto-selection
      setShowInsufficientModal(true);
      return;
    }

    // Manual selection is sufficient, proceed with selected tickets
    console.log(`🎯 Using manually selected tickets: ${selectedTickets.length} tickets`);
    onStartSprint({
      ...config,
      autoSelectedTickets: undefined // No auto-selection needed
    });
  };

  // Handle auto-selection of additional tickets
  const handleAutoSelectTickets = () => {
    setShowInsufficientModal(false);

    // Use the enhanced auto-selection algorithm to fill remaining capacity
    const ticketsForSprint = autoSelectTickets();
    console.log(`🤖 User chose auto-selection: ${ticketsForSprint.length} tickets selected`);

    onStartSprint({
      ...config,
      autoSelectedTickets: ticketsForSprint
    });
  };

  // Handle manual selection (close modal and let user select more)
  const handleManualSelectTickets = () => {
    setShowInsufficientModal(false);
    onClose(); // Close the sidebar so user can select more tickets
  };

  const totalSelectedPoints = selectedTickets.reduce((total, ticket) => total + (ticket.storyPoints || 0), 0);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full w-96 bg-white dark:bg-slate-950 border-r border-[#dbdbe6] dark:border-white/10 z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } shadow-2xl`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="px-6 py-5 border-b border-[#dbdbe6] dark:border-white/10">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-[#111118] dark:text-white">Sprint Configuration</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined text-slate-500 cursor-pointer">close</span>
              </button>
            </div>
            <p className="text-sm text-pretty text-[#616189]">
              {selectedTickets.length === 0
                ? "AI will automatically select tickets based on priority and story points to match your team's capacity"
                : `Configure your sprint with ${selectedTickets.length} tickets (${totalSelectedPoints} story points)`
              }
            </p>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Sprint Duration */}
            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#616189]">Sprint Duration</label>
              <select
                value={config.duration}
                onChange={(e) => setConfig({ ...config, duration: parseInt(e.target.value) })}
                className="w-full bg-background-light dark:bg-white/5 border border-[#dbdbe6] dark:border-white/10 rounded-lg py-2.5 px-3 text-sm font-medium text-[#111118] dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
              >
                <option value={1}>1 Week (Accelerated)</option>
                <option value={2}>2 Weeks (Standard)</option>
                <option value={3}>3 Weeks</option>
                <option value={4}>4 Weeks</option>
              </select>
            </div>

            {/* Team Capacity */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#616189]">
                  {config.autoCalculate ? 'Team Velocity' : 'Team Capacity'}
                </label>
                <button
                  onClick={() => handleAutoCalculateToggle(!config.autoCalculate)}
                  className={`text-xs font-medium px-3 py-1 rounded-full transition-colors ${
                    config.autoCalculate
                      ? 'bg-primary/10 text-primary hover:bg-primary/20'
                      : 'bg-slate-100 dark:bg-white/10 text-[#616189] hover:bg-slate-200 dark:hover:bg-white/20'
                  }`}
                >
                  {config.autoCalculate ? 'Auto-Calculate' : 'Manual'}
                </button>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={config.autoCalculate ? config.totalVelocity : config.teamCapacity}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    if (config.autoCalculate) {
                      handleVelocityChange(value);
                    } else {
                      setConfig({ ...config, teamCapacity: value });
                    }
                  }}
                  className="w-full bg-background-light dark:bg-white/5 border border-[#dbdbe6] dark:border-white/10 rounded-lg py-2.5 pl-10 pr-12 text-sm font-bold text-[#111118] dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
                  placeholder="40"
                />
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#616189]">groups</span>
                <span className="absolute right-3 top-2.5 text-xs text-[#616189] font-medium">pts</span>
              </div>
              <p className="text-xs text-[#616189] leading-relaxed">
                {config.autoCalculate
                  ? `Adjust total velocity for sprint planning. Individual capacity/availability controls are hidden.`
                  : 'Total capacity is calculated by summing individual member availability in days below.'
                }
              </p>
            </div>

            {/* Team Members */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#616189]">Team Members</label>
                <span className="text-xs text-[#616189]">
                  {config.teamMembers.filter(m => m.isSelected).length} of {config.teamMembers.length} selected
                </span>
              </div>

              {isLoadingMembers ? (
                <div className="text-center py-8 text-[#616189]">
                  <span className="material-symbols-outlined animate-spin">refresh</span>
                  <p className="mt-2 text-sm">Loading team members...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {config.teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className={`border rounded-lg p-4 space-y-3 transition-all duration-200 ${
                      member.isSelected
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                        : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 opacity-75'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Selection checkbox */}
                      <input
                        type="checkbox"
                        checked={member.isSelected}
                        onChange={(e) => handleMemberChange(member.id, 'isSelected', e.target.checked)}
                        className="w-4 h-4 text-primary bg-white border-gray-300 rounded focus:ring-primary"
                      />
                      <div
                        className="w-8 h-8 rounded-full bg-cover bg-center border border-white dark:border-white/10"
                        style={{ backgroundImage: `url('${member.avatar}')` }}
                      />
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${member.isSelected ? 'text-[#111118] dark:text-white' : 'text-[#616189]'}`}>
                          {member.name}
                        </p>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-[#616189]">{member.userId}</p>
                          {!member.isSelected ? (
                            <span className="text-xs px-1.5 py-0.5 rounded text-amber-700 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400">
                              Not in sprint
                            </span>
                          ) : null}
                        </div>
                      </div>

                      {/* Expand/Collapse button - only show for selected members */}
                      {member.isSelected && (
                        <button
                          onClick={() => toggleMemberExpansion(member.id)}
                          className={`p-2 rounded-lg transition-all duration-200 flex items-center gap-1 ${
                            expandedMembers.has(member.id)
                              ? 'bg-primary/10 text-primary hover:bg-primary/20'
                              : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400'
                          }`}
                          title={expandedMembers.has(member.id) ? "Hide role settings" : "Configure role & capacity"}
                        >
                          <svg
                            className={`w-4 h-4 transition-transform duration-200 ${
                              expandedMembers.has(member.id) ? 'rotate-180' : ''
                            }`}
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M7 10l5 5 5-5z"/>
                          </svg>
                          <span className="text-xs font-medium hidden sm:inline">
                            {expandedMembers.has(member.id) ? 'Less' : 'More'}
                          </span>
                        </button>
                      )}
                    </div>

                    {/* Role keywords - show only when member is selected and expanded */}
                    {member.isSelected && expandedMembers.has(member.id) && (
                      <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                        <div>
                          <label className="text-xs text-[#616189] mb-1 block flex items-center gap-2">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                            </svg>
                            Role Keywords (for AI)
                          </label>
                          <input
                            type="text"
                            value={member.roleKeywords}
                            onChange={(e) => handleMemberChange(member.id, 'roleKeywords', e.target.value)}
                            className="w-full bg-white dark:bg-white/10 border border-[#dbdbe6] dark:border-white/10 rounded text-sm py-1.5 px-2 text-[#111118] dark:text-white focus:ring-2 focus:ring-primary/20"
                            placeholder="e.g., backend developer, API expert, database specialist"
                          />
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Help AI understand this person's expertise for better task assignment
                          </p>
                        </div>

                        {/* Capacity controls - only show in manual mode and when expanded */}
                        {!config.autoCalculate && (
                          <>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-xs text-[#616189] mb-1 block">Availability (days)</label>
                                <input
                                  type="number"
                                  value={member.capacity}
                                  onChange={(e) => handleMemberChange(member.id, 'capacity', parseInt(e.target.value) || 0)}
                                  className="w-full bg-white dark:bg-white/10 border border-[#dbdbe6] dark:border-white/10 rounded text-sm py-1.5 px-2 text-[#111118] dark:text-white focus:ring-2 focus:ring-primary/20"
                                  min="0"
                                  max="10"
                                  step="0.5"
                                />
                              </div>
                              <div>
                                <label className="text-xs text-[#616189] mb-1 block">Available (%)</label>
                                <input
                                  type="number"
                                  value={member.availability}
                                  onChange={(e) => handleMemberChange(member.id, 'availability', parseInt(e.target.value) || 0)}
                                  className="w-full bg-white dark:bg-white/10 border border-[#dbdbe6] dark:border-white/10 rounded text-sm py-1.5 px-2 text-[#111118] dark:text-white focus:ring-2 focus:ring-primary/20"
                                  min="0"
                                  max="100"
                                />
                              </div>
                            </div>
                            <div className="text-xs text-[#616189] flex justify-between">
                              <span>Effective Capacity:</span>
                              <span className="font-medium text-primary">{Math.round(member.capacity * member.availability / 100 * 10) / 10} days</span>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  ))}
                </div>
              )}
            </div>


          </div>

          {/* Footer */}
          <div className="p-6 border-t border-[#dbdbe6] dark:border-white/10 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-[#616189]">
                {selectedTickets.length === 0 ? 'Tickets (Auto-select):' : 'Selected Tickets:'}
              </span>
              <span className="font-medium text-[#111118] dark:text-white">
                {selectedTickets.length === 0
                  ? `AI will choose (~${config.autoCalculate ? config.totalVelocity : config.teamCapacity} pts)`
                  : `${selectedTickets.length} (${totalSelectedPoints} pts)`
                }
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#616189]">{config.autoCalculate ? 'Velocity:' : 'Team Capacity:'}</span>
              <span className="font-medium text-[#111118] dark:text-white">
                {config.autoCalculate ? `${config.totalVelocity} pts` : `${Math.round(calculateTotalCapacity() * 10) / 10} days`}
                {' '}({config.teamMembers.filter(m => m.isSelected).length} members)
              </span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleStartSprintClick}
                className="flex-1 py-2.5 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-primary/20 cursor-pointer"
              >
                {selectedTickets.length === 0 ? 'Auto-Select & Start Planning' : 'Start Sprint Planning'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Insufficient Tickets Modal */}
      <InsufficientTicketsModal
        isOpen={showInsufficientModal}
        onClose={() => setShowInsufficientModal(false)}
        selectedPoints={totalSelectedPoints}
        teamCapacity={config.autoCalculate ? config.totalVelocity : config.teamCapacity}
        shortfall={checkTicketSufficiency().shortfall}
        onAutoSelect={handleAutoSelectTickets}
        onManualSelect={handleManualSelectTickets}
      />
    </>
  );
}