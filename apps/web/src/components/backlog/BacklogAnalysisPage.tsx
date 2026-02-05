import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CommonHeader } from '../common/CommonHeader';
import { BacklogFilters } from './BacklogFilters';
import { BacklogTable } from './BacklogTable';
import { AIInsightsSidebar } from './AIInsightsSidebar';
import { AIInsightsSidebarSkeleton } from './AIInsightsSidebarSkeleton';
import { SprintConfigSidebar } from './SprintConfigSidebar';
import { StoryPointsRequiredModal } from './StoryPointsRequiredModal';
import { AssigneeValidationModal } from './AssigneeValidationModal';
import { useBacklog, usePrefetchTeamMembers } from '../../lib/hooks';
import { useSelectedProject } from '../../lib/projectContext';
import { useProjects } from '../../lib/hooks';
import { useToast } from '@/context/toastContext';
import type { Ticket } from '@/types';

interface BacklogAnalysisPageProps {
  projectCode?: string;
}

export function BacklogAnalysisPage({ projectCode }: BacklogAnalysisPageProps) {
  const navigate = useNavigate();
  const { data: tickets, isLoading, error, refetch } = useBacklog(projectCode || '');
  const { selectedProject, setSelectedProject } = useSelectedProject();
  const { data: projects } = useProjects();
  const { showToast } = useToast();

  // Prefetch team members in the background for better UX when opening sprint config
  usePrefetchTeamMembers(projectCode);

  // Log prefetching for debugging
  useEffect(() => {
    if (projectCode) {
      console.log(`🚀 Background prefetching team members for project: ${projectCode}`);
    }
  }, [projectCode]);
  const [predictingTicketIds, setPredictingTicketIds] = useState<string[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[] | undefined>(tickets);
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
  const [isSprintConfigOpen, setIsSprintConfigOpen] = useState(false);
  const [isStoryPointsModalOpen, setIsStoryPointsModalOpen] = useState(false);
  const [isAssigneeValidationModalOpen, setIsAssigneeValidationModalOpen] = useState(false);
  const [assigneeValidationData, setAssigneeValidationData] = useState<{
    missingAssignees: string[];
    affectedTickets: Ticket[];
    config: any;
    finalTickets: Ticket[];
  } | null>(null);
  const backlogFiltersRef = useRef<{ triggerAutoFill: () => void }>(null);

  // Set the selected project based on the projectCode when the page loads
  useEffect(() => {
    if (projectCode && projects && (!selectedProject || selectedProject.key.toLowerCase() !== projectCode.toLowerCase())) {
      const matchingProject = projects.find(p => p.key.toLowerCase() === projectCode.toLowerCase());
      if (matchingProject) {
        setSelectedProject({
          id: matchingProject.id,
          key: matchingProject.key,
          name: matchingProject.name,
          avatarUrls: matchingProject.avatarUrls
        });
      }
    }
  }, [projectCode, projects, selectedProject, setSelectedProject]);
  
  // Handle auto-filling story points from modal
  const handleAutoFillFromModal = () => {
    setIsStoryPointsModalOpen(false);
    // Trigger the auto-fill functionality from BacklogFilters through ref
    if (backlogFiltersRef.current) {
      backlogFiltersRef.current.triggerAutoFill();
    }
  };
  // Update filtered tickets when original tickets change
  useEffect(() => {
    if (!filteredTickets || filteredTickets === tickets) {
      setFilteredTickets(tickets);
    }
  }, [tickets]);

  // Clear selection when filtered tickets change to prevent selecting hidden tickets
  useEffect(() => {
    if (filteredTickets && selectedTickets.length > 0) {
      const filteredTicketIds = new Set(filteredTickets.map(t => t.id));
      const validSelections = selectedTickets.filter(id => filteredTicketIds.has(id));
      if (validSelections.length !== selectedTickets.length) {
        setSelectedTickets(validSelections);
      }
    }
  }, [filteredTickets]);

  // Validate selected tickets have story points
  const validateSelectedTickets = (): { isValid: boolean; missingTickets: Ticket[] } => {
    const selectedTicketData = tickets?.filter(ticket => selectedTickets.includes(ticket.id)) || [];
    const missingStoryPoints = selectedTicketData.filter(ticket => !ticket.storyPoints || ticket.storyPoints === 0);

    return {
      isValid: missingStoryPoints.length === 0,
      missingTickets: missingStoryPoints
    };
  };

  // Handle opening sprint configuration with validation
  const handleOpenSprintConfig = () => {
    // Check if there are any tickets available
    if (!tickets || tickets.length === 0) {
      showToast("No tickets available in the backlog to create a sprint.", "error");
      return;
    }

    // If tickets are manually selected, validate they have story points
    if (selectedTickets.length > 0) {
      const validation = validateSelectedTickets();
      if (!validation.isValid) {
        const ticketKeys = validation.missingTickets.map(t => t.key).join(', ');
        showToast(
          `The following selected tickets are missing story points: ${ticketKeys}. Please add story points to these tickets or let AI auto-select tickets for you.`,
          "error"
        );
        return;
      }
    } else {
      // If no tickets are manually selected, check if AI can auto-select
      // AI needs story points to make intelligent selections
      const ticketsWithoutPoints = tickets.filter(ticket => !ticket.storyPoints || ticket.storyPoints === 0);

      if (ticketsWithoutPoints.length > 0) {
        // Show modal asking user to auto-fill story points first
        setIsStoryPointsModalOpen(true);
        return;
      }
    }

    setIsSprintConfigOpen(true);
  };

  // Validate team velocity against selected team members
  const validateTeamVelocity = (config: any): { isValid: boolean; message: string } => {
    const selectedTeamMembers = config.teamMembers.filter((member: any) => member.isSelected);
    const velocity = config.autoCalculate ? config.totalVelocity : config.teamCapacity;

    if (selectedTeamMembers.length === 0) {
      return { isValid: false, message: "No team members selected for the sprint. Please select at least one team member." };
    }


    const minVelocityPerMember = 3;
    const minReasonableVelocity = selectedTeamMembers.length * minVelocityPerMember;

    if (velocity < minReasonableVelocity) {
      return {
        isValid: false,
        message: `Team velocity of ${velocity} story points seems too low for ${selectedTeamMembers.length} team members. Consider adjusting velocity to at least ${minReasonableVelocity} story points or reducing team size.`
      };
    }

    return { isValid: true, message: "" };
  };

  // Validate ticket assignees against selected team members
  const validateTicketAssignees = (config: any, finalTickets: Ticket[]): { isValid: boolean; missingAssignees: string[]; affectedTickets: Ticket[] } => {
    const selectedTeamMembers = config.teamMembers.filter((member: any) => member.isSelected);
    const selectedUserIds = new Set(selectedTeamMembers.map((member: any) => member.userId));

    // Find tickets with assignees not in selected team
    const ticketsWithMissingAssignees = finalTickets.filter(ticket =>
      ticket.assignee && !selectedUserIds.has(ticket.assignee)
    );

    if (ticketsWithMissingAssignees.length === 0) {
      return { isValid: true, missingAssignees: [], affectedTickets: [] };
    }

    // Get unique missing assignees
    const missingAssignees = [...new Set(ticketsWithMissingAssignees
      .map(ticket => ticket.assigneeName)
      .filter(name => name !== null))] as string[];

    return {
      isValid: false,
      missingAssignees,
      affectedTickets: ticketsWithMissingAssignees
    };
  };

  // Handle sprint configuration
  const handleStartSprintPlanning = (config: any) => {
    // Use auto-selected tickets if provided, otherwise use manually selected tickets
    const finalTickets = config.autoSelectedTickets ||
      (tickets?.filter(ticket => selectedTickets.includes(ticket.id)) || []);

    // Validation 1: Team velocity validation
    const velocityValidation = validateTeamVelocity(config);
    if (!velocityValidation.isValid) {
      showToast(velocityValidation.message, "error");
      return;
    }

    // Validation 2: Assignee validation
    const assigneeValidation = validateTicketAssignees(config, finalTickets);
    if (!assigneeValidation.isValid) {
      // Show assignee validation modal instead of proceeding
      setAssigneeValidationData({
        missingAssignees: assigneeValidation.missingAssignees,
        affectedTickets: assigneeValidation.affectedTickets,
        config: config,
        finalTickets: finalTickets
      });
      setIsAssigneeValidationModalOpen(true);
      return;
    }

    // All validations passed, proceed with sprint planning
    proceedWithSprintPlanning(config, finalTickets);
  };


  // Handle canceling story points modal
  const handleCancelStoryPointsModal = () => {
    setIsStoryPointsModalOpen(false);
  };

  // Handle assignee validation modal choices
  const handleIncludeAssignees = () => {
    if (!assigneeValidationData) return;

    const { config, finalTickets, affectedTickets, missingAssignees } = assigneeValidationData;

    console.log('User chose to include missing assignees:', missingAssignees);

    // Find the missing team members from the full team list and mark them as selected
    const updatedTeamMembers = config.teamMembers.map((member: any) => {
      // Check if this member is one of the missing assignees
      const isMissingAssignee = affectedTickets.some((ticket: any) =>
        ticket.assignee === member.userId || ticket.assigneeName === member.name
      );

      if (isMissingAssignee) {
        console.log(`Including team member ${member.name} in sprint selection`);
        return { ...member, isSelected: true };
      }
      return member;
    });

    // Count how many team members were added
    const addedCount = updatedTeamMembers.filter((member: any) => member.isSelected).length -
                     config.teamMembers.filter((member: any) => member.isSelected).length;

    const updatedConfig = {
      ...config,
      teamMembers: updatedTeamMembers
    };

    showToast(
      `${addedCount} team member${addedCount > 1 ? 's' : ''} added to sprint team to maintain ticket assignments`,
      "success"
    );

    setIsAssigneeValidationModalOpen(false);

    // Proceed with sprint planning using the updated config (with additional team members selected)
    proceedWithSprintPlanning(updatedConfig, finalTickets);
  };

  const handleReassignTickets = () => {
    if (!assigneeValidationData) return;

    const { config, finalTickets, affectedTickets } = assigneeValidationData;

    console.log('User chose to reassign tickets:', affectedTickets);
    console.log('Unassigning tickets from non-selected team members...');

    // Create a new array of tickets with affected tickets unassigned
    const updatedTickets = finalTickets.map(ticket => {
      // If this ticket is in the affected tickets list, unassign it
      if (affectedTickets.some(affected => affected.id === ticket.id)) {
        console.log(`Unassigning ticket ${ticket.key} from ${ticket.assigneeName}`);
        return {
          ...ticket,
          assignee: null,
          assigneeName: null,
          assigneeAvatar: null
        };
      }
      return ticket;
    });

    // Count how many tickets were unassigned
    const unassignedCount = affectedTickets.length;

    showToast(
      `${unassignedCount} ticket${unassignedCount > 1 ? 's' : ''} unassigned and ready for reassignment`,
      "success"
    );

    setIsAssigneeValidationModalOpen(false);

    // Proceed with sprint planning using the updated tickets (with unassigned tickets)
    proceedWithSprintPlanning(config, updatedTickets);
  };

  const handleProceedAnyway = () => {
    if (!assigneeValidationData) return;

    showToast("Proceeding with current assignee configuration", "warning");

    setIsAssigneeValidationModalOpen(false);
    proceedWithSprintPlanning(assigneeValidationData.config, assigneeValidationData.finalTickets);
  };

  const handleCancelAssigneeValidation = () => {
    setIsAssigneeValidationModalOpen(false);
    setAssigneeValidationData(null);
  };

  // Proceed with sprint planning after validation passes
  const proceedWithSprintPlanning = (config: any, finalTickets: Ticket[]) => {
    // Prepare comprehensive data for sprint planning
    const sprintPlanningData = {
      selectedTickets: finalTickets,
      sprintConfig: config,
      projectCode: projectCode,
      projectInfo: selectedProject,
      wasAutoSelected: !!config.autoSelectedTickets,
      teamMembers: config.teamMembers,
      allBacklogTickets: tickets // Full backlog for reference
    };

    // Console log all the data being passed to sprint planning
    console.group('🚀 Starting Sprint Planning');
    console.log('📋 Project Information:', {
      code: projectCode,
      name: selectedProject?.name,
      key: selectedProject?.key
    });
    console.log('🎯 Sprint Configuration:', {
      duration: config.duration,
      teamCapacity: config.teamCapacity,
      totalVelocity: config.totalVelocity,
      autoCalculate: config.autoCalculate,
      includeBugs: config.includeBugs,
      prioritizeTechDebt: config.prioritizeTechDebt,
      smartDependencyCheck: config.smartDependencyCheck
    });
    console.log('👥 Team Members:', config.teamMembers.map((member: any) => ({
      name: member.name,
      userId: member.userId,
      isSelected: member.isSelected,
      capacity: member.capacity,
      availability: member.availability,
      roleKeywords: member.roleKeywords || 'No role keywords set'
    })));
    console.log('🎫 Selected Tickets for Sprint:', finalTickets.map(ticket => ({
      key: ticket.key,
      summary: ticket.summary,
      storyPoints: ticket.storyPoints,
      priority: ticket.priority,
      assigneeName: ticket.assigneeName,
      status: ticket.status
    })));
    console.log('📊 Sprint Statistics:', {
      totalTickets: finalTickets.length,
      totalStoryPoints: finalTickets.reduce((sum, ticket) => sum + (ticket.storyPoints || 0), 0),
      selectedTeamMembers: config.teamMembers.filter((m: any) => m.isSelected).length,
      wasAutoSelected: !!config.autoSelectedTickets
    });
    console.log('🔄 Full Data Object being passed:', sprintPlanningData);
    console.groupEnd();

    setIsSprintConfigOpen(false);
    showToast("Sprint planning started successfully! 🚀", "success");
    navigate('/plan/sprint', {
      state: sprintPlanningData
    });
  };

  if (!projectCode) {
    return (
      <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">Invalid Project</h2>
          <p className="text-slate-600 dark:text-slate-300">No project code provided.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white overflow-hidden">
      <div className="flex h-screen w-full flex-col">
        <CommonHeader showSearch={false} />

        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden relative flex-col lg:flex-row">
          {/* Left Column: Backlog Data */}
          <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-white dark:bg-slate-950">
            <BacklogFilters
              ref={backlogFiltersRef}
              projectCode={projectCode}
              tickets={tickets}
              onPredictionStateChange={setPredictingTicketIds}
              onFilteredTicketsChange={setFilteredTickets}
              selectedTickets={selectedTickets}
              onDraftSprintClick={handleOpenSprintConfig}
            />
            <BacklogTable
              tickets={filteredTickets}
              isLoading={isLoading}
              error={error}
              onRetry={refetch}
              predictingTicketIds={predictingTicketIds}
              selectedTickets={selectedTickets}
              onTicketSelectionChange={setSelectedTickets}
            />
          </main>

          {/* Right Column: AI Insights Sidebar */}
          {isLoading ? (
            <AIInsightsSidebarSkeleton />
          ) : (
            <AIInsightsSidebar tickets={filteredTickets} projectCode={projectCode} />
          )}
        </div>

        {/* Sprint Configuration Sidebar */}
        <SprintConfigSidebar
          isOpen={isSprintConfigOpen}
          onClose={() => setIsSprintConfigOpen(false)}
          selectedTickets={tickets?.filter(ticket => selectedTickets.includes(ticket.id)) || []}
          onStartSprint={handleStartSprintPlanning}
          projectCode={projectCode}
          allTickets={tickets || []}
        />

        {/* Story Points Required Modal */}
        <StoryPointsRequiredModal
          isOpen={isStoryPointsModalOpen}
          onClose={handleCancelStoryPointsModal}
          ticketsWithoutPoints={tickets?.filter(ticket => !ticket.storyPoints || ticket.storyPoints === 0).length || 0}
          totalTickets={tickets?.length || 0}
          onAutoFillPoints={handleAutoFillFromModal}
          onCancel={handleCancelStoryPointsModal}
        />

        {/* Assignee Validation Modal */}
        <AssigneeValidationModal
          isOpen={isAssigneeValidationModalOpen}
          onClose={handleCancelAssigneeValidation}
          missingAssignees={assigneeValidationData?.missingAssignees || []}
          affectedTickets={assigneeValidationData?.affectedTickets || []}
          onIncludeAssignees={handleIncludeAssignees}
          onReassignTickets={handleReassignTickets}
          onProceedAnyway={handleProceedAnyway}
        />
      </div>
    </div>
  );
}