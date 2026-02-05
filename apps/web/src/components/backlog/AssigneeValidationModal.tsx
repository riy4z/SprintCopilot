import type { Ticket } from "@/types";

interface AssigneeValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  missingAssignees: string[];
  affectedTickets: Ticket[];
  onIncludeAssignees: () => void;
  onReassignTickets: () => void;
  onProceedAnyway: () => void;
}

export function AssigneeValidationModal({
  isOpen,
  onClose,
  missingAssignees,
  affectedTickets,
  onIncludeAssignees,
  onReassignTickets,
  onProceedAnyway
}: AssigneeValidationModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-60 transition-opacity duration-300" />

      {/* Modal */}
      <div className="fixed inset-0 z-61 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-950 rounded-xl border border-[#dbdbe6] dark:border-white/10 shadow-2xl max-w-lg w-full">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-orange-600">group_off</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#111118] dark:text-white">Assignee Mismatch Detected</h3>
                <p className="text-sm text-[#616189]">Some tickets have assignees not in your selected team</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-slate-50 dark:bg-white/5 rounded-lg p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[#616189]">Affected tickets:</span>
                  <span className="font-medium text-[#111118] dark:text-white">{affectedTickets.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#616189]">Missing assignees:</span>
                  <span className="font-medium text-[#111118] dark:text-white">{missingAssignees.length}</span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-[#111118] dark:text-white">Missing assignees:</p>
                <div className="flex flex-wrap gap-2">
                  {missingAssignees.map((assignee) => (
                    <span
                      key={assignee}
                      className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 text-xs rounded-md font-medium"
                    >
                      {assignee}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-[#111118] dark:text-white">Affected tickets:</p>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {affectedTickets.slice(0, 5).map((ticket) => (
                    <div key={ticket.id} className="flex items-center gap-2 text-xs">
                      <span className="font-medium text-primary">{ticket.key}</span>
                      <span className="text-[#616189] truncate">{ticket.summary}</span>
                      <span className="text-orange-600 ml-auto">→ {ticket.assigneeName}</span>
                    </div>
                  ))}
                  {affectedTickets.length > 5 && (
                    <p className="text-xs text-[#616189] italic">
                      ...and {affectedTickets.length - 5} more tickets
                    </p>
                  )}
                </div>
              </div>

              <p className="text-sm text-[#616189] leading-relaxed">
                What would you like to do with these tickets?
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={onIncludeAssignees}
                className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-primary/20 text-left px-4"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-lg">group_add</span>
                  <div>
                    <div className="font-semibold">Include missing assignees in team</div>
                    <div className="text-xs text-white/80 mt-0.5">
                      Add {missingAssignees.length} team member{missingAssignees.length > 1 ? 's' : ''} to sprint and keep current assignments
                    </div>
                  </div>
                </div>
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={onReassignTickets}
                  className="py-3 border border-[#dbdbe6] dark:border-white/10 text-[#111118] dark:text-white font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-left px-3"
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="material-symbols-outlined text-lg">swap_horiz</span>
                    <div className="text-sm font-semibold">Reassign tickets</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 text-center">
                      Unassign {affectedTickets.length} ticket{affectedTickets.length > 1 ? 's' : ''}
                    </div>
                  </div>
                </button>
                <button
                  onClick={onProceedAnyway}
                  className="py-3 border border-amber-300 dark:border-amber-600 text-amber-700 dark:text-amber-400 font-medium rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors text-left px-3"
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="material-symbols-outlined text-lg">warning</span>
                    <div className="text-sm font-semibold">Proceed anyway</div>
                    <div className="text-xs text-amber-600 dark:text-amber-400 text-center">
                      Keep current assignments
                    </div>
                  </div>
                </button>
              </div>

              <button
                onClick={onClose}
                className="w-full py-2 text-sm text-[#616189] hover:text-[#111118] dark:hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}