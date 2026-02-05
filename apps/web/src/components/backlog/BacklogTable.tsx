import { useState, useRef, useCallback, useEffect } from 'react';
import { Ticket } from '@/types';
import { BacklogTableSkeleton } from './BacklogTableSkeleton';
import { SparkleLoader } from '../ui/SparkleLoader';

interface BacklogTableProps {
  tickets?: Ticket[];
  isLoading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  predictingTicketIds?: string[];
  selectedTickets?: string[];
  onTicketSelectionChange?: (selectedIds: string[]) => void;
}


function openWindow(ticketId: string) {
  return () => {
    const jiraBaseUrl = 'https://jira.logitech.com';
    const ticketUrl = `${jiraBaseUrl}/browse/${ticketId}`;
    window.open(ticketUrl, ticketId, 'width=1000,height=800,scrollbars=yes');
  }}

function getPriorityColor(priority: string) {
  switch (priority) {
    case 'Critical':
      return 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-100 dark:border-red-900/30';
    case 'High':
      return 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-orange-100 dark:border-orange-900/30';
    case 'Medium':
      return 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900/30';
    case 'Low':
      return 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30';
    default:
      return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700';
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'In Progress':
      return 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-900/30';
    case 'In Review':
      return 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-100 dark:border-purple-900/30';
    case 'Done':
      return 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30';
    default:
      return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700';
  }
}

function getTypeIcon(type: string) {
  const iconClass = "w-4 h-4";

  switch (type) {
    case 'Bug':
      return (
        <svg className={iconClass} viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="7" fill="#E34935" stroke="#C53030" strokeWidth="1"/>
          <path d="M5.5 6.5L7.5 8.5L10.5 5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M6 10.5C6.5 11 7.2 11.5 8 11.5C8.8 11.5 9.5 11 10 10.5" stroke="white" strokeWidth="1" strokeLinecap="round"/>
        </svg>
      );
    case 'Story':
      return (
        <svg className={iconClass} viewBox="0 0 16 16" fill="none">
          <path d="M2 2C2 1.44772 2.44772 1 3 1H13C13.5523 1 14 1.44772 14 2V14.5L8 11L2 14.5V2Z" fill="#36B37E" stroke="#00875A" strokeWidth="1"/>
        </svg>
      );
    case 'Task':
      return (
        <svg className={iconClass} viewBox="0 0 16 16" fill="none">
          <rect x="1" y="1" width="14" height="14" rx="2" fill="#0052CC" stroke="#0747A6" strokeWidth="1"/>
          <path d="M4.5 8L6.5 10L11.5 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case 'Epic':
      return (
        <svg className={iconClass} viewBox="0 0 16 16" fill="none">
          <path d="M8.5 1L3 9H6.5L7.5 15L13 7H9.5L8.5 1Z" fill="#8777D9" stroke="#6554C0" strokeWidth="1" strokeLinejoin="round"/>
        </svg>
      );
    case 'Subtask':
      return (
        <svg className={iconClass} viewBox="0 0 16 16" fill="none">
          <rect x="2" y="2" width="12" height="12" rx="1" fill="#0052CC" stroke="#0747A6" strokeWidth="1"/>
          <path d="M5 8L7 10L11 6" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M1 5L2 4V6" stroke="#0052CC" strokeWidth="1" strokeLinecap="round"/>
        </svg>
      );
    default:
      return (
        <svg className={iconClass} viewBox="0 0 16 16" fill="none">
          <path d="M3 2C2.44772 2 2 2.44772 2 3V13C2 13.5523 2.44772 14 3 14H13C13.5523 14 14 13.5523 14 13V6L10 2H3Z" fill="#8993A4" stroke="#6B778C" strokeWidth="1"/>
          <path d="M10 2V6H14" stroke="#6B778C" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
  }
}

export function BacklogTable({ tickets, isLoading, error, onRetry, predictingTicketIds = [], selectedTickets = [], onTicketSelectionChange }: BacklogTableProps) {
  const getResponsiveColumnWidths = () => {
    if (typeof window !== 'undefined') {
      const isMobile = window.innerWidth < 768;
      const isTablet = window.innerWidth < 1024;

      if (isMobile) {
        return {
          checkbox: 40,
          key: 80,
          type: 60,
          summary: 200,
          priority: 70,
          points: 60,
          status: 80,
          assignee: 120,
        };
      } else if (isTablet) {
        return {
          checkbox: 45,
          key: 100,
          type: 65,
          summary: 280,
          priority: 80,
          points: 70,
          status: 100,
          assignee: 140,
        };
      }
    }

    return {
      checkbox: 50,
      key: 120,
      type: 70,
      summary: 350,
      priority: 90,
      points: 80,
      status: 110,
      assignee: 150,
    };
  };

  const [columnWidths, setColumnWidths] = useState(getResponsiveColumnWidths);

  useEffect(() => {
    const handleResize = () => {
      setColumnWidths(getResponsiveColumnWidths());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleTicketSelection = (ticketId: string, isSelected: boolean) => {
    if (!onTicketSelectionChange) return;

    if (isSelected) {
      onTicketSelectionChange([...selectedTickets, ticketId]);
    } else {
      onTicketSelectionChange(selectedTickets.filter(id => id !== ticketId));
    }
  };

  const handleSelectAll = (isSelected: boolean) => {
    if (!onTicketSelectionChange || !tickets) return;

    if (isSelected) {
      onTicketSelectionChange(tickets.map(ticket => ticket.id));
    } else {
      onTicketSelectionChange([]);
    }
  };

  const isAllSelected = tickets && tickets.length > 0 && selectedTickets.length === tickets.length;
  const isPartialSelected = selectedTickets.length > 0 && selectedTickets.length < (tickets?.length || 0);

  const resizingColumn = useRef<string | null>(null);
  const startX = useRef<number>(0);
  const startWidth = useRef<number>(0);
  const tableRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent, column: string) => {
    e.preventDefault();
    e.stopPropagation();
    resizingColumn.current = column;
    startX.current = e.clientX;
    startWidth.current = columnWidths[column as keyof typeof columnWidths];

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [columnWidths]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!resizingColumn.current || !tableRef.current) return;

    const containerRect = tableRef.current.getBoundingClientRect();
    const diff = e.clientX - startX.current;
    const minColumnWidth = 60;
    const maxColumnWidth = 600;
    const minTableWidth = 800; 
    const maxTableWidth = Math.max(containerRect.width - 24, minTableWidth); 

    let newWidth = Math.max(minColumnWidth, Math.min(maxColumnWidth, startWidth.current + diff));

    const currentTotal = Object.values(columnWidths).reduce((sum, width) => sum + width, 0);
    const oldColumnWidth = columnWidths[resizingColumn.current as keyof typeof columnWidths];
    const newTotal = currentTotal - oldColumnWidth + newWidth;


    if (newTotal > maxTableWidth + 100) { 
      newWidth = (maxTableWidth + 100) - (currentTotal - oldColumnWidth);
    }

    if (newTotal < minTableWidth) {
      newWidth = minTableWidth - (currentTotal - oldColumnWidth);
    }

    newWidth = Math.max(minColumnWidth, Math.min(maxColumnWidth, newWidth));

    setColumnWidths(prev => ({
      ...prev,
      [resizingColumn.current!]: newWidth
    }));
  }, [columnWidths]);

  const handleMouseUp = useCallback(() => {
    resizingColumn.current = null;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, [handleMouseMove]);


  if (error) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/50 dark:bg-slate-950/50">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <h2 className="text-xl font-bold text-red-600 mb-2">Error Loading Backlog</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              Failed to load backlog data from JIRA. Please try again.
            </p>
            <button
              onClick={() => onRetry?.()}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }


  if (isLoading) {
    return <BacklogTableSkeleton />;
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/50 dark:bg-slate-950/50">
      <div ref={tableRef} className="flex-1 overflow-x-auto overflow-y-auto p-3 sm:p-6">
        <div className="border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse table-fixed" style={{
              minWidth: Math.max(Object.values(columnWidths).reduce((a, b) => a + b, 0), 800) + 'px',
              width: '100%'
            }}>
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
              <th className="px-2 sm:px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 relative" style={{ width: columnWidths.checkbox + 'px' }}>
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = isPartialSelected;
                  }}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="w-4 h-4 text-primary bg-white border-gray-300 rounded focus:ring-primary dark:focus:ring-primary dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <div
                  className="absolute right-0 top-0 w-2 h-full cursor-col-resize hover:bg-blue-500 opacity-0 hover:opacity-100 transition-opacity active:opacity-100 active:bg-blue-600"
                  onMouseDown={(e) => handleMouseDown(e, 'checkbox')}
                  style={{ zIndex: 10 }}
                />
              </th>
              <th className="px-2 sm:px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 relative" style={{ width: columnWidths.key + 'px' }}>
                Key
                <div
                  className="absolute right-0 top-0 w-2 h-full cursor-col-resize hover:bg-blue-500 opacity-0 hover:opacity-100 transition-opacity active:opacity-100 active:bg-blue-600"
                  onMouseDown={(e) => handleMouseDown(e, 'key')}
                  style={{ zIndex: 10 }}
                />
              </th>
              <th className="px-2 sm:px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 relative" style={{ width: columnWidths.type + 'px' }}>
                Type
                <div
                  className="absolute right-0 top-0 w-2 h-full cursor-col-resize hover:bg-blue-500 opacity-0 hover:opacity-100 transition-opacity active:opacity-100 active:bg-blue-600"
                  style={{ zIndex: 10 }}
                  onMouseDown={(e) => handleMouseDown(e, 'type')}
                />
              </th>
              <th className="px-2 sm:px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 relative" style={{ width: columnWidths.summary + 'px' }}>
                Summary
                <div
                  className="absolute right-0 top-0 w-2 h-full cursor-col-resize hover:bg-blue-500 opacity-0 hover:opacity-100 transition-opacity active:opacity-100 active:bg-blue-600"
                  style={{ zIndex: 10 }}
                  onMouseDown={(e) => handleMouseDown(e, 'summary')}
                />
              </th>
              <th className="px-2 sm:px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 relative" style={{ width: columnWidths.priority + 'px' }}>
                Priority
                <div
                  className="absolute right-0 top-0 w-2 h-full cursor-col-resize hover:bg-blue-500 opacity-0 hover:opacity-100 transition-opacity active:opacity-100 active:bg-blue-600"
                  style={{ zIndex: 10 }}
                  onMouseDown={(e) => handleMouseDown(e, 'priority')}
                />
              </th>
              <th className="px-2 sm:px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-center relative" style={{ width: columnWidths.points + 'px' }}>
                Points
                <div
                  className="absolute right-0 top-0 w-2 h-full cursor-col-resize hover:bg-blue-500 opacity-0 hover:opacity-100 transition-opacity active:opacity-100 active:bg-blue-600"
                  style={{ zIndex: 10 }}
                  onMouseDown={(e) => handleMouseDown(e, 'points')}
                />
              </th>
              <th className="px-2 sm:px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 relative" style={{ width: columnWidths.status + 'px' }}>
                Status
                <div
                  className="absolute right-0 top-0 w-2 h-full cursor-col-resize hover:bg-blue-500 opacity-0 hover:opacity-100 transition-opacity active:opacity-100 active:bg-blue-600"
                  style={{ zIndex: 10 }}
                  onMouseDown={(e) => handleMouseDown(e, 'status')}
                />
              </th>
              <th className="px-2 sm:px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 relative" style={{ width: columnWidths.assignee + 'px' }}>
                Assignee
                <div
                  className="absolute right-0 top-0 w-2 h-full cursor-col-resize hover:bg-blue-500 opacity-0 hover:opacity-100 transition-opacity active:opacity-100 active:bg-blue-600"
                  style={{ zIndex: 10 }}
                  onMouseDown={(e) => handleMouseDown(e, 'assignee')}
                />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {tickets?.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                  No tickets found in this backlog.
                </td>
              </tr>
            ) : (
              tickets?.map((ticket) => (
                <tr
                  key={ticket.id}
                  className={`group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                    selectedTickets.includes(ticket.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <td className="px-2 sm:px-4 py-3" style={{ width: columnWidths.checkbox + 'px' }}>
                    <input
                      type="checkbox"
                      checked={selectedTickets.includes(ticket.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleTicketSelection(ticket.id, e.target.checked);
                      }}
                      className="w-4 h-4 text-primary bg-white border-gray-300 rounded focus:ring-primary dark:focus:ring-primary dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                  </td>
                  <td
                    onClick={openWindow(ticket.id)}
                    className="px-2 sm:px-4 py-3 text-sm font-medium text-slate-500 dark:text-slate-400 font-mono cursor-pointer"
                    style={{ width: columnWidths.key + 'px' }}
                  >
                    <div className="truncate" title={ticket.key}>
                      {ticket.key}
                    </div>
                  </td>
                  <td
                    onClick={openWindow(ticket.id)}
                    className="px-2 sm:px-4 py-3 text-center cursor-pointer"
                    style={{ width: columnWidths.type + 'px' }}
                  >
                    <div
                      title={ticket.type}
                      className="flex items-center justify-center"
                    >
                      {getTypeIcon(ticket.type)}
                    </div>
                  </td>
                  <td
                    onClick={openWindow(ticket.id)}
                    className="px-2 sm:px-4 py-3 text-sm text-slate-900 dark:text-white font-medium cursor-pointer"
                    style={{ width: columnWidths.summary + 'px' }}
                  >
                    <div className="flex flex-col">
                      <div className="truncate" title={ticket.summary}>
                        {ticket.summary}
                      </div>
                      {ticket.labels && ticket.labels.length > 0 && (
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {ticket.labels.slice(0, 2).map((label) => (
                            <span
                              key={label}
                              className="inline-flex items-center px-1.5 py-0.5 rounded-sm text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 truncate"
                              title={label}
                            >
                              {label}
                            </span>
                          ))}
                          {ticket.labels.length > 2 && (
                            <span className="text-xs text-slate-400" title={`${ticket.labels.length - 2} more labels`}>
                              +{ticket.labels.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                  <td
                    onClick={openWindow(ticket.id)}
                    className="px-2 sm:px-4 py-3 cursor-pointer"
                    style={{ width: columnWidths.priority + 'px' }}
                  >
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold border w-full justify-center ${getPriorityColor(ticket.priority)}`}>
                      <span className="truncate">{ticket.priority}</span>
                    </span>
                  </td>
                  <td
                    onClick={openWindow(ticket.id)}
                    className="px-2 sm:px-4 py-3 text-sm text-slate-600 dark:text-slate-400 text-center font-mono cursor-pointer"
                    style={{ width: columnWidths.points + 'px' }}
                  >
                    {predictingTicketIds.includes(ticket.id) && (!ticket.storyPoints || ticket.storyPoints === 0) ? (
                      <SparkleLoader size="sm" variant="compact" />
                    ) : (
                      ticket.storyPoints || '-'
                    )}
                  </td>
                  <td
                    onClick={openWindow(ticket.id)}
                    className="px-2 sm:px-4 py-3 cursor-pointer"
                    style={{ width: columnWidths.status + 'px' }}
                  >
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border w-full justify-center ${getStatusColor(ticket.status)}`}>
                      <span className="truncate" title={ticket.status}>
                        {ticket.status}
                      </span>
                    </span>
                  </td>
                  <td
                    onClick={openWindow(ticket.id)}
                    className="px-2 sm:px-4 py-3 cursor-pointer"
                    style={{ width: columnWidths.assignee + 'px' }}
                  >
                    {ticket.assigneeName ? (
                      <div className="flex items-center gap-2 min-w-0">
                        {ticket.assigneeAvatar ? (
                          <img
                            src={ticket.assigneeAvatar}
                            loading='lazy'
                            alt={ticket.assigneeName || 'Assignee Avatar'}
                            className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                          />
                        ) : null}
                        <span className="text-sm text-slate-600 dark:text-slate-400 truncate" title={ticket.assigneeName}>
                          {ticket.assigneeName}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-slate-400 dark:text-slate-500">Unassigned</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}