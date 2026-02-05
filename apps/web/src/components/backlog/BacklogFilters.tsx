interface Filter {
  label: string;
  value: string;
  type: 'priority' | 'points' | 'status' | 'assignee';
  filterValue: string | null;
}

import { useNavigate } from 'react-router-dom';
import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { jira } from '@/lib/api-services';
import type { Ticket, StoryTicketRequest } from '@/types';
import { useMutation, useQueryClient } from '../../lib/hooks';
import { queryKeys } from '../../lib/queryClient';
import { useSelectedProject } from '../../lib/projectContext';
import { SparkleLoader } from '../ui/SparkleLoader';

// Generate dynamic filter options from ticket data
const generateFilterOptions = (tickets: Ticket[] = []) => {
  // Priority options
  const priorities = [...new Set(tickets.map(t => t.priority))].sort();
  const priorityOptions = [
    { label: 'Priority: All', value: 'all', filterValue: null },
    ...priorities.map(priority => ({
      label: `Priority: ${priority}`,
      value: priority?.toLowerCase(),
      filterValue: priority
    }))
  ];

  // Status options
  const statuses = [...new Set(tickets.map(t => t.status))].sort();
  const statusOptions = [
    { label: 'Status: All', value: 'all', filterValue: null },
    ...statuses.map(status => ({
      label: `Status: ${status}`,
      value: status.toLowerCase().replace(/\s+/g, ''),
      filterValue: status
    }))
  ];

  // Assignee options
  const assignees = [...new Set(tickets.map(t => t.assigneeName).filter(Boolean))].sort();
  const assigneeOptions = [
    { label: 'Assignee: All', value: 'all', filterValue: null },
    { label: 'Assignee: Unassigned', value: 'unassigned', filterValue: 'unassigned' },
    ...assignees.map(assignee => ({
      label: `Assignee: ${assignee}`,
      value: assignee!.toLowerCase().replace(/\s+/g, ''),
      filterValue: assignee!
    }))
  ];

  // Points options - group by ranges but based on actual data
  const points = [...new Set(tickets.map(t => t.storyPoints).filter(p => p && p > 0))].sort((a, b) => a - b);
  const hasUnestimated = tickets.some(t => !t.storyPoints || t.storyPoints === 0);

  const pointsOptions = [
    { label: 'Points: All', value: 'all', filterValue: null },
    ...(hasUnestimated ? [{ label: 'Points: Unestimated', value: 'unestimated', filterValue: 'unestimated' }] : []),
    ...points.map(point => ({
      label: `Points: ${point}`,
      value: `points-${point}`,
      filterValue: point.toString()
    }))
  ];

  return {
    priority: priorityOptions,
    status: statusOptions,
    assignee: assigneeOptions,
    points: pointsOptions
  };
};

interface BacklogFiltersProps {
  projectCode?: string;
  tickets?: Ticket[];
  onPredictionStateChange?: (predictingTicketIds: string[]) => void;
  onFilteredTicketsChange?: (filteredTickets: Ticket[]) => void;
  selectedTickets?: string[];
  onDraftSprintClick?: () => void;
}

export const BacklogFilters = forwardRef<
  { triggerAutoFill: () => void },
  BacklogFiltersProps
>(({ projectCode, tickets, onPredictionStateChange, onFilteredTicketsChange, selectedTickets = [], onDraftSprintClick }, ref) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { selectedProject } = useSelectedProject();
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Use the project name from the selected project context
  const projectName = selectedProject?.name || projectCode?.toUpperCase() || 'Unknown Project';
    const handleAutoFillStoryPoints = async () => {
    if (!tickets || tickets.length === 0) {
      console.warn('No tickets available to predict story points');
      return;
    }

    let ticketsWithoutPoints: Ticket[];

    if (selectedTickets.length > 0) {
      // Use selected tickets only
      const selectedTicketObjects = tickets.filter(ticket => selectedTickets.includes(ticket.id));
      ticketsWithoutPoints = selectedTicketObjects.filter(
        ticket => !ticket.storyPoints || ticket.storyPoints === 0
      );
    } else {
      // Use all tickets that don't have story points
      ticketsWithoutPoints = tickets.filter(
        ticket => !ticket.storyPoints || ticket.storyPoints === 0
      );
    }

    if (ticketsWithoutPoints.length === 0) {
      console.warn('All selected tickets already have story points assigned');
      return;
    }

    setIsAutoFilling(true);
    // Pass the specific ticket IDs that are being predicted
    const ticketIdsBeingPredicted = ticketsWithoutPoints.map(ticket => ticket.id);
    onPredictionStateChange?.(ticketIdsBeingPredicted);

    // Convert filtered tickets to StoryTicketRequest format
    const storyTicketRequests: StoryTicketRequest[] = ticketsWithoutPoints.map(ticket => ({
      jiraId: ticket.key,
      jiraDescription: ticket.summary
    }));

    autoFillMutation.mutate(storyTicketRequests);
  };
  // Expose triggerAutoFill function through ref
  useImperativeHandle(ref, () => ({
    triggerAutoFill: handleAutoFillStoryPoints
  }), [handleAutoFillStoryPoints]);

  // Generate filter options from current ticket data
  const filterOptions = generateFilterOptions(tickets);
  
  // Active filters state
  const [activeFilters, setActiveFilters] = useState({
    priority: filterOptions.priority[0],
    points: filterOptions.points[0],
    status: filterOptions.status[0],
    assignee: filterOptions.assignee[0],
  });
  

  // Update active filters when ticket data changes (reset to "All" if current selection no longer exists)
  useEffect(() => {
    setActiveFilters(prev => ({
      priority: filterOptions.priority.find(opt => opt.value === prev.priority.value) || filterOptions.priority[0],
      points: filterOptions.points.find(opt => opt.value === prev.points.value) || filterOptions.points[0],
      status: filterOptions.status.find(opt => opt.value === prev.status.value) || filterOptions.status[0],
      assignee: filterOptions.assignee.find(opt => opt.value === prev.assignee.value) || filterOptions.assignee[0],
    }));
  }, [tickets]);

  // Count tickets that need story points
  const ticketsNeedingPoints = tickets?.filter(
    ticket => !ticket.storyPoints || ticket.storyPoints === 0
  ).length || 0;

  const handleDraftAISprint = () => {
    if (onDraftSprintClick) {
      onDraftSprintClick();
    }
  };

  // Handle search functionality (supports JQL queries)
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !tickets) {
      onFilteredTicketsChange?.(tickets || []);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filteredTickets = tickets.filter(ticket => {
      // Support basic JQL-style queries
      if (query.startsWith('key =') || query.startsWith('key=')) {
        const keyValue = query.replace(/key\s*=\s*/i, '').trim();
        return ticket.key.toLowerCase().includes(keyValue);
      }

      if (query.startsWith('summary ~') || query.startsWith('summary~')) {
        const summaryValue = query.replace(/summary\s*~\s*/i, '').trim();
        return ticket.summary.toLowerCase().includes(summaryValue);
      }

      if (query.startsWith('assignee =') || query.startsWith('assignee=')) {
        const assigneeValue = query.replace(/assignee\s*=\s*/i, '').trim();
        return ticket.assigneeName?.toLowerCase().includes(assigneeValue) || false;
      }

      if (query.startsWith('priority =') || query.startsWith('priority=')) {
        const priorityValue = query.replace(/priority\s*=\s*/i, '').trim();
        return ticket.priority.toLowerCase().includes(priorityValue);
      }

      if (query.startsWith('status =') || query.startsWith('status=')) {
        const statusValue = query.replace(/status\s*=\s*/i, '').trim();
        return ticket.status.toLowerCase().includes(statusValue);
      }

      // Default text search across multiple fields
      return (
        ticket.key.toLowerCase().includes(query) ||
        ticket.summary.toLowerCase().includes(query) ||
        ticket.assigneeName?.toLowerCase().includes(query) ||
        ticket.priority.toLowerCase().includes(query) ||
        ticket.status.toLowerCase().includes(query)
      );
    });

    onFilteredTicketsChange?.(filteredTickets);
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    onFilteredTicketsChange?.(tickets || []);
  };

  const autoFillMutation = useMutation({
    mutationFn: async (tickets: StoryTicketRequest[]) => {
      return await jira.predictStoryPoints(tickets);
    },
    onSuccess: (predictedPoints) => {
      // Update the query cache with the new story points
      if (projectCode && predictedPoints) {
        queryClient.setQueryData(queryKeys.backlog(projectCode), (oldData: any) => {
          if (!oldData?.tickets) return oldData;

          const updatedTickets = oldData.tickets.map((ticket: Ticket) => {
            const prediction = predictedPoints.find(
              (p: { jiraId: string; storyPoints: number }) => p.jiraId === ticket.key
            );
            return prediction
              ? { ...ticket, storyPoints: prediction.storyPoints }
              : ticket;
          });

          return { ...oldData, tickets: updatedTickets };
        });
      }
      setIsAutoFilling(false);
      onPredictionStateChange?.([]);
    },
    onError: (error) => {
      console.error('Failed to auto-fill story points:', error);
      setIsAutoFilling(false);
      onPredictionStateChange?.([]);
    }
  });


  // Filter logic
  const applyFilters = (ticketsToFilter: Ticket[]) => {
    return ticketsToFilter.filter(ticket => {
      // Priority filter
      if (activeFilters.priority.filterValue && ticket.priority !== activeFilters.priority.filterValue) {
        return false;
      }

      // Points filter
      if (activeFilters.points.filterValue) {
        if (activeFilters.points.filterValue === 'unestimated') {
          if (ticket.storyPoints && ticket.storyPoints > 0) return false;
        } else {
          const expectedPoints = parseInt(activeFilters.points.filterValue);
          if (ticket.storyPoints !== expectedPoints) return false;
        }
      }

      // Status filter
      if (activeFilters.status.filterValue && ticket.status !== activeFilters.status.filterValue) {
        return false;
      }

      // Assignee filter
      if (activeFilters.assignee.filterValue) {
        if (activeFilters.assignee.filterValue === 'unassigned') {
          if (ticket.assigneeName) return false;
        } else {
          if (ticket.assigneeName !== activeFilters.assignee.filterValue) return false;
        }
      }

      return true;
    });
  };

  // Apply filters whenever tickets or activeFilters change
  useEffect(() => {
    if (tickets && onFilteredTicketsChange) {
      const filteredTickets = applyFilters(tickets);
      onFilteredTicketsChange(filteredTickets);
    }
  }, [tickets, activeFilters, onFilteredTicketsChange]);

  const handleFilterChange = (filterType: keyof typeof activeFilters, option: typeof filterOptions.priority[0]) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterType]: option
    }));
  };

  const clearAllFilters = () => {
    const newFilterOptions = generateFilterOptions(tickets);
    setActiveFilters({
      priority: newFilterOptions.priority[0],
      points: newFilterOptions.points[0],
      status: newFilterOptions.status[0],
      assignee: newFilterOptions.assignee[0],
    });
  };

  const hasActiveFilters = Object.values(activeFilters).some(filter => filter.filterValue !== null);


  return (
    <div className="flex flex-col border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-6 py-5 shrink-0 z-10">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {projectName} ({projectCode?.toUpperCase()})
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Manage your sprint backlog and review AI-driven insights for {projectName}.
          </p>
        </div>

        {/* Action buttons - improved UI */}
        <div className="flex items-center gap-3">
          {/* Auto Fill Story Points Button */}
          <button
            onClick={handleAutoFillStoryPoints}
            disabled={isAutoFilling || (selectedTickets.length > 0 ? selectedTickets.filter(ticketId => {
              const ticket = tickets?.find(t => t.id === ticketId);
              return !ticket?.storyPoints || ticket.storyPoints === 0;
            }).length === 0 : ticketsNeedingPoints === 0)}
            className="group cursor-pointer relative flex items-center gap-2.5 px-4 py-2.5 bg-white dark:bg-white/5 border border-[#dbdbe6] dark:border-white/10 text-[#111118] dark:text-white hover:border-primary/30 hover:bg-primary/5 dark:hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-[#dbdbe6] disabled:hover:bg-white dark:disabled:hover:bg-white/5 text-sm font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center justify-center w-5 h-5 text-primary">
              {isAutoFilling ? (
                <SparkleLoader size="sm" variant="compact" />
              ) : (
                <span className="material-symbols-outlined text-[18px] group-hover:rotate-12 transition-transform duration-300">wand_shine</span>
              )}
            </div>
            <span className="whitespace-nowrap">
              {isAutoFilling
                ? 'Estimating...'
                : selectedTickets.length > 0
                  ? `Estimate Selected (${selectedTickets.filter(ticketId => {
                      const ticket = tickets?.find(t => t.id === ticketId);
                      return !ticket?.storyPoints || ticket.storyPoints === 0;
                    }).length})`
                  : ticketsNeedingPoints === 0
                    ? 'All Points Assigned'
                    : `Estimate Points (${ticketsNeedingPoints})`
              }
            </span>
            {!isAutoFilling && (
              <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 bg-gradient-to-r from-primary/5 to-blue-500/5 transition-opacity duration-200 pointer-events-none" />
            )}
          </button>

          {/* Draft AI Sprint Button */}
          <button
            onClick={handleDraftAISprint}
            className="group cursor-pointer relative flex items-center gap-2.5 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white text-sm font-semibold rounded-lg shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200 overflow-hidden"
          >
            <div className="flex items-center justify-center w-5 h-5">
              <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform duration-200">auto_awesome</span>
            </div>
            <span className="whitespace-nowrap relative z-10">
              {selectedTickets.length > 0
                ? `Draft AI Sprint (${selectedTickets.length})`
                : 'Draft AI Sprint (Auto-Select)'
              }
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            {!selectedTickets.length && (
              <div className="absolute -right-1 -top-1 w-3 h-3">
                <div className="w-full h-full bg-blue-400 rounded-full animate-pulse" />
              </div>
            )}
          </button>
        </div>

      </div>

      {/* Filters and Search Row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Left side - Filters */}
        <div className="flex flex-wrap items-center gap-2">
        {Object.entries(activeFilters).map(([filterType, activeFilter]) => (
          <FilterDropdown
            key={filterType}
            filterType={filterType as keyof typeof activeFilters}
            activeFilter={activeFilter}
            options={filterOptions[filterType as keyof typeof filterOptions]}
            onFilterChange={handleFilterChange}
          />
        ))}

        <div className="w-px h-6 bg-slate-300 dark:bg-slate-700 mx-1"></div>

          <button
            onClick={clearAllFilters}
            className={`text-xs font-medium hover:underline px-2 transition-colors ${
              hasActiveFilters
                ? 'text-primary hover:text-blue-700'
                : 'text-slate-400 dark:text-slate-500 cursor-not-allowed'
            }`}
            disabled={!hasActiveFilters}
          >
            Clear Filters
          </button>
        </div>

        {/* Right side - Search */}
        <div className="flex items-center gap-2">
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#616189] group-focus-within:text-primary transition-colors text-sm">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search issues or use JQL..."
                className="w-80 bg-background-light dark:bg-white/5 border border-[#dbdbe6] dark:border-white/10 rounded-lg py-2 pl-9 pr-10 text-sm text-[#111118] dark:text-white placeholder:text-[#616189] focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-2.5 text-[#616189] hover:text-slate-600 dark:hover:text-slate-300"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              )}
            </div>
            <button
              type="submit"
              className="px-3 py-2 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-medium rounded-lg transition-colors"
            >
              Search
            </button>
          </form>
        </div>
      </div>
    </div>
  );
});

BacklogFilters.displayName = 'BacklogFilters';

// Filter Dropdown Component
interface FilterDropdownProps {
  filterType: string;
  activeFilter: { label: string; value: string; filterValue: string | null };
  options: { label: string; value: string; filterValue: string | null }[];
  onFilterChange: (filterType: string, option: { label: string; value: string; filterValue: string | null }) => void;
}

function FilterDropdown({ filterType, activeFilter, options, onFilterChange }: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center h-8 px-3 gap-2 rounded-lg border cursor-pointer transition-colors ${
          activeFilter.filterValue
            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'
            : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800'
        }`}
      >
        <span className={`text-xs font-medium ${
          activeFilter.filterValue
            ? 'text-blue-700 dark:text-blue-300'
            : 'text-slate-700 dark:text-slate-300'
        }`}>
          {activeFilter.label}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${
            isOpen ? 'rotate-180' : ''
          } ${
            activeFilter.filterValue
              ? 'text-blue-500 dark:text-blue-400'
              : 'text-slate-500'
          }`}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
        </svg>
      </div>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          {/* Dropdown Menu */}
          <div className="absolute top-full left-0 mt-1 min-w-[200px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg z-20">
            {options.map((option) => (
              <div
                key={option.value}
                onClick={() => {
                  onFilterChange(filterType, option);
                  setIsOpen(false);
                }}
                className={`px-3 py-2 text-xs font-medium cursor-pointer transition-colors first:rounded-t-lg last:rounded-b-lg ${
                  activeFilter.value === option.value
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {option.label}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}